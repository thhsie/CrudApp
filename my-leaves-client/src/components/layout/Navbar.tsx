import { useAuth } from '../../contexts/AuthContext';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="flex-1">
        <a href="/" className="btn btn-ghost normal-case text-xl">MyLeaves</a>
      </div>
      {isAuthenticated && (
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <div className="flex h-full w-full items-center justify-center bg-neutral-content text-neutral">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 text-base-content">
              <li>
              <a href="/profile" className="justify-between">
                  Profile
                </a>
              </li>
              <li>
                <button onClick={() => logout()}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};