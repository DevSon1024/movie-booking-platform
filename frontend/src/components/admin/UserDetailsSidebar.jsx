import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaTicketAlt, FaSpinner, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { getUserDetails, getUserStats } from '../../services/userService';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const UserDetailsSidebar = ({ userId, onClose, onUserDeleted }) => {
  const { currencySymbol } = useSelector((state) => state.settings);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookings, setShowBookings] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [detailsData, statsData] = await Promise.all([
        getUserDetails(userId),
        getUserStats(userId),
      ]);
      
      setUser(detailsData.user);
      setBookings(detailsData.bookings);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load user details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-red-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{user.name}</h3>
                <p className="text-red-100">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-red-100 text-xs uppercase tracking-wider mb-1">City</p>
                <p className="font-semibold">{user.city || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-red-100 text-xs uppercase tracking-wider mb-1">Phone</p>
                <p className="font-semibold">{user.phone || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-red-100 text-xs uppercase tracking-wider mb-1">Joined</p>
                <p className="font-semibold">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-red-100 text-xs uppercase tracking-wider mb-1">Role</p>
                <p className="font-semibold uppercase">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaChartLine className="text-red-600" />
                Booking Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <FaTicketAlt className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Bookings</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <FaMoneyBillWave className="text-green-600 dark:text-green-400 text-xl" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currencySymbol}{stats.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Spent</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-900/30">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currencySymbol}{stats.averageTicketPrice}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Avg Ticket Price</p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-900/30">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.consistency}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">Bookings/Month</p>
                </div>
              </div>

              {/* Favorite Genres */}
              {stats.favoriteGenres && stats.favoriteGenres.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Favorite Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {stats.favoriteGenres.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white">{item.genre}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">({item.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings Over Time Chart */}
              {stats.bookingsByMonth && stats.bookingsByMonth.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Bookings Over Time (Last 6 Months)</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-end justify-between gap-2 h-32">
                      {stats.bookingsByMonth.map((item, index) => {
                        const maxCount = Math.max(...stats.bookingsByMonth.map(m => m.count));
                        const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                              <div
                                className="w-full bg-gradient-to-t from-red-500 to-red-600 rounded-t transition-all duration-300 hover:from-red-600 hover:to-red-700"
                                style={{ height: `${height}%`, minHeight: item.count > 0 ? '8px' : '0' }}
                                title={`${item.count} bookings`}
                              />
                              {item.count > 0 && (
                                <span className="absolute -top-5 text-xs font-bold text-gray-700 dark:text-gray-300">
                                  {item.count}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                              {item.month.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bookings Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaTicketAlt className="text-red-600" />
                Booking History ({bookings.length})
              </h3>
              {bookings.length > 0 && (
                <button
                  onClick={() => setShowBookings(!showBookings)}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                >
                  {showBookings ? 'Hide' : 'View All'}
                </button>
              )}
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <FaTicketAlt className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No bookings yet</p>
              </div>
            ) : showBookings ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={booking.movie?.posterUrl}
                        alt={booking.movie?.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                          {booking.movie?.title}
                        </h4>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <p className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-red-500" />
                            {booking.show?.theatre?.name}, {booking.show?.theatre?.city}
                          </p>
                          <p className="flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-500" />
                            {new Date(booking.show?.startTime).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <p>
                            <span className="font-semibold">Seats:</span> {booking.seats.join(', ')}
                          </p>
                          <p className="font-bold text-green-600 dark:text-green-400">
                            {currencySymbol}{booking.totalPrice}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click "View All" to see booking history
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

UserDetailsSidebar.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onUserDeleted: PropTypes.func,
};

export default UserDetailsSidebar;
