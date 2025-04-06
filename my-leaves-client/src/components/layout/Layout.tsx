import { ReactNode } from 'react';
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
        // Centered Loading covering the screen
        <div className="flex items-center justify-center min-h-screen bg-base-200">
            <Loading size="lg" />
        </div>
    );
  }

  // This should ideally be handled by the router's ProtectedRoute
  // Leaving it as a safeguard, but router should handle primary redirection.
  if (!isAuthenticated) {
     return <Navigate to="/login" replace />;
   }

  // Render the main layout with drawer for authenticated users
  return (
    // Use lg:drawer-open to keep sidebar open on large screens
    <div className="drawer lg:drawer-open">
      {/* Checkbox to control drawer on mobile */}
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      {/* Page content area */}
      <div className="drawer-content flex flex-col min-h-screen bg-base-100"> {/* Use consistent bg */}
        {/* Navbar sticks to top */}
        <Navbar />
        {/* Main content with padding */}
        <main className="flex-grow p-4 md:p-6 lg:p-8"> {/* Standardized Padding */}
          {children} {/* Render the page content */}
        </main>
        {/* Standard Footer */}
        <footer className="footer footer-center p-4 bg-base-300 text-base-content">
            <aside>
                <p>Copyright © {new Date().getFullYear()} - MyLeaves Application</p>
            </aside>
        </footer>
      </div>

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
};