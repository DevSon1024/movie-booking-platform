import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  const { movieId, rating, comment } = req.body;

  // 1. Check if user already reviewed this movie
  const alreadyReviewed = await Review.findOne({
    movie: movieId,
    user: req.user._id,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this movie');
  }

  // 2. VERIFICATION LOGIC
  // Check if user has a booking for this movie
  const bookings = await Booking.find({ 
    user: req.user._id, 
    movie: movieId,
    paymentStatus: 'CONFIRMED'
  }).populate('show'); // We need show details to check time

  let isVerifiedWatcher = false;
  const currentTime = new Date();

  // Iterate bookings to see if any show has finished
  for (let booking of bookings) {
    const showEndTime = new Date(new Date(booking.show.startTime).getTime() + (120 * 60000)); // Approx 2 hours
    
    // Rule: Current Time >= Show End Time
    if (currentTime >= showEndTime) {
      isVerifiedWatcher = true;
      break; 
    }
  }

  // Also check if Movie status is 'ENDED' (Allowed to review even if show logic fails, but user must have booked)
  const movie = await Movie.findById(movieId);
  if (bookings.length > 0 && movie.status === 'ENDED') {
    isVerifiedWatcher = true;
  }

  // STRICT MODE: If you want to block reviews entirely for non-watchers:
  if (!isVerifiedWatcher) {
    res.status(400);
    throw new Error('You can only review after watching the movie (Show ended)');
  }

  // 3. Create Review
  const review = new Review({
    user: req.user._id,
    movie: movieId,
    rating,
    comment,
    isVerifiedWatcher
  });

  await review.save();
  res.status(201).json({ message: 'Review added' });
};

// @desc    Get reviews for a movie
// @route   GET /api/reviews/:movieId
// @access  Public
const getMovieReviews = async (req, res) => {
  const reviews = await Review.find({ movie: req.params.movieId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.json(reviews);
};

export { createReview, getMovieReviews };