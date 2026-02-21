import { useState, useEffect, useMemo, useRef } from "react";
import { FaPlus, FaCalendarAlt, FaSearch, FaFilter, FaList, FaTh } from "react-icons/fa";
import { getAdminMovies } from "../../services/movieService";
import { useSelector } from "react-redux";
import { getTheatres } from "../../services/theatreService";
import { createShow, getShows, updateShow, deleteShow, getShowBookings } from "../../services/showService";
import toast from "react-hot-toast";
import { FaEye, FaTimes } from "react-icons/fa";
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
  
  // View Bookings State
  const [viewingShow, setViewingShow] = useState(null);
  const [showBookings, setShowBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  
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

  const handleViewBookings = async (show) => {
    setViewingShow(show);
    setIsBookingsLoading(true);
    try {
      const bookings = await getShowBookings(show._id);
      setShowBookings(bookings);
    } catch (e) {
      toast.error('Failed to load bookings');
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const calculateShowStatus = (show) => {
    const totalSeats = show.seats?.length || 0;
    const bookedSeats = show.seats?.filter(s => s.isBooked).length || 0;
    if (totalSeats === 0) return { label: 'N/A', classes: 'text-gray-500 bg-gray-100' };

    const percentage = (bookedSeats / totalSeats) * 100;
    if (percentage === 100) return { label: 'Housefull', classes: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400' };
    if (percentage >= 80) return { label: 'Fast Filling', classes: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { label: 'Available', classes: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400' };
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
              <th className="p-4 text-center">Status</th>
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
                    <td className="p-4 text-center">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${calculateShowStatus(show).classes}`}>
                         {calculateShowStatus(show).label}
                       </span>
                    </td>
                    <td className="p-4 font-bold text-green-600">{currencySymbol}{show.price}</td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => handleViewBookings(show)} className="text-teal-500 hover:text-teal-700 font-semibold text-sm transition transition-transform hover:scale-110"><FaEye className="inline mr-1"/>View</button>
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
                   <div className="flex items-center justify-between mb-1.5 gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${calculateShowStatus(show).classes}`}>
                        {calculateShowStatus(show).label}
                     </span>
                     <div className="font-bold text-green-600 text-base">{currencySymbol}{show.price}</div>
                   </div>
                   <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1.5 mt-2">
                       <FaCalendarAlt className="text-red-500/70 shrink-0" />
                       <span className="truncate">
                           {new Date(show.startTime).toLocaleString(undefined, {
                               weekday: 'short', month: 'short', day: 'numeric', 
                               hour: '2-digit', minute: '2-digit'
                           })}
                       </span>
                   </div>
                 </div>
                 
                 <div className="flex gap-2 border-t border-gray-100 dark:border-gray-700 pt-3 flex-wrap">
                    <button onClick={() => handleViewBookings(show)} className="flex-1 text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 dark:text-teal-400 dark:bg-teal-900/20 dark:hover:bg-teal-900/40 py-2 rounded font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1">
                       <FaEye /> View
                    </button>
                    <button onClick={() => { setEditingShow(show); setIsModalOpen(true); }} className="flex-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 py-2 rounded font-semibold text-xs sm:text-sm transition">
                       Edit
                    </button>
                    <button onClick={() => handleDelete(show._id)} className="flex-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 py-2 rounded font-semibold text-xs sm:text-sm transition">
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

      {/* View Bookings Modal */}
      {viewingShow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
             
             {/* Header */}
             <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
               <div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Show Bookings</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                   {viewingShow.movie?.title} • {viewingShow.theatre?.name} ({viewingShow.screenName})
                 </p>
                 <div className="flex items-center gap-3 mt-1.5">
                   <span className={`px-2 py-0.5 rounded text-xs font-semibold ${calculateShowStatus(viewingShow).classes}`}>
                     {calculateShowStatus(viewingShow).label}
                   </span>
                   <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-800/50 px-2 py-0.5 rounded">
                     {viewingShow.seats?.filter(s => s.isBooked).length || 0} / {viewingShow.seats?.length || 0} Seats Booked
                   </span>
                 </div>
               </div>
               <button onClick={() => setViewingShow(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <FaTimes size={20} />
               </button>
             </div>

             {/* Content */}
             <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
               {isBookingsLoading ? (
                 <div className="flex justify-center items-center h-48">
                   <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                 </div>
               ) : showBookings.length > 0 ? (
                 <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                   <table className="w-full text-left whitespace-nowrap">
                     <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase font-semibold">
                       <tr>
                         <th className="p-4">Booking ID</th>
                         <th className="p-4">User</th>
                         <th className="p-4">Seats</th>
                         <th className="p-4">Total Price</th>
                         <th className="p-4">Date Booked</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                       {showBookings.map((booking) => (
                         <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                           <td className="p-4 text-xs font-mono text-gray-500 dark:text-gray-400">{booking._id.substring(0, 8)}...</td>
                           <td className="p-4">
                             <div className="font-semibold text-gray-800 dark:text-white">{booking.user?.name}</div>
                             <div className="text-xs text-gray-500">{booking.user?.email}</div>
                           </td>
                           <td className="p-4 font-medium text-gray-700 dark:text-gray-300">
                             {booking.seats.join(', ')} <span className="text-xs text-gray-400">({booking.seats.length})</span>
                           </td>
                           <td className="p-4 font-bold text-green-600">{currencySymbol}{booking.totalPrice}</td>
                           <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                             {new Date(booking.createdAt).toLocaleString()}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">No bookings yet</h3>
                   <p className="text-gray-500 dark:text-gray-400 mt-2">There are currently no seats booked for this show.</p>
                 </div>
               )}
             </div>

          </div>
        </div>
      )}
    </div>
  );
};
export default AdminShowsPage;