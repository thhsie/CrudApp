import { useState, useMemo, useEffect } from 'react';
import { LeaveList } from '../components/leaves/LeaveList';
import { useLeaves } from '../hooks/useLeaves';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { Feedback } from '../hooks/useAuthQuery';
import { getApiErrorMessage } from '../services/authService';

// Re-define or import FeedbackAlert component here (same as in AdminUsers.tsx and LeaveManagement.tsx)
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

export const AdminDashboard = () => {
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null); // State for feedback

  const {
    // Fetching hook
    useAdminLeavesInfinite,
    // Mutations + States
    approveLeave,
    isApproving,
    errorApproving,
    rejectLeave,
    isRejecting,
    errorRejecting,
    deleteLeave,
    isDeleting,
    errorDeleting,
  } = useLeaves();

  // Use the infinite query hook
  const {
    data: adminLeavesPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingAdminLeaves, // Initial loading state
    error: errorAdminLeaves, // Initial fetch error state
  } = useAdminLeavesInfinite();

 // Flatten the pages data into a single array for rendering
  const allAdminLeaves = useMemo(() =>
    adminLeavesPages?.pages.flatMap(page => page.data) ?? []
  , [adminLeavesPages]);

 // Get overall counts from the first page's response
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

  // --- Effects to show mutation errors ---
  useEffect(() => {
    if (errorApproving) {
      setPageFeedback({ type: 'error', message: `Approve failed: ${getApiErrorMessage(errorApproving)}` });
    }
  }, [errorApproving]);

  useEffect(() => {
    if (errorRejecting) {
      setPageFeedback({ type: 'error', message: `Reject failed: ${getApiErrorMessage(errorRejecting)}` });
    }
  }, [errorRejecting]);

    useEffect(() => {
        if (errorDeleting) {
            setPageFeedback({ type: 'error', message: `Delete failed: ${getApiErrorMessage(errorDeleting)}` });
        }
    }, [errorDeleting]);

  // --- Handlers for Mutations (with success feedback) ---
  const handleApprove = (id: number) => {
      setPageFeedback(null); // Clear previous feedback
      approveLeave(id, {
          onSuccess: () => setPageFeedback({ type: 'success', message: `Request #${id} approved.` }),
          // onError handled by useEffect
      });
  };

  const handleReject = (id: number) => {
      setPageFeedback(null);
      rejectLeave(id, {
          onSuccess: () => setPageFeedback({ type: 'success', message: `Request #${id} rejected.` }),
          // onError handled by useEffect
      });
  };

  const handleDelete = (id: number) => {
      setPageFeedback(null);
      // Confirmation dialog is inside LeaveCard
      deleteLeave(id, {
           onSuccess: () => setPageFeedback({ type: 'success', message: `Request #${id} deleted.` }),
           // onError handled by useEffect
      });
  };

  // --- Render Logic ---

  // Initial Loading State
  if (isLoadingAdminLeaves && !adminLeavesPages) {
     return <div className="flex justify-center items-center p-10"><Loading size="lg"/></div>;
   }

   // Initial Fetch Error State
   if (errorAdminLeaves && !adminLeavesPages) {
     return <div className="p-6"><ErrorDisplay message={getApiErrorMessage(errorAdminLeaves) || "Failed to load leave data."} /></div>;
   }

  return (
     <div className="space-y-6 md:space-y-8 relative"> {/* Add relative for toast */}
        {/* Feedback Alert Display */}
        <FeedbackAlert feedback={pageFeedback} onClose={() => setPageFeedback(null)} />

      {/* <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard - Manage Leaves</h1> */}

      {/* Stats Section */}
       <div className="stats stats-vertical lg:stats-horizontal shadow-md w-full bg-base-100 border border-base-300/50 rounded-lg overflow-hidden">
         <div className="stat">
          <div className="stat-title text-base-content/70">Total Requests</div>
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

      {/* All Leaves List Card */}
      <div className="card bg-base-100 shadow-lg border border-base-300/50">
        <div className="card-body p-5 md:p-6">
          <h2 className="card-title mb-4 text-lg">All Leave Requests ({counts.total})</h2>

           <LeaveList
                leaves={allAdminLeaves} // Pass the flattened list
                // Loading/Error handled above for initial load
                isLoading={false}
                error={null}
                // Pass mutation handlers
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                // Pass mutation states for disabling buttons in LeaveCard
                isApproving={isApproving}
                isRejecting={isRejecting}
                isDeleting={isDeleting}
            />

            {/* "Load More" Button Area */}
            <div className="flex justify-center mt-6">
                {hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage || isLoadingAdminLeaves}
                        className="btn btn-primary btn-outline w-full sm:w-auto"
                        aria-busy={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <><span className="loading loading-spinner loading-xs mr-2"></span>Loading more...</>
                        ) : ( 'Load More Requests' )}
                    </button>
                )}
                {!hasNextPage && allAdminLeaves.length > 0 && (
                    <p className="text-center text-base-content/60 italic mt-4">All requests loaded.</p>
                 )}
            </div>
             {/* Handle case where there are truly zero requests overall */}
             {allAdminLeaves.length === 0 && !isLoadingAdminLeaves && !errorAdminLeaves && (
                  <p className="text-center py-8 text-base-content/70 italic">No leave requests found in the system.</p>
             )}
             {/* Display subsequent fetch errors if they occur */}
             {errorAdminLeaves && adminLeavesPages && (
                 <div className="mt-4">
                     <ErrorDisplay message={`Error loading more requests: ${getApiErrorMessage(errorAdminLeaves)}`} />
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};