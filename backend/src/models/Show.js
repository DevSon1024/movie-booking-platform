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
  endTime: {
    type: Date,
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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  cancelReason: {
    type: String,
    default: ''
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true,
});

const Show = mongoose.model('Show', showSchema);
export default Show;