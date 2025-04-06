import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { GoogleLogin } from '../components/auth/GoogleLogin';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/ui/Loading';

// Placeholder for RegisterForm component
const RegisterFormPlaceholder = () => (
    <p className="text-center text-warning p-4 border border-warning rounded-lg">
        Registration Form component is needed here. Replace this placeholder.
        This should eventually use `useAuth().register`.
    </p>
);


export const Login = () => {
  // Get state and actions from the hook, now powered by TanStack Query
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard'; // Get intended destination or default

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('sessionExpired') === 'true';
  const loggedOut = queryParams.get('loggedOut') === 'true';
  const registrationSuccess = queryParams.get('registered') === 'true';

  useEffect(() => {
    // Redirect if already authenticated (and not loading initial state)
    if (!loading && isAuthenticated) {
       console.log(`Login Page: Already authenticated, navigating to ${from}`);
       navigate(from, { replace: true });
    }
    // Handle explicit session expiry - logout might be redundant if 401 interceptor works, but safe
    else if (sessionExpired && !loading && !isAuthenticated) {
        console.log("Login Page: Session expired message detected, ensuring logout state.");
        // Ensure local state reflects logged out status if necessary
        // logout(); // Potentially call logout if interceptor doesn't guarantee state cleanup
    }
    // Note: Successful login redirection is now implicitly handled
    // by the ProtectedRoute detecting the change in `isAuthenticated`
    // after the `login` mutation updates the `currentUser` query data.

  }, [isAuthenticated, loading, navigate, from, sessionExpired /*, logout */]); // Add logout if uncommented above

  // Show loading indicator while checking initial auth state
  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-base-200">
            <Loading size="lg" />
        </div>
    );
  }

  // Render login page content if not authenticated and not loading
  return (
    <div className="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300">
      <div className="hero-content flex-col lg:flex-row-reverse w-full max-w-4xl p-4 md:p-8">
        <div className="card shrink-0 w-full max-w-md shadow-2xl bg-base-100">
          <div className="card-body p-6 md:p-8">
             <h2 className="card-title text-2xl justify-center mb-4">Login to MyLeaves</h2>

            {/* Status Messages */}
            {sessionExpired && (
                <div role="alert" className="alert alert-warning text-sm mb-4 py-2 px-3">
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

            {/* Login Form (uses updated hook internally) */}
            <LoginForm />

            <div className="divider text-sm my-4">OR</div>

            {/* Google Login */}
            <GoogleLogin />

            <div className="text-center mt-4 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="link link-primary hover:link-secondary">
                    Register here
                </Link>
            </div>
          </div>
        </div>

        <div className="text-center lg:text-left lg:block hidden">
           <h1 className="text-4xl lg:text-5xl font-bold text-base-content opacity-90">Streamline Your Time Off</h1>
          <p className="py-6 max-w-md text-base-content/70">
            Access your account to easily manage leave requests, track balances,
            and stay organized with your time away.
          </p>
        </div>
      </div>
    </div>
  );
};

// Basic Register page component (needs a real RegisterForm)
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
             <RegisterFormPlaceholder />

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