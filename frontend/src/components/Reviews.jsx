import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaStar, FaTrash, FaEdit, FaTimes, FaCheckCircle, FaUserCircle } from 'react-icons/fa';
import { 
  getMovieReviews, 
  createReview, 
  updateReview, 
  deleteReview,
  canReviewMovie 
} from '../services/reviewService';
import toast from 'react-hot-toast';

const Reviews = ({ movieId, movieStatus }) => {
  const { userInfo } = useSelector((state) => state.auth); // FIXED: Changed from user to userInfo
  
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Review Form States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Edit State
  const [editingReview, setEditingReview] = useState(null);
  
  // Eligibility
  const [canReview, setCanReview] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);

  useEffect(() => {
    fetchReviews();
    if (userInfo) {
      checkEligibility();
    }
  }, [movieId, userInfo]);

  const fetchReviews = async () => {
    try {
      const data = await getMovieReviews(movieId);
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setReviewCount(data.count || 0);
      setVerifiedCount(data.verifiedCount || 0);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    try {
      const data = await canReviewMovie(movieId);
      setCanReview(data.canReview);
      setEligibilityData(data);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!userInfo) {
      toast.error('Please login to write a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    setSubmitting(true);

    try {
      if (editingReview) {
        // Update existing review
        await updateReview(editingReview._id, { rating, comment });
        toast.success('Review updated successfully!');
        setEditingReview(null);
      } else {
        // Create new review
        await createReview({ movieId, rating, comment });
        toast.success('Review submitted successfully!');
      }
      
      // Reset form
      setRating(0);
      setComment('');
      setShowReviewForm(false);
      
      // Refresh reviews
      fetchReviews();
      if (userInfo) checkEligibility();
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
    setShowReviewForm(true);
    
    // Scroll to form
    setTimeout(() => {
      document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(reviewId);
      toast.success('Review deleted successfully');
      fetchReviews();
      if (userInfo) checkEligibility();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setRating(0);
    setComment('');
    setShowReviewForm(false);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Star Rating Component
  const StarRating = ({ value, onChange, readonly = false, size = 'text-2xl' }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-all transform ${!readonly && 'hover:scale-110'}`}
          >
            <FaStar
              className={`${size} ${
                star <= (hoverRating || value)
                  ? 'text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Rating Summary */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                {averageRating > 0 ? averageRating : '—'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
              </div>
            </div>
            
            {verifiedCount > 0 && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-100 dark:border-green-900">
                <FaCheckCircle className="text-green-600 dark:text-green-400" />
                <div className="text-left">
                  <div className="text-xs font-bold text-green-700 dark:text-green-400">
                    {verifiedCount} Verified
                  </div>
                  <div className="text-[10px] text-green-600 dark:text-green-500">
                    Ticket holders
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Write Review Button */}
          {userInfo && canReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg hover:shadow-red-600/30 transition-all flex items-center gap-2 justify-center"
            >
              <FaStar />
              Rate this Movie
            </button>
          )}
        </div>

        {/* Eligibility Messages */}
        {userInfo && eligibilityData && !canReview && (
          <div className="mt-4">
            {eligibilityData.alreadyReviewed ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400">
                You have already reviewed this movie. You can edit or delete your review below.
              </div>
            ) : movieStatus === 'UPCOMING' ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900 rounded-lg p-3 text-sm text-yellow-700 dark:text-yellow-400">
                Reviews will be available once the movie is released.
              </div>
            ) : null}
          </div>
        )}

        {!userInfo && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400 text-center">
            Please login to write a review
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && userInfo && (
        <div id="review-form" className="p-6 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Your Rating
              </label>
              <StarRating value={rating} onChange={setRating} />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {rating === 0 ? 'Tap to rate' : `${rating} out of 5 stars`}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the movie..."
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 resize-none text-sm"
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {comment.length}/1000
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
              >
                {submitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="p-6">
        {reviewCount === 0 ? (
          <div className="text-center py-12">
            <FaStar className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Be the first one to review this movie!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-100 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {review.user?.name?.[0]?.toUpperCase() || <FaUserCircle className="text-2xl" />}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                          {review.user?.name || 'Anonymous'}
                        </h4>
                        {review.isVerifiedWatcher && (
                          <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-[10px] font-bold">
                            <FaCheckCircle className="text-[10px]" />
                            VERIFIED
                          </span>
                        )}
                        {review.isEdited && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                            (edited)
                          </span>
                        )}
                      </div>
                      
                      {/* Rating & Date */}
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating value={review.rating} readonly size="text-xs" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          • {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (if own review) */}
                  {userInfo && review.user?._id === userInfo._id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all"
                        title="Edit review"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                        title="Delete review"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Review Comment */}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed ml-13">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;