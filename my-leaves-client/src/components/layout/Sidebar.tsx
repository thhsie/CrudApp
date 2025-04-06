// --- Updated File: ./my-leaves-client/src/components/layout/Sidebar.tsx ---
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  // Helper for NavLink active class using daisyUI 'active' class
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string =>
    ` ${isActive ? 'active' : ''}`; // daisyUI menu uses 'active' class directly

  return (
    <div className="drawer-side z-40"> {/* Ensure high z-index */}
      {/* Overlay clickable on mobile */}
      <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
      {/* Menu */}
      <ul className="menu p-4 w-72 min-h-full bg-base-200 text-base-content"> {/* Slightly wider */}
        {/* User Links */}
        <li className="mb-1"> {/* Add margin bottom */}
          <NavLink to="/dashboard" className={getNavLinkClass} end> {/* Use end prop for exact match */}
            {/* Add icons if desired */}
            {/* <svg>...</svg> */}
            Dashboard
          </NavLink>
        </li>
        <li className="mb-1">
          <NavLink to="/leaves" className={getNavLinkClass}>
            Leave Management
          </NavLink>
        </li>

        {/* Admin Links */}
        {isAdmin && (
          <>
            {/* Use menu-title for section header */}
            <li className="menu-title pt-4">
              <span>Admin Area</span>
            </li>
            <li className="mb-1">
              <NavLink to="/admin/dashboard" className={getNavLinkClass} end>
                Overview
              </NavLink>
            </li>
            <li className="mb-1">
              <NavLink to="/admin/leaves" className={getNavLinkClass}>
                Manage All Leaves
              </NavLink>
            </li>
            {/* Add other admin links here */}
            {/* e.g., Manage Users, Settings */}
          </>
        )}
      </ul>
    </div>
  );
};