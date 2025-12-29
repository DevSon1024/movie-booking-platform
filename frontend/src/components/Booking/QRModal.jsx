import { QRCodeSVG } from 'qrcode.react';
import { FaTimes, FaQrcode } from 'react-icons/fa';
import { format } from 'date-fns';

const QRModal = ({ booking, onClose }) => {
  const qrData = JSON.stringify({
    id: booking._id, movie: booking.movie.title, 
    seats: booking.seats, time: booking.show.startTime
  });

  return (
    // Fixed: z-index high (z-50) and overflow-y-auto ensures it's scrollable if screen is small
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative animate-fade-in my-auto">
        
        {/* Close Button Top Right */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-600 dark:text-white hover:bg-red-100 hover:text-red-500 transition shadow-sm"
        >
          <FaTimes size={16} />
        </button>

        {/* Ticket Content */}
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-center gap-2">
            <FaQrcode className="text-blue-500" /> Digital Ticket
          </h3>
          
          <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 inline-block mb-6">
            <QRCodeSVG value={qrData} size={180} level="H" />
          </div>
          
          <h4 className="text-lg font-bold text-gray-800 dark:text-white">{booking.movie.title}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {booking.show.theatre?.name} • {booking.show.screenName}
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
             <div className="flex justify-between text-sm">
               <span className="text-gray-500">Date</span>
               <span className="font-semibold dark:text-white">{format(new Date(booking.show.startTime), 'MMM dd')}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-gray-500">Time</span>
               <span className="font-semibold dark:text-white">{format(new Date(booking.show.startTime), 'h:mm a')}</span>
             </div>
             <div className="flex justify-between text-sm border-t border-dashed border-gray-300 dark:border-gray-700 pt-2 mt-2">
               <span className="text-gray-500">Seats</span>
               <span className="font-bold text-blue-600">{booking.seats.join(', ')}</span>
             </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 transition">
          Close Ticket
        </button>
      </div>
    </div>
  );
};
export default QRModal;