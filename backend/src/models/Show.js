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
    type: String, // Matches one of the screen names in the Theatre doc
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date, // Calculated automatically based on Movie duration
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  seats: [{
    row: String,
    number: Number,
    isBooked: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // If booked
  }]
}, {
  timestamps: true,
});

const Show = mongoose.model('Show', showSchema);
export default Show;