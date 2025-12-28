import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaList, FaTh, FaSearch } from 'react-icons/fa';
import { getAdminMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService';
import toast from 'react-hot-toast';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', genre: '', duration: '', language: '', releaseDate: '', posterUrl: '', status: 'UPCOMING'
  });

  useEffect(() => { fetchMovies(); }, [search, sortBy]);

  const fetchMovies = async () => {
      setLoading(true);
      const data = await getAdminMovies(search, sortBy);
      setMovies(data);
      setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) await updateMovie(editId, formData);
      else await createMovie(formData);
      toast.success(isEditing ? 'Updated' : 'Created');
      resetForm(); fetchMovies();
    } catch(err) { toast.error('Failed'); }
  };
  
  const handleDelete = async (id) => {
      if(confirm('Delete?')) { await deleteMovie(id); fetchMovies(); toast.success('Deleted'); }
  }

  const resetForm = () => { /* ... reset logic ... */ 
     setFormData({ title: '', description: '', genre: '', duration: '', language: '', releaseDate: '', posterUrl: '', status: 'UPCOMING' });
     setShowForm(false); setIsEditing(false);
  };
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEdit = (m) => {
      setFormData({ ...m, releaseDate: m.releaseDate.split('T')[0] });
      setEditId(m._id); setIsEditing(true); setShowForm(true);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Movies</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow flex items-center">
          {showForm ? 'Close' : <><FaPlus className="mr-2" /> Add Movie</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{isEditing ? 'Edit Movie' : 'Add New Movie'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="title" placeholder="Title" onChange={handleChange} value={formData.title} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            <input name="genre" placeholder="Genre" onChange={handleChange} value={formData.genre} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            <input name="duration" type="number" placeholder="Mins" onChange={handleChange} value={formData.duration} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            <input name="language" placeholder="Language" onChange={handleChange} value={formData.language} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            <input name="releaseDate" type="date" onChange={handleChange} value={formData.releaseDate} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            <select name="status" onChange={handleChange} value={formData.status} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="UPCOMING">Upcoming</option>
                <option value="RUNNING">Running</option>
                <option value="ENDED">Ended</option>
            </select>
            <input name="posterUrl" placeholder="Poster URL" onChange={handleChange} value={formData.posterUrl} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-red-500" required />
            <textarea name="description" placeholder="Description" onChange={handleChange} value={formData.description} className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-red-500" rows="3"></textarea>
            
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg md:col-span-2 shadow">Save Movie</button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input type="text" placeholder="Search..." className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 rounded-lg w-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <button onClick={() => setView('list')} className={`p-3 ${view === 'list' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`}><FaList /></button>
          <button onClick={() => setView('grid')} className={`p-3 ${view === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500'}`}><FaTh /></button>
        </div>
      </div>

      {/* List/Grid View */}
      {view === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Genre</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
              {movies.map(m => (
                <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{m.title}</td>
                  <td className="p-4">{m.genre}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs text-white ${m.status === 'RUNNING' ? 'bg-green-500' : 'bg-yellow-500'}`}>{m.status}</span></td>
                  <td className="p-4 text-right space-x-3">
                    <button onClick={() => handleEdit(m)} className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                    <button onClick={() => handleDelete(m._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {movies.map(m => (
             <div key={m._id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition">
                <img src={m.posterUrl} className="w-full h-48 object-cover" />
                <div className="p-4">
                   <h3 className="font-bold text-gray-900 dark:text-white truncate">{m.title}</h3>
                   <div className="flex justify-between mt-4">
                     <button onClick={() => handleEdit(m)} className="text-blue-500 text-sm flex items-center"><FaEdit className="mr-1"/> Edit</button>
                     <button onClick={() => handleDelete(m._id)} className="text-red-500 text-sm flex items-center"><FaTrash className="mr-1"/> Delete</button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default AdminMoviesPage;