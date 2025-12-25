import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminMoviesPage = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', genre: '', duration: '', language: '', releaseDate: '', posterUrl: '', status: 'UPCOMING'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/movies', formData);
      toast.success('Movie Added Successfully!');
      setFormData({ title: '', description: '', genre: '', duration: '', language: '', releaseDate: '', posterUrl: '', status: 'UPCOMING' }); // Reset
    } catch (error) {
      toast.error('Failed to add movie');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Add New Movie</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input name="title" placeholder="Movie Title" onChange={handleChange} value={formData.title} className="bg-gray-700 p-3 rounded text-white" required />
        <input name="genre" placeholder="Genre (e.g. Action)" onChange={handleChange} value={formData.genre} className="bg-gray-700 p-3 rounded text-white" required />
        <input name="duration" type="number" placeholder="Duration (mins)" onChange={handleChange} value={formData.duration} className="bg-gray-700 p-3 rounded text-white" required />
        <input name="language" placeholder="Language" onChange={handleChange} value={formData.language} className="bg-gray-700 p-3 rounded text-white" required />
        <input name="releaseDate" type="date" onChange={handleChange} value={formData.releaseDate} className="bg-gray-700 p-3 rounded text-white" required />
        <select name="status" onChange={handleChange} value={formData.status} className="bg-gray-700 p-3 rounded text-white">
          <option value="UPCOMING">Upcoming</option>
          <option value="RUNNING">Now Showing</option>
          <option value="ENDED">Ended</option>
        </select>
        <input name="posterUrl" placeholder="Poster Image URL" onChange={handleChange} value={formData.posterUrl} className="bg-gray-700 p-3 rounded text-white md:col-span-2" required />
        <textarea name="description" placeholder="Description" onChange={handleChange} value={formData.description} className="bg-gray-700 p-3 rounded text-white md:col-span-2" rows="3" required></textarea>
        
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded md:col-span-2">
          Add Movie
        </button>
      </form>
    </div>
  );
};

export default AdminMoviesPage;