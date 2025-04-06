// --- Updated File: ./my-leaves-client/src/pages/LeaveManagement.tsx ---
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LeaveList } from '../components/leaves/LeaveList';
import { LeaveForm } from '../components/leaves/LeaveForm';
import { useLeaves } from '../hooks/useLeaves';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { LeaveRequestData } from '../types/leave';

export const LeaveManagement = () => {
  const location = useLocation();
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

  // Reset form visibility state if navigating back to the page without specific state
  useEffect(() => {
    if (location.state?.showForm) {
      setIsFormVisible(true);
      // Clean up location state after using it
      window.history.replaceState({}, document.title);
    } else {
      // If navigating back without the state, ensure form is hidden unless explicitly opened
      // This prevents the form staying open if user navigates away and back
      // setIsFormVisible(false); // Uncomment if you want form always closed on navigation unless state is set
    }
  }, [location.state]);

  const handleSubmit = (formData: LeaveRequestData) => {
    createLeave(formData, {
      onSuccess: () => {
        setIsFormVisible(false); // Hide form
        // Consider adding a success notification (e.g., using react-toastify)
      },
      onError: (error: any) => {
         alert(`Error submitting request: ${error.message || 'Please try again.'}`);
      }
    });
  };

  return (
    <>
      {/* Header & Toggle Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Leave Management</h1>
        <button
          className={`btn ${isFormVisible ? 'btn-outline' : 'btn-primary'}`}
          onClick={() => setIsFormVisible(!isFormVisible)}
          aria-expanded={isFormVisible} // Accessibility
          aria-controls="leave-request-form" // Accessibility
        >
          {/* Icon can be added here */}
          {isFormVisible ? 'Cancel Request' : '+ New Leave Request'}
        </button>
      </div>

      {/* New Leave Form Card (Collapsible Section) */}
      {isFormVisible && (
        <div id="leave-request-form" className="card bg-base-100 shadow-xl mb-6 border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Submit New Leave Request</h2>
            <LeaveForm onSubmit={handleSubmit} isSubmitting={isCreating} />
          </div>
        </div>
      )}

      {/* Leave History/List Card */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
           <h2 className="card-title mb-4">My Leave History</h2>
            {isLoadingLeaves ? (
                <Loading />
            ) : errorLeaves ? (
                <ErrorDisplay message={errorLeaves.message || 'Failed to load leave history.'} />
            ) : (
                <LeaveList
                    leaves={leaves}
                    isLoading={false}
                    error={null}
                    onDelete={deleteLeave}
                    isDeleting={isDeleting}
                    // No approve/reject needed for user's own list
                />
            )}
        </div>
      </div>
    </>
  );
};