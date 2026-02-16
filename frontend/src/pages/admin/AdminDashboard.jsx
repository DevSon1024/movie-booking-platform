import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaFilm, FaTheaterMasks, FaCalendarAlt, FaCog, FaChartLine, FaBars, FaTimes, FaUsers, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  // Helper to highlight the active sidebar item
  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <FaChartLine /> },
    { path: '/admin/users', label: 'Users', icon: <FaUsers /> },
    { path: '/admin/movies', label: 'Movies', icon: <FaFilm /> },
    { path: '/admin/theatres', label: 'Theatres', icon: <FaTheaterMasks /> },
    { path: '/admin/shows', label: 'Shows', icon: <FaCalendarAlt /> },
    { path: '/admin/settings', label: 'Settings', icon: <FaCog /> },
  ];

  const activeItem = navItems.find(item => isActive(item.path));
  useDocumentTitle(activeItem ? `Admin - ${activeItem.label}` : 'Admin Dashboard');

  return (
    <div className="flex relative min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation - Desktop: Fixed Icon-based, Mobile: Slide-over */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          transform transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
          md:translate-x-0 ${isExpanded ? 'md:w-64' : 'md:w-20'}
          md:top-20 md:h-[calc(100vh-5rem)]
        `}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {(isSidebarOpen || isExpanded) && (
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Management</h2>
          )}
          
          {/* Mobile close button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-red-500 transition-colors ml-auto"
          >
            <FaTimes size={20} />
          </button>

          {/* Desktop expand/collapse button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`hidden md:block text-gray-500 hover:text-red-500 transition-colors ${!isExpanded && 'mx-auto'}`}
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="mt-2 space-y-1 px-2 flex-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 font-medium group relative ${
                isActive(item.path)
                  ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${!isExpanded && 'md:justify-center'}`}
              title={!isExpanded ? item.label : ''}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              
              {/* Label - shown on mobile or when expanded on desktop */}
              {(isSidebarOpen || isExpanded) && (
                <span className="ml-3">{item.label}</span>
              )}

              {/* Tooltip for collapsed desktop view */}
              {!isExpanded && (
                <div className="hidden md:group-hover:block absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                </div>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col h-full w-full overflow-hidden transition-all duration-300 ${isExpanded ? 'md:ml-64' : 'md:ml-20'}`}>
        
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