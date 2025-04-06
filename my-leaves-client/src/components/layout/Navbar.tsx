// --- Updated File: ./my-leaves-client/src/components/layout/Navbar.tsx ---
import { useAuth } from '../../contexts/AuthContext';
import { Link, NavLink } from 'react-router-dom'; // Use Link/NavLink

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    // Cleaner navbar: base-100 background, subtle border, sticky
    <div className="navbar sticky top-0 z-30 bg-base-100/70 backdrop-blur-lg border-b border-base-300 shadow-sm">
      {/* Left Section */}
      <div className="navbar-start">
        {/* Drawer Toggle (Mobile) */}
        <label htmlFor="my-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost lg:hidden">
           {/* Hamburger Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </label>
        {/* Brand */}
        <Link to="/" className="btn btn-ghost normal-case text-xl px-2">MyLeaves</Link>
      </div>

      {/* Center Section (Optional) - Could add quick links on larger screens */}
      {/* <div className="navbar-center hidden lg:flex"></div> */}

      {/* Right Section */}
      <div className="navbar-end">
        {isAuthenticated && user ? (
          <div className="dropdown dropdown-end">
            {/* Avatar Button */}
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder"> {/* Added placeholder */}
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                 {/* Initials or Placeholder Icon */}
                {user?.email ? user.email[0].toUpperCase() : '?'}
                {/* Example using email, adapt if firstName/lastName are available */}
                {/* {user?.firstName?.[0]}{user?.lastName?.[0]} */}
              </div>
            </label>
            {/* Dropdown Menu */}
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52" /* Use base-200 for contrast */
            >
              <li className="menu-title px-4 pt-2 pb-1">
                 <span>{user.email}</span>
              </li>
              <li><div className="divider my-0"></div></li>
              <li>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}> {/* Use NavLink */}
                    Profile
                 </NavLink>
              </li>
              <li>
                <button onClick={() => logout()}>Logout</button>
              </li>
            </ul>
          </div>
        ) : (
            // Optional: Show Login button if needed on some pages (though usually login page is separate)
            <Link to="/login" className="btn btn-sm btn-outline btn-primary">Login</Link>
        )}
      </div>
    </div>
  );
};
