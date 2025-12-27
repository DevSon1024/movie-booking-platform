import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FaTicketAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaTheaterMasks,
  FaQrcode,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const ProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { currencySymbol } = useSelector((state) => state.settings);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, past
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/mybookings');
        setBookings(data);
      } catch (error) {
        toast.error("Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filterBookings = () => {
    const now = new Date();
    
    if (activeTab === 'upcoming') {
      return bookings.filter(b => b.show && new Date(b.show.startTime) > now);
    } else if (activeTab === 'past') {
      return bookings.filter(b => b.show && new Date(b.show.startTime) < now);
    }
    return bookings;
  };

  const filteredBookings = filterBookings();

  const handleShowQR = (booking) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Your Tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <FaTicketAlt className="text-red-600 dark:text-red-400" />
            My Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, <span className="font-semibold text-gray-900 dark:text-white">{userInfo?.name}</span>! 
            Here are all your movie bookings.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 inline-flex mb-8">
          {['all', 'upcoming', 'past'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-red-600 dark:bg-red-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'all' ? 'All Bookings' : tab === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>
        
        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-xl text-center border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <FaTheaterMasks className="text-6xl text-gray-400 dark:text-gray-600 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No {activeTab === 'all' ? '' : activeTab} bookings found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'all' 
                ? "You haven't booked any tickets yet. Start exploring movies!"
                : `You have no ${activeTab} bookings.`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
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

      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
        <QRModal 
          booking={selectedBooking} 
          onClose={() => setShowQRModal(false)} 
        />
      )}
    </div>
  );
};

// Ticket Card Component
const TicketCard = ({ booking, currencySymbol, onShowQR }) => {
  if (!booking.show || !booking.movie) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-red-300 dark:border-red-900 shadow-md">
         <div className="flex items-start justify-between">
           <div className="flex-1">
               <div className="flex items-center gap-2 mb-2">
                 <FaTimesCircle className="text-red-600 dark:text-red-400 text-xl" />
                 <h3 className="text-red-600 dark:text-red-400 font-bold text-lg">
                   Booking Data Unavailable
                 </h3>
               </div>
               <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  The show or movie for this booking is no longer available.
               </p>
               <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                 Booking ID: {booking._id}
               </p>
           </div>
           <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
             {booking.paymentStatus}
           </span>
         </div>
      </div>
    );
  }

  const showTime = new Date(booking.show.startTime);
  const now = new Date();
  const isUpcoming = showTime > now;
  const isPast = showTime < now;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all">
      <div className="flex flex-col md:flex-row">
        
        {/* Movie Poster */}
        <div className="md:w-40 h-56 md:h-auto bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          <img 
            src={booking.movie.posterUrl} 
            alt={booking.movie.title} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Ticket Details */}
        <div className="flex-1 p-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
            <div className="mb-3 sm:mb-0">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {booking.movie.title}
              </h3>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <FaMapMarkerAlt className="text-red-500" />
                <span className="font-medium">{booking.show.theatre?.name}</span>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
                booking.paymentStatus === 'confirmed' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              }`}>
                <FaCheckCircle className="inline mr-1" />
                {booking.paymentStatus}
              </span>
              {isUpcoming && (
                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  Upcoming
                </span>
              )}
            </div>
          </div>

          {/* Booking Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Date & Time */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-2">
                <FaCalendarAlt />
                <span className="uppercase tracking-wide font-medium">Date & Time</span>
              </div>
              <p className="text-gray-900 dark:text-white font-bold">
                {format(showTime, 'MMM dd, yyyy')}
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {format(showTime, 'h:mm a')}
              </p>
            </div>

            {/* Theatre Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-2">
                <FaTheaterMasks />
                <span className="uppercase tracking-wide font-medium">Theatre</span>
              </div>
              <p className="text-gray-900 dark:text-white font-bold truncate">
                {booking.show.theatre?.name}
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {booking.show.screenName}
              </p>
            </div>

            {/* Seats */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-2">
                <FaTicketAlt />
                <span className="uppercase tracking-wide font-medium">Seats</span>
              </div>
              <p className="text-gray-900 dark:text-white font-bold">
                {booking.seats.join(', ')}
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {booking.seats.length} {booking.seats.length === 1 ? 'Seat' : 'Seats'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currencySymbol}{booking.totalPrice}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => onShowQR(booking)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaQrcode />
                Show QR Code
              </button>
            </div>
          </div>

          {/* Booking ID */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Booking ID: <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{booking._id}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// QR Code Modal Component
const QRModal = ({ booking, onClose }) => {
  const qrData = JSON.stringify({
    bookingId: booking._id,
    movieTitle: booking.movie.title,
    theatre: booking.show.theatre?.name,
    screen: booking.show.screenName,
    showTime: booking.show.startTime,
    seats: booking.seats,
    totalPrice: booking.totalPrice
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaQrcode className="text-purple-600" />
            Your Ticket
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* QR Code */}
          <div className="bg-white p-6 rounded-xl inline-block mb-6 shadow-lg">
            <QRCodeSVG 
              value={qrData} 
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Movie Info */}
          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {booking.movie.title}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
              {booking.show.theatre?.name} - {booking.show.screenName}
            </p>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {format(new Date(booking.show.startTime), 'MMM dd, yyyy • h:mm a')}
            </p>
          </div>

          {/* Seats */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg mb-4">
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 uppercase tracking-wide font-medium">
              Seats
            </p>
            <p className="text-gray-900 dark:text-white font-bold text-lg">
              {booking.seats.join(', ')}
            </p>
          </div>

          {/* Booking ID */}
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-6">
            ID: {booking._id}
          </p>

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              <strong>📱 Show this QR code at the theatre entrance</strong>
            </p>
            <p className="text-yellow-700 dark:text-yellow-400 text-xs mt-1">
              Please arrive 15 minutes before showtime
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-3 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;