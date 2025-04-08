import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LeaveList } from '../components/leaves/LeaveList';
import { LeaveForm } from '../components/leaves/LeaveForm';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveRequestData } from '../types/leave';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';

export const LeaveManagement = () => {
  const location = useLocation();
  const [isFormVisible, setIsFormVisible] = useState(location.state?.showForm === true);

  // Use the specific infinite query hook for user leaves
  const {
    useUserLeavesInfinite,
    createLeave,
    isCreating,
    deleteLeave,
    isDeleting,
  } = useLeaves();

  // Get data and functions from the infinite query hook
  const {
      data: userLeavesPages,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading: isLoadingUserLeaves, // Initial loading state
      error: errorUserLeaves,
  } = useUserLeavesInfinite();

  // Flatten the pages data into a single array for rendering
  const allUserLeaves = React.useMemo(() =>
      userLeavesPages?.pages.flatMap(page => page.data) ?? []
  , [userLeavesPages]);

  // Get overall counts from the first page's response for potential display
  // (LeaveList will calculate its own filtered counts)
   const totalCount = userLeavesPages?.pages[0]?.totalCount ?? 0;


  useEffect(() => {
    if (location.state?.showForm) {
      setIsFormVisible(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = (formData: LeaveRequestData) => {
    createLeave(formData, {
      onSuccess: () => {
        setIsFormVisible(false);
        console.log("Leave request submitted successfully!");
        // Toast notification here
      },
      onError: (error: unknown) => {
         console.error("Leave submission error:", error);
         // Toast notification here
      }
    });
  };

   // Handle initial loading state for the whole page
   if (isLoadingUserLeaves && !userLeavesPages) { // Check !userLeavesPages to only show on very first load
       return <div className="p-10 flex justify-center"><Loading size="lg" /></div>;
   }

   // Handle initial error state
   if (errorUserLeaves && !userLeavesPages) {
       return <div className="p-6"><ErrorDisplay message={(errorUserLeaves as Error).message || "Failed to load your leaves."} /></div>;
   }


  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header & Toggle Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Display total count if available */}
        <h1 className="text-2xl md:text-3xl font-bold">My Leave Requests {totalCount > 0 ? `(${totalCount})` : ''}</h1>
        <button
          className={`btn ${isFormVisible ? 'btn-outline btn-warning' : 'btn-primary'} min-w-[180px]`}
          onClick={() => setIsFormVisible(!isFormVisible)}
          aria-expanded={isFormVisible}
          aria-controls="leave-request-form"
        >
          {isFormVisible ? 'Cancel Request' : '+ New Leave Request'}
        </button>
      </div>

      {/* New Leave Form Card */}
      <div
          id="leave-request-form"
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isFormVisible ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
       >
        <div className="card bg-base-100 shadow-lg border border-primary/30 mb-6 md:mb-8">
          <div className="card-body p-5 md:p-6">
            <h2 className="card-title mb-3 text-lg">Submit New Leave Request</h2>
            <LeaveForm onSubmit={handleSubmit} isSubmitting={isCreating} />
             {/* Display creation error specifically? */}
             {/* {errorCreating && <ErrorDisplay message={errorCreating.message || 'Failed to submit.'}/>} */}
          </div>
        </div>
      </div>

      {/* Leave History/List Card */}
      <div className="card bg-base-100 shadow-lg border border-base-300/50">
        <div className="card-body p-5 md:p-6">
           <h2 className="card-title mb-4 text-lg">Leave History</h2>
           {/* Pass the flattened list */}
           {/* Pass loading/error states based on *subsequent* fetches or overall error */}
           <LeaveList
                leaves={allUserLeaves}
                isLoading={isLoadingUserLeaves && !isFetchingNextPage && allUserLeaves.length === 0} // Show loading only if truly empty and initial loading
                error={errorUserLeaves && allUserLeaves.length === 0 ? errorUserLeaves : null} // Show error only if truly empty
                onDelete={deleteLeave}
                isDeleting={isDeleting}
            />

            {/* "Load More" Button Area */}
            <div className="flex justify-center mt-6">
                {hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="btn btn-primary btn-outline w-full sm:w-auto"
                        aria-busy={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <>
                                <span className="loading loading-spinner loading-xs mr-2"></span>
                                Loading more...
                            </>
                        ) : (
                            'Load More Requests'
                        )}
                    </button>
                )}
                 {!hasNextPage && allUserLeaves.length > 0 && (
                    <p className="text-center text-base-content/60 italic">All your requests loaded.</p>
                 )}
            </div>
             {/* Handle case where there are truly zero requests overall after initial load */}
            {allUserLeaves.length === 0 && !isLoadingUserLeaves && !errorUserLeaves && (
                  <p className="text-center py-8 text-base-content/70 italic">You haven't submitted any leave requests yet.</p>
             )}
        </div>
      </div>
    </div>
  );
};