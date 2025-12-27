import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";
import toast from "react-hot-toast";
import { FaCreditCard, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currencySymbol } = useSelector((state) => state.settings);

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShow = async () => {
      try {
        const { data } = await api.get(`/shows/${id}`);
        setShow(data);
        setLoading(false);
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Failed to load show details");
        setLoading(false);
      }
    };

    if (id) {
      fetchShow();
    }
  }, [id]);

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    const seatLabel = `${seat.row}${seat.number}`;
    if (selectedSeats.includes(seatLabel)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatLabel));
    } else {
      if (selectedSeats.length >= 6) {
        toast.error("You can select max 6 seats");
        return;
      }
      setSelectedSeats([...selectedSeats, seatLabel]);
    }
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
    setShowPaymentModal(true);
  };

  const processPaymentAndBook = async () => {
    setProcessing(true);
    setTimeout(async () => {
      try {
        await api.post("/bookings", { showId: id, selectedSeats });
        toast.success("Booking Confirmed!");
        navigate("/profile");
      } catch (error) {
        toast.error(error.response?.data?.message || "Booking failed");
        setProcessing(false);
        setShowPaymentModal(false);
      }
    }, 1500);
  };

  if (loading)
    return (
      <div className="text-white text-center mt-20 animate-pulse">
        Loading Cinema Hall...
      </div>
    );

  if (!show)
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl text-red-500">Show Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-gray-700 px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );

  // Group seats by Row
  const seatsByRow = show.seats
    ? show.seats.reduce((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = [];
        acc[seat.row].push(seat);
        return acc;
      }, {})
    : {};

  // FIX: Use 'show.price' instead of 'show.seats[0].price'
  const pricePerSeat = show.price || 0;
  const totalPrice = selectedSeats.length * (show.price || 0);

  return (
    <div className="container mx-auto px-4 py-6 text-white max-w-5xl pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white"
        >
          <FaArrowLeft />
        </button>
        <div>
          <h2 className="text-2xl font-bold">{show.movie?.title}</h2>
          <p className="text-gray-400 text-sm">
            {show.theatre?.name} | {show.screenName}
          </p>
        </div>
      </div>

      {/* Screen Visual */}
      <div className="w-full h-12 bg-gradient-to-b from-white/10 to-transparent rounded-[50%] mb-8 border-t-4 border-white/20 shadow-[0_-10px_20px_rgba(255,255,255,0.1)]"></div>
      <p className="text-center text-xs text-gray-500 mb-8 font-tracking-widest">
        SCREEN
      </p>

      {/* Seat Grid */}
      <div className="w-full overflow-x-auto pb-12 px-4 md:px-0">
        <div className="flex flex-col gap-3 items-center min-w-max mx-auto">
          {Object.keys(seatsByRow)
            .sort()
            .map((rowLabel) => (
              <div key={rowLabel} className="flex gap-2 items-center">
                <span className="w-6 text-center font-bold text-gray-500 text-sm">
                  {rowLabel}
                </span>
                <div className="flex gap-2 md:gap-3">
                  {seatsByRow[rowLabel]
                    .sort((a, b) => a.number - b.number)
                    .map((seat) => {
                      const seatLabel = `${seat.row}${seat.number}`;
                      const isSelected = selectedSeats.includes(seatLabel);

                      let seatClass =
                        "bg-gray-700 hover:bg-gray-600 cursor-pointer hover:scale-110";
                      if (seat.isBooked)
                        seatClass = "bg-gray-800 cursor-not-allowed opacity-40";
                      if (isSelected)
                        seatClass =
                          "bg-green-500 text-black font-bold shadow-[0_0_15px_rgba(34,197,94,0.6)] scale-110";

                      return (
                        <button
                          key={seat._id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.isBooked}
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-t-xl text-[10px] md:text-xs transition-all duration-200 flex items-center justify-center ${seatClass}`}
                        >
                          {isSelected ? (
                            <FaCheckCircle />
                          ) : (
                            !seat.isBooked && seat.number
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-700 p-4 shadow-2xl z-40 animate-slide-up">
          <div className="container mx-auto flex justify-between items-center max-w-4xl">
            <div>
              <p className="text-gray-400 text-xs md:text-sm mb-1">
                {selectedSeats.length} Seat(s) Selected
              </p>
              <p className="text-xl md:text-2xl font-bold text-white">
                Total:{" "}
                <span className="text-green-400">
                  {currencySymbol}
                  {totalPrice}
                </span>
              </p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700 text-white px-6 md:px-10 py-3 rounded-full font-bold shadow-lg transition transform hover:scale-105"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 md:p-8 rounded-2xl max-w-md w-full border border-gray-600 shadow-2xl animate-fade-in">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <FaCreditCard className="text-yellow-500" /> Payment
            </h3>

            <div className="bg-gray-700/50 p-4 rounded-xl mb-6 border border-gray-600">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400">Seats:</span>
                <span className="text-white font-medium">
                  {selectedSeats.join(", ")}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-400">Amount:</span>
                <span className="font-bold text-green-400">
                  {currencySymbol}
                  {totalPrice}
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                processPaymentAndBook();
              }}
              className="space-y-4"
            >
              {/* Payment Form Inputs */}
              <div>
                <label className="text-xs text-gray-500 ml-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-gray-900 p-3 rounded-lg text-white border border-gray-700 focus:border-green-500 outline-none transition"
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 ml-1">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full bg-gray-900 p-3 rounded-lg text-white border border-gray-700 focus:border-green-500 outline-none transition"
                    required
                  />
                </div>
                <div className="w-1/3">
                  <label className="text-xs text-gray-500 ml-1">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full bg-gray-900 p-3 rounded-lg text-white border border-gray-700 focus:border-green-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl mt-4 shadow-lg transition-all relative overflow-hidden group"
              >
                {processing
                  ? "Processing..."
                  : `Pay ${currencySymbol}{totalPrice}`}
              </button>
            </form>

            {!processing && (
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full mt-4 text-gray-500 hover:text-white text-sm transition"
              >
                Cancel Transaction
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;