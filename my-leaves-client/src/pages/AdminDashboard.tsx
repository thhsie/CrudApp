import { Layout } from '../components/layout/Layout';
import { LeaveList } from '../components/leaves/LeaveList';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveStatus } from '../types/leave';

export const AdminDashboard = () => {
  const {
    leaves,
    isLoading,
    error,
    approveLeave,
    rejectLeave,
    deleteLeave,
  } = useLeaves();

  // Count leaves by status for the stats
  const pendingCount = leaves.filter(leave => leave.status === LeaveStatus.Pending).length;
  const approvedCount = leaves.filter(leave => leave.status === LeaveStatus.Approved).length;
  const rejectedCount = leaves.filter(leave => leave.status === LeaveStatus.Rejected).length;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="stats shadow mb-6 w-full">
        <div className="stat">
          <div className="stat-title">Total Leaves</div>
          <div className="stat-value">{leaves.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Pending</div>
          <div className="stat-value text-warning">{pendingCount}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Approved</div>
          <div className="stat-value text-success">{approvedCount}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Rejected</div>
          <div className="stat-value text-error">{rejectedCount}</div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">All Leave Requests</h2>
          <LeaveList
            leaves={leaves}
            isLoading={isLoading}
            error={error}
            onApprove={approveLeave}
            onReject={rejectLeave}
            onDelete={deleteLeave}
          />
        </div>
      </div>
    </Layout>
  );
};
