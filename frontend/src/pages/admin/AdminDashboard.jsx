import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaFilm, FaTheaterMasks, FaCalendarAlt, FaCog, FaChartLine, FaBars, FaTimes } from 'react-icons/fa';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    <div className="flex relative min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          transform transition-transform duration-300 ease-in-out flex-shrink-0 h-full
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0
        `}
      >
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Management</h2>
          {/* Close button for mobile inside sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-red-500 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <nav className="mt-2 space-y-1 px-2">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile when clicked
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full w-full overflow-hidden">
        
        {/* Mobile Header / Menu Toggle */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-20">
          <span className="font-bold text-gray-700 dark:text-gray-200">Admin Menu</span>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <FaBars size={20} />
          </button>
        </div>

        {/* Content Outlet */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;