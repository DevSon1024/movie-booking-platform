import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaList, FaTh, FaSearch } from 'react-icons/fa';
import { getAdminMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService';
import toast from 'react-hot-toast';

const AdminMoviesPage = () => {
  // --- State Management ---
  const [movies, setMovies] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'grid'
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', genre: '', duration: '', language: '', releaseDate: '', posterUrl: '', status: 'UPCOMING'
  });

  // --- Effects ---
  useEffect(() => {
    fetchMovies();
  }, [search, sortBy]);

  // --- Handlers ---
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await getAdminMovies(search, sortBy);
      setMovies(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load movies');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateMovie(editId, formData);
        toast.success('Movie Updated!');
      } else {
        await createMovie(formData);
        toast.success('Movie Added!');
      }
      resetForm();
      fetchMovies();
    } catch (error) {
      toast.error(isEditing ? 'Update Failed' : 'Creation Failed');
    }
  };

  const handleEdit = (movie) => {
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      duration: movie.duration,
      language: movie.language,
      releaseDate: movie.releaseDate.split('T')[0], // Format for input type=date
      posterUrl: movie.posterUrl,
      status: movie.status
    });
    setEditId(movie._id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await deleteMovie(id);
        toast.success('Movie Deleted');
        fetchMovies();
      } catch (error) {
        toast.error('Delete Failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', genre: '', duration: '', language: '', releaseDate: '', posterUrl: '', status: 'UPCOMING' });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- Render Helpers ---
  const renderStatusBadge = (status) => {
    const colors = {
      UPCOMING: 'bg-yellow-600',
      RUNNING: 'bg-green-600',
      ENDED: 'bg-red-600'
    };
    return <span className={`${colors[status] || 'bg-gray-600'} text-xs px-2 py-1 rounded`}>{status}</span>;
  };

  return (
    <div>
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Manage Movies</h1>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
        >
          {showForm ? 'Close Form' : <><FaPlus className="mr-2" /> Add Movie</>}
        </button>
      </div>

      {/* Add/Edit Form Section */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 text-red-400">{isEditing ? 'Edit Movie' : 'Add New Movie'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="title" placeholder="Movie Title" onChange={handleChange} value={formData.title} className="bg-gray-700 p-3 rounded text-white" required />
            <input name="genre" placeholder="Genre (e.g. Action)" onChange={handleChange} value={formData.genre} className="bg-gray-700 p-3 rounded text-white" required />
            <input name="duration" type="number" placeholder="Duration (mins)" onChange={handleChange} value={formData.duration} className="bg-gray-700 p-3 rounded text-white" required />
            <input name="language" placeholder="Language" onChange={handleChange} value={formData.language} className="bg-gray-700 p-3 rounded text-white" required />
            <div>
               <label className="text-xs text-gray-400">Release Date</label>
               <input name="releaseDate" type="date" onChange={handleChange} value={formData.releaseDate} className="bg-gray-700 p-3 rounded text-white w-full" required />
            </div>
            <div>
               <label className="text-xs text-gray-400">Status</label>
               <select name="status" onChange={handleChange} value={formData.status} className="bg-gray-700 p-3 rounded text-white w-full">
                <option value="UPCOMING">Upcoming</option>
                <option value="RUNNING">Now Showing</option>
                <option value="ENDED">Ended</option>
              </select>
            </div>
            <input name="posterUrl" placeholder="Poster Image URL" onChange={handleChange} value={formData.posterUrl} className="bg-gray-700 p-3 rounded text-white md:col-span-2" required />
            <textarea name="description" placeholder="Description" onChange={handleChange} value={formData.description} className="bg-gray-700 p-3 rounded text-white md:col-span-2" rows="3" required></textarea>
            
            <div className="md:col-span-2 flex justify-end space-x-3">
               <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded">Cancel</button>
               <button type="submit" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-bold">{isEditing ? 'Update' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & View Toggle */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-800 p-4 rounded-lg">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search movies..." 
            className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-red-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="bg-gray-700 text-white px-4 py-2 rounded focus:outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <div className="flex bg-gray-700 rounded overflow-hidden">
          <button onClick={() => setView('list')} className={`p-3 ${view === 'list' ? 'bg-red-600' : 'hover:bg-gray-600'}`}><FaList /></button>
          <button onClick={() => setView('grid')} className={`p-3 ${view === 'grid' ? 'bg-red-600' : 'hover:bg-gray-600'}`}><FaTh /></button>
        </div>
      </div>

      {/* Movies List */}
      {loading ? (
        <p className="text-center text-gray-400">Loading movies...</p>
      ) : (
        <>
          {view === 'list' ? (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-700 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Genre</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Release</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {movies.map(movie => (
                    <tr key={movie._id} className="hover:bg-gray-750">
                      <td className="p-4 font-bold">{movie.title}</td>
                      <td className="p-4 text-gray-400">{movie.genre}</td>
                      <td className="p-4">{renderStatusBadge(movie.status)}</td>
                      <td className="p-4 text-gray-400">{new Date(movie.releaseDate).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-3">
                        <button onClick={() => handleEdit(movie)} className="text-blue-400 hover:text-blue-300"><FaEdit /></button>
                        <button onClick={() => handleDelete(movie._id)} className="text-red-400 hover:text-red-300"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                  {movies.length === 0 && (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-500">No movies found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map(movie => (
                <div key={movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition duration-300">
                   <img src={movie.posterUrl} alt={movie.title} className="w-full h-48 object-cover" />
                   <div className="p-4">
                      <div className="flex justify-between items-start">
                         <h3 className="text-lg font-bold truncate">{movie.title}</h3>
                         {renderStatusBadge(movie.status)}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{movie.genre}</p>
                      <div className="flex justify-between mt-4 border-t border-gray-700 pt-3">
                        <button onClick={() => handleEdit(movie)} className="text-blue-400 flex items-center text-sm"><FaEdit className="mr-1"/> Edit</button>
                        <button onClick={() => handleDelete(movie._id)} className="text-red-400 flex items-center text-sm"><FaTrash className="mr-1"/> Delete</button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminMoviesPage;