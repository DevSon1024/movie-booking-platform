import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getCelebrities } from '../../services/celebrityService';
import professionsData from '../../data/professions.json';

const MovieForm = ({ initialData, isEditing, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [celebrities, setCelebrities] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', genre: '', duration: '', language: '', 
    releaseDate: '', posterUrl: '', trailerUrl: '', status: 'UPCOMING',
    cast: [], crew: []
  });
  
  // Poster Upload State
  const [posterFile, setPosterFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const freshCelebrities = await getCelebrities();
        setCelebrities(freshCelebrities.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error("Failed to load celebrities", error);
        toast.error("Could not load celebrity list");
      }

      if (isEditing && initialData) {
        setFormData({
          ...initialData,
          releaseDate: initialData.releaseDate ? initialData.releaseDate.split('T')[0] : '',
          trailerUrl: initialData.trailerUrl || '',
          cast: initialData.cast || [],
          crew: initialData.crew || []
        });
        // Default to URL mode when editing
        setUploadMode('url');
      }
    };

    loadData();
  }, [initialData, isEditing]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        setPosterFile(file);
        setUploadMode('file');
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, posterUrl: previewUrl }));
    } else {
        toast.error('Please drop a valid image file');
    }
  };

  const handlePosterFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, posterUrl: previewUrl }));
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    
    // Append simple fields
    Object.keys(formData).forEach(key => {
        if (key !== 'cast' && key !== 'crew' && key !== 'posterUrl') {
            submitData.append(key, formData[key] === null ? '' : formData[key]);
        }
    });

    // Handle Poster
    if (uploadMode === 'file' && posterFile) {
        submitData.append('posterFile', posterFile);
    } else {
        submitData.append('posterUrl', formData.posterUrl || '');
    }

    // Handle Complex Fields (Cast & Crew)
    // Send as JSON strings, backend will parse them
    submitData.append('cast', JSON.stringify(formData.cast));
    submitData.append('crew', JSON.stringify(formData.crew));

    onSubmit(submitData);
  };

  const addToMovie = (celeb, type, role) => {
    if(!role) {
      toast.error(type === 'cast' ? "Please enter character name" : "Please enter job title");
      return;
    }
    
    const exists = formData[type].some(item => item.name === celeb.name);
    if(exists) {
      toast.error(`${celeb.name} is already added`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], { name: celeb.name, image: celeb.image, role }]
    }));
    toast.success('Added successfully');
  };

  const removeFromList = (index, type) => {
    const list = [...formData[type]];
    list.splice(index, 1);
    setFormData({ ...formData, [type]: list });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {isEditing ? 'Edit Movie' : 'Add New Movie'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <FaTimes size={24} />
          </button>
        </div>

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
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase">Poster Image</label>
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => { setUploadMode('url'); setPosterFile(null); if(isEditing) setFormData(prev => ({...prev, posterUrl: initialData.posterUrl || ''})); }}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${uploadMode === 'url' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => { setUploadMode('file'); setFormData(prev => ({...prev, posterUrl: ''})); }}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${uploadMode === 'file' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                          Upload
                        </button>
                    </div>
                  </div>
                  
                  {uploadMode === 'url' ? (
                      <input 
                        name="posterUrl" 
                        value={formData.posterUrl} 
                        onChange={handleChange} 
                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-white" 
                        placeholder="https://example.com/poster.jpg"
                        required={!posterFile} 
                      />
                  ) : (
                      <div 
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all bg-gray-50 dark:bg-gray-700/50 ${
                            isDragging 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 scale-[1.02]' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handlePosterFileChange}
                          className="hidden" 
                          id="poster-upload"
                          required={!formData.posterUrl}
                        />
                        <label htmlFor="poster-upload" className="cursor-pointer flex flex-col items-center w-full h-full">
                          <FaPlus className={`text-2xl mb-2 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {isDragging ? 'Drop poster here' : !!posterFile ? 'Change File' : 'Click or Drag to Upload Poster'}
                          </span>
                        </label>
                        {posterFile && (
                          <div className="mt-2 text-xs text-green-600 font-semibold truncate max-w-xs mx-auto">
                            {posterFile.name}
                          </div>
                        )}
                        {/* Preview specific for upload mode if needed, effectively duplicate of formData.posterUrl if set */}
                      </div>
                  )}
                  {formData.posterUrl && (
                      <div className="mt-2 w-full h-48 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative">
                          <img 
                            src={formData.posterUrl} 
                            alt="Poster Preview" 
                            className="w-full h-full object-contain"
                            onError={(e) => {e.target.style.display='none'}}
                          />
                      </div>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Trailer URL (YouTube)</label>
                  <input 
                    name="trailerUrl" 
                    value={formData.trailerUrl} 
                    onChange={handleChange} 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 dark:text-white" 
                    placeholder="https://www.youtube.com/watch?v=xxxxx or https://youtu.be/xxxxx"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional: Add YouTube trailer link for this movie</p>
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

const CastCrewSelector = ({ type, data, celebrities, professions, onAdd, onRemove }) => {
  const [celebritySearch, setCelebritySearch] = useState('');
  const [role, setRole] = useState('');
  const [showCelebrityDropdown, setShowCelebrityDropdown] = useState(false);
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  
  const filteredCelebrities = celebrities.filter(c => 
    c.name.toLowerCase().includes(celebritySearch.toLowerCase())
  );

  const filteredProfessions = professions.filter(p => 
    p.toLowerCase().includes(role.toLowerCase())
  );

  const handleCelebritySelect = (celeb) => {
    setCelebritySearch(celeb.name);
    setShowCelebrityDropdown(false);
  };

  const handleProfessionSelect = (profession) => {
    setRole(profession);
    setShowProfessionDropdown(false);
  };

  const handleAddClick = () => {
    const selectedCeleb = celebrities.find(c => c.name === celebritySearch);
    if (!selectedCeleb) {
      toast.error("Please select a valid celebrity from the list");
      return;
    }
    onAdd(selectedCeleb, type, role);
    setCelebritySearch('');
    setRole('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
            {type === 'cast' ? 'Actor/Actress Name' : 'Crew Member Name'}
          </label>
          <input 
            placeholder="Type to search celebrity..." 
            className="w-full p-2.5 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" 
            value={celebritySearch} 
            onChange={e => {
              setCelebritySearch(e.target.value);
              setShowCelebrityDropdown(true);
            }}
            onFocus={() => setShowCelebrityDropdown(true)}
          />
          
          {showCelebrityDropdown && celebritySearch && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCelebrities.length > 0 ? (
                filteredCelebrities.slice(0, 10).map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => handleCelebritySelect(c)} 
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-600 last:border-0"
                  >
                    <img 
                      src={c.image} 
                      className="w-10 h-10 rounded-full object-cover bg-gray-200" 
                      alt={c.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Img"; }}
                    />
                    <span className="text-sm font-medium dark:text-white">{c.name}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-sm text-center">No celebrity found</div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
            {type === 'cast' ? 'Character Name' : 'Job Title/Profession'}
          </label>
          <input 
            placeholder={type === 'cast' ? "e.g., Hero, Villain" : "Type profession..."}
            className="w-full p-2.5 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" 
            value={role} 
            onChange={e => {
              setRole(e.target.value);
              if (type === 'crew') setShowProfessionDropdown(true);
            }}
            onFocus={() => {
              if (type === 'crew') setShowProfessionDropdown(true);
            }}
          />
          
          {type === 'crew' && showProfessionDropdown && role && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredProfessions.length > 0 ? (
                filteredProfessions.slice(0, 10).map((profession, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleProfessionSelect(profession)} 
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-600 last:border-0"
                  >
                    <span className="text-sm dark:text-white">{profession}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-sm text-center">No profession found</div>
              )}
            </div>
          )}
        </div>
      </div>

      <button 
        type="button" 
        onClick={handleAddClick}
        className="w-full md:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
      >
        <FaPlus /> Add {type === 'cast' ? 'Cast Member' : 'Crew Member'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition">
            <img 
              src={item.image} 
              className="w-12 h-12 rounded-full object-cover bg-gray-200" 
              alt={item.name}
              referrerPolicy="no-referrer"
              onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Img"; }}
            />
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm truncate dark:text-white">{item.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300 truncate">{item.role}</p>
            </div>
            <button 
              type="button" 
              onClick={() => onRemove(idx, type)} 
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded transition"
            >
              <FaTrash size={14}/>
            </button>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
          <p className="text-lg mb-2">No {type} members added yet</p>
          <p className="text-sm">Use the fields above to add {type} members</p>
        </div>
      )}
    </div>
  );
};

export default MovieForm;