import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";
import toast from "react-hot-toast";
import { FaCreditCard, FaArrowLeft, FaCheckCircle, FaTimes, FaExclamationTriangle } from "react-icons/fa";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-center animate-pulse">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
          Loading Cinema Hall...
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-red-600 dark:text-red-400 mb-4">Show Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ CHECK IF SHOW IS CANCELLED
  if (show.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl p-8 text-center">
          <FaExclamationTriangle className="text-6xl text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-3">
            Show Cancelled
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            This show has been cancelled by the theatre.
          </p>
          {show.cancelReason && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-6">
              Reason: {show.cancelReason}
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/movie/${show.movie._id}`)}
              className="w-full bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              View Other Shows
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const seatsByRow = show.seats
    ? show.seats.reduce((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = [];
        acc[seat.row].push(seat);
        return acc;
      }, {})
    : {};

  const pricePerSeat = show.price || 0;
  const totalPrice = selectedSeats.length * (show.price || 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-5xl pb-32">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{show.movie?.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {show.theatre?.name} | {show.screenName}
            </p>
          </div>
        </div>

        {/* Screen Visual */}
        <div className="w-full max-w-3xl mx-auto mb-12">
          <div className="h-3 bg-gradient-to-b from-gray-400 dark:from-gray-600 to-transparent rounded-[50%] shadow-[0_-5px_15px_rgba(0,0,0,0.2)] dark:shadow-[0_-5px_15px_rgba(255,255,255,0.1)]"></div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3 font-semibold tracking-[0.3em]">
            SCREEN
          </p>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-t-lg"></div>
            <span className="text-gray-600 dark:text-gray-400">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 dark:bg-gray-800 opacity-40 rounded-t-lg"></div>
            <span className="text-gray-600 dark:text-gray-400">Booked</span>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="w-full overflow-x-auto pb-12 px-4">
          <div className="flex flex-col gap-3 items-center min-w-max mx-auto">
            {Object.keys(seatsByRow)
              .sort()
              .map((rowLabel) => (
                <div key={rowLabel} className="flex gap-2 items-center">
                  <span className="w-8 text-center font-bold text-gray-600 dark:text-gray-400 text-sm">
                    {rowLabel}
                  </span>
                  <div className="flex gap-2 md:gap-3">
                    {seatsByRow[rowLabel]
                      .sort((a, b) => a.number - b.number)
                      .map((seat) => {
                        const seatLabel = `${seat.row}${seat.number}`;
                        const isSelected = selectedSeats.includes(seatLabel);

                        let seatClass =
                          "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer hover:scale-110";
                        if (seat.isBooked)
                          seatClass = "bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed opacity-40";
                        if (isSelected)
                          seatClass =
                            "bg-green-500 dark:bg-green-600 text-white font-bold shadow-lg scale-110";

                        return (
                          <button
                            key={seat._id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.isBooked}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-t-xl text-[10px] md:text-xs transition-all duration-200 flex items-center justify-center ${seatClass}`}
                          >
                            {isSelected ? (
                              <FaCheckCircle className="text-sm" />
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
          <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-2xl z-40 animate-slide-up">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl">
              <div className="text-center sm:text-left">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  {selectedSeats.length} Seat(s) Selected: {selectedSeats.join(", ")}
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Total:{" "}
                  <span className="text-green-600 dark:text-green-400">
                    {currencySymbol}{totalPrice}
                  </span>
                </p>
              </div>
              <button
                onClick={handleCheckout}
                disabled={processing}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FaCreditCard className="text-yellow-500" /> Payment
                </h3>
                {!processing && (
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-6 border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Seats:</span>
                  <span className="text-gray-900 dark:text-white font-medium text-sm">
                    {selectedSeats.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {currencySymbol}{totalPrice}
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
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 ml-1 block mb-1.5">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 outline-none transition-all"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 dark:text-gray-400 ml-1 block mb-1.5">
                      Expiry
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="text-xs text-gray-600 dark:text-gray-400 ml-1 block mb-1.5">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white font-bold py-4 rounded-xl mt-4 shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? "Processing Payment..." : `Pay ${currencySymbol}${totalPrice}`}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;