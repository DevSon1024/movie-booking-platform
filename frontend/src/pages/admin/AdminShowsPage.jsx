import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaPlus, FaTrash, FaEdit, FaClock, FaBan, FaCheck, FaTimes, FaPlayCircle, FaCalendarCheck, FaTimesCircle } from "react-icons/fa";
import { getAdminMovies } from "../../services/movieService";
import { getTheatres } from "../../services/theatreService";
import { createShow, getShows, updateShow, cancelShow, deleteShow } from "../../services/showService";
import toast from "react-hot-toast";

const AdminShowsPage = () => {
  const { currencySymbol } = useSelector((state) => state.settings);
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [availableScreens, setAvailableScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingShowId, setEditingShowId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingShowId, setCancellingShowId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [activeTab, setActiveTab] = useState('running'); // running, scheduled, cancelled

  const initialFormState = {
    movieId: "",
    theatreId: "",
    screenName: "",
    startTime: "",
    price: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.theatreId) {
      const selectedTheatre = theatres.find((t) => t._id === formData.theatreId);
      setAvailableScreens(selectedTheatre ? selectedTheatre.screens : []);
    } else {
      setAvailableScreens([]);
    }
  }, [formData.theatreId, theatres]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [moviesData, theatresData, showsData] = await Promise.all([
        getAdminMovies(),
        getTheatres(),
        getShows(),
      ]);
      setMovies(moviesData);
      setTheatres(theatresData);
      setShows(showsData);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load data");
      setLoading(false);
    }
  };

  // Filter shows based on active tab
  const filterShows = () => {
    const now = new Date();
    
    if (activeTab === 'running') {
      // Show is currently running (started but not ended, and not cancelled)
      return shows.filter(show => {
        const start = new Date(show.startTime);
        const end = new Date(show.endTime);
        return show.status === 'active' && start <= now && end >= now;
      });
    } else if (activeTab === 'scheduled') {
      // Show is scheduled for future (not started yet, and not cancelled)
      return shows.filter(show => {
        const start = new Date(show.startTime);
        return show.status === 'active' && start > now;
      });
    } else if (activeTab === 'cancelled') {
      // Show is cancelled
      return shows.filter(show => show.status === 'cancelled');
    }
    
    return shows;
  };

  const filteredShows = filterShows();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditingShowId(null);
    setShowForm(false);
  };

  const handleEdit = (show) => {
    setFormData({
      movieId: show.movie._id,
      theatreId: show.theatre._id,
      screenName: show.screenName,
      startTime: new Date(show.startTime).toISOString().slice(0, 16),
      price: show.price,
    });
    setEditingShowId(show._id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateShow(editingShowId, formData);
        toast.success("Show Updated Successfully!");
      } else {
        await createShow(formData);
        toast.success("Show Scheduled Successfully!");
      }
      resetForm();
      const updatedShows = await getShows();
      setShows(updatedShows);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} show`);
    }
  };

  const handleCancelShow = (showId) => {
    setCancellingShowId(showId);
    setShowCancelModal(true);
  };

  const confirmCancelShow = async () => {
    try {
      await cancelShow(cancellingShowId, cancelReason);
      toast.success("Show cancelled successfully");
      setShowCancelModal(false);
      setCancelReason("");
      setCancellingShowId(null);
      const updatedShows = await getShows();
      setShows(updatedShows);
    } catch (error) {
      toast.error("Failed to cancel show");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this show? This action cannot be undone.")) {
      try {
        await deleteShow(id);
        toast.success("Show deleted permanently");
        const updatedShows = await getShows();
        setShows(updatedShows);
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 dark:text-gray-500">Loading shows...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Shows
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Schedule, update, and manage movie showtimes
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {showForm ? (
            <span>Close Form</span>
          ) : (
            <>
              <FaPlus className="text-sm" />
              <span>Schedule Show</span>
            </>
          )}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl mb-8 border border-gray-200 dark:border-gray-700 shadow-lg animate-fade-in">
          <h2 className="text-xl font-bold mb-6 text-purple-600 dark:text-purple-400 flex items-center gap-2">
            {isEditing ? <FaEdit className="text-lg" /> : <FaClock className="text-lg" />}
            {isEditing ? 'Edit Show' : 'Schedule New Show'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Movie Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                Select Movie *
              </label>
              <select
                name="movieId"
                value={formData.movieId}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="" className="text-gray-500 dark:text-gray-400">
                  -- Choose a movie --
                </option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id} className="text-gray-900 dark:text-white">
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Theatre Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                Select Theatre *
              </label>
              <select
                name="theatreId"
                value={formData.theatreId}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                required
              >
                <option value="" className="text-gray-500 dark:text-gray-400">
                  -- Choose a theatre --
                </option>
                {theatres.map((t) => (
                  <option key={t._id} value={t._id} className="text-gray-900 dark:text-white">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Screen Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                Select Screen *
              </label>
              <select
                name="screenName"
                value={formData.screenName}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={!formData.theatreId}
              >
                <option value="" className="text-gray-500 dark:text-gray-400">
                  {!formData.theatreId ? "Select theatre first" : "-- Choose a screen --"}
                </option>
                {availableScreens.map((s, i) => (
                  <option key={i} value={s.name} className="text-gray-900 dark:text-white">
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                Ticket Price ({currencySymbol}) *
              </label>
              <input
                type="number"
                name="price"
                placeholder={`e.g. 15`}
                value={formData.price}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Submit Buttons */}
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isEditing ? 'Update Show' : 'Confirm Schedule'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Cancel Show Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FaBan className="text-red-500" />
              Cancel Show
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to cancel this show? This will notify all users who booked tickets.
            </p>
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                Reason for Cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Technical issues, Low bookings, etc."
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none"
                rows="3"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmCancelShow}
                disabled={!cancelReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <FaCheck /> Confirm Cancel
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setCancellingShowId(null);
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <FaTimes /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 inline-flex mb-8">
        <button
          onClick={() => setActiveTab('running')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'running'
              ? 'bg-green-600 dark:bg-green-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FaPlayCircle /> Running
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'scheduled'
              ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FaCalendarCheck /> Scheduled
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'cancelled'
              ? 'bg-red-600 dark:bg-red-500 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FaTimesCircle /> Cancelled
        </button>
      </div>

      {/* Shows List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4">Movie</th>
                <th className="p-4">Theatre</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Price</th>
                {activeTab === 'cancelled' && <th className="p-4">Cancel Reason</th>}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredShows.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'cancelled' ? "6" : "5"} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    {activeTab === 'running' && "No shows currently running."}
                    {activeTab === 'scheduled' && "No shows scheduled yet."}
                    {activeTab === 'cancelled' && "No cancelled shows."}
                  </td>
                </tr>
              ) : (
                filteredShows.map((show) => (
                  <tr 
                    key={show._id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {show.movie?.title || "Unknown Movie"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {show.theatre?.name || "Unknown Theatre"}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {show.screenName}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <FaClock className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm">
                          {new Date(show.startTime).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-green-600 dark:text-green-400">
                        {currencySymbol}{show.price}
                      </div>
                    </td>
                    {activeTab === 'cancelled' && (
                      <td className="p-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                          {show.cancelReason || 'No reason provided'}
                        </div>
                      </td>
                    )}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {show.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleEdit(show)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                              title="Edit show"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleCancelShow(show._id)}
                              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                              title="Cancel show"
                            >
                              <FaBan className="text-lg" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(show._id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          title="Delete permanently"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminShowsPage;