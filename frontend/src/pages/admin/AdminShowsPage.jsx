import { useState, useEffect, useMemo, useRef } from "react";
import { FaPlus, FaCalendarAlt, FaSearch, FaFilter, FaList, FaTh } from "react-icons/fa";
import { getAdminMovies } from "../../services/movieService";
import { useSelector } from "react-redux";
import { getTheatres } from "../../services/theatreService";
import { createShow, getShows, updateShow, deleteShow } from "../../services/showService";
import toast from "react-hot-toast";
import ShowForm from "../../components/admin/ShowForm";
import MovieSearchDropdown from "../../components/admin/MovieSearchDropdown";
import CitySearchDropdown from "../../components/admin/CitySearchDropdown";
import TheatreSearchDropdown from "../../components/admin/TheatreSearchDropdown";

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const { currencySymbol } = useSelector((state) => state.settings);

  // View and Sorting State
  const [viewMode, setViewMode] = useState(localStorage.getItem('adminShowsView') || 'list');
  const [sortOrder, setSortOrder] = useState('latest');

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
    localStorage.setItem('adminShowsView', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const loadData = async () => {
      const [m, t, s] = await Promise.all([getAdminMovies(), getTheatres(), getShows()]);
      
      // Sort shows by startTime oldest first to assign Sr. No. correctly
      const sortedForIndex = [...s].sort((a, b) => {
          const dateA = new Date(a.startTime).getTime() || 0;
          const dateB = new Date(b.startTime).getTime() || 0;
          return dateA - dateB; // Oldest first
      });

      // Append originalIndex to preserve oldest-first order
      const formattedShows = sortedForIndex.map((show, idx) => ({ ...show, originalIndex: idx + 1 }));
      
      setMovies(m); setTheatres(t); setShows(formattedShows);
    };
    loadData();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingShow) await updateShow(editingShow._id, formData);
      else await createShow(formData);
      toast.success(editingShow ? 'Updated' : 'Created');
      setIsModalOpen(false);
      const s = await getShows(); 
      const sortedForIndex = [...s].sort((a, b) => {
          const dateA = new Date(a.startTime).getTime() || 0;
          const dateB = new Date(b.startTime).getTime() || 0;
          return dateA - dateB;
      });
      const formattedShows = sortedForIndex.map((show, idx) => ({ ...show, originalIndex: idx + 1 }));
      setShows(formattedShows);
    } catch (e) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if(confirm("Delete show?")) { 
       await deleteShow(id); 
       const s = await getShows(); 
       const sortedForIndex = [...s].sort((a, b) => {
          const dateA = new Date(a.startTime).getTime() || 0;
          const dateB = new Date(b.startTime).getTime() || 0;
          return dateA - dateB;
       });
       const formattedShows = sortedForIndex.map((show, idx) => ({ ...show, originalIndex: idx + 1 }));
       setShows(formattedShows); 
       toast.success('Deleted'); 
    }
  };

  const filteredShows = useMemo(() => {
    const filtered = shows.filter(show => {
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
    
    // Sort logic after filtering
    filtered.sort((a, b) => {
        const dateA = new Date(a.startTime).getTime() || 0;
        const dateB = new Date(b.startTime).getTime() || 0;
        return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  }, [shows, filters, sortOrder]);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Showtimes Management</h1>
           <p className="text-gray-500">Manage and schedule shows</p>
        </div>
        
        <div className="flex items-center gap-4">
             {/* View Toggle */}
             <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="List View"
                 >
                    <FaList />
                 </button>
                 <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="Grid View"
                 >
                    <FaTh />
                 </button>
             </div>
             <button onClick={() => { setEditingShow(null); setIsModalOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow font-semibold flex items-center">
               <FaPlus className="mr-2" /> Schedule Show
             </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white border-l-4 border-red-500 pl-3">Filter & Sort Shows</h2>
            <button onClick={resetFilters} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Clear Filters</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Movie Filter */}
            <div className="relative">
                <div className="absolute top-2.5 right-10 pointer-events-none z-10">
                  <kbd className="hidden sm:inline-block bg-gray-100 dark:bg-gray-700 text-gray-400 text-[10px] px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-mono">Shift + /</kbd>
                </div>
                <MovieSearchDropdown 
                  movies={movies}
                  value={filters.movie}
                  onChange={(val) => setFilters(prev => ({ ...prev, movie: val }))}
                  mode="title"
                  placeholder="Movie Title..."
                  inputRef={searchInputRef}
                />
            </div>
            
            {/* Theatre Filter */}
            <div className="relative z-10">
                <TheatreSearchDropdown 
                  theatres={theatres}
                  value={filters.theatre}
                  onChange={(val) => setFilters(prev => ({ ...prev, theatre: val }))}
                  mode="name"
                  placeholder="Theatre Name or City..."
                />
            </div>

            {/* City Dropdown */}
            <div className="relative z-0">
                <CitySearchDropdown 
                  cities={uniqueCities}
                  value={filters.city}
                  onChange={(val) => setFilters(prev => ({ ...prev, city: val }))}
                  placeholder="All Cities"
                />
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
            
            {/* Sort Order */}
            <div>
               <select 
                 value={sortOrder}
                 onChange={(e) => setSortOrder(e.target.value)}
                 className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
               >
                 <option value="latest">Sort: Latest</option>
                 <option value="oldest">Sort: Oldest</option>
               </select>
            </div>
        </div>
      </div>

      {viewMode === 'list' ? (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4 w-16 text-center">Sr.</th>
              <th className="p-4">Movie</th>
              <th className="p-4">Theatre</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredShows.length > 0 ? (
                filteredShows.map((show) => (
                  <tr key={show._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 text-center text-gray-500 dark:text-gray-400 font-medium">
                        {show.originalIndex}
                    </td>
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
      </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredShows.length > 0 ? (
           filteredShows.map((show) => (
              <div key={show._id} className="bg-white dark:bg-gray-800 outline outline-1 outline-gray-200 dark:outline-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col pt-8">
                 <div className="absolute top-2 right-2 text-xs font-bold text-gray-400 dark:text-gray-500 px-2 py-1">
                   #{show.originalIndex}
                 </div>
                 
                 <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 truncate">{show.movie?.title}</h3>
                 
                 <div className="text-gray-600 dark:text-gray-300 mb-3 text-sm">
                   <p className="font-semibold block mb-0.5">{show.theatre?.name}</p>
                   <p className="opacity-75">{show.theatre?.city} • {show.screenName}</p>
                 </div>
                 
                 <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-4 text-sm mt-auto">
                   <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1.5">
                       <FaCalendarAlt className="text-red-500/70 shrink-0" />
                       <span className="truncate">
                           {new Date(show.startTime).toLocaleString(undefined, {
                               weekday: 'short', month: 'short', day: 'numeric', 
                               hour: '2-digit', minute: '2-digit'
                           })}
                       </span>
                   </div>
                   <div className="font-bold text-green-600 mt-2 text-lg">{currencySymbol}{show.price}</div>
                 </div>
                 
                 <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <button onClick={() => { setEditingShow(show); setIsModalOpen(true); }} className="flex-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 py-2 rounded font-semibold text-sm transition">
                       Edit
                    </button>
                    <button onClick={() => handleDelete(show._id)} className="flex-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 py-2 rounded font-semibold text-sm transition">
                       Delete
                    </button>
                 </div>
              </div>
           ))
        ) : (
           <div className="col-span-full p-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
               <FaFilter className="mx-auto text-4xl mb-4 text-gray-300 dark:text-gray-600" />
               <p className="text-lg">No shows found matching your filters.</p>
           </div>
        )}
      </div>
      )}

      {isModalOpen && (
        <ShowForm 
          isEditing={!!editingShow}
          initialData={editingShow}
          movies={movies}
          theatres={theatres}
          currencySymbol={currencySymbol}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
};
export default AdminShowsPage;