import { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaEdit, FaTh, FaList, FaWikipediaW, FaExternalLinkAlt } from 'react-icons/fa';
import { getCelebrities, createCelebrity, updateCelebrity, deleteCelebrity } from '../../services/celebrityService';
import toast from 'react-hot-toast';
import axios from 'axios';

const ManageCelebrities = ({ onClose }) => {
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Form State
  const [formData, setFormData] = useState({ id: '', name: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);
  
  // Image Search State
  const [wikiImages, setWikiImages] = useState([]);
  const [searchingImages, setSearchingImages] = useState(false);

  useEffect(() => {
    fetchCelebrities();
  }, []);

  const fetchCelebrities = async () => {
    try {
      const data = await getCelebrities();
      // Sort by ID descending (newest first) or Name? Let's do newest first based on ID
      const sortedData = data.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      setCelebrities(sortedData);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load celebrities');
      setLoading(false);
    }
  };

  // Wikipedia Image Search
  const searchWikipediaImages = async (query) => {
    if (!query) return;
    setSearchingImages(true);
    setWikiImages([]);
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrlimit=5&prop=pageimages&piprop=original&format=json&origin=*`;
      const { data } = await axios.get(url);
      
      if (data.query && data.query.pages) {
        const images = Object.values(data.query.pages)
          .filter(page => page.original)
          .map(page => ({
             title: page.title,
             url: page.original.source
          }));
        setWikiImages(images);
      }
    } catch (err) {
      console.error("Wiki search failed", err);
    }
    setSearchingImages(false);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({ ...formData, name });
    if (name.length > 2) {
      const timer = setTimeout(() => searchWikipediaImages(name), 800);
      return () => clearTimeout(timer);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateCelebrity(formData.id, { name: formData.name, image: formData.image });
        toast.success('Celebrity Updated');
      } else {
        await createCelebrity({ name: formData.name, image: formData.image });
        toast.success('Celebrity Added');
      }
      setFormData({ id: '', name: '', image: '' });
      setIsEditing(false);
      setWikiImages([]);
      fetchCelebrities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (celeb) => {
    setFormData(celeb);
    setIsEditing(true);
    setWikiImages([]); 
  };

  const handleDelete = async (id) => {
    if(confirm('Delete this celebrity?')) {
        await deleteCelebrity(id);
        fetchCelebrities();
        toast.success('Deleted');
    }
  };

  const filteredCelebrities = celebrities.filter(c => 
    c.name.toLowerCase().includes(localSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div>
              <h2 className="text-2xl font-bold dark:text-white">Manage Celebrities</h2>
              <p className="text-sm text-gray-500">Total: {celebrities.length} records</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-3xl transition">&times;</button>
        </div>

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
            
            {/* Left Panel: Form */}
            <div className="w-full md:w-1/3 p-6 border-r dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 dark:text-gray-200 flex items-center gap-2">
                        {isEditing ? <FaEdit className="text-blue-500"/> : <FaWikipediaW className="text-gray-400"/>}
                        {isEditing ? 'Edit Details' : 'Add New Celebrity'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Name</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    placeholder="Type name to auto-search..."
                                    required
                                />
                                {searchingImages && <span className="absolute right-3 top-3 text-xs text-blue-500 font-semibold animate-pulse">Scanning...</span>}
                            </div>
                        </div>

                        {/* Image Suggestions */}
                        {wikiImages.length > 0 && (
                            <div className="animate-slide-down">
                                <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Web Suggestions</p>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {wikiImages.map((img, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => setFormData({...formData, image: img.url})}
                                            title="Click to use this image"
                                            className="min-w-[70px] h-[70px] cursor-pointer hover:opacity-100 opacity-80 border-2 border-transparent hover:border-blue-500 rounded-lg overflow-hidden shadow-sm transition"
                                        >
                                            <img src={img.url} alt="suggestion" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Image URL</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={formData.image}
                                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                                    placeholder="https://..."
                                    required
                                />
                                <a href={formData.image} target="_blank" rel="noreferrer" className={`p-3 rounded-lg border dark:border-gray-600 flex items-center justify-center ${!formData.image ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    <FaExternalLinkAlt className="text-gray-500" />
                                </a>
                            </div>
                        </div>
                        
                        <div className="w-full aspect-[3/4] bg-gray-100 dark:bg-gray-900/50 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center relative group">
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-sm">Image Preview</span>
                            )}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 rounded-lg font-semibold shadow-lg transition transform hover:scale-[1.02]">
                                {isEditing ? 'Update Celebrity' : 'Add to Database'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={() => { setIsEditing(false); setFormData({ id:'', name:'', image:'' }); setWikiImages([]); }} className="px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Panel: List */}
            <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-gray-800">
                {/* Tools Bar */}
                <div className="p-4 border-b dark:border-gray-700 flex gap-4 items-center bg-white dark:bg-gray-800 sticky top-0 z-10">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by name..."
                            className="w-full pl-10 p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                            title="Grid View"
                        >
                            <FaTh />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                            title="List View"
                        >
                            <FaList />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/30">
                    {/* GRID VIEW */}
                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredCelebrities.map(celeb => (
                                <div key={celeb.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={celeb.image} alt={celeb.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                            <button onClick={() => handleEdit(celeb)} className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg transform hover:scale-110 transition"><FaEdit /></button>
                                            <button onClick={() => handleDelete(celeb.id)} className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-lg transform hover:scale-110 transition"><FaTrash /></button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate" title={celeb.name}>{celeb.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {celeb.id}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* LIST VIEW */}
                    {viewMode === 'list' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-4 w-20">Image</th>
                                        <th className="p-4">Name</th>
                                        <th className="p-4 w-24">ID</th>
                                        <th className="p-4 w-32 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredCelebrities.map(celeb => (
                                        <tr key={celeb.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                            <td className="p-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                                    <img src={celeb.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{celeb.name}</td>
                                            <td className="p-3 text-gray-500 font-mono text-sm">{celeb.id}</td>
                                            <td className="p-3">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleEdit(celeb)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"><FaEdit /></button>
                                                    <button onClick={() => handleDelete(celeb.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredCelebrities.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <FaSearch className="text-4xl mb-4 opacity-20" />
                            <p>No celebrities found matching "{localSearch}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCelebrities;