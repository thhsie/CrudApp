import { useState, useMemo, useEffect } from 'react';
import { useAuthQuery, Feedback } from '../hooks/useAuthQuery';
import { UserListTable } from '../components/admin/UserListTable';
import { EditLeaveBalancesModal } from '../components/admin/EditLeaveBalancesModal';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { UserListItem, LeaveBalancesUpdateDto } from '../types/auth'; // Ensure UserListItem is updated type
import { getApiErrorMessage } from '../services/authService';
import { FaSearch, FaTimes } from 'react-icons/fa'; // Import icons

// FeedbackAlert Component (assuming it's defined correctly or imported)
const FeedbackAlert = ({ feedback, onClose }: { feedback: Feedback | null; onClose: () => void }) => {
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (feedback) {
            timer = setTimeout(() => {
                onClose();
            }, 5000);
        }
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [feedback, onClose]);

    if (!feedback) return null;

    const alertClass = feedback.type === 'success' ? 'alert-success' : 'alert-error';

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


// AdminUsers Page Component
export const AdminUsers = () => {
  const {
      currentUser, // Get currentUser to check isAdmin status reliably
      isLoadingUser,
      useAdminUsersInfinite,
      updateLeaveBalancesAsync,
      isUpdatingBalances,
      errorUpdatingBalances
    } = useAuthQuery();

  // --- Filter State ---
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string | null>(null);

  // Check isAdmin status *after* user has loaded
  const isAdmin = !!currentUser?.isAdmin;

  // Use the infinite query hook, passing the active search term
  // It will be enabled/disabled internally based on the isAdmin flag passed to useAuthQuery
  const {
      data: usersPages,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading: isLoadingUsers, // Loading state specific to the users query
      error: errorUsers, // Get refetch function if needed (e.g., after updates if invalidation fails)
  } = useAdminUsersInfinite({ searchTerm: activeSearchTerm });

  // --- Modal and Feedback State ---
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null);

  // Flatten pages data for the table
  const allUsers = useMemo(() =>
    usersPages?.pages.flatMap(page => page.data) ?? []
  , [usersPages]);

  // Get total count from the first page for display (respects filter from API)
  const totalCount = usersPages?.pages[0]?.totalCount ?? 0;

  // --- Filter Handlers ---
  const handleApplyFilter = (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmedSearch = searchInput.trim();
      setActiveSearchTerm(trimmedSearch ? trimmedSearch : null);
      // Note: React Query automatically refetches when the query key changes (due to activeSearchTerm update)
  };
  const handleClearFilter = () => {
      setSearchInput('');
      setActiveSearchTerm(null);
      // React Query refetches automatically
  };

  // --- Modal Handlers ---
  const handleEditClick = (user: UserListItem) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setPageFeedback(null); // Clear feedback when opening modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Handler to save balances from the modal
  const handleSaveBalances = async (userId: string, balances: LeaveBalancesUpdateDto) => {
      setPageFeedback(null); // Clear previous feedback
      try {
          await updateLeaveBalancesAsync({ userId, balances });
          setPageFeedback({ type: 'success', message: 'Leave balances updated successfully!' });
          handleCloseModal(); // Close modal on success
          // Invalidation should happen automatically via useAuthQuery's onSuccess
          // If not, uncomment: await refetchUsers();
      } catch (error) {
          setPageFeedback({ type: 'error', message: `Failed to update balances: ${getApiErrorMessage(error)}` });
          // Keep modal open on error
      }
  };

  // --- Render Logic ---
  // Loading state for the initial user fetch (to determine admin status)
  if (isLoadingUser) {
       return <div className="p-10 flex justify-center"><Loading size="lg" /></div>;
  }

  // Check if user is admin *after* loading is complete
  if (!isAdmin) {
    return <div className="p-6"><ErrorDisplay message="Access Denied. You do not have permission to view this page." /></div>;
  }

  // Determine loading/error states specifically for the users list query
  const isInitialUserListLoading = isLoadingUsers && !usersPages && !errorUsers; // True only on first load for a specific filter
  const initialUserListError = errorUsers && !usersPages; // True only on first load error for a specific filter
  const isOverallLoading = isLoadingUsers || isFetchingNextPage; // True during initial load or fetching more pages

  // Display initial error state if fetching users failed catastrophically
  if (initialUserListError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Admin Users</h1>
        <ErrorDisplay message={getApiErrorMessage(errorUsers) || 'Failed to load users.'} />
      </div>
    );
  }

  // Main page content
  return (
    <div className="space-y-6 md:space-y-8 relative"> {/* Add relative for toast positioning */}
      <FeedbackAlert feedback={pageFeedback} onClose={() => setPageFeedback(null)} />

      {/* Page Header */}
      <div>
          <h1 className="text-2xl md:text-3xl font-bold">All leave balance details</h1>
          <p className="text-base-content/70 mt-1">View and edit leave balances for users.</p>
      </div>

       {/* Filter Controls */}
       <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4 md:p-5">
                <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row items-end gap-3">
                    <label className="form-control w-full sm:flex-1">
                        <div className="label pb-1"><span className="label-text">Filter by Name/Email</span></div>
                        <input
                            type="search"
                            placeholder="Search users..."
                            className="input input-bordered w-full"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            disabled={isOverallLoading} // Disable while any user list loading is happening
                        />
                    </label>
                    <div className="flex gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                        <button type="submit" className="btn btn-primary flex-1 sm:flex-none" disabled={isOverallLoading}>
                            <FaSearch className="mr-1"/> Apply
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost flex-1 sm:flex-none"
                            onClick={handleClearFilter}
                            disabled={!activeSearchTerm || isOverallLoading} // Disable if no filter active or loading
                        >
                            <FaTimes className="mr-1"/> Clear
                        </button>
                    </div>
                </form>
                {activeSearchTerm && (
                    <p className="text-sm text-base-content/70 mt-2 italic">
                        Showing results for: <span className="font-medium">{activeSearchTerm}</span>
                    </p>
                )}
            </div>
       </div>

      {/* User List Card */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-5 md:p-6">
            <h2 className="card-title mb-4 text-lg">
                {activeSearchTerm ? `Filtered User Balances` : 'All User Balances'} ({isInitialUserListLoading ? <span className="skeleton h-5 w-8 inline-block animate-pulse"></span> : totalCount})
            </h2>

            {/* Initial Loading Skeleton for User List */}
            {isInitialUserListLoading ? (
                <div className="overflow-x-auto">
                    <table className="table">
                        {/* Skeleton Head - Updated for Taken columns */}
                        <thead>
                            <tr>
                                <th className="w-1/4"><span className="skeleton h-4 w-24 animate-pulse"></span></th> {/* User */}
                                <th className="w-1/6 text-right"><span className="skeleton h-4 w-16 inline-block animate-pulse"></span></th> {/* Annual Bal */}
                                <th className="w-1/12 text-right"><span className="skeleton h-4 w-10 inline-block animate-pulse"></span></th> {/* Annual Taken */}
                                <th className="w-1/6 text-right"><span className="skeleton h-4 w-16 inline-block animate-pulse"></span></th> {/* Sick Bal */}
                                <th className="w-1/12 text-right"><span className="skeleton h-4 w-10 inline-block animate-pulse"></span></th> {/* Sick Taken */}
                                <th className="w-1/6 text-right"><span className="skeleton h-4 w-16 inline-block animate-pulse"></span></th> {/* Special Bal */}
                                <th className="w-1/12 text-right"><span className="skeleton h-4 w-10 inline-block animate-pulse"></span></th> {/* Special Taken */}
                                <th className="w-auto text-right"><span className="skeleton h-4 w-10 inline-block animate-pulse"></span></th> {/* Actions */}
                            </tr>
                        </thead>
                         {/* Skeleton Body - Updated */}
                         <tbody>
                            {[1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    <td>
                                        <div className="skeleton h-4 w-3/4 mb-1 animate-pulse"></div>
                                        <div className="skeleton h-3 w-1/2 opacity-70 animate-pulse"></div>
                                    </td>
                                    <td className="text-right"><span className="skeleton h-4 w-8 inline-block animate-pulse"></span></td>
                                    <td className="text-right"><span className="skeleton h-4 w-6 inline-block opacity-70 animate-pulse"></span></td>
                                    <td className="text-right"><span className="skeleton h-4 w-8 inline-block animate-pulse"></span></td>
                                    <td className="text-right"><span className="skeleton h-4 w-6 inline-block opacity-70 animate-pulse"></span></td>
                                    <td className="text-right"><span className="skeleton h-4 w-8 inline-block animate-pulse"></span></td>
                                    <td className="text-right"><span className="skeleton h-4 w-6 inline-block opacity-70 animate-pulse"></span></td>
                                    <td className="text-right"><span className="skeleton h-8 w-8 inline-block animate-pulse"></span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <>
                     {/* Render table if users exist, otherwise show message */}
                     {allUsers.length > 0 ? (
                        // UserListTable should now render the taken columns correctly
                        <UserListTable users={allUsers} onEdit={handleEditClick} />
                     ) : (
                        <p className="text-center py-8 text-base-content/70 italic">
                            {activeSearchTerm
                                ? `No users found matching "${activeSearchTerm}".`
                                : 'No users found in the system.'}
                        </p>
                     )}

                     {/* "Load More" Button Area */}
                     <div className="flex justify-center mt-6">
                            {hasNextPage && (
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage} // Only disable when actively fetching next page
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
                            {/* Message when all users are loaded (respecting filter) */}
                            {!hasNextPage && allUsers.length > 0 && !isOverallLoading && (
                                <p className="text-center text-base-content/60 italic mt-4">
                                    All {activeSearchTerm ? 'matching ' : ''}users loaded.
                                </p>
                            )}
                     </div>

                    {/* Display subsequent fetch errors inline, if any */}
                    {/* Show only if not the initial error and pages have been loaded */}
                    {errorUsers && usersPages && !initialUserListError && (
                        <div className="mt-4">
                            <ErrorDisplay message={`Error fetching more users: ${getApiErrorMessage(errorUsers)}`} />
                        </div>
                    )}
                 </>
             )}
        </div>
      </div>

      {/* Edit Modal - Rendered conditionally */}
      {/* Ensure EditLeaveBalancesModal only deals with editing balances, not taken days */}
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
