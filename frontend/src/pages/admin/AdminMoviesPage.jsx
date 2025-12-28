import { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaPlus, FaList, FaTh, FaSearch, FaUserTie, FaSave } from 'react-icons/fa';
import { getAdminMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService';
import toast from 'react-hot-toast';
import initialCelebritiesData from '../../data/celebrities.json';
import professionsData from '../../data/professions.json'; // Import professions

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  
  // Form States
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Celebrity & Cast/Crew States
  const [celebrities, setCelebrities] = useState([]);
  const [showCelebModal, setShowCelebModal] = useState(false);
  // Removed default profession from newCeleb state
  const [newCeleb, setNewCeleb] = useState({ name: '', image: '' });
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'cast', 'crew'

  const initialFormState = {
    title: '', description: '', genre: '', duration: '', language: '', 
    releaseDate: '', posterUrl: '', status: 'UPCOMING',
    cast: [], crew: []
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => { 
    fetchMovies(); 
    const stored = JSON.parse(localStorage.getItem('celebrities'));
    setCelebrities(stored || initialCelebritiesData);
  }, [search, sortBy]);

  const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await getAdminMovies(search, sortBy);
        setMovies(data);
      } catch (error) {
        toast.error("Error fetching movies");
      }
      setLoading(false);
  };

  // --- Celebrity Management ---
  const handleSaveCelebrity = () => {
    if(!newCeleb.name || !newCeleb.image) return toast.error("Name and Image required");
    
    // Removed profession from the object creation
    const updatedCelebs = [...celebrities, { ...newCeleb, id: Date.now().toString() }];
    setCelebrities(updatedCelebs);
    localStorage.setItem('celebrities', JSON.stringify(updatedCelebs));
    
    setNewCeleb({ name: '', image: '' });
    toast.success("Celebrity Added to List");
    setShowCelebModal(false);
  };

  const addToMovie = (celeb, type, role) => {
    if(!role) return toast.error(type === 'cast' ? "Please enter character name" : "Please enter job title");
    
    const newEntry = {
      name: celeb.name,
      image: celeb.image,
      role: role
    };

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], newEntry]
    }));
    toast.success(`Added to ${type}`);
  };

  const removeFromList = (index, type) => {
    const list = [...formData[type]];
    list.splice(index, 1);
    setFormData({ ...formData, [type]: list });
  };

  // --- Movie Management ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) await updateMovie(editId, formData);
      else await createMovie(formData);
      toast.success(isEditing ? 'Updated' : 'Created');
      resetForm(); 
      fetchMovies();
    } catch(err) { toast.error('Failed'); }
  };
  
  const handleDelete = async (id) => {
      if(confirm('Delete?')) { await deleteMovie(id); fetchMovies(); toast.success('Deleted'); }
  }

  const resetForm = () => {
     setFormData(initialFormState);
     setShowForm(false); setIsEditing(false); setActiveTab('basic');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleEdit = (m) => {
      setFormData({ 
        ...m, 
        releaseDate: m.releaseDate.split('T')[0],
        cast: m.cast || [],
        crew: m.crew || []
      });
      setEditId(m._id); setIsEditing(true); setShowForm(true);
  };

  // Helper component for searching and adding cast/crew
  const CastCrewSelector = ({ type }) => {
    const [roleInput, setRoleInput] = useState('');
    const [localSearch, setLocalSearch] = useState('');
    
    // Autocomplete states
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
      // Click outside listener to close suggestions
      function handleClickOutside(event) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setShowSuggestions(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredCelebs = celebrities.filter(c => 
      c.name.toLowerCase().includes(localSearch.toLowerCase())
    );

    // Handle Job Input Change (for Autocomplete)
    const handleRoleChange = (e) => {
      const value = e.target.value;
      setRoleInput(value);

      if (type === 'crew' && value.length > 0) {
        const filteredProfessions = professionsData.filter(p => 
          p.toLowerCase().startsWith(value.toLowerCase())
        );
        setSuggestions(filteredProfessions);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    };

    const selectProfession = (profession) => {
      setRoleInput(profession);
      setShowSuggestions(false);
    };

    return (
      <div className="space-y-4">
        {/* Search & Add Area */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="font-bold text-sm mb-3 uppercase text-gray-500">Add {type}</h4>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
             <input 
               placeholder="Search Celebrity..." 
               className="flex-1 bg-white dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
               value={localSearch}
               onChange={e => setLocalSearch(e.target.value)}
             />
             
             {/* Role/Job Input with Autocomplete */}
             <div className="flex-1 relative" ref={wrapperRef}>
               <input 
                 placeholder={type === 'cast' ? "As (Character Name)" : "Job (e.g. Director)"} 
                 className="w-full bg-white dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
                 value={roleInput}
                 onChange={handleRoleChange}
                 autoComplete="off"
               />
               
               {/* Suggestions Dropdown */}
               {showSuggestions && suggestions.length > 0 && (
                 <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-b-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                   {suggestions.map((prof, idx) => (
                     <li 
                       key={idx}
                       onClick={() => selectProfession(prof)}
                       className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-sm text-gray-700 dark:text-gray-200"
                     >
                       {prof}
                     </li>
                   ))}
                 </ul>
               )}
             </div>
          </div>
          
          {localSearch && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {filteredCelebs.map(c => (
                <div key={c.id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                     onClick={() => { addToMovie(c, type, roleInput); setRoleInput(''); }}>
                   <img src={c.image} className="w-8 h-8 rounded-full object-cover" />
                   <div className="text-xs">
                     <p className="font-bold dark:text-white">{c.name}</p>
                   </div>
                   <FaPlus className="ml-auto text-green-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {formData[type].map((item, idx) => (
            <div key={idx} className="relative flex items-center gap-3 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
              <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                   {type === 'cast' ? 'As ' : ''}{item.role}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => removeFromList(idx, type)}
                className="text-red-500 hover:bg-red-50 p-1 rounded"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}
          {formData[type].length === 0 && <p className="text-sm text-gray-400 italic col-span-full">No {type} added yet.</p>}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Movies</h1>
        
        <div className="flex gap-2">
           <button onClick={() => setShowCelebModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow flex items-center text-sm">
             <FaUserTie className="mr-2" /> Manage Celebrities
           </button>
           <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow flex items-center text-sm">
             {showForm ? 'Close Form' : <><FaPlus className="mr-2" /> Add Movie</>}
           </button>
        </div>
      </div>

      {/* Celebrity Modal (Modified: No Profession Selection) */}
      {showCelebModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Add New Celebrity</h3>
            <div className="space-y-3">
               <input placeholder="Full Name" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={newCeleb.name} onChange={e=>setNewCeleb({...newCeleb, name: e.target.value})} />
               <input placeholder="Image URL" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" value={newCeleb.image} onChange={e=>setNewCeleb({...newCeleb, image: e.target.value})} />
               {/* Profession select removed as requested */}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCelebModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSaveCelebrity} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Celebrity</button>
            </div>
          </div>
        </div>
      )}

      {/* Movie Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-gray-800 dark:text-white">{isEditing ? 'Edit Movie' : 'Add New Movie'}</h2>
             
             {/* Tabs */}
             <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
               {['basic', 'cast', 'crew'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                 >
                   {tab} Info
                 </button>
               ))}
             </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
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
              </div>
            )}

            {/* Cast Tab */}
            {activeTab === 'cast' && <CastCrewSelector type="cast" />}

            {/* Crew Tab */}
            {activeTab === 'crew' && <CastCrewSelector type="crew" />}

            <div className="mt-6 flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow flex items-center gap-2">
                <FaSave /> Save Movie
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters (Existing code...) */}
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

      {/* List/Grid View (Existing code...) */}
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