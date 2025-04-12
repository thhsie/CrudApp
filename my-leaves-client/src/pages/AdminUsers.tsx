import { useState, useMemo, useEffect } from 'react';
import { useAuthQuery, Feedback } from '../hooks/useAuthQuery';
import { UserListTable } from '../components/admin/UserListTable';
import { EditLeaveBalancesModal } from '../components/admin/EditLeaveBalancesModal';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { UserListItem, LeaveBalancesUpdateDto } from '../types/auth';
import { getApiErrorMessage } from '../services/authService';
import { FaSearch, FaTimes } from 'react-icons/fa'; // Import icons

// FeedbackAlert Component (assuming it's defined correctly as in the example)
const FeedbackAlert = ({ feedback, onClose }: { feedback: Feedback | null; onClose: () => void }) => {
    // Moved useEffect outside conditional return
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (feedback) {
            timer = setTimeout(() => {
                onClose();
            }, 5000);
        }
        // Cleanup function
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [feedback, onClose]); // Dependencies remain the same

    if (!feedback) return null; // Conditional return is okay here

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
  const { isAdmin, useAdminUsersInfinite, updateLeaveBalancesAsync, isUpdatingBalances, errorUpdatingBalances, isLoadingUser } = useAuthQuery();

  // --- Filter State ---
  const [searchInput, setSearchInput] = useState<string>('');
  const [activeSearchTerm, setActiveSearchTerm] = useState<string | null>(null);

  // Use the infinite query hook, passing the active search term
  const {
      data: usersPages,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading: isLoadingUsers, // Initial load state for the *current* filter
      error: errorUsers,
  } = useAdminUsersInfinite({ searchTerm: activeSearchTerm }); // Pass filter object

  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null); // Renamed for clarity

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
  };
  const handleClearFilter = () => {
      setSearchInput('');
      setActiveSearchTerm(null);
  };

  // Handler to open the edit modal
  const handleEditClick = (user: UserListItem) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setPageFeedback(null); // Clear feedback when opening modal
  };

  // Handler to close the edit modal
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
      } catch (error) {
          setPageFeedback({ type: 'error', message: `Failed to update balances: ${getApiErrorMessage(error)}` });
          // Keep modal open on error
      }
  };

  // --- Render Logic ---
  const isInitialLoading = isLoadingUsers && !usersPages; // True only on first load for a specific filter
  const initialLoadError = errorUsers && !usersPages; // True only on first load error for a specific filter
  const isOverallLoading = isLoadingUsers || isFetchingNextPage; // True during initial load or fetching more pages

  // Safeguard check
  if (!isAdmin && !isLoadingUser) { // Check isAdmin only after user loading is done
    return <ErrorDisplay message="Access Denied. You do not have permission to view this page." />;
  }
  // Initial loading state for the *whole* page (before isAdmin check or user load)
  if (isLoadingUser) {
       return <div className="p-10 flex justify-center"><Loading size="lg" /></div>;
  }

  // Display initial error state if fetching users failed catastrophically
  if (initialLoadError) {
    return <div className="p-6"><ErrorDisplay message={getApiErrorMessage(errorUsers) || 'Failed to load users.'} /></div>;
  }

  // Main page content
  return (
    <div className="space-y-6 md:space-y-8 relative">
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
                            type="search" // Use type="search" for potential browser features
                            placeholder="Search users..."
                            className="input input-bordered w-full"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            disabled={isOverallLoading} // Disable while any loading is happening
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
                {activeSearchTerm ? `Filtered Users` : 'All Users'} ({isInitialLoading ? <span className="skeleton h-5 w-8 inline-block"></span> : totalCount})
            </h2>

            {/* Initial Loading Skeleton */}
            {isInitialLoading ? (
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-2/5"><span className="skeleton h-4 w-24"></span></th>
                                <th className="w-1/5"><span className="skeleton h-4 w-16"></span></th>
                                <th className="w-1/5"><span className="skeleton h-4 w-16"></span></th>
                                <th className="w-1/5"><span className="skeleton h-4 w-12"></span></th>
                                <th className="w-auto"><span className="skeleton h-4 w-10"></span></th>
                            </tr>
                        </thead>
                         <tbody>
                            {[1, 2, 3].map(i => (
                                <tr key={i}>
                                    <td><span className="skeleton h-4 w-3/4"></span></td>
                                    <td><span className="skeleton h-4 w-10"></span></td>
                                    <td><span className="skeleton h-4 w-10"></span></td>
                                    <td><span className="skeleton h-4 w-8"></span></td>
                                    <td><span className="skeleton h-8 w-16"></span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 <>
                     {/* Render table if users exist, otherwise show message */}
                     {allUsers.length > 0 ? (
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
                    {errorUsers && usersPages && !initialLoadError && ( // Show only if not the initial error
                        <div className="mt-4">
                            <ErrorDisplay message={`Error fetching more users: ${getApiErrorMessage(errorUsers)}`} />
                        </div>
                    )}
                 </>
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
              updateError={errorUpdatingBalances ? getApiErrorMessage(errorUpdatingBalances) : null}
          />
      )}
    </div>
  );
};