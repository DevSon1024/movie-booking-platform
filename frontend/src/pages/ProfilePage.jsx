import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FaStar, FaTicketAlt, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaRegStar, FaTheaterMasks } from 'react-icons/fa';

const ProfilePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, past

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-center animate-pulse">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
          Loading Your Tickets...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 py-8">
      <div className="max-w-5xl mx-auto px-4">
        
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
              <TicketCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Ticket Card Component
const TicketCard = ({ booking }) => {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!booking.show || !booking.movie) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-red-300 dark:border-red-900 shadow-md">
         <div className="flex items-center justify-between">
           <div>
               <h3 className="text-red-600 dark:text-red-400 font-bold mb-1">⚠️ Booking Data Unavailable</h3>
               <p className="text-gray-600 dark:text-gray-400 text-sm">
                  The show or movie for this booking is no longer available.
               </p>
               <p className="text-xs text-gray-500 dark:text-gray-500 font-mono mt-2">
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
  const isPast = now > new Date(showTime.getTime() + 120 * 60000);
  const isUpcoming = showTime > now;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        movieId: booking.movie._id,
        rating,
        comment
      });
      toast.success("Review Submitted! Thank you for your feedback.");
      setReviewOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex flex-col md:flex-row">
        
        {/* Movie Poster */}
        <div className="md:w-40 h-48 md:h-auto bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          <img 
            src={booking.movie.posterUrl} 
            alt={booking.movie.title} 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Ticket Details */}
        <div className="p-6 flex-grow">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {booking.movie.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                {booking.show.theatre?.name || 'Unknown Theatre'} | {booking.show.screenName}
              </p>
            </div>
            <div className="mt-2 sm:mt-0">
               <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                 booking.paymentStatus === 'CONFIRMED' 
                   ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                   : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
               }`}>
                 {booking.paymentStatus}
               </span>
               {isUpcoming && (
                 <span className="ml-2 px-3 py-1.5 text-xs font-bold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                   Upcoming
                 </span>
               )}
            </div>
          </div>

          {/* Show Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Date & Time</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {format(showTime, 'PPp')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaTicketAlt className="text-gray-400 dark:text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Seats</p>
                <p className="font-semibold text-gray-900 dark:text-white break-words">
                  {booking.seats.join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div>
            {!isPast ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-400 text-sm flex items-center gap-2">
                  <FaClock className="text-yellow-600 dark:text-yellow-500" />
                  Enjoy the show! Review option will be available after the movie ends.
                </p>
              </div>
            ) : (
              <div>
                {!reviewOpen ? (
                  <button 
                    onClick={() => setReviewOpen(true)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FaStar /> Write a Verified Review
                  </button>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border border-gray-200 dark:border-gray-600 animate-fade-in">
                    {/* Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl transition-all hover:scale-110 ${
                              star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                            }`}
                          >
                            {star <= rating ? <FaStar /> : <FaRegStar />}
                          </button>
                        ))}
                        <span className="ml-2 text-gray-600 dark:text-gray-400 font-medium">
                          {rating}/5
                        </span>
                      </div>
                    </div>
                    
                    {/* Comment */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Review
                      </label>
                      <textarea 
                        className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 outline-none transition-all resize-none"
                        rows="3"
                        placeholder="Share your thoughts about this movie..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                      <button 
                        type="button" 
                        onClick={() => setReviewOpen(false)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
                      >
                        Submit Review
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;