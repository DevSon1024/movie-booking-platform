import { useEffect, useState } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa'; 

const ProfilePage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings on mount
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

  if (loading) return <div className="text-white text-center mt-20">Loading Dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-red-600 pl-4">My Tickets</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded text-center text-gray-400">
          You haven't booked any tickets yet.
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <TicketCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

// Sub-component for individual Ticket
const TicketCard = ({ booking }) => {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // FIX: Safety Check - Prevent crash if Show or Movie was deleted
  if (!booking.show || !booking.movie) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-red-900 shadow-lg flex items-center justify-between">
         <div>
             <h3 className="text-red-500 font-bold mb-1">Booking Data Unavailable</h3>
             <p className="text-gray-400 text-sm">
                The show or movie for Ticket ID <span className="font-mono text-xs bg-gray-900 p-1 rounded">{booking._id}</span> is no longer active.
             </p>
         </div>
         <div className="text-right">
             <span className="px-2 py-1 text-xs font-bold rounded bg-gray-700 text-gray-300">
               {booking.paymentStatus}
             </span>
         </div>
      </div>
    );
  }

  // Logic: Has the show ended?
  const showTime = new Date(booking.show.startTime);
  const now = new Date();
  const isPast = now > new Date(showTime.getTime() + 120 * 60000); 

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        movieId: booking.movie._id,
        rating,
        comment
      });
      toast.success("Review Submitted! You are a Verified Watcher.");
      setReviewOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col md:flex-row shadow-lg">
      {/* Movie Poster */}
      <div className="md:w-32 bg-gray-900 relative">
        <img 
          src={booking.movie.posterUrl} 
          alt={booking.movie.title} 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Ticket Details */}
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">{booking.movie.title}</h3>
            <p className="text-gray-400 text-sm">{booking.show.theatre?.name || 'Unknown Theatre'} | {booking.show.screenName}</p>
          </div>
          <div className="text-right">
             <span className={`px-2 py-1 text-xs font-bold rounded ${
               booking.paymentStatus === 'CONFIRMED' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
             }`}>
               {booking.paymentStatus}
             </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p className="text-gray-500">Date & Time</p>
            <p className="font-semibold text-white">
              {format(new Date(booking.show.startTime), 'PPp')}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Seats</p>
            <p className="font-semibold text-white break-words">
              {booking.seats.join(', ')}
            </p>
          </div>
        </div>

        {/* Action Area: Review Section */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          {!isPast ? (
            <p className="text-yellow-500 text-sm italic">
              Enjoy the show! Review option unlocks after the movie ends.
            </p>
          ) : (
            <div>
              {!reviewOpen ? (
                <button 
                  onClick={() => setReviewOpen(true)}
                  className="text-red-400 hover:text-white text-sm font-semibold underline transition"
                >
                  Write a Verified Review
                </button>
              ) : (
                <form onSubmit={handleReviewSubmit} className="mt-2 bg-gray-700 p-4 rounded animate-fade-in">
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-500'}`}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">Review</label>
                    <textarea 
                      className="w-full bg-gray-600 text-white text-sm p-2 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                      rows="2"
                      placeholder="How was the movie?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      type="button" 
                      onClick={() => setReviewOpen(false)}
                      className="text-gray-400 text-xs hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;