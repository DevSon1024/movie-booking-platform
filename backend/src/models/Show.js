import mongoose from 'mongoose';

const showSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: true,
  },
  screenName: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  // Determine if show is booking enabled
  status: {
    type: String,
    enum: ['OPEN', 'SOLD_OUT', 'CANCELLED'],
    default: 'OPEN'
  },
  // The actual seats for this specific show instance
  seats: [{
    row: { type: String, required: true }, // e.g., "A"
    number: { type: Number, required: true }, // e.g., 1
    isBooked: { type: Boolean, default: false },
    price: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // Who booked it?
  }]
}, {
  timestamps: true,
});

const Show = mongoose.model('Show', showSchema);
export default Show;