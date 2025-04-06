// --- Updated File: ./my-leaves-client/src/pages/Login.tsx ---
import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { GoogleLogin } from '../components/auth/GoogleLogin';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/ui/Loading'; // Import Loading

export const Login = () => {
  const { isAuthenticated, loading, logout } = useAuth(); // Use loading state
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('sessionExpired') === 'true';
  const loggedOut = queryParams.get('loggedOut') === 'true';
  const registrationSuccess = queryParams.get('registered') === 'true'; // Check for registration redirect

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else if (sessionExpired && !loading && !isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, loading, navigate, sessionExpired, logout]);

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-base-200">
            <Loading size="lg" />
        </div>
    );
  }

  return (
    // Full screen hero background
    <div className="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300"> {/* Subtle gradient */}
      <div className="hero-content flex-col lg:flex-row-reverse w-full max-w-4xl p-4 md:p-8"> {/* Max width */}
        {/* Login Card - Improved Styling */}
        <div className="card shrink-0 w-full max-w-md shadow-2xl bg-base-100">
          <div className="card-body p-6 md:p-8"> {/* Responsive padding */}
             <h2 className="card-title text-2xl justify-center mb-4">Login to MyLeaves</h2> {/* Title */}

            {/* Status Messages */}
            {sessionExpired && (
                <div role="alert" className="alert alert-warning text-sm mb-4 py-2 px-3"> {/* Smaller alert */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>Session expired. Please log in again.</span>
                </div>
            )}
             {loggedOut && (
                <div role="alert" className="alert alert-info text-sm mb-4 py-2 px-3">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>You have been logged out.</span>
                </div>
            )}
             {registrationSuccess && (
                <div role="alert" className="alert alert-success text-sm mb-4 py-2 px-3">
                   <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <span>Registration successful! Please log in.</span>
                </div>
            )}

            {/* Login Form */}
            <LoginForm />

            {/* Divider */}
            <div className="divider text-sm my-4">OR</div> {/* Reduced margin */}

            {/* Google Login */}
            <GoogleLogin />

            {/* Link to registration */}
            <div className="text-center mt-4 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="link link-primary hover:link-secondary"> {/* Added hover effect */}
                    Register here
                </Link>
            </div>
          </div>
        </div>

         {/* Text Content (Hidden on smaller screens, visible on lg) */}
        <div className="text-center lg:text-left lg:block hidden">
           <h1 className="text-4xl lg:text-5xl font-bold text-base-content opacity-90">Streamline Your Time Off</h1>
          <p className="py-6 max-w-md text-base-content/70"> {/* Adjusted text color */}
            Access your account to easily manage leave requests, track balances,
            and stay organized with your time away.
          </p>
        </div>

      </div>
    </div>
  );
};

// Basic Register page component
// import { RegisterForm } from '../components/auth/RegisterForm'; // Assuming you create this
export const Register = () => (
     <div className="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      <div className="hero-content flex-col w-full max-w-md p-4 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold">Create Account</h1>
          <p className="py-4 text-base-content/70">Join MyLeaves today.</p>
        </div>
        <div className="card shrink-0 w-full shadow-2xl bg-base-100">
          <div className="card-body p-6 md:p-8">
            {/* Replace with actual RegisterForm component */}
            {/* <RegisterForm /> */}
            <p className="text-center text-warning p-4 border border-warning rounded-lg">Registration Form component is needed here. Replace this placeholder.</p>

             <div className="text-center mt-4 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="link link-primary hover:link-secondary">
                    Login here
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
);
