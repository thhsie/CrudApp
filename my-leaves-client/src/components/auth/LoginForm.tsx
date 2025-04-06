import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { AxiosError } from 'axios';

// Define a type for expected error structure from BFF/API
interface ApiErrorResponse {
    message?: string;
    // Add other potential error fields if your API returns them, e.g.,
    // errors?: Record<string, string[]>;
    // title?: string; // ASP.NET Core Identity sometimes uses 'title'
}

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Get login function and state from the hook
  const { login, isLoggingIn, errorLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // The login function from useAuth now handles loading state via useMutation
    login({ email, password });
    // Error handling is now managed by the errorLogin state from useMutation
    // Redirection happens based on the currentUser state change in AuthContext/ProtectedRoute
  };

   // Helper to extract a user-friendly error message
   const getErrorMessage = (error: Error | AxiosError<ApiErrorResponse> | null): string => {
    if (!error) return '';

    // Check if it's an Axios error with a response body
    if (error instanceof AxiosError && error.response?.data) {
        const responseData = error.response.data;
        // Try specific fields commonly used for auth errors
        return responseData.message || responseData.title || 'Invalid email or password.';
    }
    // Fallback to generic error message
    return error.message || 'An unexpected error occurred during login.';
   };

   const displayError = getErrorMessage(errorLogin);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error from the login mutation */}
      {displayError && <ErrorDisplay message={displayError} />}

      {/* Email Field */}
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Email Address</span>
        </div>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input input-bordered w-full"
          required
          autoComplete="email"
          disabled={isLoggingIn} // Disable input while logging in
        />
      </label>

      {/* Password Field */}
       <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Password</span>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input input-bordered w-full"
          required
          minLength={6}
          autoComplete="current-password"
          disabled={isLoggingIn} // Disable input while logging in
        />
      </label>

      {/* Submit Button */}
      <div className="form-control mt-6">
        <button
          type="submit"
          className={`btn btn-primary w-full ${isLoggingIn ? 'btn-disabled' : ''}`} // Use btn-disabled for loading state
          disabled={isLoggingIn}
        >
          {isLoggingIn && <span className="loading loading-spinner loading-xs mr-2"></span>}
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  );
};