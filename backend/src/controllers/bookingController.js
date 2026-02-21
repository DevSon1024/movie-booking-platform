import Booking from '../models/Booking.js';
import Show from '../models/Show.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { showId, selectedSeats, transactionId, paymentMethod } = req.body; 

  // 1. Find the Show with populated movie and theatre
  const show = await Show.findById(showId)
    .populate('movie', 'title posterUrl duration language genre')
    .populate('theatre', 'name address city');
    
  if (!show) {
    res.status(404);
    throw new Error('Show not found');
  }

  // 2. Validate Seat Availability
  const isSeatTaken = show.seats.some(seat => 
    selectedSeats.includes(`${seat.row}${seat.number}`) && seat.isBooked
  );

  if (isSeatTaken) {
    res.status(400);
    throw new Error('One or more selected seats are already booked');
  }

  // 3. Calculate Price
  const pricePerSeat = show.price;
  if (!pricePerSeat) {
    res.status(500);
    throw new Error('Price configuration missing for this show');
  }
  const totalPrice = pricePerSeat * selectedSeats.length;

  try {
    // 4. Mark Seats as Booked
    show.seats.forEach(seat => {
      const seatLabel = `${seat.row}${seat.number}`;
      if (selectedSeats.includes(seatLabel)) {
        seat.isBooked = true;
        seat.userId = req.user._id;
      }
    });

    await show.save();

    // 5. Create Booking
    const booking = new Booking({
      user: req.user._id,
      show: showId,
      movie: show.movie._id, // Store just the ID
      seats: selectedSeats,
      totalPrice: totalPrice,
      transactionId: transactionId || `TXN-DUMMY-${Math.floor(Math.random() * 1000000)}`,
      paymentMethod: paymentMethod || 'CARD'
    });

    const createdBooking = await booking.save();
    
    // 6. Populate before sending response
    await createdBooking.populate('movie', 'title posterUrl duration language genre');
    await createdBooking.populate({
      path: 'show',
      populate: { 
        path: 'theatre', 
        select: 'name address city' 
      }
    });
    
    res.status(201).json(createdBooking);

  } catch (error) {
    // Rollback: Unbook seats if booking creation fails
    console.error("Booking Error:", error);
    try {
        const freshShow = await Show.findById(showId);
        freshShow.seats.forEach(seat => {
            const seatLabel = `${seat.row}${seat.number}`;
            if (selectedSeats.includes(seatLabel) && seat.userId?.toString() === req.user._id.toString()) {
                seat.isBooked = false;
                seat.userId = null;
            }
        });
        await freshShow.save();
    } catch (rbError) { 
      console.error("Rollback failed", rbError); 
    }

    res.status(500);
    throw new Error('Booking failed. Please try again.');
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('movie', 'title posterUrl duration language genre')
    .populate({
        path: 'show',
        populate: { 
          path: 'theatre', 
          select: 'name address city' 
        }
    })
    .sort({ createdAt: -1 });
    
  res.json(bookings);
};

export { createBooking, getMyBookings };