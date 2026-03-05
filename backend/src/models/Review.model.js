import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000,
  },
  isVerifiedWatcher: {
    type: Boolean,
    default: false,
  },
  helpful: {
    type: Number,
    default: 0, // For future: users can mark reviews as helpful
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

// Compound index to ensure one review per user per movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true });

// Update isEdited flag before saving
reviewSchema.pre('save', function(next) {
  if (this.isModified('rating') || this.isModified('comment')) {
    if (!this.isNew) {
      this.isEdited = true;
    }
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;