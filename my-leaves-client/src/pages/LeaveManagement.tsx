// --- Updated File: ./my-leaves-client/src/pages/LeaveManagement.tsx ---
import React, { useState, useEffect } from 'react';
import { useLocation,} from 'react-router-dom';
// Layout is handled by router
import { LeaveList } from '../components/leaves/LeaveList';
import { LeaveForm } from '../components/leaves/LeaveForm';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveRequestData } from '../types/leave';

export const LeaveManagement = () => {
  const location = useLocation();
  // Default form visibility based on navigation state, default to false
  const [isFormVisible, setIsFormVisible] = useState(location.state?.showForm === true);

  const {
    leaves,
    isLoadingLeaves,
    errorLeaves,
    createLeave,
    isCreating,
    deleteLeave,
    isDeleting,
  } = useLeaves();

  // Effect to handle the initial state and clear it
  useEffect(() => {
    if (location.state?.showForm) {
      setIsFormVisible(true);
      // Clean up location state after using it to prevent form reopening on refresh/back
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = (formData: LeaveRequestData) => {
    createLeave(formData, {
      onSuccess: () => {
        setIsFormVisible(false); // Hide form on successful submission
        // TODO: Implement success toast notification here
        // Example: toast.success("Leave request submitted successfully!");
      },
      onError: (error: unknown) => {
         // TODO: Implement error toast notification here
         // Example: toast.error(`Error: ${error.message || 'Failed to submit request.'}`);
         console.error("Leave submission error:", error);
         // Error is likely displayed in the form component or via global error handling
      }
    });
  };

  return (
    <div className="space-y-6 md:space-y-8"> {/* Consistent spacing */}
      {/* Header & Toggle Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">My Leave Requests</h1>
        <button
          className={`btn ${isFormVisible ? 'btn-outline btn-warning' : 'btn-primary'} min-w-[180px]`} // Fixed width, warning when open
          onClick={() => setIsFormVisible(!isFormVisible)}
          aria-expanded={isFormVisible}
          aria-controls="leave-request-form"
        >
          {/* Toggle Icon could go here */}
          {isFormVisible ? 'Cancel Request' : '+ New Leave Request'}
        </button>
      </div>

      {/* New Leave Form Card (Animated visibility) */}
      {/* Use a transition library or simple CSS for smoother hide/show */}
      <div
          id="leave-request-form"
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isFormVisible ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`} // Simple CSS transition
       >
        <div className="card bg-base-100 shadow-lg border border-primary/30 mb-6 md:mb-8"> {/* Highlight border */}
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
           {/* LeaveList component handles loading/error/empty states internally now */}
           <LeaveList
                leaves={leaves ?? []} // Ensure leaves is an array
                isLoading={isLoadingLeaves}
                error={errorLeaves}
                onDelete={deleteLeave}
                isDeleting={isDeleting}
                // No approve/reject needed for user's own list
            />
        </div>
      </div>
    </div>
  );
};