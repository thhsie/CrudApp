import { useState, useMemo, useEffect } from 'react';
import { LeaveList } from '../components/leaves/LeaveList';
import { useLeaves } from '../hooks/useLeaves';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { Feedback } from '../hooks/useAuthQuery';
import { getApiErrorMessage } from '../services/authService';
import { FaSearch, FaTimes, FaList, FaTable } from 'react-icons/fa';
import { LeaveTable } from '../components/leaves/LeaveTable';


// Re-define or import FeedbackAlert component (assuming it exists)
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


export const AdminDashboard = () => {
  const [pageFeedback, setPageFeedback] = useState<Feedback | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table'); // State for view mode

  // --- Filter State ---
  const [searchTermFilterInput, setSearchTermFilterInput] = useState<string>('');
  const [activeSearchTermFilter, setActiveSearchTermFilter] = useState<string | null>(null);

  const {
    useAdminLeavesInfinite,
    // Mutations - Removed non-existent variables properties
    approveLeave, isApproving, errorApproving,
    rejectLeave, isRejecting, errorRejecting,
    deleteLeave, isDeleting, errorDeleting,
  } = useLeaves();

  // Pass active filter to the hook
  const {
    data: adminLeavesPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingAdminLeaves,
    error: errorAdminLeaves,
  } = useAdminLeavesInfinite({ searchTerm: activeSearchTermFilter }); // Pass filter object

 // Flatten the pages data
  const allAdminLeaves = useMemo(() =>
    adminLeavesPages?.pages.flatMap(page => page.data) ?? []
  , [adminLeavesPages]);

 // Get counts (respects filter as API returns filtered counts)
  const counts = useMemo(() => {
      const firstPage = adminLeavesPages?.pages[0];
      if (!firstPage) return { pending: 0, approved: 0, rejected: 0, total: 0 };
      return {
          total: firstPage.totalCount,
          pending: firstPage.pendingCount,
          approved: firstPage.approvedCount,
          rejected: firstPage.rejectedCount,
      };
  }, [adminLeavesPages?.pages]);

  // --- Effects for mutation errors ---
  useEffect(() => { if (errorApproving) setPageFeedback({ type: 'error', message: `Approve failed: ${getApiErrorMessage(errorApproving)}` }); }, [errorApproving]);
  useEffect(() => { if (errorRejecting) setPageFeedback({ type: 'error', message: `Reject failed: ${getApiErrorMessage(errorRejecting)}` }); }, [errorRejecting]);
  useEffect(() => { if (errorDeleting) setPageFeedback({ type: 'error', message: `Delete failed: ${getApiErrorMessage(errorDeleting)}` }); }, [errorDeleting]);

  // --- Handlers for Mutations ---
  const handleApprove = (id: number) => { setPageFeedback(null); approveLeave(id, { onSuccess: () => setPageFeedback({ type: 'success', message: `Request #${id} approved.` }) }); };
  const handleReject = (id: number) => { setPageFeedback(null); rejectLeave(id, { onSuccess: () => setPageFeedback({ type: 'success', message: `Request #${id} rejected.` }) }); };
  const handleDelete = (id: number) => { setPageFeedback(null); deleteLeave(id, { onSuccess: () => setPageFeedback({ type: 'success', message: `Request #${id} deleted.` }) }); };

  // --- Filter Handlers ---
  const handleApplyFilter = (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmedSearch = searchTermFilterInput.trim();
      setActiveSearchTermFilter(trimmedSearch ? trimmedSearch : null);
  };
  const handleClearFilter = () => {
      setSearchTermFilterInput('');
      setActiveSearchTermFilter(null);
  };

  // --- Render Logic ---
  const isInitialLoading = isLoadingAdminLeaves && !adminLeavesPages;
  const initialLoadError = errorAdminLeaves && !adminLeavesPages;
  const isOverallLoading = isLoadingAdminLeaves || isFetchingNextPage;

  // Construct the 'response' prop for LeaveList based on your structure
  const leaveListResponseProp = useMemo(() => ({
      data: allAdminLeaves,
      totalCount: counts.total,
      pendingCount: counts.pending,
      approvedCount: counts.approved,
      rejectedCount: counts.rejected,
      // Estimate page number and size - adjust if LeaveList needs precise values
      pageNumber: adminLeavesPages?.pages.length ?? 1,
      pageSize: adminLeavesPages?.pages[0]?.pageSize ?? counts.total // Use pageSize from API if available, else approximate
  }), [allAdminLeaves, counts, adminLeavesPages]);

  return (
     <div className="space-y-6 md:space-y-8 relative">
        <FeedbackAlert feedback={pageFeedback} onClose={() => setPageFeedback(null)} />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin section</h1>
        <p className="text-base-content/70 mt-1">Manage all user leave requests.</p>
      </div>

      {/* Display initial error if occurred */}
      {initialLoadError && <ErrorDisplay message={getApiErrorMessage(errorAdminLeaves) || "Failed to load leave data."} />}

      {/* Stats Section - Show skeleton or data */}
       <div className={`stats stats-vertical lg:stats-horizontal w-full bg-base-100 border border-base-300 overflow-hidden ${isInitialLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="stat">
                <div className="stat-title text-base-content/70">Total Requests {activeSearchTermFilter ? '(Filtered)' : ''}</div>
                <div className="stat-value">{isInitialLoading ? <span className="skeleton h-8 w-16"></span> : counts.total}</div>
            </div>
            <div className="stat">
                <div className="stat-title text-base-content/70">Pending Approval</div>
                <div className="stat-value text-warning">{isInitialLoading ? <span className="skeleton h-8 w-10"></span> : counts.pending}</div>
                <div className="stat-desc text-xs text-warning">{!isInitialLoading && counts.pending > 0 ? `${counts.pending} require action` : ''}</div>
            </div>
             <div className="stat">
                <div className="stat-title text-base-content/70">Approved</div>
                <div className="stat-value text-success">{isInitialLoading ? <span className="skeleton h-8 w-12"></span> : counts.approved}</div>
            </div>
            <div className="stat">
                <div className="stat-title text-base-content/70">Rejected</div>
                <div className="stat-value text-error">{isInitialLoading ? <span className="skeleton h-8 w-10"></span> : counts.rejected}</div>
            </div>
       </div>

        {/* Filter Controls */}
        {!initialLoadError && (
            <div className="card bg-base-100 border border-base-300">
                <div className="card-body p-4 md:p-5">
                    <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row items-end gap-3">
                        <label className="form-control w-full sm:flex-1">
                            <div className="label pb-1"><span className="label-text">Filter by Name/Email</span></div>
                            <input type="text" placeholder="Search users..." className="input input-bordered w-full" value={searchTermFilterInput} onChange={(e) => setSearchTermFilterInput(e.target.value)} disabled={isOverallLoading}/>
                        </label>
                        <div className="flex gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                            <button type="submit" className="btn btn-primary flex-1 sm:flex-none" disabled={isOverallLoading}>
                                <FaSearch className="mr-1"/> Apply
                            </button>
                            <button type="button" className="btn btn-ghost flex-1 sm:flex-none" onClick={handleClearFilter} disabled={!activeSearchTermFilter || isOverallLoading}>
                                <FaTimes className="mr-1"/> Clear
                            </button>
                        </div>
                    </form>
                    {activeSearchTermFilter && <p className="text-sm text-base-content/70 mt-2 italic">Showing requests for: <span className="font-medium">{activeSearchTermFilter}</span></p>}
                </div>
        </div>
       )}

      {/* View Switch and List/Table Section */}
      {!initialLoadError && (
        <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-5 md:p-6">
                {/* Header and View Toggle */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <h2 className="card-title text-lg">
                        {activeSearchTermFilter ? `Leave Requests for ${activeSearchTermFilter}` : 'All Leave Requests'}
                        {!isInitialLoading && ` (${counts.total})`}
                    </h2>
                    {!isInitialLoading && counts.total > 0 && (
                        <label className="flex cursor-pointer gap-2 items-center">
                            <FaList size={16} className={viewMode === 'card' ? 'text-primary' : 'text-base-content/50'}/>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary toggle-sm"
                                checked={viewMode === 'table'}
                                onChange={() => setViewMode(prev => prev === 'card' ? 'table' : 'card')}
                                aria-label="Switch view mode"
                            />
                            <FaTable size={16} className={viewMode === 'table' ? 'text-primary' : 'text-base-content/50'}/>
                        </label>
                    )}
                </div>

            {/* Initial Loading Skeleton (remains card-based for simplicity) */}
            {isInitialLoading ? (
                <div className="space-y-4">
                    <div className="skeleton h-20 w-full"></div>
                    <div className="skeleton h-20 w-full"></div>
                    <div className="skeleton h-20 w-full"></div>
                </div>
            ) : (
                <>
                    {/* Conditional Rendering: Card List or Table View */}
                    {viewMode === 'card' ? (
                        <LeaveList
                            response={leaveListResponseProp}
                            isLoading={false}
                            error={null}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onDelete={handleDelete}
                            isApproving={isApproving}
                            isRejecting={isRejecting}
                            isDeleting={isDeleting}
                        />
                    ) : (
                        // Use the new LeaveTable component
                        <LeaveTable
                            leaves={allAdminLeaves}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onDelete={handleDelete}
                            isApproving={isApproving}
                            isRejecting={isRejecting}
                            isDeleting={isDeleting}
                        />
                    )}

                    {/* "Load More" Button Area (Common for both views) */}
                    <div className="flex justify-center mt-6">
                        {hasNextPage && (
                        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="btn btn-primary btn-outline w-full sm:w-auto" aria-busy={isFetchingNextPage}>
                            {isFetchingNextPage ? (<><span className="loading loading-spinner loading-xs mr-2"></span>Loading more...</>) : ('Load More Requests')}
                        </button>
                        )}
                        {!hasNextPage && counts.total > 0 && !isOverallLoading && (
                        <p className="text-center text-base-content/60 italic mt-4">All {activeSearchTermFilter ? 'filtered ' : ''}requests loaded.</p>
                        )}
                    </div>

                    {/* Empty State Message (remains the same) */}
                    {counts.total === 0 && !isOverallLoading && (
                        <p className="text-center py-8 text-base-content/70 italic">
                            {activeSearchTermFilter ? `No leave requests found for ${activeSearchTermFilter}.` : 'No leave requests found in the system.'}
                        </p>
                    )}

                    {/* Subsequent Fetch Error (remains the same) */}
                    {errorAdminLeaves && adminLeavesPages && (
                        <div className="mt-4"><ErrorDisplay message={`Error loading more requests: ${getApiErrorMessage(errorAdminLeaves)}`} /></div>
                    )}
                </>
            )}
            </div>
        </div>
       )}
    </div>
  );
};
