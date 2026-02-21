import { useState, useEffect, useRef, useMemo } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserTie, FaList, FaTh } from 'react-icons/fa';
import { getAdminMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService';
import toast from 'react-hot-toast';
import MovieForm from '../../components/admin/MovieForm';
import ManageCelebrities from '../../components/admin/ManageCelebrities';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MovieCardSkeleton } from '../../components/SkeletonLoader';
import MovieSearchDropdown from '../../components/admin/MovieSearchDropdown';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // View and Sorting State
  const [viewMode, setViewMode] = useState(localStorage.getItem('adminMoviesView') || 'grid');
  const [sortOrder, setSortOrder] = useState('latest');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCelebrityModalOpen, setIsCelebrityModalOpen] = useState(false); // New State
  const [editingMovie, setEditingMovie] = useState(null);
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
    localStorage.setItem('adminMoviesView', viewMode);
  }, [viewMode]);

  useEffect(() => { 
    fetchMovies(); 
  }, [search]);

  const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await getAdminMovies(search);
        
        // Sort data by releaseDate oldest first to assign Sr. No. correctly
        const sortedForIndex = [...data].sort((a, b) => {
            const dateA = new Date(a.releaseDate).getTime() || 0;
            const dateB = new Date(b.releaseDate).getTime() || 0;
            return dateA - dateB; // Oldest first
        });
        
        // Add static sequence number (Sr. No.) based on oldest-first order
        const formattedData = sortedForIndex.map((item, index) => ({
             ...item,
             originalIndex: index + 1
        }));
        
        setMovies(formattedData);
        
        // Also fetch all movies without search term to populate dropdown if not done yet
        if (!search && allMovies.length === 0) {
            setAllMovies(data);
        } else if (allMovies.length === 0) {
             // In case initial load has a search term somehow, we need all movies for dropdown
             const allData = await getAdminMovies('');
             setAllMovies(allData);
        }
      } catch (error) {
        toast.error("Error fetching movies");
      }
      setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setIsModalOpen(true);
  };

  const sortedMovies = useMemo(() => {
     let sorted = [...movies];
     sorted.sort((a, b) => {
         const dateA = new Date(a.releaseDate).getTime() || 0;
         const dateB = new Date(b.releaseDate).getTime() || 0;
         return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
     });
     return sorted;
  }, [movies, sortOrder]);

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingMovie) {
        await updateMovie(editingMovie._id, formData);
        toast.success('Movie Updated');
      } else {
        await createMovie(formData);
        toast.success('Movie Created');
      }
      setIsModalOpen(false);
      fetchMovies();
    } catch(err) { 
      toast.error('Operation Failed'); 
    }
  };

  const handleDelete = async (id) => {
      if(confirm('Delete movie?')) { 
        await deleteMovie(id); 
        fetchMovies(); 
        toast.success('Deleted'); 
      }
  };

  return (
    <div className="p-2 sm:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Movies Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your movie catalog</p>
        </div>
        <div className="flex gap-3">
            {/* New Button for Celebrities */}
            <button onClick={() => setIsCelebrityModalOpen(true)} className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center font-semibold transition transform hover:scale-105">
            <FaUserTie className="mr-2" /> Manage Celebrities
            </button>
            <button onClick={handleOpenAdd} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg shadow-lg flex items-center font-semibold transition transform hover:scale-105">
            <FaPlus className="mr-2" /> Add Movie
            </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:max-w-md">
            <div className="absolute top-4 right-10 pointer-events-none z-10">
               <kbd className="hidden sm:inline-block bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-mono shadow-sm">Shift + /</kbd>
            </div>
            <MovieSearchDropdown 
               movies={allMovies}
               value={search}
               onChange={(val) => setSearch(val)}
               mode="title"
               placeholder="Search movies by title..."
               inputRef={searchInputRef}
               className="w-full"
            />
          </div>
          
          {/* Controls: Sorting & View Toggle */}
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="List View"
                 >
                    <FaList />
                 </button>
                 <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="Grid View"
                 >
                    <FaTh />
                 </button>
             </div>
             
             <select 
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value)}
               className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none shadow-sm min-w-[140px]"
             >
                 <option value="latest">Sort: Latest</option>
                 <option value="oldest">Sort: Oldest</option>
             </select>
          </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <MovieCardSkeleton key={idx} />
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedMovies.map(m => (
            <div key={m._id} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col">
               <div className="relative h-64 overflow-hidden shrink-0">
                 <img src={m.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={m.title} />
                 <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                   {m.status}
                 </div>
               </div>
               <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1">{m.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{m.genre} • {m.duration} mins</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-1">Rel: {new Date(m.releaseDate).toLocaleDateString()}</p>
                  
                  <div className="flex gap-2 mt-auto">
                    <button onClick={() => handleOpenEdit(m)} className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(m._id)} className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition">
                      Delete
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
           <div className="overflow-x-auto">
             <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase font-semibold">
                   <tr>
                     <th className="p-4 w-16 text-center">Sr.</th>
                     <th className="p-4 w-20">Poster</th>
                     <th className="p-4">Movie Details</th>
                     <th className="p-4">Rel. Date</th>
                     <th className="p-4 text-center">Status</th>
                     <th className="p-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                   {sortedMovies.map((m) => (
                      <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                         <td className="p-4 text-center text-gray-500 dark:text-gray-400 font-medium">
                            {m.originalIndex}
                         </td>
                         <td className="p-4">
                            <img src={m.posterUrl} alt={m.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                         </td>
                         <td className="p-4">
                            <div className="font-bold text-gray-900 dark:text-white mb-0.5">{m.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{m.genre} • {m.duration} mins</div>
                         </td>
                         <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                            {new Date(m.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}
                         </td>
                         <td className="p-4 text-center">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold tracking-wide ${
                                m.status === 'RUNNING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                m.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {m.status}
                            </span>
                         </td>
                         <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                                <button onClick={() => handleOpenEdit(m)} className="text-blue-500 hover:text-blue-700 transition" title="Edit">
                                   <FaEdit size={16} />
                                </button>
                                <button onClick={() => handleDelete(m._id)} className="text-red-500 hover:text-red-700 transition" title="Delete">
                                   <FaTrash size={16} />
                                </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                   {sortedMovies.length === 0 && (
                      <tr>
                         <td colSpan="6" className="p-8 text-center text-gray-500">No movies found.</td>
                      </tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Existing Movie Modal */}
      {isModalOpen && (
        <MovieForm 
          isEditing={!!editingMovie}
          initialData={editingMovie}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* New Celebrity Modal */}
      {isCelebrityModalOpen && (
        <ManageCelebrities 
          onClose={() => setIsCelebrityModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminMoviesPage;