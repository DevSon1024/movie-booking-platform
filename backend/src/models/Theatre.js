import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
    index: true // Indexed for faster search by city
  },
  address: {
    type: String,
    required: true,
  },
  facilities: [{
    type: String, // e.g. ["Dolby Atmos", "Food Court", "Parking"]
  }],
  screens: [{
    name: { type: String, required: true },
    type: { 
      type: String, 
      // Add the new types to this list
      enum: ['Standard', 'IMAX', '3D', '4DX', 'Premium', 'Recliner', 'Luxury'],
      default: 'Standard'
    },
    seatLayout: {
      rows: { type: Number, required: true }, 
      cols: { type: Number, required: true }, 
    },
    capacity: { type: Number }, // Calculated (rows * cols)
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

// Pre-save hook to calculate capacity automatically
theatreSchema.pre('save', function(next) {
  if (this.screens) {
    this.screens.forEach(screen => {
      screen.capacity = screen.seatLayout.rows * screen.seatLayout.cols;
    });
  }
  next();
});

const Theatre = mongoose.model('Theatre', theatreSchema);
export default Theatre;