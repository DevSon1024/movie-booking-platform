import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaFilm, FaClock } from 'react-icons/fa';
import { getAdminMovies } from '../../services/movieService';
import { getTheatres } from '../../services/theatreService';
import { createShow, getShows, deleteShow } from '../../services/showService';
import toast from 'react-hot-toast';

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  
  // Dependent State: Screens available for the selected theatre
  const [availableScreens, setAvailableScreens] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    movieId: '',
    theatreId: '',
    screenName: '',
    startTime: '',
    price: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  // When theatre changes, update available screens
  useEffect(() => {
    if (formData.theatreId) {
      const selectedTheatre = theatres.find(t => t._id === formData.theatreId);
      setAvailableScreens(selectedTheatre ? selectedTheatre.screens : []);
    } else {
      setAvailableScreens([]);
    }
  }, [formData.theatreId, theatres]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [moviesData, theatresData, showsData] = await Promise.all([
        getAdminMovies(), // Use admin endpoint to get all movies
        getTheatres(),
        getShows()
      ]);
      setMovies(moviesData);
      setTheatres(theatresData);
      setShows(showsData);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load data');
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
      toast.success('Show Scheduled Successfully!');
      setShowForm(false);
      setFormData({ movieId: '', theatreId: '', screenName: '', startTime: '', price: '' });
      // Refresh shows
      const updatedShows = await getShows();
      setShows(updatedShows);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create show');
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm('Delete this show?')) {
          try {
              await deleteShow(id);
              toast.success('Show deleted');
              const updatedShows = await getShows();
              setShows(updatedShows);
          } catch (error) {
              toast.error('Failed to delete');
          }
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Shows</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
        >
          {showForm ? 'Close' : <><FaPlus className="mr-2" /> Schedule Show</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 text-purple-400">Schedule New Show</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Movie Selection */}
            <div>
               <label className="text-sm text-gray-400">Select Movie</label>
               <select name="movieId" value={formData.movieId} onChange={handleChange} className="w-full bg-gray-700 p-3 rounded text-white" required>
                 <option value="">-- Choose Movie --</option>
                 {movies.map(m => (
                   <option key={m._id} value={m._id}>{m.title} ({m.language})</option>
                 ))}
               </select>
            </div>

            {/* Theatre Selection */}
            <div>
               <label className="text-sm text-gray-400">Select Theatre</label>
               <select name="theatreId" value={formData.theatreId} onChange={handleChange} className="w-full bg-gray-700 p-3 rounded text-white" required>
                 <option value="">-- Choose Theatre --</option>
                 {theatres.map(t => (
                   <option key={t._id} value={t._id}>{t.name} - {t.city}</option>
                 ))}
               </select>
            </div>

            {/* Screen Selection (Dependent) */}
            <div>
               <label className="text-sm text-gray-400">Select Screen</label>
               <select name="screenName" value={formData.screenName} onChange={handleChange} className="w-full bg-gray-700 p-3 rounded text-white" required disabled={!formData.theatreId}>
                 <option value="">-- Choose Screen --</option>
                 {availableScreens.map((s, i) => (
                   <option key={i} value={s.name}>{s.name} ({s.type})</option>
                 ))}
               </select>
            </div>

            {/* Date & Time */}
            <div>
               <label className="text-sm text-gray-400">Start Time</label>
               <input 
                 type="datetime-local" 
                 name="startTime" 
                 value={formData.startTime} 
                 onChange={handleChange} 
                 className="w-full bg-gray-700 p-3 rounded text-white" 
                 required 
               />
            </div>

            {/* Price */}
            <div>
               <label className="text-sm text-gray-400">Ticket Price ($)</label>
               <input 
                 type="number" 
                 name="price" 
                 placeholder="e.g. 15"
                 value={formData.price} 
                 onChange={handleChange} 
                 className="w-full bg-gray-700 p-3 rounded text-white" 
                 required 
               />
            </div>

            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded md:col-span-2 mt-4">
              Confirm Schedule
            </button>
          </form>
        </div>
      )}

      {/* Shows List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
         <table className="w-full text-left">
           <thead className="bg-gray-700 text-gray-400 uppercase text-xs">
             <tr>
               <th className="p-4">Movie</th>
               <th className="p-4">Theatre / Screen</th>
               <th className="p-4">Date & Time</th>
               <th className="p-4">Price</th>
               <th className="p-4 text-right">Action</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-700">
             {shows.map(show => (
               <tr key={show._id} className="hover:bg-gray-750">
                 <td className="p-4">
                    <div className="font-bold text-white">{show.movie?.title}</div>
                    <div className="text-xs text-gray-400">{show.movie?.duration} mins</div>
                 </td>
                 <td className="p-4">
                    <div className="text-sm">{show.theatre?.name}</div>
                    <div className="text-xs text-gray-400">{show.screenName}</div>
                 </td>
                 <td className="p-4">
                    <div className="flex items-center"><FaClock className="mr-2 text-gray-500"/> {new Date(show.startTime).toLocaleString()}</div>
                 </td>
                 <td className="p-4 font-bold text-green-400">${show.price}</td>
                 <td className="p-4 text-right">
                    <button onClick={() => handleDelete(show._id)} className="text-red-400 hover:text-red-300"><FaTrash /></button>
                 </td>
               </tr>
             ))}
             {shows.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-500">No upcoming shows scheduled.</td></tr>}
           </tbody>
         </table>
      </div>
    </div>
  );
};

export default AdminShowsPage;