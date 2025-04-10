import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Login, Register } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LeaveManagement } from './pages/LeaveManagement';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { NotFound } from './pages/NotFound';
import { useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { Loading } from './components/ui/Loading';
import { JSX } from 'react';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-base-200">
            <Loading size="lg"/>
        </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login.');
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to="/login" state={{ from: currentPath }} replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('ProtectedRoute: Not admin, redirecting to dashboard.');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => (
  <ProtectedRoute adminOnly>{children}</ProtectedRoute>
);

const AppLayout = () => (
    <Layout>
        <Outlet /> {/* Nested routes will render here */}
    </Layout>
);

// Router Definition
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
     path: '/register',
     element: <Register />,
  },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      {
        index: true, // Default route redirects to dashboard
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'user/leaves', // User's leave management
        element: <LeaveManagement />,
      },
      {
        // Temporary placeholder profile route
        path: 'profile',
        element: <Profile />
      },
      // Admin Section
      {
        path: 'admin',
        element: <AdminRoute><Outlet /></AdminRoute>, // Protect all admin routes
        children: [
             {
                index: true, // Default route for '/admin' -> admin dashboard
                element: <Navigate to="dashboard" replace />,
            },
            // {
            //     path: 'dashboard', // Admin Overview
            //     element: <AdminDashboard />,
            // },
            {
                path: 'leaves', // Manage All Leaves
                element: <AdminDashboard />,
            },
            {
                path: 'users',
                element: <AdminUsers />,
            }
            // Add other admin routes here (e.g., /admin/settings)
        ]
      }
    ],
  },
  {
    path: '*', // Catch-all route for 404
    element: <NotFound />,
  },
]);