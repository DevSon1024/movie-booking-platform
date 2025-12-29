import { useState, useEffect } from "react";
import { FaTimes, FaCalendarCheck } from "react-icons/fa";

const ShowForm = ({ initialData, isEditing, movies, theatres, currencySymbol, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    movieId: "", theatreId: "", screenName: "", startTime: "", price: ""
  });
  const [availableScreens, setAvailableScreens] = useState([]);

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        movieId: initialData.movie._id,
        theatreId: initialData.theatre._id,
        screenName: initialData.screenName,
        startTime: new Date(initialData.startTime).toISOString().slice(0, 16),
        price: initialData.price,
      });
    }
  }, [initialData, isEditing]);

  useEffect(() => {
    if (formData.theatreId) {
      const selected = theatres.find((t) => t._id === formData.theatreId);
      setAvailableScreens(selected ? selected.screens : []);
    } else {
      setAvailableScreens([]);
    }
  }, [formData.theatreId, theatres]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
             <FaCalendarCheck className="text-green-500"/> {isEditing ? "Edit Show" : "Schedule Show"}
          </h2>
          <button onClick={onClose}><FaTimes className="text-gray-500 hover:text-red-500"/></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold dark:text-gray-300">Movie</label>
            <select name="movieId" value={formData.movieId} onChange={handleChange} className="w-full p-2.5 mt-1 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
              <option value="">Select Movie</option>
              {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold dark:text-gray-300">Theatre</label>
            <select name="theatreId" value={formData.theatreId} onChange={handleChange} className="w-full p-2.5 mt-1 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
              <option value="">Select Theatre</option>
              {theatres.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold dark:text-gray-300">Screen</label>
              <select name="screenName" value={formData.screenName} onChange={handleChange} className="w-full p-2.5 mt-1 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" required disabled={!formData.theatreId}>
                <option value="">Select Screen</option>
                {availableScreens.map((s,i) => <option key={i} value={s.name}>{s.name} ({s.type})</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold dark:text-gray-300">Price ({currencySymbol})</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2.5 mt-1 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold dark:text-gray-300">Start Time</label>
            <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full p-2.5 mt-1 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
          </div>
          
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4 shadow">
            {isEditing ? 'Update Schedule' : 'Confirm Schedule'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ShowForm;