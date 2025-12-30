import { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaEdit, FaTh, FaList, FaWikipediaW, FaExternalLinkAlt, FaTimes, FaPlus, FaImage, FaUserTie } from 'react-icons/fa';
import { getCelebrities, createCelebrity, updateCelebrity, deleteCelebrity } from '../../services/celebrityService';
import toast from 'react-hot-toast';
import axios from 'axios';

const ManageCelebrities = ({ onClose }) => {
  const [celebrities, setCelebrities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Form State
  const [formData, setFormData] = useState({ id: '', name: '', image: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Image Search State
  const [wikiImages, setWikiImages] = useState([]);
  const [searchingImages, setSearchingImages] = useState(false);

  useEffect(() => {
    fetchCelebrities();
  }, []);

  const fetchCelebrities = async () => {
    try {
      const data = await getCelebrities();
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
      const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrlimit=6&prop=pageimages&piprop=original&format=json&origin=*`;
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
        toast.success('Celebrity Updated Successfully!');
      } else {
        await createCelebrity({ name: formData.name, image: formData.image });
        toast.success('Celebrity Added Successfully!');
      }
      setFormData({ id: '', name: '', image: '' });
      setIsEditing(false);
      setShowForm(false);
      setWikiImages([]);
      fetchCelebrities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (celeb) => {
    setFormData(celeb);
    setIsEditing(true);
    setShowForm(true);
    setWikiImages([]);
  };

  const handleDelete = async (id) => {
    if(confirm('Are you sure you want to delete this celebrity?')) {
        try {
          await deleteCelebrity(id);
          fetchCelebrities();
          toast.success('Celebrity Deleted Successfully!');
        } catch (err) {
          toast.error('Failed to delete celebrity');
        }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowForm(false);
    setFormData({ id: '', name: '', image: '' });
    setWikiImages([]);
  };

  const filteredCelebrities = celebrities.filter(c => 
    c.name.toLowerCase().includes(localSearch.toLowerCase())
  );

  // Optimized Image Component with error handling
  const CelebrityImage = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [imgError, setImgError] = useState(false);

    const handleError = () => {
      if (!imgError) {
        setImgError(true);
        setImgSrc('https://ui-avatars.com/api/?name=' + encodeURIComponent(alt) + '&size=400&background=ef4444&color=fff&bold=true');
      }
    };

    return (
      <img 
        src={imgSrc}
        alt={alt}
        className={className}
        loading="lazy"
        onError={handleError}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaUserTie className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Manage Celebrities</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Total: <span className="font-bold text-red-600 dark:text-red-400">{celebrities.length}</span> records
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          
          {/* Action Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row gap-3">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input 
                  type="text" 
                  placeholder="Search celebrities by name..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
                {localSearch && (
                  <button 
                    onClick={() => setLocalSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition-all font-medium text-sm flex items-center gap-2 ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600 dark:text-red-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <FaTh /> <span className="hidden sm:inline">Grid</span>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-all font-medium text-sm flex items-center gap-2 ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-red-600 dark:text-red-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <FaList /> <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Add New Button */}
              <button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 text-sm"
              >
                <FaPlus /> <span className="hidden sm:inline">Add Celebrity</span><span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">Loading celebrities...</p>
              </div>
            ) : filteredCelebrities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FaSearch className="text-5xl mb-4 opacity-20" />
                <p className="text-lg font-medium">No celebrities found</p>
                {localSearch && <p className="text-sm mt-2">Try a different search term</p>}
              </div>
            ) : (
              <>
                {/* GRID VIEW */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {filteredCelebrities.map(celeb => (
                      <div 
                        key={celeb.id} 
                        className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-red-300 dark:hover:border-red-700 transition-all duration-300"
                      >
                        <div className="aspect-[3/4] overflow-hidden relative bg-gray-100 dark:bg-gray-700">
                          <CelebrityImage
                            src={celeb.image}
                            alt={celeb.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                            <button 
                              onClick={() => handleEdit(celeb)} 
                              className="p-2.5 bg-white hover:bg-blue-50 text-blue-600 rounded-lg shadow-lg transform hover:scale-110 transition-all"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDelete(celeb.id)} 
                              className="p-2.5 bg-white hover:bg-red-50 text-red-600 rounded-lg shadow-lg transform hover:scale-110 transition-all"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate text-sm" title={celeb.name}>
                            {celeb.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                            ID: {celeb.id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* LIST VIEW */}
                {viewMode === 'list' && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs uppercase font-bold border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="p-4 w-16">Image</th>
                            <th className="p-4">Celebrity Name</th>
                            <th className="p-4 w-32">ID</th>
                            <th className="p-4 w-36 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {filteredCelebrities.map(celeb => (
                            <tr key={celeb.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                              <td className="p-4">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                  <CelebrityImage
                                    src={celeb.image}
                                    alt={celeb.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </td>
                              <td className="p-4 font-medium text-gray-800 dark:text-gray-200">{celeb.name}</td>
                              <td className="p-4 text-gray-500 dark:text-gray-400 font-mono text-sm">{celeb.id}</td>
                              <td className="p-4">
                                <div className="flex justify-center gap-2">
                                  <button 
                                    onClick={() => handleEdit(celeb)} 
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(celeb.id)} 
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredCelebrities.map(celeb => (
                        <div key={celeb.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex-shrink-0">
                            <CelebrityImage
                              src={celeb.image}
                              alt={celeb.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">{celeb.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">ID: {celeb.id}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(celeb)} 
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDelete(celeb.id)} 
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in">
            
            {/* Form Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  {isEditing ? <FaEdit className="text-white" /> : <FaPlus className="text-white" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isEditing ? 'Edit Celebrity' : 'Add New Celebrity'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isEditing ? 'Update celebrity information' : 'Fill in the details below'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleCancel}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Name Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Celebrity Name *
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g., Shahrukh Khan"
                    required
                  />
                  {searchingImages && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Searching...
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <FaWikipediaW className="text-gray-400" /> Auto-search starts after typing 3+ characters
                </p>
              </div>

              {/* Wikipedia Image Suggestions */}
              {wikiImages.length > 0 && (
                <div className="animate-slide-down">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FaImage className="text-red-600" /> Suggested Images from Web
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {wikiImages.map((img, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setFormData({...formData, image: img.url})}
                        className={`aspect-[3/4] cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          formData.image === img.url 
                            ? 'border-red-600 ring-2 ring-red-600 ring-offset-2 dark:ring-offset-gray-800' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-red-400'
                        }`}
                        title="Click to select this image"
                      >
                        <CelebrityImage src={img.url} alt={img.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image URL Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Image URL *
                </label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {formData.image && (
                    <a 
                      href={formData.image} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-3 rounded-xl border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition group"
                      title="Open image in new tab"
                    >
                      <FaExternalLinkAlt className="text-gray-500 group-hover:text-red-600 transition" />
                    </a>
                  )}
                </div>
              </div>
              
              {/* Image Preview */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Preview
                </label>
                <div className="w-full aspect-[16/9] sm:aspect-[3/2] bg-gray-100 dark:bg-gray-900/50 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center relative">
                  {formData.image ? (
                    <CelebrityImage
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <FaImage className="text-4xl mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Image preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  {isEditing ? (
                    <><FaEdit /> Update Celebrity</>
                  ) : (
                    <><FaPlus /> Add Celebrity</>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCelebrities;