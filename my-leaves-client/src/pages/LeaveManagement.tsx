import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { LeaveList } from '../components/leaves/LeaveList';
import { LeaveForm } from '../components/leaves/LeaveForm';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveRequestData } from '../types/leave';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { Feedback } from '../hooks/useAuthQuery';
import { getApiErrorMessage } from '../services/authService';

// Re-define or import FeedbackAlert component here (same as in AdminUsers.tsx)
const FeedbackAlert = ({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) => {
    if (!feedback) return null;
    const alertClass = feedback.type === 'success' ? 'alert-success' : 'alert-error';
    useEffect(() => {
        const timer = setTimeout(() => { onClose(); }, 5000);
        return () => clearTimeout(timer);
    }, [feedback, onClose]);

    return (
        <div className="toast toast-end toast-bottom z-50 p-4">
            <div role="alert" className={`alert ${alertClass} shadow-lg`}>
                 {feedback.type === 'success' ? ( <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> )
                 : ( <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> )}
                <span>{feedback.message}</span>
            </div>
        </div>
    );
};


export const LeaveManagement = () => {
  const location = useLocation();
  const [isFormVisible, setIsFormVisible] = useState(location.state?.showForm === true);
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null); // State for feedback messages

  // Use the specific infinite query hook for user leaves
  const {
    useUserLeavesInfinite,
    createLeaveAsync, // Use async version to handle feedback
    isCreating,
    // errorCreating, // We'll handle error inside handleSubmit
    deleteLeave, // Use simple mutate for delete
    isDeleting,
    errorDeleting,
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
  const allUserLeaves = useMemo(() =>
      userLeavesPages?.pages.flatMap(page => page.data) ?? []
  , [userLeavesPages]);

  // Get overall counts from the first page's response
   const totalCount = userLeavesPages?.pages[0]?.totalCount ?? 0;

  // Effect to show form based on navigation state
  useEffect(() => {
    if (location.state?.showForm) {
      setIsFormVisible(true);
      // Clear the state from history so refresh doesn't reopen form
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

   // Effect to show delete error feedback
   useEffect(() => {
       if (errorDeleting) {
           setPageFeedback({ type: 'error', message: `Delete failed: ${getApiErrorMessage(errorDeleting)}` });
       }
   }, [errorDeleting]);


  // Handle form submission with feedback
  const handleSubmit = async (formData: LeaveRequestData) => {
    setPageFeedback(null); // Clear previous feedback
    try {
        await createLeaveAsync(formData); // Use async mutation
        setPageFeedback({ type: 'success', message: 'Leave request submitted successfully!' });
        setIsFormVisible(false); // Close form on success
        // Optionally reset form fields if needed
    } catch (error) {
        setPageFeedback({ type: 'error', message: `Failed to submit request: ${getApiErrorMessage(error)}` });
        // Keep form open on error
    }
  };

  // Handle delete action with feedback
   const handleDelete = (id: number) => {
       setPageFeedback(null);
       // Confirmation dialog should be shown by LeaveCard component
       // We just call the mutation here. Success/Error feedback is handled
       // by the mutation's own callbacks or the errorDeleting effect.
       // NOTE: useLeaves hook was updated NOT to have internal feedback,
       // so we add success feedback here. Error is handled by useEffect.
       deleteLeave(id, {
           onSuccess: () => {
               setPageFeedback({ type: 'success', message: `Request #${id} deleted.` });
           },
           // onError handled by useEffect watching errorDeleting
       });
   };


   // Handle initial loading state for the whole page
   if (isLoadingUserLeaves && !userLeavesPages) {
       return <div className="p-10 flex justify-center"><Loading size="lg" /></div>;
   }

   // Handle initial error state
   if (errorUserLeaves && !userLeavesPages) {
       return <div className="p-6"><ErrorDisplay message={(errorUserLeaves as Error).message || "Failed to load your leaves."} /></div>;
   }


  return (
    <div className="space-y-6 md:space-y-8 relative"> {/* Add relative for toast positioning */}
      {/* Feedback Alert Display */}
      <FeedbackAlert feedback={pageFeedback} onClose={() => setPageFeedback(null)} />

      {/* Header & Toggle Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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

      {/* New Leave Form Card (Collapsible) */}
      <div
          id="leave-request-form"
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isFormVisible ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`} // Use max-h for transition
       >
        <div className="card bg-base-100 shadow-lg border border-primary/30 mb-6 md:mb-8">
          <div className="card-body p-5 md:p-6">
            <h2 className="card-title mb-3 text-lg">Submit New Leave Request</h2>
            <LeaveForm onSubmit={handleSubmit} isSubmitting={isCreating} />
             {/* Error during creation is shown in pageFeedback */}
          </div>
        </div>
      </div>

      {/* Leave History/List Card */}
      <div className="card bg-base-100 shadow-lg border border-base-300/50">
        <div className="card-body p-5 md:p-6">
           <h2 className="card-title mb-4 text-lg">Leave History</h2>

           {/* Pass the flattened list and delete handler */}
           <LeaveList
                leaves={allUserLeaves}
                // Loading shown only initially or when empty
                isLoading={isLoadingUserLeaves && !isFetchingNextPage && allUserLeaves.length === 0}
                // Error shown only initially or when empty
                error={errorUserLeaves && allUserLeaves.length === 0 ? errorUserLeaves : null}
                onDelete={handleDelete} // Pass updated delete handler
                isDeleting={isDeleting} // Pass deleting state
            />

            {/* "Load More" Button Area */}
            <div className="flex justify-center mt-6">
                {hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage || isLoadingUserLeaves}
                        className="btn btn-primary btn-outline w-full sm:w-auto"
                        aria-busy={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <><span className="loading loading-spinner loading-xs mr-2"></span>Loading more...</>
                        ) : ( 'Load More Requests' )}
                    </button>
                )}
                 {!hasNextPage && allUserLeaves.length > 0 && (
                    <p className="text-center text-base-content/60 italic mt-4">All your requests loaded.</p>
                 )}
            </div>
             {/* Handle case where there are truly zero requests overall after initial load */}
            {allUserLeaves.length === 0 && !isLoadingUserLeaves && !errorUserLeaves && (
                  <p className="text-center py-8 text-base-content/70 italic">You haven't submitted any leave requests yet.</p>
             )}
              {/* Display subsequent fetch errors if they occur */}
             {errorUserLeaves && userLeavesPages && ( // Only show if not initial error
                 <div className="mt-4">
                     <ErrorDisplay message={`Error loading more requests: ${getApiErrorMessage(errorUserLeaves)}`} />
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};