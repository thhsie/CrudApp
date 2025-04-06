// --- Updated File: ./my-leaves-client/src/pages/Login.tsx ---
import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { GoogleLogin } from '../components/auth/GoogleLogin';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/ui/Loading'; // Import Loading

export const Login = () => {
  const { isAuthenticated, loading } = useAuth(); // Use loading state
  const navigate = useNavigate();
  const location = useLocation();

  // Check for query params passed during redirect (e.g., from 401 interceptor)
  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('sessionExpired') === 'true';
  const loggedOut = queryParams.get('loggedOut') === 'true';

  useEffect(() => {
    // Redirect if already authenticated and not loading
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show loading indicator if auth state is still being checked
  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-base-200">
            <Loading size="lg" />
        </div>
    );
  }

  // If not loading and not authenticated, show the login page
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse gap-12 lg:gap-16"> {/* Added gap */}
        {/* Text Content */}
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">MyLeaves Login</h1>
          <p className="py-6 max-w-lg"> {/* Added max-width */}
            Access your account to manage leave requests, track balances,
            and stay informed about your time off.
          </p>
        </div>
        {/* Login Card */}
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100"> {/* Use shrink-0 */}
          <div className="card-body">
            {/* Optional messages based on redirects */}
            {sessionExpired && (
                <div role="alert" className="alert alert-warning mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Your session expired. Please log in again.</span>
                </div>
            )}
             {loggedOut && (
                <div role="alert" className="alert alert-info mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>You have been logged out.</span>
                </div>
            )}
            {/* Login Form */}
            <LoginForm />
            {/* Divider */}
            <div className="divider">OR</div>
            {/* Google Login */}
            <GoogleLogin />
            {/* Optional: Link to registration */}
            <div className="text-center mt-4 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="link link-primary">Register here</Link> {/* Add Register link */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add a basic Register page component if needed
// import { RegisterForm } from '../components/auth/RegisterForm'; // Assuming you create this
export const Register = () => (
     <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col">
         <div className="text-center mb-6">
          <h1 className="text-5xl font-bold">Register</h1>
          <p className="py-4">Create your MyLeaves account.</p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            {/* <RegisterForm /> */} {/* Placeholder for RegisterForm */}
            <p>Registration form goes here.</p>
             <div className="text-center mt-4 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="link link-primary">Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
);