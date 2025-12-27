import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
// FIX: Added missing import
import { useSelector } from 'react-redux'; 
import { FaFilm, FaTheaterMasks, FaCalendarAlt, FaCog, FaChartLine, FaMoneyBillWave, FaTicketAlt, FaFilter } from 'react-icons/fa';
import { getAdminStats } from '../../services/adminService';

const AdminDashboard = () => {
  // FIX: Access Global Settings for Currency
  const { currencySymbol } = useSelector((state) => state.settings);
  
  const [stats, setStats] = useState({
    revenue: 0,
    ticketsSold: 0,
    activeMovies: 0
  });
  
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FIX: Dynamic Formatting
  const formatCurrency = (amount) => {
    return `${currencySymbol}${amount?.toLocaleString() || '0'}`; 
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats(dateRange.startDate, dateRange.endDate);
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard stats');
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: formatCurrency(stats.revenue), 
      icon: <FaMoneyBillWave />, 
      color: 'bg-green-600' 
    },
    { 
      title: 'Tickets Sold', 
      value: stats.ticketsSold, 
      icon: <FaTicketAlt />, 
      color: 'bg-blue-600' 
    },
    { 
      title: 'Active Movies', 
      value: stats.activeMovies, 
      icon: <FaFilm />, 
      color: 'bg-purple-600' 
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 hidden md:block flex-shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-red-500">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <Link to="/admin" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
            <FaChartLine className="mr-3" /> Dashboard
          </Link>
          <Link to="/admin/movies" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
            <FaFilm className="mr-3" /> Manage Movies
          </Link>
          <Link to="/admin/theatres" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
            <FaTheaterMasks className="mr-3" /> Manage Theatres
          </Link>
          <Link to="/admin/shows" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
            <FaCalendarAlt className="mr-3" /> Manage Shows
          </Link>
          <Link to="/admin/settings" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
            <FaCog className="mr-3" /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard Overview</h1>
          
          {/* Date Filter Section */}
          <div className="flex flex-wrap justify-center gap-2 items-center bg-gray-800 p-3 rounded-lg border border-gray-700 w-full md:w-auto">
            <FaFilter className="text-gray-400" />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">From:</span>
              <input 
                type="date" 
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 max-w-[130px]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">To:</span>
              <input 
                type="date" 
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500 max-w-[130px]"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Loading analytics...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          /* Stats Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {statCards.map((stat, index) => (
              <div key={index} className={`${stat.color} p-6 rounded-lg shadow-lg flex items-center justify-between`}>
                <div>
                  <p className="text-gray-200 text-sm uppercase">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="text-4xl opacity-50">{stat.icon}</div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[400px]">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;