import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="drawer-side">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <ul className="menu p-4 w-60 h-full bg-base-200 text-base-content">
        <li>
          <a href="/dashboard">Dashboard</a>
        </li>
        <li>
          <a href="/leaves">My Leaves</a>
        </li>
        <li>
          <a href="/leaves/new">Request Leave</a>
        </li>
        {isAdmin && (
          <>
            <li className="menu-title">
              <span>Admin</span>
            </li>
            <li>
              <a href="/admin/dashboard">Admin Dashboard</a>
            </li>
            <li>
              <a href="/admin/leaves">Manage All Leaves</a>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};
