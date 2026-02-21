import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true,
  },
  // Denormalizing movieId here for faster "My Bookings" queries
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  seats: [{
    type: String, // e.g., ["A1", "A2"]
    required: true,
  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'CONFIRMED', // Mocking successful payment for this project
  },
  transactionId: {
    type: String, // e.g. "TXN-12345678"
    required: false,
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'CARD'],
    required: false,
  }
}, {
  timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;