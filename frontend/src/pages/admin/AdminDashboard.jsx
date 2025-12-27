import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaFilm, FaTheaterMasks, FaCalendarAlt, FaCog, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
  const location = useLocation();

  // Helper to highlight the active sidebar item
  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FaChartLine /> },
    { path: '/admin/movies', label: 'Movies', icon: <FaFilm /> },
    { path: '/admin/theatres', label: 'Theatres', icon: <FaTheaterMasks /> },
    { path: '/admin/shows', label: 'Shows', icon: <FaCalendarAlt /> },
    { path: '/admin/settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Sidebar - Hidden on mobile, handled by Navbar hamburger in real mobile view, 
          but for now keeping simple sidebar for Admin Desktop */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Management</h2>
        </div>
        <nav className="mt-2 space-y-1 px-2">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${
                isActive(item.path)
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area - Renders the child route (Overview, Movies, etc.) */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminDashboard;