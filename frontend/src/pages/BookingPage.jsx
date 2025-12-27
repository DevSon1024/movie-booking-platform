import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector
import api from "../services/api";
import toast from "react-hot-toast";
import { FaCreditCard } from "react-icons/fa";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Fetch currency from Redux
  const { currencySymbol } = useSelector((state) => state.settings);
  
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;
    const seatLabel = `${seat.row}${seat.number}`;
    if (selectedSeats.includes(seatLabel)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatLabel));
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
    setShowPaymentModal(true); // Open Modal instead of direct booking
  };

  const processPaymentAndBook = async () => {
    setProcessing(true);
    setTimeout(async () => {
      try {
        await api.post("/bookings", { showId: id, selectedSeats });
        toast.success("Payment Successful! Booking Confirmed.");
        navigate("/profile");
      } catch (error) {
        toast.error(error.response?.data?.message || "Booking failed");
        setProcessing(false);
        setShowPaymentModal(false);
      }
    }, 2000);
  };

  if (!show) return <div className="text-white text-center mt-20">Loading...</div>;

  const seatsByRow = show.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const totalPrice = selectedSeats.length * show.seats[0].price;

  return (
    <div className="container mx-auto px-4 py-6 text-white max-w-4xl">
      <h2 className="text-2xl font-bold mb-2">{show.movie.title}</h2>
      <p className="text-gray-400 mb-8">{show.theatre.name} | {show.screenName}</p>

      {/* Screen Visual ... (Same as before) */}
      <div className="w-full h-4 bg-gray-700 rounded-lg mb-2 shadow-[0_10px_20px_rgba(255,255,255,0.1)]"></div>
      <p className="text-center text-xs text-gray-500 mb-10">SCREEN THIS WAY</p>

      {/* Seat Grid ... (Same as before) */}
      <div className="flex flex-col gap-4 items-center">
        {Object.keys(seatsByRow).sort().map((rowLabel) => (
            <div key={rowLabel} className="flex gap-4 items-center">
              <span className="w-6 text-center font-bold text-gray-500">{rowLabel}</span>
              <div className="flex gap-2">
                {seatsByRow[rowLabel].sort((a, b) => a.number - b.number).map((seat) => {
                    const seatLabel = `${seat.row}${seat.number}`;
                    const isSelected = selectedSeats.includes(seatLabel);
                    let seatColor = "bg-gray-700 hover:bg-gray-600 cursor-pointer";
                    if (seat.isBooked) seatColor = "bg-red-900 cursor-not-allowed text-red-900";
                    if (isSelected) seatColor = "bg-green-500 text-black font-bold shadow-lg shadow-green-500/50";
                    return (
                      <button key={seat._id} onClick={() => handleSeatClick(seat)} disabled={seat.isBooked}
                        className={`w-8 h-8 rounded-t-lg text-xs transition-all duration-200 ${seatColor}`}>
                        {!seat.isBooked && seat.number}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>

      {/* Action Bar */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-800 border-t border-gray-700 p-4">
          <div className="container mx-auto flex justify-between items-center max-w-4xl">
            <div>
              <p className="text-gray-400 text-sm">Selected: {selectedSeats.join(", ")}</p>
              {/* Dynamic Currency */}
              <p className="text-xl font-bold">Total: {currencySymbol}{totalPrice}</p>
            </div>
            <button onClick={handleBooking} disabled={processing} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold">
               Checkout
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl max-w-md w-full border border-gray-600">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><FaCreditCard className="text-yellow-500" /> Payment Gateway</h3>
            <div className="bg-gray-700 p-4 rounded mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Total Amount:</span>
                {/* Dynamic Currency */}
                <span className="text-xl font-bold text-white">{currencySymbol}{totalPrice}</span>
              </div>
            </div>
            {/* ... Payment Form (Same as before) ... */}
            <form onSubmit={(e) => { e.preventDefault(); processPaymentAndBook(); }} className="space-y-4">
               <input type="text" placeholder="Card Number (Any 16 digits)" className="w-full bg-gray-900 p-3 rounded text-white border border-gray-700" required />
               <div className="flex gap-4">
                  <input type="text" placeholder="MM/YY" className="w-1/2 bg-gray-900 p-3 rounded text-white border border-gray-700" required />
                  <input type="text" placeholder="CVV" className="w-1/2 bg-gray-900 p-3 rounded text-white border border-gray-700" required />
               </div>
               <button type="submit" disabled={processing} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded">
                  {processing ? "Processing..." : `Pay ${currencySymbol}${totalPrice}`}
               </button>
            </form>
            {!processing && <button onClick={() => setShowPaymentModal(false)} className="w-full mt-3 text-gray-400 hover:text-white text-sm">Cancel</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;