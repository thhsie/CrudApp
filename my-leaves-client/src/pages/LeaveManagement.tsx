import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LeaveList } from '../components/leaves/LeaveList';
import { LeaveForm } from '../components/leaves/LeaveForm';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveRequestData } from '../types/leave';
// Optional: Add Loading/Error components if needed for the whole page state
// import { Loading } from '../components/ui/Loading';
// import { ErrorDisplay } from '../components/ui/ErrorDisplay';

export const LeaveManagement = () => {
  const location = useLocation();
  const [isFormVisible, setIsFormVisible] = useState(location.state?.showForm === true);

  // Destructure using the correct names from the updated useLeaves hook
  const {
    userLeaves, // *** UPDATED: Use the specific name for user's leaves ***
    isLoadingUserLeaves, // *** UPDATED: Loading state for user leaves ***
    errorUserLeaves, // *** UPDATED: Error state for user leaves ***
    createLeave,
    isCreating,
    deleteLeave,
    isDeleting,
  } = useLeaves();

  useEffect(() => {
    if (location.state?.showForm) {
      setIsFormVisible(true);
      // Clean up location state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = (formData: LeaveRequestData) => {
    createLeave(formData, {
      onSuccess: () => {
        setIsFormVisible(false);
        // TODO: Implement success toast notification here
        // Example: toast.success("Leave request submitted successfully!");
        console.log("Leave request submitted successfully!"); // Placeholder log
      },
      onError: (error: unknown) => {
         // TODO: Implement error toast notification here
         // Example: toast.error(`Error: ${(error as Error)?.message || 'Failed to submit request.'}`);
         console.error("Leave submission error:", error);
         // Error is likely displayed in the form component or via global error handling
      }
    });
  };

  // Optional: Add top-level loading/error state handling if desired
  // if (isLoadingUserLeaves) return <div className="p-10 flex justify-center"><Loading size="lg" /></div>;
  // if (errorUserLeaves) return <div className="p-6"><ErrorDisplay message={errorUserLeaves.message || "Failed to load your leaves."} /></div>;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header & Toggle Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">My Leave Requests</h1>
        <button
          className={`btn ${isFormVisible ? 'btn-outline btn-warning' : 'btn-primary'} min-w-[180px]`}
          onClick={() => setIsFormVisible(!isFormVisible)}
          aria-expanded={isFormVisible}
          aria-controls="leave-request-form"
        >
          {isFormVisible ? 'Cancel Request' : '+ New Leave Request'}
        </button>
      </div>

      {/* New Leave Form Card (Animated visibility) */}
      <div
          id="leave-request-form"
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isFormVisible ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
       >
        <div className="card bg-base-100 shadow-lg border border-primary/30 mb-6 md:mb-8">
          <div className="card-body p-5 md:p-6">
            <h2 className="card-title mb-3 text-lg">Submit New Leave Request</h2>
            <LeaveForm onSubmit={handleSubmit} isSubmitting={isCreating} />
          </div>
        </div>
      </div>

      {/* Leave History/List Card */}
      <div className="card bg-base-100 shadow-lg border border-base-300/50">
        <div className="card-body p-5 md:p-6">
           <h2 className="card-title mb-4 text-lg">Leave History</h2>
           {/* Pass the correct user leaves data and states */}
           <LeaveList
                leaves={userLeaves ?? []} // *** UPDATED: Pass userLeaves ***
                isLoading={isLoadingUserLeaves} // *** UPDATED: Pass user loading state ***
                error={errorUserLeaves} // *** UPDATED: Pass user error state ***
                onDelete={deleteLeave} // Users can delete their own pending leaves
                isDeleting={isDeleting}
                // No approve/reject needed for user's own list view
            />
        </div>
      </div>
    </div>
  );
};