import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";
import toast from "react-hot-toast";
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { 
  FaCreditCard, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimes, 
  FaExclamationTriangle,
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTheaterMasks,
  FaHome
} from "react-icons/fa";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currencySymbol } = useSelector((state) => state.settings);

  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);
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
      if (selectedSeats.length >= 10) {
        toast.error("You can select maximum 10 seats");
        return;
      }
      setSelectedSeats([...selectedSeats, seatLabel]);
    }
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    setShowPaymentModal(true);
  };

  const processPaymentAndBook = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        const { data } = await api.post("/bookings", { 
          showId: id, 
          selectedSeats 
        });
        
        setBookingData(data);
        setShowPaymentModal(false);
        setShowSuccessModal(true);
        toast.success("🎉 Booking Confirmed!");
        
      } catch (error) {
        toast.error(error.response?.data?.message || "Booking failed. Please try again.");
        setProcessing(false);
      }
    }, 2000);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate("/profile");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Cinema Hall...</p>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-600 dark:text-red-400 mb-4 font-bold">Show Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check if show is cancelled
  if (show.status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl p-8 text-center">
          <FaExclamationTriangle className="text-6xl text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-3">
            Show Cancelled
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            This show has been cancelled by the theatre.
          </p>
          {show.cancelReason && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Reason:</p>
              <p className="text-gray-800 dark:text-gray-200 italic">{show.cancelReason}</p>
            </div>
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

  const totalPrice = selectedSeats.length * (show.price || 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      <div className="container mx-auto px-4 py-6 max-w-5xl pb-32">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 shadow-md border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 inline-flex items-center gap-2 transition-colors"
          >
            <FaArrowLeft /> Back
          </button>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {show.movie?.title}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-red-500" />
                  {show.theatre?.name}
                </span>
                <span className="flex items-center gap-1">
                  <FaTheaterMasks className="text-blue-500" />
                  {show.screenName}
                </span>
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="text-green-500" />
                  {format(new Date(show.startTime), 'MMM dd, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <FaClock className="text-purple-500" />
                  {format(new Date(show.startTime), 'h:mm a')}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 px-6 py-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Price per seat</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currencySymbol}{show.price}
              </p>
            </div>
          </div>
        </div>

        {/* Screen Visual */}
        <div className="w-full max-w-3xl mx-auto mb-12">
          <div className="h-3 bg-gradient-to-b from-gray-400 dark:from-gray-600 to-transparent rounded-[50%] shadow-[0_-5px_15px_rgba(0,0,0,0.2)] dark:shadow-[0_-5px_15px_rgba(255,255,255,0.1)]"></div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3 font-bold tracking-[0.3em]">
            SCREEN THIS WAY
          </p>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-8 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-t-lg border border-gray-300 dark:border-gray-600"></div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-500 rounded-t-lg shadow-md"></div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-400 dark:bg-gray-800 opacity-40 rounded-t-lg"></div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Booked</span>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="w-full overflow-x-auto pb-12 px-2">
          <div className="flex flex-col gap-3 items-center min-w-max mx-auto">
            {Object.keys(seatsByRow)
              .sort()
              .map((rowLabel) => (
                <div key={rowLabel} className="flex gap-2 items-center">
                  <span className="w-10 text-center font-bold text-gray-700 dark:text-gray-300 text-sm">
                    {rowLabel}
                  </span>
                  <div className="flex gap-2 md:gap-3">
                    {seatsByRow[rowLabel]
                      .sort((a, b) => a.number - b.number)
                      .map((seat) => {
                        const seatLabel = `${seat.row}${seat.number}`;
                        const isSelected = selectedSeats.includes(seatLabel);

                        let seatClass =
                          "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer hover:scale-110 border border-gray-300 dark:border-gray-600";
                        
                        if (seat.isBooked) {
                          seatClass = "bg-gray-400 dark:bg-gray-800 text-gray-500 dark:text-gray-600 cursor-not-allowed opacity-40 border border-gray-500 dark:border-gray-700";
                        }
                        
                        if (isSelected) {
                          seatClass =
                            "bg-green-500 dark:bg-green-600 text-white font-bold shadow-lg scale-110 border-2 border-green-400 dark:border-green-500";
                        }

                        return (
                          <button
                            key={seat._id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.isBooked}
                            className={`w-9 h-9 md:w-11 md:h-11 rounded-t-xl text-[10px] md:text-xs transition-all duration-200 flex items-center justify-center font-semibold ${seatClass}`}
                          >
                            {isSelected ? (
                              <FaCheckCircle className="text-sm md:text-base" />
                            ) : (
                              !seat.isBooked && seat.number
                            )}
                          </button>
                        );
                      })}
                  </div>
                  <span className="w-10 text-center font-bold text-gray-700 dark:text-gray-300 text-sm">
                    {rowLabel}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Bottom Action Bar */}
        {selectedSeats.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 p-4 shadow-2xl z-40 animate-slide-up">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl">
              <div className="text-center sm:text-left">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                  <FaTicketAlt className="inline mr-1" />
                  {selectedSeats.length} Seat(s): <span className="font-semibold text-gray-900 dark:text-white">{selectedSeats.join(", ")}</span>
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
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
              >
                <FaCreditCard />
                Proceed to Pay
              </button>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FaCreditCard className="text-blue-500" /> Payment
                </h3>
                {!processing && (
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-5 rounded-xl mb-6 border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Movie:</span>
                  <span className="text-gray-900 dark:text-white font-bold truncate ml-2">
                    {show.movie?.title}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Seats:</span>
                  <span className="text-gray-900 dark:text-white font-medium text-right ml-2">
                    {selectedSeats.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg pt-3 border-t border-blue-200 dark:border-blue-800">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Total Amount:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-xl">
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
                  <label className="text-sm text-gray-700 dark:text-gray-300 font-medium ml-1 block mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-700 dark:text-gray-300 font-medium ml-1 block mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="text-sm text-gray-700 dark:text-gray-300 font-medium ml-1 block mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength="3"
                      className="w-full bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white font-bold py-4 rounded-xl mt-6 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Pay {currencySymbol}{totalPrice}
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                🔒 Your payment is secure and encrypted
              </p>
            </div>
          </div>
        )}

        {/* Updated Success Modal with Better Responsive Layout */}
        {showSuccessModal && bookingData && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Success Header - Fixed */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center flex-shrink-0">
                <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                  <FaCheckCircle className="text-4xl text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Booking Confirmed!
                </h2>
                <p className="text-green-100 text-sm">
                  Your tickets have been booked successfully
                </p>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                
                {/* QR Code Section - Compact */}
                <div className="flex flex-col items-center justify-center mb-6">
                   <div className="bg-white p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-sm">
                      <QRCodeSVG 
                        value={JSON.stringify({
                          bookingId: bookingData._id,
                          movieTitle: bookingData.movie?.title,
                          theatre: bookingData.show?.theatre?.name,
                          screen: bookingData.show?.screenName,
                          showTime: bookingData.show?.startTime,
                          seats: bookingData.seats,
                          totalPrice: bookingData.totalPrice
                        })} 
                        size={140}
                        level="H"
                        includeMargin={true}
                      />
                   </div>
                   <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mt-2">
                     Scan at Entry
                   </p>
                </div>

                {/* Booking Details - Grid Layout */}
                <div className="space-y-3 mb-6">
                  {/* Movie Title */}
                  <div className="text-center mb-4">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                       {bookingData.movie?.title}
                     </h3>
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                       {bookingData.show?.theatre?.name} • {bookingData.show?.screenName}
                     </p>
                  </div>

                  {/* Date, Time, Seats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                        <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold">Date & Time</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {format(new Date(bookingData.show?.startTime), 'MMM dd')}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {format(new Date(bookingData.show?.startTime), 'h:mm a')}
                        </p>
                     </div>
                     <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                        <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold">Seats ({bookingData.seats?.length})</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white break-words">
                          {bookingData.seats?.join(', ')}
                        </p>
                     </div>
                  </div>
                  
                  {/* Total Price */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800 flex justify-between items-center">
                     <span className="text-sm text-green-800 dark:text-green-300 font-medium">Total Paid</span>
                     <span className="text-xl font-bold text-green-700 dark:text-green-400">{currencySymbol}{bookingData.totalPrice}</span>
                  </div>

                  {/* Booking ID */}
                  <div className="text-center">
                     <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                       ID: {bookingData._id}
                     </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleCloseSuccess}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FaTicketAlt /> View My Tickets
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <FaHome /> Back to Home
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;