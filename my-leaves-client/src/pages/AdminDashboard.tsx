import React from 'react';
import { LeaveList } from '../components/leaves/LeaveList';
import { useLeaves } from '../hooks/useLeaves';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';

export const AdminDashboard = () => {
  const {
    // Fetching hook
    useAdminLeavesInfinite,
    // Mutations
    approveLeave,
    rejectLeave,
    deleteLeave,
    isApproving,
    isRejecting,
    isDeleting,
  } = useLeaves();

  // Use the infinite query hook
  const {
    data: adminLeavesPages, // This holds the pages data
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingAdminLeaves, // Initial loading state
    error: errorAdminLeaves,
  } = useAdminLeavesInfinite(); // Default page size is used from hook

 // Flatten the pages data into a single array for rendering
  const allAdminLeaves = React.useMemo(() =>
    adminLeavesPages?.pages.flatMap(page => page.data) ?? []
  , [adminLeavesPages]);

 // Get overall counts from the first page's response (should be consistent)
 // Provide defaults while loading or if no data exists yet
  const counts = React.useMemo(() => {
      const firstPage = adminLeavesPages?.pages[0];
      if (!firstPage) return { pending: 0, approved: 0, rejected: 0, total: 0 };
      return {
          total: firstPage.totalCount,
          pending: firstPage.pendingCount,
          approved: firstPage.approvedCount,
          rejected: firstPage.rejectedCount,
      };
  }, [adminLeavesPages?.pages]);

  // Display loading or error for the initial fetch
  if (isLoadingAdminLeaves) {
     return <div className="flex justify-center items-center p-10"><Loading size="lg"/></div>;
   }

   if (errorAdminLeaves) {
     return <ErrorDisplay message={errorAdminLeaves.message || "Failed to load leave data."} />;
   }

  return (
     <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard - Manage Leaves</h1>

      {/* Stats Section - Use counts from the API response */}
       <div className="stats stats-vertical lg:stats-horizontal shadow-md w-full bg-base-100 border border-base-300/50 rounded-lg overflow-hidden">
         <div className="stat">
          <div className="stat-title text-base-content/70">Total Requests</div>
          {/* Show count even during subsequent fetches */}
          <div className="stat-value">{counts.total}</div>
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/70">Pending Approval</div>
          <div className="stat-value text-warning">{counts.pending}</div>
          <div className="stat-desc text-xs text-warning">{counts.pending > 0 ? `${counts.pending} require action` : 'All caught up!'}</div>
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/70">Approved</div>
          <div className="stat-value text-success">{counts.approved}</div>
        </div>
         <div className="stat">
          <div className="stat-title text-base-content/70">Rejected</div>
          <div className="stat-value text-error">{counts.rejected}</div>
        </div>
      </div>

      {/* All Leaves List - Admin View */}
      <div className="card bg-base-100 shadow-lg border border-base-300/50">
        <div className="card-body p-5 md:p-6">
          <h2 className="card-title mb-4 text-lg">All Leave Requests ({counts.total})</h2>
           {/* Pass the flattened list and mutation handlers */}
           <LeaveList
                leaves={allAdminLeaves} // Pass the combined list from all pages
                // Pass overall loading/error status only if needed for an empty state *before* first load
                // LeaveList internal logic handles empty filtered results.
                isLoading={false} // Initial load handled above
                error={null}      // Initial error handled above
                onApprove={approveLeave} // Pass admin actions
                onReject={rejectLeave}
                onDelete={deleteLeave}
                isApproving={isApproving} // Pass mutation status
                isRejecting={isRejecting}
                isDeleting={isDeleting}
            />

            {/* "Load More" Button Area */}
            <div className="flex justify-center mt-6">
                {hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="btn btn-primary btn-outline w-full sm:w-auto" // Responsive width
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
                {/* Optionally show a message when all data is loaded */}
                 {!hasNextPage && allAdminLeaves.length > 0 && (
                    <p className="text-center text-base-content/60 italic">All requests loaded.</p>
                 )}
            </div>
             {/* Handle case where there are truly zero requests overall */}
             {allAdminLeaves.length === 0 && !isLoadingAdminLeaves && (
                  <p className="text-center py-8 text-base-content/70 italic">No leave requests found in the system.</p>
             )}
        </div>
      </div>
    </div>
  );
};