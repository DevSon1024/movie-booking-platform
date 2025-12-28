import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrash, FaEdit, FaMapMarkerAlt, FaVideo } from 'react-icons/fa';
import { getTheatres, createTheatre, updateTheatre, deleteTheatre } from '../../services/theatreService';
import toast from 'react-hot-toast';
import citiesData from '../../data/cities.json';

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // City Autocomplete State
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Initial Form State
  const initialFormState = {
    name: '',
    city: '',
    address: '',
    facilities: '',
    screens: [
      { name: 'Screen 1', type: 'Standard', seatLayout: { rows: 10, cols: 10 } }
    ]
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchTheatres();
    
    // Click outside to close suggestions
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTheatres = async () => {
    try {
      const data = await getTheatres();
      setTheatres(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load theatres');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Handle City Autocomplete
    if (name === 'city') {
      if (value.length > 1) {
        const filtered = citiesData.filter(item => 
          item.city.toLowerCase().startsWith(value.toLowerCase())
        ).slice(0, 10); // Limit to 10 suggestions
        setCitySuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const selectCity = (city, state) => {
    setFormData({ ...formData, city: city }); // You can also append state if needed: `${city}, ${state}`
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const handleScreenChange = (index, field, value) => {
    const newScreens = [...formData.screens];
    if (field === 'rows' || field === 'cols') {
      newScreens[index].seatLayout[field] = parseInt(value) || 0;
    } else {
      newScreens[index][field] = value;
    }
    setFormData({ ...formData, screens: newScreens });
  };

  const addScreen = () => {
    setFormData({
      ...formData,
      screens: [...formData.screens, { name: `Screen ${formData.screens.length + 1}`, type: 'Standard', seatLayout: { rows: 10, cols: 10 } }]
    });
  };

  const removeScreen = (index) => {
    if (formData.screens.length > 1) {
      const newScreens = formData.screens.filter((_, i) => i !== index);
      setFormData({ ...formData, screens: newScreens });
    } else {
      toast.error('At least one screen is required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        facilities: formData.facilities.split(',').map(f => f.trim()).filter(f => f !== '')
      };

      if (isEditing) {
        await updateTheatre(editId, payload);
        toast.success('Theatre Updated');
      } else {
        await createTheatre(payload);
        toast.success('Theatre Created');
      }
      resetForm();
      fetchTheatres();
    } catch (error) {
      console.error(error);
      toast.error('Operation failed');
    }
  };

  const handleEdit = (theatre) => {
    setFormData({
      name: theatre.name,
      city: theatre.city,
      address: theatre.address,
      facilities: theatre.facilities.join(', '),
      screens: theatre.screens
    });
    setEditId(theatre._id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this theatre? This will affect historical bookings.')) {
      try {
        await deleteTheatre(id);
        toast.success('Theatre deleted');
        fetchTheatres();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
    setCitySuggestions([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 dark:text-gray-500">Loading theatres...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Theatres
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add, edit, and manage theatre locations
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {showForm ? (
            <span>Close Form</span>
          ) : (
            <>
              <FaPlus className="text-sm" />
              <span>Add Theatre</span>
            </>
          )}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl mb-8 border border-gray-200 dark:border-gray-700 shadow-lg animate-fade-in">
          <h2 className="text-xl font-bold mb-6 text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <FaVideo className="text-lg" />
            {isEditing ? 'Edit Theatre' : 'Add New Theatre'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                  Theatre Name *
                </label>
                <input 
                  name="name" 
                  placeholder="e.g., Cineplex Downtown" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all" 
                  required 
                />
              </div>
              
              <div className="space-y-2 relative" ref={suggestionsRef}>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                  City *
                </label>
                <input 
                  name="city" 
                  placeholder="Start typing city..." 
                  value={formData.city} 
                  onChange={handleChange} 
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all" 
                  required 
                  autoComplete="off"
                />
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && citySuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {citySuggestions.map((item, index) => (
                      <li 
                        key={`${item.city}-${index}`}
                        onClick={() => selectCity(item.city, item.state)}
                        className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-600 last:border-0 flex justify-between"
                      >
                        <span className="font-medium">{item.city}</span>
                        <span className="text-xs text-gray-400 flex items-center">{item.state}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                  Full Address *
                </label>
                <input 
                  name="address" 
                  placeholder="e.g., 123 Main Street, Downtown" 
                  value={formData.address} 
                  onChange={handleChange} 
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all" 
                  required 
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                  Facilities
                </label>
                <input 
                  name="facilities" 
                  placeholder="Parking, Dolby Atmos, Cafe (comma separated)" 
                  value={formData.facilities} 
                  onChange={handleChange} 
                  className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-3 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none transition-all" 
                />
              </div>
            </div>

            {/* Screens Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Screens Configuration *
                </label>
                <button 
                  type="button" 
                  onClick={addScreen} 
                  className="text-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                >
                  <FaPlus className="text-xs" /> Add Screen
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.screens.map((screen, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col md:flex-row gap-3 bg-white dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    <div className="flex-1 space-y-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400">Screen Name</label>
                      <input 
                        placeholder="Screen Name" 
                        value={screen.name} 
                        onChange={(e) => handleScreenChange(index, 'name', e.target.value)}
                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all text-sm"
                        required
                      />
                    </div>
                    
                    <div className="w-full md:w-36 space-y-2">
                      <label className="text-xs text-gray-600 dark:text-gray-400">Type</label>
                      <select 
                        value={screen.type}
                        onChange={(e) => handleScreenChange(index, 'type', e.target.value)}
                        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all text-sm"
                      >
                        <option value="Standard">Standard</option>
                        <option value="IMAX">IMAX</option>
                        <option value="3D">3D</option>
                        <option value="4DX">4DX</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end gap-3">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400">Rows</label>
                        <input 
                          type="number" 
                          value={screen.seatLayout.rows}
                          onChange={(e) => handleScreenChange(index, 'rows', e.target.value)}
                          className="w-20 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all text-sm"
                          required
                          min="1"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs text-gray-600 dark:text-gray-400">Cols</label>
                        <input 
                          type="number" 
                          value={screen.seatLayout.cols}
                          onChange={(e) => handleScreenChange(index, 'cols', e.target.value)}
                          className="w-20 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all text-sm"
                          required
                          min="1"
                        />
                      </div>
                      
                      <button 
                        type="button" 
                        onClick={() => removeScreen(index)} 
                        className="p-2.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Remove screen"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 w-full py-3 rounded-lg font-bold text-white transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isEditing ? 'Update Theatre' : 'Save Theatre'}
            </button>
          </form>
        </div>
      )}

      {/* Theatre Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theatres.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No theatres added yet. Click "Add Theatre" to create one.
          </div>
        ) : (
          theatres.map(theatre => (
            <div 
              key={theatre._id} 
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-red-500 dark:border-red-400 hover:shadow-xl transition-all duration-200"
            >
              {/* Theatre Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {theatre.name}
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(theatre)} 
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                    title="Edit theatre"
                  >
                    <FaEdit className="text-lg" />
                  </button>
                  <button 
                    onClick={() => handleDelete(theatre._id)} 
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Delete theatre"
                  >
                    <FaTrash className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Location */}
              <p className="text-gray-600 dark:text-gray-400 flex items-start gap-2 text-sm mb-4">
                <FaMapMarkerAlt className="mt-0.5 flex-shrink-0" /> 
                <span>{theatre.city} - {theatre.address}</span>
              </p>
              
              {/* Screens Info */}
              <div className="space-y-2 mb-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FaVideo className="text-gray-500 dark:text-gray-400" />
                  Screens ({theatre.screens.length})
                </p>
                <div className="space-y-1.5">
                  {theatre.screens.map((s, i) => (
                    <div 
                      key={i} 
                      className="text-xs bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg flex justify-between items-center"
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {s.name} <span className="text-gray-500 dark:text-gray-400">({s.type})</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {s.capacity} Seats
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              {theatre.facilities && theatre.facilities.length > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {theatre.facilities.map((f, i) => (
                      <span 
                        key={i} 
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTheatresPage;