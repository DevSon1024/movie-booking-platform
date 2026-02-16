import { useEffect, useState } from 'react';
import { getMyReviews, deleteReview, updateReview } from '../services/reviewService';
import { FaStar, FaTrash, FaEdit, FaList, FaTh, FaCalendarAlt, FaQuoteLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const data = await getMyReviews();
      setReviews(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(id);
      setReviews(reviews.filter(r => r._id !== id));
      toast.success("Review deleted");
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const saveEdit = async () => {
    try {
      await updateReview(editingId, { rating: editRating, comment: editComment });
      setReviews(reviews.map(r => r._id === editingId ? { ...r, rating: editRating, comment: editComment } : r));
      setEditingId(null);
      toast.success("Review updated");
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner size="large" text="Loading Reviews..." />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Reviews</h1>
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <button 
                onClick={() => setView('grid')}
                className={`p-2 rounded ${view === 'grid' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'text-gray-500'}`}
            >
                <FaTh />
            </button>
            <button 
                onClick={() => setView('list')}
                className={`p-2 rounded ${view === 'list' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'text-gray-500'}`}
            >
                <FaList />
            </button>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
             <h3 className="text-xl font-bold text-gray-400 mb-4">You haven't reviewed any movies yet.</h3>
             <Link to="/" className="text-red-600 hover:underline">Explore Movies</Link>
          </div>
        ) : (
          <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {reviews.map((review) => (
              <div key={review._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                {/* Header with Movie Info */}
                <div className="p-5 flex gap-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                    <img 
                        src={review.movie?.posterUrl} 
                        alt={review.movie?.title} 
                        className="w-16 h-24 object-cover rounded shadow-sm"
                    />
                    <div className="flex-1">
                        <Link to={`/movie/${review.movie?._id}`} className="font-bold text-lg hover:text-red-600 transition line-clamp-1">
                            {review.movie?.title}
                        </Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                            <FaCalendarAlt /> {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                        {editingId === review._id ? (
                            <div className="flex gap-1 mt-2">
                                {[1,2,3,4,5].map(star => (
                                    <FaStar 
                                        key={star} 
                                        className={`cursor-pointer text-lg ${star <= editRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        onClick={() => setEditRating(star)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mt-2 font-bold text-yellow-500">
                                <FaStar /> {review.rating}/5
                            </div>
                        )}
                    </div>
                </div>

                {/* Review Content */}
                <div className="p-5 flex-1">
                    {editingId === review._id ? (
                        <textarea 
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            className="w-full h-32 p-3 border rounded bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-red-500"
                        />
                    ) : (
                        <div className="relative pl-6">
                            <FaQuoteLeft className="absolute top-0 left-0 text-gray-200 dark:text-gray-700 text-xl" />
                            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed italic">
                                "{review.comment}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                    {editingId === review._id ? (
                        <>
                            <button onClick={saveEdit} className="px-4 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">Save</button>
                            <button onClick={cancelEdit} className="px-4 py-1.5 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400">Cancel</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => startEdit(review)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm px-3 py-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                                <FaEdit /> Edit
                            </button>
                            <button onClick={() => handleDelete(review._id)} className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                <FaTrash /> Delete
                            </button>
                        </>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;