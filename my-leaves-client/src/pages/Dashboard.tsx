import { useLeaves } from '../hooks/useLeaves';
import { LeaveList } from '../components/leaves/LeaveList';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const {
    leaves,
    isLoading,
    error,
    deleteLeave,
    isDeleting,
  } = useLeaves();

  // Get pending leaves for quick view
  const pendingLeaves = leaves.filter(leave => leave.status === 0);

  return (
    <Layout>
      <div className="page-header">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user?.firstName}!</h1>
      </div>

      <div className="stats shadow mb-6 w-full">
        <div className="stat">
          <div className="stat-title">Total Leaves</div>
          <div className="stat-value">{leaves.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Pending</div>
          <div className="stat-value">{pendingLeaves.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Approved</div>
          <div className="stat-value">{leaves.filter(leave => leave.status === 1).length}</div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Leave Requests</h2>
          <LeaveList
            leaves={leaves.slice(0, 5)}
            isLoading={isLoading}
            error={error}
            onDelete={deleteLeave}
          />
          {leaves.length > 5 && (
            <div className="card-actions justify-end mt-4">
              <a href="/leaves" className="btn btn-primary">
                View All Leaves
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title">Quick Actions</h2>
          <div className="flex flex-wrap gap-4 mt-4">
            <a href="/leaves/new" className="btn btn-primary">
              Request New Leave
            </a>
            <a href="/leaves" className="btn btn-outline">
              Manage My Leaves
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};