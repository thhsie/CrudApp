// --- Updated File: ./my-leaves-client/src/components/layout/Layout.tsx ---
import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../ui/Loading';
import { Navigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { loading, isAuthenticated } = useAuth();

  // Handle initial loading state globally
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-base-200"> {/* Added bg */}
            <Loading size="lg" /> {/* Larger spinner */}
        </div>
    );
  }

  // This should ideally be handled by the router's ProtectedRoute
  // Leaving it as a safeguard, but it might cause double renders if router also redirects.
  if (!isAuthenticated) {
     return <Navigate to="/login" replace />;
   }

  // Render the main layout with drawer for authenticated users
  return (
    <div className="drawer lg:drawer-open bg-base-100"> {/* Use base-100 for drawer background */}
      {/* Checkbox to control drawer on mobile */}
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      {/* Page content area */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Navbar sticks to top */}
        <Navbar />
        {/* Main content with padding */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 bg-base-100"> {/* Use base-100 */}
          {children} {/* Render the page content */}
        </main>
        {/* Optional Footer */}
        <footer className="footer footer-center p-4 bg-base-300 text-base-content">
            <aside>
                <p>Copyright © {new Date().getFullYear()} - MyLeaves App</p>
            </aside>
        </footer>
      </div>

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
};;