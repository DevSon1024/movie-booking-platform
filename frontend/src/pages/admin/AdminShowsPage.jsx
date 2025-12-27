import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaPlus, FaTrash, FaClock } from "react-icons/fa";
import { getAdminMovies } from "../../services/movieService";
import { getTheatres } from "../../services/theatreService";
import { createShow, getShows, deleteShow } from "../../services/showService";
import toast from "react-hot-toast";

const AdminShowsPage = () => {
  const { currencySymbol } = useSelector((state) => state.settings);
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);

  // Dependent State: Screens available for the selected theatre
  const [availableScreens, setAvailableScreens] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    movieId: "",
    theatreId: "",
    screenName: "",
    startTime: "",
    price: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  // When theatre changes, update available screens
  useEffect(() => {
    if (formData.theatreId) {
      const selectedTheatre = theatres.find(
        (t) => t._id === formData.theatreId
      );
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createShow(formData);
      toast.success("Show Scheduled Successfully!");
      setShowForm(false);
      setFormData({
        movieId: "",
        theatreId: "",
        screenName: "",
        startTime: "",
        price: "",
      });
      const updatedShows = await getShows();
      setShows(updatedShows);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create show");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this show?")) {
      try {
        await deleteShow(id);
        toast.success("Show deleted");
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
            Schedule and manage movie showtimes
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
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
            <FaClock className="text-lg" />
            Schedule New Show
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
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
                  <option 
                    key={m._id} 
                    value={m._id}
                    className="text-gray-900 dark:text-white"
                  >
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
                  <option 
                    key={t._id} 
                    value={t._id}
                    className="text-gray-900 dark:text-white"
                  >
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
                  <option 
                    key={i} 
                    value={s.name}
                    className="text-gray-900 dark:text-white"
                  >
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

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg md:col-span-2 mt-4 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Confirm Schedule
            </button>
          </form>
        </div>
      )}

      {/* Shows List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4">Movie</th>
                <th className="p-4">Theatre</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {shows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No shows scheduled yet. Click "Schedule Show" to add one.
                  </td>
                </tr>
              ) : (
                shows.map((show) => (
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
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(show._id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        title="Delete show"
                      >
                        <FaTrash className="text-lg" />
                      </button>
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