import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserTie } from 'react-icons/fa';
import { getAdminMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService';
import toast from 'react-hot-toast';
import MovieForm from '../../components/admin/MovieForm';
import ManageCelebrities from '../../components/admin/ManageCelebrities';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MovieCardSkeleton } from '../../components/SkeletonLoader';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCelebrityModalOpen, setIsCelebrityModalOpen] = useState(false); // New State
  const [editingMovie, setEditingMovie] = useState(null);

  useEffect(() => { 
    fetchMovies(); 
  }, [search]);

  const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await getAdminMovies(search);
        setMovies(data);
      } catch (error) {
        toast.error("Error fetching movies");
      }
      setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setIsModalOpen(true);
  };

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

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search movies by title..." 
          className="w-full bg-white dark:bg-gray-800 pl-12 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-red-500 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <MovieCardSkeleton key={idx} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map(m => (
            <div key={m._id} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
               <div className="relative h-64 overflow-hidden">
                 <img src={m.posterUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={m.title} />
                 <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                   {m.status}
                 </div>
               </div>
               <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1">{m.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{m.genre} • {m.duration} mins</p>
                  
                  <div className="flex gap-2">
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