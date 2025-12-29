import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import initialCelebritiesData from '../../data/celebrities.json';
import professionsData from '../../data/professions.json';

const MovieForm = ({ initialData, isEditing, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [celebrities, setCelebrities] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', genre: '', duration: '', language: '', 
    releaseDate: '', posterUrl: '', status: 'UPCOMING',
    cast: [], crew: []
  });

  // Load initial data if editing
  useEffect(() => {
    const storedCelebs = JSON.parse(localStorage.getItem('celebrities'));
    setCelebrities(storedCelebs || initialCelebritiesData);

    if (isEditing && initialData) {
      setFormData({
        ...initialData,
        releaseDate: initialData.releaseDate ? initialData.releaseDate.split('T')[0] : '',
        cast: initialData.cast || [],
        crew: initialData.crew || []
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // --- Helper: Cast/Crew Logic (Inline for simplicity in this file) ---
  const addToMovie = (celeb, type, role) => {
    if(!role) return toast.error(type === 'cast' ? "Enter character name" : "Enter job title");
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { name: celeb.name, image: celeb.image, role }]
    }));
    toast.success('Added');
  };

  const removeFromList = (index, type) => {
    const list = [...formData[type]];
    list.splice(index, 1);
    setFormData({ ...formData, [type]: list });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEditing ? 'Edit Movie' : 'Add New Movie'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          {['basic', 'cast', 'crew'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab} Details
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="movie-form" onSubmit={handleSubmit}>
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                  <input name="title" value={formData.title} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Genre</label>
                  <input name="genre" value={formData.genre} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Duration (mins)</label>
                  <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Language</label>
                  <input name="language" value={formData.language} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Release Date</label>
                  <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-white">
                    <option value="UPCOMING">Upcoming</option>
                    <option value="RUNNING">Running</option>
                    <option value="ENDED">Ended</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Poster URL</label>
                  <input name="posterUrl" value={formData.posterUrl} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-white" required />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-white" rows="3"></textarea>
                </div>
              </div>
            )}

            {(activeTab === 'cast' || activeTab === 'crew') && (
              <CastCrewSelector 
                type={activeTab} 
                data={formData[activeTab]} 
                celebrities={celebrities} 
                professions={professionsData}
                onAdd={addToMovie} 
                onRemove={removeFromList} 
              />
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition">
            Cancel
          </button>
          <button type="submit" form="movie-form" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition flex items-center gap-2">
            <FaSave /> {isEditing ? 'Update Movie' : 'Save Movie'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Internal Helper for Selector
const CastCrewSelector = ({ type, data, celebrities, professions, onAdd, onRemove }) => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const filtered = celebrities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input placeholder="Search Celebrity..." className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={search} onChange={e=>setSearch(e.target.value)} />
        <input placeholder={type==='cast' ? "Role (Character)" : "Job (e.g. Director)"} className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={role} onChange={e=>setRole(e.target.value)} />
      </div>
      
      {search && (
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-2 rounded">
          {filtered.map(c => (
            <div key={c.id} onClick={()=>{onAdd(c, type, role); setSearch(''); setRole('');}} className="flex items-center gap-2 p-2 hover:bg-white dark:hover:bg-gray-700 cursor-pointer rounded">
              <img src={c.image} className="w-8 h-8 rounded-full" alt="" />
              <span className="text-sm dark:text-white">{c.name}</span>
              <FaPlus className="ml-auto text-green-500" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2 border rounded dark:border-gray-600 bg-white dark:bg-gray-700">
            <img src={item.image} className="w-10 h-10 rounded object-cover" alt="" />
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm truncate dark:text-white">{item.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{item.role}</p>
            </div>
            <button type="button" onClick={()=>onRemove(idx, type)} className="text-red-500"><FaTrash size={12}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieForm;