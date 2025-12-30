import { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaTrash, FaEdit, FaCheck } from 'react-icons/fa';
import { getCelebrities, createCelebrity, updateCelebrity, deleteCelebrity } from '../../services/celebrityService';
import toast from 'react-hot-toast';
import axios from 'axios';

const ManageCelebrities = ({ onClose }) => {
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  
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
      setCelebrities(data);
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
      // Wiki API Query for images
      const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrlimit=5&prop=pageimages&piprop=original&format=json&origin=*`;
      
      const { data } = await axios.get(url);
      
      if (data.query && data.query.pages) {
        const images = Object.values(data.query.pages)
          .filter(page => page.original) // Only pages with images
          .map(page => ({
             title: page.title,
             url: page.original.source
          }));
        setWikiImages(images);
      } else {
        setWikiImages([]);
      }
    } catch (err) {
      console.error("Wiki search failed", err);
    }
    setSearchingImages(false);
  };

  // Handle Name Input Change with Debounce for Image Search
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({ ...formData, name });
    
    // Simple debounce to trigger search
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
    setWikiImages([]); // Clear previous search
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-2xl font-bold dark:text-white">Manage Celebrities</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            
            {/* Left Panel: Form */}
            <div className="w-1/3 p-6 border-r dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-lg mb-4 dark:text-gray-200">{isEditing ? 'Edit Celebrity' : 'Add New Celebrity'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-400">Name</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={formData.name}
                                onChange={handleNameChange}
                                placeholder="Enter full name"
                                required
                            />
                            {searchingImages && <span className="absolute right-2 top-2.5 text-xs text-blue-500 animate-pulse">Searching...</span>}
                        </div>
                    </div>

                    {/* Image Suggestions */}
                    {wikiImages.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Wiki Suggestions (Click to select):</p>
                            <div className="flex gap-2 overflow-x-auto py-2">
                                {wikiImages.map((img, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => setFormData({...formData, image: img.url})}
                                        className="min-w-[60px] h-[60px] cursor-pointer hover:opacity-80 border-2 border-transparent hover:border-blue-500 rounded overflow-hidden"
                                    >
                                        <img src={img.url} alt="suggestion" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-400">Image URL</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            placeholder="https://..."
                            required
                        />
                    </div>
                    
                    {formData.image && (
                        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded">
                            {isEditing ? 'Update' : 'Add'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={() => { setIsEditing(false); setFormData({ id:'', name:'', image:'' }); setWikiImages([]); }} className="px-4 bg-gray-500 text-white rounded">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Right Panel: List */}
            <div className="w-2/3 flex flex-col p-6">
                <div className="mb-4 relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search local database..."
                        className="w-full pl-10 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 content-start">
                    {filteredCelebrities.map(celeb => (
                        <div key={celeb.id} className="relative group bg-white dark:bg-gray-700 rounded-lg shadow border dark:border-gray-600 overflow-hidden hover:shadow-lg transition">
                            <div className="h-40 overflow-hidden">
                                <img src={celeb.image} alt={celeb.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-2">
                                <p className="font-semibold text-sm truncate dark:text-white">{celeb.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {celeb.id}</p>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(celeb)} className="p-1.5 bg-blue-600 text-white rounded-full shadow"><FaEdit size={10} /></button>
                                <button onClick={() => handleDelete(celeb.id)} className="p-1.5 bg-red-600 text-white rounded-full shadow"><FaTrash size={10} /></button>
                            </div>
                        </div>
                    ))}
                    {filteredCelebrities.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 py-10">
                            No celebrities found.
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