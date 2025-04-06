import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LeaveManagement } from './pages/LeaveManagement';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Loading } from './components/ui/Loading';
import { JSX } from 'react';

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    // Show loading indicator within the layout structure if possible
    // Or just a full screen loader for the initial check
     return (
        <div className="flex items-center justify-center min-h-screen">
            <Loading />
        </div>
    );
  }

  if (!isAuthenticated) {
    // console.log('ProtectedRoute: Not authenticated, redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    // console.log('ProtectedRoute: Not admin, redirecting to dashboard.');
    return <Navigate to="/dashboard" replace />;
  }

  // console.log(`ProtectedRoute: Access granted. IsAdmin: ${isAdmin}, AdminOnly: ${adminOnly}`);
  return children;
};

// Admin route component
const AdminRoute = ({ children }: { children: JSX.Element }) => (
  <ProtectedRoute adminOnly>{children}</ProtectedRoute>
);

// Layout wrapper for authenticated routes
const AppLayout = () => (
    <Layout>
        <Outlet /> {/* Nested routes will render here */}
    </Layout>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />, // Login page doesn't use the main Layout
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>, // Protected routes use Layout
    children: [
      {
        index: true, // Default route for '/'
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'user/leaves',
        element: <LeaveManagement />,
      },
      {
        path: 'admin',
        element: <AdminRoute><Outlet /></AdminRoute>, // Nested admin routes
        children: [
            {
                path: 'dashboard', // Matches /admin/dashboard
                element: <AdminDashboard />,
            },
            {
                path: 'leaves', // Matches /admin/leaves
                element: <AdminDashboard />, // Reuse AdminDashboard
            },
            // Add other admin routes here
        ]
      }
    ],
  },
  {
    path: '*', // Catch-all route should be outside the protected layout
    element: <NotFound />,
  },
]);