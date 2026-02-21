import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import toast from 'react-hot-toast';
import TicketCard from '../components/Booking/TicketCard';
import QRModal from '../components/Booking/QRModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaTicketAlt, FaList, FaTh } from 'react-icons/fa';

const MyBookingsPage = () => {
  const { currencySymbol } = useSelector((state) => state.settings);
  
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [viewMode, setViewMode] = useState(localStorage.getItem('myBookingsView') || 'list');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    localStorage.setItem('myBookingsView', viewMode);
  }, [viewMode]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/mybookings');
      setBookings(res.data);
    } catch (error) {
      toast.error('Failed to load bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (booking) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" text="Loading Bookings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Bookings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage your movie tickets
            </p>
          </div>
          
          {bookings.length > 0 && (
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm shrink-0">
               <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                  title="List View"
               >
                  <FaList />
               </button>
               <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                  title="Grid View"
               >
                  <FaTh />
               </button>
            </div>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <FaTicketAlt className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl font-medium text-gray-800 dark:text-gray-200">No bookings found</p>
            <p className="text-md text-gray-500 dark:text-gray-400 mt-2">
              Book your first movie ticket to see it here
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "grid grid-cols-1 gap-6"}>
            {bookings.map((booking) => (
              <TicketCard
                key={booking._id}
                booking={booking}
                currencySymbol={currencySymbol}
                onShowQR={handleShowQR}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      {showQRModal && selectedBooking && (
        <QRModal booking={selectedBooking} onClose={() => setShowQRModal(false)} />
      )}
    </div>
  );
};

export default MyBookingsPage;
