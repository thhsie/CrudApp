import { useAuth } from '../../contexts/AuthContext';
import { Link, NavLink } from 'react-router-dom';

export const Navbar = () => {
  // Use the updated hook - values are now powered by TanStack Query
  // Note: isLoggingOut is available if you added it to useAuthQuery and AuthContextType
  const { user, logout, isAuthenticated /* , isLoggingOut */ } = useAuth();

  const handleLogout = () => {
    // Call the logout mutation function from the hook
    logout();
    // Redirect might be handled by interceptor or mutation's onSuccess/onError
  }

  return (
    <div className="navbar sticky top-0 z-30 bg-base-100/70 backdrop-blur-lg border-b border-base-300 shadow-sm">
      {/* Left Section */}
      <div className="navbar-start">
        <label htmlFor="my-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </label>
        {/* <Link to="/" className="btn btn-ghost normal-case text-xl px-2">MyLeaves</Link> */}
      </div>

      {/* Center Section (Optional) */}
      {/* <div className="navbar-center hidden lg:flex"></div> */}

      {/* Right Section */}
      <div className="navbar-end">
        {isAuthenticated && user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10 flex justify-center items-center text-lg">
                {user?.email ? user.email[0].toUpperCase() : '?'}
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52"
            >
              <li className="menu-title px-4 pt-2 pb-1">
                 <span>{user.email}</span>
              </li>
              <li><div className="divider my-0"></div></li>
              <li>
                {/* Ensure NavLink usage is correct */}
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `flex items-center gap-2 ${isActive ? 'active' : ''}`}
                 >
                    Profile
                 </NavLink>
              </li>
              <li>
                {/* Logout button */}
                <button onClick={handleLogout} disabled={false /* isLoggingOut */}> {/* Optionally disable during logout */}
                   {/* {isLoggingOut ? <span className="loading loading-spinner loading-xs"></span> : 'Logout'} */}
                   Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
            // Show Login button if not authenticated (might not be needed if always redirecting)
             <Link to="/login" className="btn btn-sm btn-outline btn-primary">Login</Link>
        )}
      </div>
    </div>
  );
};
