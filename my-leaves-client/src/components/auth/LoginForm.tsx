// --- Updated File: ./my-leaves-client/src/components/auth/LoginForm.tsx ---
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ErrorDisplay } from '../ui/ErrorDisplay'; // Use ErrorDisplay component

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      // Success - redirection will happen in the auth context or router
    } catch (err: any) { // Catch specific error type if possible
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Use ErrorDisplay component for consistency */}
      {error && <ErrorDisplay message={error} />}

      {/* Email Field */}
      <label className="form-control w-full"> {/* Use form-control on label */}
        <div className="label">
          <span className="label-text">Email Address</span>
        </div>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input input-bordered w-full" // Ensure full width
          required
          autoComplete="email" // Add autocomplete hint
        />
        {/* Optional: Add validation hint */}
        {/* <div className="label">
          <span className="label-text-alt">Validation message</span>
        </div> */}
      </label>

      {/* Password Field */}
       <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Password</span>
          {/* Optional: Forgot password link */}
          {/* <a href="#" className="label-text-alt link link-hover">Forgot password?</a> */}
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input input-bordered w-full"
          required
          minLength={6} // Keep minLength if required by backend
          autoComplete="current-password" // Add autocomplete hint
        />
      </label>

      {/* Submit Button */}
      <div className="form-control mt-6">
        <button
          type="submit"
          className={`btn btn-primary w-full ${isLoading ? 'btn-disabled' : ''}`} // Use btn-disabled for loading state
          disabled={isLoading}
        >
          {isLoading && <span className="loading loading-spinner loading-xs mr-2"></span>} {/* Add spinner inside button */}
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  );
};