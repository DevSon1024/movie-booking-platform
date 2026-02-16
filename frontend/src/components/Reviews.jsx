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
import LoadingSpinner from './LoadingSpinner';
import { ReviewSkeleton } from './SkeletonLoader';

const Reviews = ({ movieId, movieStatus }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [editingReview, setEditingReview] = useState(null);
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
        await updateReview(editingReview._id, { rating, comment });
        toast.success('Review updated successfully!');
        setEditingReview(null);
      } else {
        await createReview({ movieId, rating, comment });
        toast.success('Review submitted successfully!');
      }
      
      setRating(0);
      setComment('');
      setShowReviewForm(false);
      
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <ReviewSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 p-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-8">
            <div className="text-center">
              {averageRating > 0 ? (
                <div className="text-5xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    {averageRating}
                    <span className="text-2xl text-gray-400 font-normal">/5</span>
                </div>
              ) : (
                <div className="text-lg text-gray-500 italic">No ratings yet</div>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
              </div>
            </div>
            
            {verifiedCount > 0 && (
              <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl border border-green-100 dark:border-green-900">
                <FaCheckCircle className="text-green-600 dark:text-green-400 text-xl" />
                <div className="text-left">
                  <div className="text-sm font-bold text-green-700 dark:text-green-400">
                    {verifiedCount} Verified
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-500">
                    Ticket holders
                  </div>
                </div>
              </div>
            )}
          </div>

          {userInfo && canReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-red-600/30 transition-all flex items-center gap-2 justify-center"
            >
              <FaStar />
              Rate this Movie
            </button>
          )}
        </div>

        {userInfo && eligibilityData && !canReview && (
          <div className="mt-6">
            {eligibilityData.alreadyReviewed ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-400">
                You have already reviewed this movie. You can edit or delete your review below.
              </div>
            ) : movieStatus === 'UPCOMING' ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900 rounded-lg p-4 text-sm text-yellow-700 dark:text-yellow-400">
                Reviews will be available once the movie is released.
              </div>
            ) : null}
          </div>
        )}

        {!userInfo && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
            Please login to write a review
          </div>
        )}
      </div>

      {showReviewForm && userInfo && (
        <div id="review-form" className="p-8 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingReview ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div>
              <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">
                Your Rating
              </label>
              <StarRating value={rating} onChange={setRating} size="text-3xl" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {rating === 0 ? 'Tap to rate' : `${rating} out of 5 stars`}
              </p>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-700 dark:text-gray-300 mb-3">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the movie..."
                className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 resize-none text-base"
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                {comment.length}/1000
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <LoadingSpinner size="small" />
                ) : (
                  editingReview ? 'Update Review' : 'Submit Review'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-base transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-8">
        {reviewCount === 0 ? (
          <div className="text-center py-16">
            <FaStar className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-base text-gray-500 dark:text-gray-400">
              Be the first one to review this movie!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-100 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0 text-lg shadow-md">
                      {review.user?.name?.[0]?.toUpperCase() || <FaUserCircle className="text-3xl" />}
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-bold text-gray-900 dark:text-white text-base">
                          {review.user?.name || 'Anonymous'}
                        </h4>
                        {review.isVerifiedWatcher && (
                          <span className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider">
                            <FaCheckCircle className="text-[10px]" />
                            VERIFIED
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1">
                             <StarRating value={review.rating} readonly size="text-sm" />
                             <span className="text-sm font-bold ml-1 text-gray-700 dark:text-gray-300">{review.rating}/5</span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          • {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {userInfo && review.user?._id === userInfo._id && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all"
                        title="Edit review"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
                        title="Delete review"
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed ml-16">
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