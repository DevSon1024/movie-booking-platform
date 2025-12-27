import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import { FaFilm, FaTicketAlt, FaMoneyBillWave, FaFilter } from 'react-icons/fa';
import { getAdminStats } from '../../services/adminService';

const AdminOverview = () => {
  const { currencySymbol } = useSelector((state) => state.settings);
  
  const [stats, setStats] = useState({ revenue: 0, ticketsSold: 0, activeMovies: 0 });
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats(dateRange.startDate, dateRange.endDate);
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [dateRange]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const statCards = [
    { title: 'Total Revenue', value: `${currencySymbol}${stats.revenue.toLocaleString()}`, icon: <FaMoneyBillWave />, color: 'bg-green-600' },
    { title: 'Tickets Sold', value: stats.ticketsSold, icon: <FaTicketAlt />, color: 'bg-blue-600' },
    { title: 'Active Movies', value: stats.activeMovies, icon: <FaFilm />, color: 'bg-purple-600' },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
        
        {/* Date Filter */}
        <div className="flex flex-wrap items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <FaFilter className="text-gray-400 ml-2 mr-3" />
          <div className="flex items-center space-x-2 mr-4">
            <span className="text-xs text-gray-500 font-bold uppercase">From</span>
            <input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-red-500" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-bold uppercase">To</span>
            <input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-red-500" />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading analytics...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 text-${stat.color.replace('bg-', '')} text-xl`}>
                {/* For icon colors we need a slight adjustment or hardcode */}
                <span className="text-white p-2 rounded-lg" style={{backgroundColor: stat.color === 'bg-green-600' ? '#16a34a' : stat.color === 'bg-blue-600' ? '#2563eb' : '#9333ea'}}>
                   {stat.icon}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOverview;