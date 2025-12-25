import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const { data } = await api.get(`/shows/${id}`);
        setShow(data);
      } catch (error) {
        toast.error("Failed to load show details");
      }
    };
    fetchShow();
  }, [id]);

  // Helper to toggle seat selection
  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    const seatLabel = `${seat.row}${seat.number}`;
    if (selectedSeats.includes(seatLabel)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatLabel));
    } else {
      if (selectedSeats.length >= 5) {
        toast.error("You can only select up to 5 seats");
        return;
      }
      setSelectedSeats([...selectedSeats, seatLabel]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;
    setProcessing(true);
    try {
      await api.post('/bookings', {
        showId: id,
        selectedSeats
      });
      toast.success('Booking Confirmed!');
      navigate('/profile'); // We will build this next
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!show) return <div className="text-white text-center mt-20">Loading Map...</div>;

  // Group seats by Row for rendering: { "A": [seat1, seat2], "B": [...] }
  const seatsByRow = show.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-6 text-white max-w-4xl">
      <h2 className="text-2xl font-bold mb-2">{show.movie.title}</h2>
      <p className="text-gray-400 mb-8">{show.theatre.name} | {show.screenName}</p>

      {/* SCREEN VISUAL */}
      <div className="w-full h-4 bg-gray-700 rounded-lg mb-2 shadow-[0_10px_20px_rgba(255,255,255,0.1)]"></div>
      <p className="text-center text-xs text-gray-500 mb-10">SCREEN THIS WAY</p>

      {/* SEAT GRID */}
      <div className="flex flex-col gap-4 items-center">
        {Object.keys(seatsByRow).sort().map(rowLabel => (
          <div key={rowLabel} className="flex gap-4 items-center">
            <span className="w-6 text-center font-bold text-gray-500">{rowLabel}</span>
            <div className="flex gap-2">
              {seatsByRow[rowLabel].sort((a,b) => a.number - b.number).map(seat => {
                const seatLabel = `${seat.row}${seat.number}`;
                const isSelected = selectedSeats.includes(seatLabel);
                
                let seatColor = "bg-gray-700 hover:bg-gray-600 cursor-pointer"; // Available
                if (seat.isBooked) seatColor = "bg-red-900 cursor-not-allowed text-red-900"; // Booked (Hide text)
                if (isSelected) seatColor = "bg-green-500 text-black font-bold shadow-lg shadow-green-500/50"; // Selected

                return (
                  <button
                    key={seat._id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.isBooked}
                    className={`w-8 h-8 rounded-t-lg text-xs transition-all duration-200 ${seatColor}`}
                  >
                    {!seat.isBooked && seat.number}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* LEGEND */}
      <div className="flex justify-center gap-6 mt-10 text-sm text-gray-400">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-700 rounded"></div> Available</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div> Selected</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-900 rounded"></div> Booked</div>
      </div>

      {/* ACTION BAR */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-700 p-4">
          <div className="container mx-auto flex justify-between items-center max-w-4xl">
            <div>
              <p className="text-gray-400 text-sm">Selected: {selectedSeats.join(', ')}</p>
              <p className="text-xl font-bold">Total: ${selectedSeats.length * show.seats[0].price}</p>
            </div>
            <button 
              onClick={handleBooking}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition disabled:opacity-50"
            >
              {processing ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;