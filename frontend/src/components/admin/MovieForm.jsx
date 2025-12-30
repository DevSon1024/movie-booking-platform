import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getCelebrities } from '../../services/celebrityService'; // Import the service
import professionsData from '../../data/professions.json';

const MovieForm = ({ initialData, isEditing, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [celebrities, setCelebrities] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', genre: '', duration: '', language: '', 
    releaseDate: '', posterUrl: '', status: 'UPCOMING',
    cast: [], crew: []
  });

  // Load initial data and celebrities
  useEffect(() => {
    const loadData = async () => {
      // 1. Fetch fresh celebrity data from API to ensure no stale URLs
      try {
        const freshCelebrities = await getCelebrities();
        // Sort alphabetically for easier searching
        setCelebrities(freshCelebrities.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Failed to load celebrities", error);
        toast.error("Could not load celebrity list");
      }

      // 2. Set Form Data if Editing
      if (isEditing && initialData) {
        setFormData({
          ...initialData,
          releaseDate: initialData.releaseDate ? initialData.releaseDate.split('T')[0] : '',
          cast: initialData.cast || [],
          crew: initialData.crew || []
        });
      }
    };

    loadData();
  }, [initialData, isEditing]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // --- Helper: Cast/Crew Logic ---
  const addToMovie = (celeb, type, role) => {
    if(!role) return toast.error(type === 'cast' ? "Enter character name" : "Enter job title");
    
    // Check if already added
    const exists = formData[type].some(item => item.name === celeb.name);
    if(exists) return toast.error(`${celeb.name} is already added`);

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
  
  // Filter celebrities based on search
  const filtered = celebrities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input 
          placeholder="Search Celebrity..." 
          className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" 
          value={search} 
          onChange={e=>setSearch(e.target.value)} 
        />
        <input 
          placeholder={type==='cast' ? "Role (Character)" : "Job (e.g. Director)"} 
          className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" 
          value={role} 
          onChange={e=>setRole(e.target.value)} 
        />
      </div>
      
      {/* Search Dropdown */}
      {search && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto bg-white dark:bg-gray-900 border dark:border-gray-700 p-2 rounded shadow-lg">
          {filtered.map(c => (
            <div 
              key={c.id} 
              onClick={()=>{onAdd(c, type, role); setSearch(''); setRole('');}} 
              className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <img 
                src={c.image} 
                className="w-10 h-10 rounded-full object-cover bg-gray-200" 
                alt={c.name}
                referrerPolicy="no-referrer"
                onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Img"; }}
              />
              <span className="text-sm font-medium dark:text-white">{c.name}</span>
              <FaPlus className="ml-auto text-green-500" />
            </div>
          ))}
          {filtered.length === 0 && (
             <div className="p-2 text-gray-500 text-sm text-center col-span-full">No results found.</div>
          )}
        </div>
      )}

      {/* Added List */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2 border rounded dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm">
            <img 
              src={item.image} 
              className="w-10 h-10 rounded object-cover bg-gray-200" 
              alt={item.name}
              referrerPolicy="no-referrer"
              onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Img"; }}
            />
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm truncate dark:text-white">{item.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{item.role}</p>
            </div>
            <button type="button" onClick={()=>onRemove(idx, type)} className="text-red-500 hover:text-red-700 p-1">
              <FaTrash size={14}/>
            </button>
          </div>
        ))}
        {data.length === 0 && !search && (
           <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
             No {type} members added yet. Search above to add.
           </div>
        )}
      </div>
    </div>
  );
};

export default MovieForm;