import { useState, useEffect, useMemo, useRef } from "react";
import { FaPlus, FaCalendarAlt, FaSearch, FaFilter } from "react-icons/fa";
import { getAdminMovies } from "../../services/movieService";
import { useSelector } from "react-redux";
import { getTheatres } from "../../services/theatreService";
import { createShow, getShows, updateShow, deleteShow } from "../../services/showService";
import toast from "react-hot-toast";
import ShowForm from "../../components/admin/ShowForm";

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const { currencySymbol } = useSelector((state) => state.settings);

  // Filter States
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    city: '',
    movie: '',
    theatre: ''
  });
  
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // '?' is Shift + /
      if (e.key === '?' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const [m, t, s] = await Promise.all([getAdminMovies(), getTheatres(), getShows()]);
      setMovies(m); setTheatres(t); setShows(s);
    };
    loadData();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingShow) await updateShow(editingShow._id, formData);
      else await createShow(formData);
      toast.success(editingShow ? 'Updated' : 'Created');
      setIsModalOpen(false);
      const s = await getShows(); setShows(s);
    } catch (e) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if(confirm("Delete show?")) { await deleteShow(id); setShows(await getShows()); toast.success('Deleted'); }
  };

  const filteredShows = useMemo(() => {
    return shows.filter(show => {
      // Date Filter
      if (filters.fromDate && new Date(show.startTime) < new Date(filters.fromDate)) return false;
      const nextDay = filters.toDate ? new Date(filters.toDate) : null;
      if (nextDay) nextDay.setDate(nextDay.getDate() + 1); // allow entire 'toDate' to be included
      if (nextDay && new Date(show.startTime) >= nextDay) return false;

      // City Filter
      if (filters.city && !show.theatre?.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;

      // Movie Filter
      if (filters.movie && !show.movie?.title?.toLowerCase().includes(filters.movie.toLowerCase())) return false;

      // Theatre Filter
      if (filters.theatre && !show.theatre?.name?.toLowerCase().includes(filters.theatre.toLowerCase())) return false;

      return true;
    });
  }, [shows, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Get unique cities for the dropdown
  const uniqueCities = useMemo(() => {
     const cities = theatres.map(t => t.city).filter(Boolean);
     return [...new Set(cities)].sort();
  }, [theatres]);

  const resetFilters = () => {
      setFilters({ fromDate: '', toDate: '', city: '', movie: '', theatre: '' });
  };

  return (
    <div className="p-2 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Showtimes Management</h1>
        <button onClick={() => { setEditingShow(null); setIsModalOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow font-semibold flex items-center">
          <FaPlus className="mr-2" /> Schedule Show
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white border-l-4 border-red-500 pl-3">Filter Shows</h2>
            <button onClick={resetFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Clear Filters</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Movie Filter */}
            <div className="relative">
                <div className="absolute top-2.5 right-2 pointer-events-none">
                  <kbd className="hidden sm:inline-block bg-gray-100 dark:bg-gray-700 text-gray-400 text-[10px] px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-mono">Shift + /</kbd>
                </div>
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  name="movie"
                  ref={searchInputRef}
                  placeholder="Movie Title..." 
                  value={filters.movie}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg pl-9 pr-2 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
            </div>
            
            {/* Theatre Filter */}
            <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  name="theatre"
                  placeholder="Theatre Name..." 
                  value={filters.theatre}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* City Dropdown */}
            <div>
                <select 
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                >
                    <option value="">All Cities</option>
                    {uniqueCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            {/* Date Range - From */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">From:</span>
                <input 
                  type="date" 
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
            </div>

            {/* Date Range - To */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">To:</span>
                <input 
                  type="date" 
                  name="toDate"
                  min={filters.fromDate}
                  value={filters.toDate}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase">
            <tr>
              <th className="p-4">Movie</th>
              <th className="p-4">Theatre</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {filteredShows.length > 0 ? (
                filteredShows.map((show) => (
                  <tr key={show._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="p-4 font-bold text-gray-800 dark:text-white">{show.movie?.title}</td>
                    <td className="p-4 dark:text-gray-300">
                      <div className="font-semibold">{show.theatre?.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><span className="opacity-75">{show.theatre?.city}</span> • {show.screenName}</div>
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-red-500/70" />
                            {new Date(show.startTime).toLocaleString(undefined, {
                                weekday: 'short', month: 'short', day: 'numeric', 
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </div>
                    </td>
                    <td className="p-4 font-bold text-green-600">{currencySymbol}{show.price}</td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => { setEditingShow(show); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 font-semibold text-sm transition transition-transform hover:scale-110">Edit</button>
                      <button onClick={() => handleDelete(show._id)} className="text-red-500 hover:text-red-700 font-semibold text-sm transition transition-transform hover:scale-110">Delete</button>
                    </td>
                  </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <FaFilter className="mx-auto text-3xl mb-3 text-gray-300 dark:text-gray-600" />
                        <p>No shows found matching your filters.</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ShowForm 
          isEditing={!!editingShow}
          initialData={editingShow}
          movies={movies}
          theatres={theatres}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
};
export default AdminShowsPage;