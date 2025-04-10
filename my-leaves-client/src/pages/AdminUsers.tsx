import { useState, useMemo, useEffect } from 'react';
import { useAuthQuery, Feedback } from '../hooks/useAuthQuery';
import { UserListTable } from '../components/admin/UserListTable';
import { EditLeaveBalancesModal } from '../components/admin/EditLeaveBalancesModal';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { UserListItem, LeaveBalancesUpdateDto } from '../types/auth';
import { getApiErrorMessage } from '../services/authService';

// Simple Alert Component using DaisyUI Alert & Toast container for positioning
const FeedbackAlert = ({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) => {
    if (!feedback) return null;

    const alertClass = feedback.type === 'success' ? 'alert-success' : 'alert-error';

    // Auto-close timer
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Adjust duration as needed
        return () => clearTimeout(timer);
    }, [feedback, onClose]); // Rerun effect if feedback changes

    return (
        // Use DaisyUI toast container for positioning at bottom-right
        <div className="toast toast-end toast-bottom z-50 p-4">
            <div role="alert" className={`alert ${alertClass} shadow-lg`}>
                 {/* Icon based on type */}
                 {feedback.type === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 )}
                <span>{feedback.message}</span>
                {/* Optional close button if you don't want auto-close only */}
                 {/* <button className="btn btn-sm btn-ghost" onClick={onClose}>✕</button> */}
            </div>
        </div>
    );
};

// AdminUsers Page Component
export const AdminUsers = () => {
  const { isAdmin, useAdminUsersInfinite, updateLeaveBalancesAsync, isUpdatingBalances, errorUpdatingBalances } = useAuthQuery();

  // Use the infinite query hook
  const {
      data: usersPages,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading: isLoadingUsers, // Initial load state
      error: errorUsers,
  } = useAdminUsersInfinite(isAdmin); // Enable based on admin status

  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null); // State for alert message

  // Flatten pages data for the table
  const allUsers = useMemo(() =>
    usersPages?.pages.flatMap(page => page.data) ?? []
  , [usersPages]);

  // Get total count from the first page for display
  const totalCount = usersPages?.pages[0]?.totalCount ?? 0;

  // Handler to open the edit modal
  const handleEditClick = (user: UserListItem) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setFeedback(null); // Clear feedback when opening modal
  };

  // Handler to close the edit modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    // Note: We don't clear feedback here, want it to persist briefly after modal closes
  };

  // Handler to save balances from the modal
  const handleSaveBalances = async (userId: string, balances: LeaveBalancesUpdateDto) => {
      setFeedback(null); // Clear previous feedback before attempting save
      try {
          await updateLeaveBalancesAsync({ userId, balances }); // Call the async mutation
          setFeedback({ type: 'success', message: 'Leave balances updated successfully!' });
          handleCloseModal(); // Close modal ONLY on success
      } catch (error) {
          // The hook `errorUpdatingBalances` will hold the error, but we catch it here
          // to set specific feedback for *this* operation.
          setFeedback({ type: 'error', message: `Failed to update balances: ${getApiErrorMessage(error)}` });
          // Keep modal open on error for correction
      }
  };

  // Display initial loading state for the whole page
  if (isLoadingUsers && !usersPages) {
    return <div className="p-10 flex justify-center"><Loading size="lg" /></div>;
  }

  // Display initial error state if fetching users failed
  if (errorUsers && !usersPages) {
    return <div className="p-6"><ErrorDisplay message={(errorUsers as Error).message || 'Failed to load users.'} /></div>;
  }

  // Safeguard check (though routing should prevent this)
  if (!isAdmin) {
    return <ErrorDisplay message="Access Denied. You do not have permission to view this page." />;
  }

  // Main page content
  return (
    <div className="space-y-6 md:space-y-8 relative"> {/* Add relative for toast positioning */}
      {/* <h1 className="text-2xl md:text-3xl font-bold">Edit leave balances</h1> */}

      {/* Feedback Alert Display */}
       <FeedbackAlert feedback={feedback} onClose={() => setFeedback(null)} />

      {/* User List Card */}
      <div className="card bg-base-100 shadow-lg border border-base-300/50">
        <div className="card-body p-5 md:p-6">
          <h2 className="card-title mb-4 text-lg">User List ({totalCount})</h2>

          {/* Render table if users exist, otherwise show message */}
          {allUsers.length > 0 ? (
            <UserListTable users={allUsers} onEdit={handleEditClick} />
          ) : (
            <p className="text-center py-8 text-base-content/70 italic">No users found in the system.</p>
          )}

           {/* "Load More" Button Area */}
           <div className="flex justify-center mt-6">
                {hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage || isLoadingUsers} // Disable if initial loading or fetching next
                        className="btn btn-primary btn-outline w-full sm:w-auto"
                        aria-busy={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <>
                                <span className="loading loading-spinner loading-xs mr-2"></span>
                                Loading more...
                            </>
                        ) : (
                            'Load More Users'
                        )}
                    </button>
                )}
                 {/* Message when all users are loaded */}
                 {!hasNextPage && allUsers.length > 0 && (
                    <p className="text-center text-base-content/60 italic mt-4">All users loaded.</p>
                 )}
            </div>

            {/* Display subsequent fetch errors inline, if any */}
            {errorUsers && usersPages && ( // Show only if not initial error
                 <div className="mt-4">
                    <ErrorDisplay message={`Error fetching more users: ${(errorUsers as Error).message}`} />
                 </div>
            )}
        </div>
      </div>

      {/* Edit Modal - Rendered conditionally */}
      {selectedUser && (
          <EditLeaveBalancesModal
              isOpen={isModalOpen}
              user={selectedUser}
              onClose={handleCloseModal}
              onSave={handleSaveBalances}
              isSaving={isUpdatingBalances}
              // Pass the specific error from the update mutation, formatted
              updateError={errorUpdatingBalances ? getApiErrorMessage(errorUpdatingBalances) : null}
          />
      )}
    </div>
  );
};
