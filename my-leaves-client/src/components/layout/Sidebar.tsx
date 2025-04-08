// --- Updated File: ./my-leaves-client/src/components/layout/Sidebar.tsx ---
import { useAuth } from '../../contexts/AuthContext';
import { NavLink } from 'react-router-dom';
// Import desired icons
import {
    FaTachometerAlt,    // Dashboard-like icon
    FaCalendarAlt,      // Calendar icon
    FaUserShield,       // Admin icon
    //FaBars,             // Placeholder if needed
    FaLeaf              // Simple Leaf icon for Branding
} from 'react-icons/fa';

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  // Enhanced NavLink class helper for clarity and better active state styling
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    const baseClasses = "flex items-center gap-3 p-2 rounded-lg transition-colors duration-150 hover:bg-base-300"; // Base styles for all links
    const activeClasses = "bg-primary text-primary-content"; // Active state styles
    return `${baseClasses} ${isActive ? activeClasses : ''}`;
  };

  return (
    // drawer-side and overlay are part of the parent Layout component's structure
    <div className="drawer-side z-40">
      {/* Overlay clickable on mobile */}
      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>

      {/* Menu - Use base-200 for contrast or base-100 for seamless */}
      {/* Increased vertical padding with py-4, horizontal with px-3 */}
      <ul className="menu p-4 w-72 min-h-full bg-base-200 text-base-content space-y-1"> {/* Added space-y-1 for slight gap */}

        {/* Sidebar Header/Logo */}
         <li className="mb-4 mt-1"> {/* Added margin top/bottom */}
           <NavLink
                to="/"
                className="btn btn-ghost justify-start text-xl font-bold h-auto px-2 py-3 normal-case hover:bg-transparent focus:bg-transparent" // Focus transparent prevents default menu focus style
                aria-label="Go to homepage"
            >
                <FaLeaf className="text-primary text-2xl mr-2" /> {/* Brand Icon */}
                MyLeaves
            </NavLink>
         </li>

        {/* User Links */}
        <li>
          <NavLink to="/dashboard" className={getNavLinkClass} end> {/* Use end prop for exact match */}
             <FaTachometerAlt className="text-lg" /> {/* Icon size */}
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/user/leaves" className={getNavLinkClass}>
             <FaCalendarAlt className="text-lg" />
            Leave Management
          </NavLink>
        </li>

        {/* Admin Links */}
        {isAdmin && (
          <>
            {/* Divider - made slightly subtler */}
            <li>
                <div className="divider my-2 text-xs text-base-content/40 font-semibold before:bg-base-content/10 after:bg-base-content/10">
                    Admin Tools
                </div>
            </li>
            {/* Removed the separate menu-title list item */}
            <li>
              <NavLink to="/admin/dashboard" className={getNavLinkClass} end>
                 <FaUserShield className="text-lg" />
                Overview
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/leaves" className={getNavLinkClass}>
                 <FaCalendarAlt className="text-lg" />
                Manage All Leaves
              </NavLink>
            </li>
            {/* Example: Add Manage Users link */}
            {/* <li>
                <NavLink to="/admin/users" className={getNavLinkClass}>
                    <FaUsersCog className="text-lg" />
                    Manage Users
                </NavLink>
            </li> */}
          </>
        )}
      </ul>
    </div>
  );
};