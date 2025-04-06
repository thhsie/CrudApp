// --- Updated File: ./my-leaves-client/src/components/layout/Sidebar.tsx ---
import { useAuth } from '../../contexts/AuthContext';
import { NavLink } from 'react-router-dom';

// Optional: Import icons (e.g., from react-icons)
// import { FaTachometerAlt, FaCalendarAlt, FaUsersCog } from 'react-icons/fa';

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  // Helper for NavLink active class using daisyUI 'active' class
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-2 ${isActive ? 'active' : ''}`; // Added flex/gap for icons

  return (
    <div className="drawer-side z-40"> {/* Ensure high z-index */}
      {/* Overlay clickable on mobile */}
      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
      {/* Menu - Use base-200 for contrast or base-100 for seamless */}
      <ul className="menu p-4 w-72 min-h-full bg-base-200 text-base-content">
        {/* Optional: Sidebar Header/Logo */}
         <li className="mb-4 text-center">
           <NavLink to="/" className="btn btn-ghost normal-case text-2xl font-bold">MyLeaves</NavLink>
         </li>

        {/* User Links */}
        <li> {/* Removed mb-1, rely on menu item padding */}
          <NavLink to="/dashboard" className={getNavLinkClass} end> {/* Use end prop for exact match */}
             {/* <FaTachometerAlt /> */}
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/user/leaves" className={getNavLinkClass}>
             {/* <FaCalendarAlt /> */}
            Leave Management
          </NavLink>
        </li>

        {/* Admin Links */}
        {isAdmin && (
          <>
            {/* Divider */}
            <li><div className="divider my-2"></div></li>
            {/* Use menu-title for section header */}
            <li className="menu-title">
              <span>Admin Area</span>
            </li>
            <li>
              <NavLink to="/admin/dashboard" className={getNavLinkClass} end>
                 {/* <FaTachometerAlt /> */}
                Overview
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/leaves" className={getNavLinkClass}>
                 {/* <FaCalendarAlt /> */}
                Manage All Leaves
              </NavLink>
            </li>
            {/* Example: Add Manage Users link */}
            {/* <li>
                <NavLink to="/admin/users" className={getNavLinkClass}>
                    <FaUsersCog />
                    Manage Users
                </NavLink>
            </li> */}
          </>
        )}
      </ul>
    </div>
  );
};