import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { GoogleLogin } from '../components/auth/GoogleLogin';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left lg:ml-8">
          <h1 className="text-5xl font-bold">MyLeaves</h1>
          <p className="py-6">
            Log in to manage your leave requests, track your time off, and keep
            your team updated about your availability.
          </p>
        </div>
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
            <LoginForm />
            <div className="divider">OR</div>
            <GoogleLogin />
          </div>
        </div>
      </div>
    </div>
  );
};