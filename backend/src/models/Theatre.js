import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  // We store simple screen configurations here
  screens: [{
    name: { type: String, required: true }, // e.g., "Screen 1", "IMAX Hall"
    seatLayout: {
      rows: { type: Number, required: true }, // e.g., 10 rows
      cols: { type: Number, required: true }, // e.g., 12 seats per row
      price: { type: Number, required: true }, // Base price for this screen
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Link to the Admin who created it
    required: true,
  }
}, {
  timestamps: true,
});

const Theatre = mongoose.model('Theatre', theatreSchema);
export default Theatre;