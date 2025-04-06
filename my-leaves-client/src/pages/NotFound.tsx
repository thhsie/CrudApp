import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    // Use Hero component for layout
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          {/* Larger text for 404 */}
          <h1 className="text-9xl font-bold text-primary opacity-50">404</h1>
          <p className="py-6 text-2xl font-semibold">Page Not Found</p>
          <p className="pb-6 text-base-content/70">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Link to="/" className="btn btn-primary">
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};