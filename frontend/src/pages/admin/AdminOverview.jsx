import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaFilm, FaTicketAlt, FaMoneyBillWave, FaFilter, FaUsers, FaBuilding } from 'react-icons/fa';
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { getAdminStats } from '../../services/adminService';
import { AnalyticsCardSkeleton } from '../../components/SkeletonLoader';

const ICON_COLORS = {
  green:  '#16a34a',
  blue:   '#2563eb',
  purple: '#9333ea',
  orange: '#ea580c',
  teal:   '#0d9488',
};

const AdminOverview = () => {
  const { currencySymbol } = useSelector((state) => state.settings);

  const [stats, setStats] = useState({
    revenue: 0,
    ticketsSold: 0,
    activeMovies: 0,
    totalUsers: 0,
    totalTheatres: 0,
    revenueTrend: [],
  });
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
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
    { title: 'Total Revenue',   value: `${currencySymbol}${stats.revenue.toLocaleString()}`, icon: <FaMoneyBillWave />, color: ICON_COLORS.green },
    { title: 'Tickets Sold',    value: stats.ticketsSold,   icon: <FaTicketAlt />,          color: ICON_COLORS.blue   },
    { title: 'Active Movies',   value: stats.activeMovies,  icon: <FaFilm />,               color: ICON_COLORS.purple },
    { title: 'Total Users',     value: stats.totalUsers,    icon: <FaUsers />,              color: ICON_COLORS.orange },
    { title: 'Total Theatres',  value: stats.totalTheatres, icon: <FaBuilding />,           color: ICON_COLORS.teal   },
  ];

  const hasTrendData = stats.revenueTrend && stats.revenueTrend.length > 0;

  return (
    <div>
      {/* ── Header + Date Filter ── */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>

        <div className="flex flex-wrap items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <FaFilter className="text-gray-400 ml-2 mr-3" />
          <div className="flex items-center space-x-2 mr-4">
            <span className="text-xs text-gray-500 font-bold uppercase">From</span>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-bold uppercase">To</span>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 rounded text-sm border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, idx) => (
            <AnalyticsCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between"
              >
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <span
                  className="text-white p-3 rounded-lg text-xl"
                  style={{ backgroundColor: stat.color }}
                >
                  {stat.icon}
                </span>
              </div>
            ))}
          </div>

          {/* ── Revenue Trend Charts ── */}
          {hasTrendData && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart — Daily Revenue */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  Daily Revenue ({currencySymbol})
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={stats.revenueTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${currencySymbol}${v.toLocaleString()}`}
                    />
                    <Tooltip
                      formatter={(value) => [`${currencySymbol}${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="dailyRevenue"
                      name="Revenue"
                      stroke={ICON_COLORS.green}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart — Daily Tickets Sold */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
                  Daily Tickets Sold
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.revenueTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value) => [value, 'Tickets']}
                      contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar
                      dataKey="dailyTickets"
                      name="Tickets"
                      fill={ICON_COLORS.blue}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Friendly empty state when no trend data yet */}
          {!hasTrendData && (
            <p className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
              No booking data available for the selected period.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOverview;