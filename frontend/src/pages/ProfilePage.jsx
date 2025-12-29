import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import toast from 'react-hot-toast';
import TicketCard from '../components/Booking/TicketCard';
import QRModal from '../components/Booking/QRModal';
import { FaTicketAlt } from 'react-icons/fa';

const ProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { currencySymbol } = useSelector((state) => state.settings);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/mybookings');
        setBookings(data);
      } catch (error) { toast.error("Failed to fetch bookings"); } 
      finally { setLoading(false); }
    };
    fetchBookings();
  }, []);

  const handleShowQR = (booking) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <FaTicketAlt className="text-red-600" /> My Tickets
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Hello {userInfo?.name}, here are your bookings.</p>

        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings found.</p>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <TicketCard 
                key={booking._id} 
                booking={booking} 
                currencySymbol={currencySymbol}
                onShowQR={handleShowQR}
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
export default ProfilePage;