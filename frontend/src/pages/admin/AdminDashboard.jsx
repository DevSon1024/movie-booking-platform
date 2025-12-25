import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FaFilm, FaTheaterMasks, FaCalendarAlt, FaCog, FaChartLine, FaMoneyBillWave, FaTicketAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  // Mock Analytics Data (For Viva Presentation)
  const stats = [
    { title: 'Total Revenue', value: '$12,450', icon: <FaMoneyBillWave />, color: 'bg-green-600' },
    { title: 'Tickets Sold', value: '843', icon: <FaTicketAlt />, color: 'bg-blue-600' },
    { title: 'Active Movies', value: '12', icon: <FaFilm />, color: 'bg-purple-600' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 hidden md:block">
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
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.color} p-6 rounded-lg shadow-lg flex items-center justify-between`}>
              <div>
                <p className="text-gray-200 text-sm uppercase">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="text-4xl opacity-50">{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions / Outlet for Sub-pages */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <p className="text-gray-400 mb-4">Select an option from the sidebar to manage content.</p>
          {/* This is where the child routes (Movies, Settings) will appear */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;