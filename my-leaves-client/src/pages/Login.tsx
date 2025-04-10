import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { GoogleLogin } from '../components/auth/GoogleLogin';
import { Feedback, useAuthQuery } from '../hooks/useAuthQuery';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/ui/Loading';
import { getApiErrorMessage } from '../services/authService';
import { RegisterDto } from '../types/auth';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';

// Placeholder Register Form - REPLACE with actual implementation
const RegisterForm = ({ onSubmit, isRegistering, error }: { onSubmit: (data: RegisterDto) => void, isRegistering: boolean, error: Error | null }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);
        if (password !== confirmPassword) {
            setValidationError("Passwords do not match.");
            return;
        }
         if (password.length < 6) { // Example basic validation
            setValidationError("Password must be at least 6 characters long.");
            return;
        }
        onSubmit({ email, password });
    };

    const displayError = validationError || (error ? getApiErrorMessage(error) : null);

    return (
         <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && <ErrorDisplay message={displayError} />}
            <label className="form-control w-full">
                <div className="label"><span className="label-text">Email Address</span></div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`input input-bordered w-full ${displayError ? 'input-error' : ''}`} required autoComplete="email" disabled={isRegistering} />
            </label>
            <label className="form-control w-full">
                 <div className="label"><span className="label-text">Password</span></div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className={`input input-bordered w-full ${displayError ? 'input-error' : ''}`} required minLength={6} autoComplete="new-password" disabled={isRegistering} />
            </label>
             <label className="form-control w-full">
                 <div className="label"><span className="label-text">Confirm Password</span></div>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className={`input input-bordered w-full ${displayError ? 'input-error' : ''}`} required minLength={6} autoComplete="new-password" disabled={isRegistering} />
            </label>
            <div className="form-control mt-6">
                <button type="submit" className={`btn btn-primary w-full ${isRegistering ? 'btn-disabled' : ''}`} disabled={isRegistering}>
                    {isRegistering && <span className="loading loading-spinner loading-xs mr-2"></span>}
                    {isRegistering ? 'Registering...' : 'Register'}
                </button>
            </div>
        </form>
    );
};


// Re-define or import FeedbackAlert component here
const FeedbackAlert = ({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) => {
    if (!feedback) return null;
    const alertClass = feedback.type === 'success' ? 'alert-success' : 'alert-error';
    useEffect(() => {
        const timer = setTimeout(() => { onClose(); }, 5000);
        return () => clearTimeout(timer);
    }, [feedback, onClose]);

    return (
        <div className="toast toast-end toast-bottom z-50 p-4">
            <div role="alert" className={`alert ${alertClass} shadow-lg`}>
                 {feedback.type === 'success' ? ( <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> )
                 : ( <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> )}
                <span>{feedback.message}</span>
            </div>
        </div>
    );
};

// --- Login Page ---
export const Login = () => {
  const { isAuthenticated, loading, logout, errorLogin } = useAuth(); // Get error state from hook
  const navigate = useNavigate();
  const location = useLocation();
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null); // State for alerts

  const from = location.state?.from || '/dashboard'; // Get intended destination or default

  // Check URL parameters for status messages
  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('sessionExpired') === 'true';
  const loggedOut = queryParams.get('loggedOut') === 'true';
  const registrationSuccess = queryParams.get('registered') === 'true';

  // Effect to handle redirection and status messages
  useEffect(() => {
    // Redirect if already authenticated (and not loading initial state)
    if (!loading && isAuthenticated) {
       console.log(`Login Page: Already authenticated, navigating to ${from}`);
       // Clear query params on redirect
       navigate(from, { replace: true, state: {} });
    }
    // Handle explicit session expiry
    else if (sessionExpired && !loading && !isAuthenticated) {
        console.log("Login Page: Session expired message detected.");
        setPageFeedback({ type: 'error', message: 'Your session has expired. Please log in again.' }); // Use warning type if available or error
        logout(); // Ensure logged out state
        // Remove query param from URL without navigating
        queryParams.delete('sessionExpired');
        navigate(location.pathname + '?' + queryParams.toString(), { replace: true, state: location.state });
    }
    // Handle logout message
    else if (loggedOut && !loading && !isAuthenticated) {
         setPageFeedback({ type: 'success', message: 'You have been logged out.' }); // Use info type if available
         // Remove query param and navigate
         queryParams.delete('loggedOut');
         navigate(location.pathname + '?' + queryParams.toString(), { replace: true, state: location.state });
    }
    // Handle registration success message
     else if (registrationSuccess && !loading && !isAuthenticated) {
         setPageFeedback({ type: 'success', message: 'Registration successful! Please log in.' });
         // Remove query param
         queryParams.delete('registered');
         navigate(location.pathname + '?' + queryParams.toString(), { replace: true, state: location.state });
    }

  }, [isAuthenticated, loading, navigate, from, sessionExpired, loggedOut, registrationSuccess, logout, location.pathname, location.state]); // Added dependencies


    // Effect to display login errors from the mutation
    useEffect(() => {
        if (errorLogin) {
            setPageFeedback({ type: 'error', message: getApiErrorMessage(errorLogin) });
        }
    }, [errorLogin]);


  // Show loading indicator during initial auth check
  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-screen bg-base-200">
            <Loading size="lg" />
        </div>
    );
  }

  // Render login page content if not authenticated and not loading
  return (
    <div className="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300 relative"> {/* Add relative */}
        {/* Feedback Alert Display */}
        <FeedbackAlert feedback={pageFeedback} onClose={() => setPageFeedback(null)} />

      <div className="hero-content flex-col lg:flex-row-reverse w-full max-w-4xl p-4 md:p-8">
        {/* Login Card */}
        <div className="card shrink-0 w-full max-w-md shadow-2xl bg-base-100">
          <div className="card-body p-6 md:p-8">
             <h2 className="card-title text-2xl justify-center mb-4">Login to MyLeaves</h2>

             {/* Status messages from URL params are now handled by pageFeedback Alert */}

            {/* Login Form (uses its own internal error display based on props) */}
            {/* LoginForm component itself accesses useAuth for isLoggingIn and errorLogin */}
            <LoginForm />

            <div className="divider text-sm my-4">OR</div>

            {/* Google Login Button */}
            <GoogleLogin />

            {/* Link to Register Page */}
            <div className="text-center mt-4 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="link link-primary hover:link-secondary">
                    Register here
                </Link>
            </div>
          </div>
        </div>

        {/* Hero Text (visible on larger screens) */}
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


// --- Register Page ---
export const Register = () => {
    const { registerAsync, isRegistering, errorRegister } = useAuthQuery();
    const navigate = useNavigate();
    const [pageFeedback, setPageFeedback] = useState<Feedback>(null);

    const handleRegister = async (data: RegisterDto) => {
        setPageFeedback(null);
        try {
            await registerAsync(data);
            // Success feedback is set on the Login page via query param
            navigate('/login?registered=true', { replace: true });
        } catch (error) {
            // Error feedback is handled by the RegisterForm using errorRegister prop
            console.error("Registration caught error in page:", error);
             // Optionally set page-level feedback if RegisterForm doesn't show it
             // setPageFeedback({ type: 'error', message: getApiErrorMessage(error) });
        }
    };

    return (
     <div className="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300 relative"> {/* Add relative */}
         {/* Feedback Alert Display */}
        <FeedbackAlert feedback={pageFeedback} onClose={() => setPageFeedback(null)} />

      <div className="hero-content flex-col w-full max-w-md p-4 md:p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold">Create Account</h1>
          <p className="py-4 text-base-content/70">Join MyLeaves today.</p>
        </div>
        <div className="card shrink-0 w-full shadow-2xl bg-base-100">
          <div className="card-body p-6 md:p-8">
             {/* Use actual RegisterForm component */}
             <RegisterForm
                onSubmit={handleRegister}
                isRegistering={isRegistering}
                error={errorRegister} // Pass error state to form
             />

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
};
