import { useAuth } from '../../contexts/AuthContext';
import { NavLink } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaCalendarAlt,
    // FaUserShield,
    // FaLeaf,
    FaUsersCog,
    FaUserCircle,
} from 'react-icons/fa';

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  // Helper for NavLink classes
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    const baseClasses = "flex items-center gap-3 p-3 transition-colors duration-150 ";
    const activeClasses = "bg-primary text-primary-content shadow-md";
    return `${baseClasses} ${isActive ? activeClasses : ''}`;
  };

  return (
    // drawer-side and overlay are part of the parent Layout component's structure
    <div className="drawer-side z-40">
      {/* Overlay clickable on mobile */}
      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>

      {/* Menu */}
      <ul className="menu p-4 w-72 min-h-full bg-base-200 text-base-content space-y-1">

        {/* Sidebar Header/Logo */}
         <li className="mb-4 mt-1">
           <NavLink
                to="/"
                className="btn btn-ghost justify-start text-xl font-bold h-auto px-2 py-3 normal-case hover:bg-transparent focus:bg-transparent"
                aria-label="Go to homepage"
            >
                <img src='src/assets/logo.svg' className="text-primary text-2xl mr-2" /> MyLeaves
            </NavLink>
         </li>
         {/* <li className="mb-4 mt-1 flex justify-center">
          <NavLink to="/" aria-label="Go to homepage">
            <img
              src="/src/assets/logo.png"
              alt="logo"
              className="w-full max-w-[150px] object-contain"
            />
          </NavLink>
        </li> */}

        {/* User Links */}
        <li><NavLink to="/dashboard" className={getNavLinkClass} end><FaTachometerAlt className="text-lg" />Dashboard</NavLink></li>
        <li><NavLink to="/user/leaves" className={getNavLinkClass}><FaCalendarAlt className="text-lg" />My leaves</NavLink></li>

        {/* Admin Links */}
        {isAdmin && (
          <>
            {/* Divider */}
            <li><div className="divider my-2 text-xs text-base-content/40 font-semibold before:bg-base-content/10 after:bg-base-content/10">Admin section</div></li>
            {/* Admin Links */}
            {/* <li><NavLink to="/admin/dashboard" className={getNavLinkClass} end><FaUserShield className="text-lg" />Overview</NavLink></li> */}
            <li><NavLink to="/admin/leaves" className={getNavLinkClass}><FaCalendarAlt className="text-lg" />Manage all leaves</NavLink></li>
            {/* --- NEW USER MANAGEMENT LINK --- */}
            <li><NavLink to="/admin/users" className={getNavLinkClass}><FaUsersCog className="text-lg" />Manage users</NavLink></li>
            {/* Example: Add other admin links here */}
            {/* <li><NavLink to="/admin/settings" className={getNavLinkClass}><FaCog className="text-lg" />Settings</NavLink></li> */}
          </>
        )}

        {/* --- Bottom Section: Profile Link --- */}
        {/* Use mt-auto on the list item to push it to the bottom */}
        <li className="mt-auto">
            {/* Optional: Add a subtle divider above the profile link */}
             {/* <div className="divider my-1 before:bg-base-content/5 after:bg-base-content/5"></div> */}
            <NavLink to="/profile" className={getNavLinkClass}>
                <FaUserCircle className="text-lg" />
                Profile
            </NavLink>
        </li>
        {/* --- End Bottom Section --- */}
      </ul>
    </div>
  );
};