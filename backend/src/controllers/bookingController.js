import Booking from '../models/Booking.js';
import Show from '../models/Show.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { showId, selectedSeats } = req.body; // selectedSeats = ["A1", "A2"]

  // 1. Find the Show
  const show = await Show.findById(showId).populate('movie');
  if (!show) {
    res.status(404);
    throw new Error('Show not found');
  }

  // 2. Validate Seat Availability
  // We check if ANY of the requested seats are already booked in the DB
  const isSeatTaken = show.seats.some(seat => 
    selectedSeats.includes(`${seat.row}${seat.number}`) && seat.isBooked
  );

  if (isSeatTaken) {
    res.status(400);
    throw new Error('One or more selected seats are already booked');
  }

  // 3. Mark Seats as Booked in Show Document
  let totalPrice = 0;
  
  // Iterate through the show's seat array and update matching seats
  show.seats = show.seats.map(seat => {
    const seatLabel = `${seat.row}${seat.number}`;
    if (selectedSeats.includes(seatLabel)) {
      totalPrice += seat.price;
      return { ...seat, isBooked: true, userId: req.user._id };
    }
    return seat;
  });

  await show.save();

  // 4. Create Booking Record
  const booking = new Booking({
    user: req.user._id,
    show: showId,
    movie: show.movie._id,
    seats: selectedSeats,
    totalPrice: totalPrice,
  });

  const createdBooking = await booking.save();
  res.status(201).json(createdBooking);
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('movie', 'title posterUrl')
    .populate('show', 'startTime theatre screenName')
    .sort({ createdAt: -1 }); // Newest first
    
  res.json(bookings);
};

export { createBooking, getMyBookings };