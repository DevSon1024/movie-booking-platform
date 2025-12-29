import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle, FaQrcode } from 'react-icons/fa';
import { format } from 'date-fns';

const TicketCard = ({ booking, currencySymbol, onShowQR }) => {
  if (!booking.show || !booking.movie) return null;

  const showTime = new Date(booking.show.startTime);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row">
      <div className="md:w-48 h-48 md:h-auto relative">
        <img src={booking.movie.posterUrl} alt={booking.movie.title} className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 bg-black/60 text-white text-xs px-2 py-1 rounded-br-lg">
          {booking.seats.length} Seats
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
             <h3 className="text-xl font-bold text-gray-900 dark:text-white">{booking.movie.title}</h3>
             <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full font-bold uppercase flex items-center gap-1">
               <FaCheckCircle size={10} /> Confirmed
             </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
            <FaMapMarkerAlt className="text-red-500"/> {booking.show.theatre?.name} — {booking.show.screenName}
          </p>
          
          <div className="flex gap-6 mt-4">
             <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded w-fit">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Date</p>
                <p className="text-sm font-semibold dark:text-white">{format(showTime, 'MMM dd, yyyy')}</p>
             </div>
             <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded w-fit">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Time</p>
                <p className="text-sm font-semibold dark:text-white">{format(showTime, 'h:mm a')}</p>
             </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
          <div>
             <p className="text-xs text-gray-400">Total Price</p>
             <p className="text-xl font-bold text-green-600">{currencySymbol}{booking.totalPrice}</p>
          </div>
          <button 
            onClick={() => onShowQR(booking)}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition"
          >
            <FaQrcode /> View Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
export default TicketCard;