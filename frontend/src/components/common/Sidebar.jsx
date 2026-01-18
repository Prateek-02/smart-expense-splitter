import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/groups', label: 'Groups', icon: '👥' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <aside className="w-52 bg-gray-50 p-4 min-h-[calc(100vh-60px)]">
      <ul className="list-none p-0 m-0">
        {menuItems.map((item) => (
          <li key={item.path} className="mb-2">
            <Link
              to={item.path}
              className={`flex items-center gap-2 p-3 no-underline rounded ${
                location.pathname === item.path
                  ? 'text-indigo-600 bg-indigo-100'
                  : 'text-gray-800 hover:bg-gray-200'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
