import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;

    // Validation
    if (!movieId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide movieId, rating, and comment' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // 1. Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // 2. CRITICAL RULE: Only RUNNING or ENDED movies can be reviewed
    if (movie.status === 'UPCOMING') {
      return res.status(403).json({ 
        message: 'Cannot review upcoming movies. Wait until the movie is released and running.' 
      });
    }

    // 3. Check if user already reviewed this movie
    const alreadyReviewed = await Review.findOne({
      movie: movieId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    // 4. VERIFICATION LOGIC - Check if user has booking for this movie
    const bookings = await Booking.find({ 
      user: req.user._id, 
      movie: movieId,
      paymentStatus: 'CONFIRMED'
    }).populate('show');

    let isVerifiedWatcher = false;

    if (bookings.length > 0) {
      const currentTime = new Date();
      
      // Check if any show has finished
      for (let booking of bookings) {
        // Calculate show end time (startTime + movie duration + buffer)
        const showStartTime = new Date(booking.show.startTime);
        const showEndTime = new Date(showStartTime.getTime() + (movie.duration + 30) * 60000); // duration in minutes + 30 min buffer
        
        // If current time >= show end time, user has watched the movie
        if (currentTime >= showEndTime) {
          isVerifiedWatcher = true;
          break;
        }
      }

      // Special case: If movie status is ENDED and user has booking, they're verified
      if (movie.status === 'ENDED') {
        isVerifiedWatcher = true;
      }
    }

    // 5. Allow review for RUNNING/ENDED movies even without booking (but mark as unverified)
    // Users can review based on watching in other platforms, but they won't get "Verified" badge
    
    // Create Review
    const review = new Review({
      user: req.user._id,
      movie: movieId,
      rating,
      comment,
      isVerifiedWatcher
    });

    await review.save();

    // Populate user details before sending response
    await review.populate('user', 'name email');

    res.status(201).json({ 
      message: isVerifiedWatcher 
        ? 'Review added successfully! You are a verified watcher.' 
        : 'Review added successfully!',
      review,
      isVerifiedWatcher
    });

  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
};

// @desc    Get reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
const getMovieReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      reviews,
      count: reviews.length,
      averageRating: parseFloat(averageRating),
      verifiedCount: reviews.filter(r => r.isVerifiedWatcher).length
    });
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }
    
    if (comment) {
      review.comment = comment;
    }

    await review.save();
    await review.populate('user', 'name email');

    res.json({ message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Update Review Error:', error);
    res.status(500).json({ message: 'Server error while updating review' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await review.deleteOne();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
};

// @desc    Get user's own reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('movie', 'title posterUrl status')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Get My Reviews Error:', error);
    res.status(500).json({ message: 'Server error while fetching your reviews' });
  }
};

// @desc    Check if user can review a movie
// @route   GET /api/reviews/can-review/:movieId
// @access  Private
const canReviewMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Check if movie is RUNNING or ENDED
    const canReview = movie.status === 'RUNNING' || movie.status === 'ENDED';
    
    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      movie: movieId,
      user: req.user._id,
    });

    // Check if user has booking
    const hasBooking = await Booking.exists({ 
      user: req.user._id, 
      movie: movieId,
      paymentStatus: 'CONFIRMED'
    });

    res.json({
      canReview: canReview && !alreadyReviewed,
      movieStatus: movie.status,
      alreadyReviewed: !!alreadyReviewed,
      hasBooking: !!hasBooking,
      willBeVerified: !!hasBooking
    });
  } catch (error) {
    console.error('Can Review Check Error:', error);
    res.status(500).json({ message: 'Server error while checking review eligibility' });
  }
};

export { 
  createReview, 
  getMovieReviews, 
  updateReview, 
  deleteReview, 
  getMyReviews,
  canReviewMovie 
};