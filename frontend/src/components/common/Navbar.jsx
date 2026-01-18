import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-indigo-600 text-white px-8 py-4 flex justify-between items-center">
      <Link to="/dashboard" className="text-white no-underline text-2xl font-bold">
        Smart Expense Splitter
      </Link>
      <div className="flex gap-8 items-center">
        <Link to="/dashboard" className="text-white no-underline hover:underline">Dashboard</Link>
        <Link to="/groups" className="text-white no-underline hover:underline">Groups</Link>
        <Link to="/analytics" className="text-white no-underline hover:underline">Analytics</Link>
        <Link to="/profile" className="text-white no-underline hover:underline flex items-center gap-2">
          <span>{user?.name}</span>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </Link>
        <button
          onClick={handleLogout}
          className="bg-white/20 border border-white text-white px-4 py-2 rounded cursor-pointer hover:bg-white/30 transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
