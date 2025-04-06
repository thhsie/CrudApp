import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Login, Register } from './pages/Login'; // Assuming Register is exported from Login.tsx
import { Dashboard } from './pages/Dashboard';
import { LeaveManagement } from './pages/LeaveManagement';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Loading } from './components/ui/Loading';
import { JSX } from 'react';

// Protected route component - Consumes updated useAuth hook
const ProtectedRoute = ({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) => {
  // These values now come from useAuthQuery via AuthContext
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    // Show loading indicator (consistent with previous behavior)
     return (
        <div className="flex items-center justify-center min-h-screen">
            <Loading size="lg"/>
        </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login.');
    // Redirect to login, potentially preserving the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('ProtectedRoute: Not admin, redirecting to dashboard.');
    // Redirect non-admins trying to access admin routes
    return <Navigate to="/dashboard" replace />;
  }

  // console.log(`ProtectedRoute: Access granted. IsAdmin: ${isAdmin}, AdminOnly: ${adminOnly}`);
  return children; // Render the protected content
};

// Admin route component remains the same
const AdminRoute = ({ children }: { children: JSX.Element }) => (
  <ProtectedRoute adminOnly>{children}</ProtectedRoute>
);

// Layout wrapper remains the same
const AppLayout = () => (
    <Layout>
        <Outlet /> {/* Nested routes will render here */}
    </Layout>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
     path: '/register', // Add register route
     element: <Register />,
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>, // Routes within AppLayout are protected
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'user/leaves', // Renamed for clarity, matches link in Dashboard
        element: <LeaveManagement />,
      },
      {
        // Temporary placeholder profile route
        path: 'profile',
        element: <div>Profile Page Placeholder</div>
      },
      {
        path: 'admin',
        element: <AdminRoute><Outlet /></AdminRoute>,
        children: [
             {
                index: true, // Default route for '/admin'
                element: <Navigate to="dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <AdminDashboard />,
            },
            {
                path: 'leaves',
                element: <AdminDashboard />, // Reuse AdminDashboard or create specific AdminLeaveList page
            },
            // Add other admin routes here (e.g., /admin/users)
        ]
      }
    ],
  },
  {
    path: '*', // Catch-all route
    element: <NotFound />,
  },
]);