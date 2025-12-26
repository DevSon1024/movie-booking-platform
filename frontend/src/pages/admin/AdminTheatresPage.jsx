import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaMapMarkerAlt, FaVideo } from 'react-icons/fa';
import { getTheatres, createTheatre, updateTheatre, deleteTheatre } from '../../services/theatreService';
import toast from 'react-hot-toast';

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Initial Form State
  const initialFormState = {
    name: '',
    city: '',
    address: '',
    facilities: '', // Comma separated string for input
    screens: [
      { name: 'Screen 1', type: 'Standard', seatLayout: { rows: 10, cols: 10 } }
    ]
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchTheatres();
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

  // --- Form Handlers ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Screen Changes (Nested Array)
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

  // --- Submit Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert facilities string to array
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
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Theatres</h1>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
        >
          {showForm ? 'Close' : <><FaPlus className="mr-2" /> Add Theatre</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700 animate-fade-in">
          <h2 className="text-xl font-bold mb-4 text-blue-400">{isEditing ? 'Edit Theatre' : 'Add New Theatre'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" placeholder="Theatre Name" value={formData.name} onChange={handleChange} className="bg-gray-700 p-3 rounded text-white" required />
              <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className="bg-gray-700 p-3 rounded text-white" required />
              <input name="address" placeholder="Full Address" value={formData.address} onChange={handleChange} className="bg-gray-700 p-3 rounded text-white md:col-span-2" required />
              <input name="facilities" placeholder="Facilities (e.g., Parking, Dolby Atmos) - Comma separated" value={formData.facilities} onChange={handleChange} className="bg-gray-700 p-3 rounded text-white md:col-span-2" />
            </div>

            {/* Screens Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-400">Screens Configuration</label>
                <button type="button" onClick={addScreen} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">+ Add Screen</button>
              </div>
              
              <div className="space-y-3">
                {formData.screens.map((screen, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 bg-gray-700/50 p-3 rounded border border-gray-600">
                    <input 
                      placeholder="Screen Name" 
                      value={screen.name} 
                      onChange={(e) => handleScreenChange(index, 'name', e.target.value)}
                      className="bg-gray-700 p-2 rounded text-white flex-1"
                      required
                    />
                    <select 
                      value={screen.type}
                      onChange={(e) => handleScreenChange(index, 'type', e.target.value)}
                      className="bg-gray-700 p-2 rounded text-white w-32"
                    >
                      <option value="Standard">Standard</option>
                      <option value="IMAX">IMAX</option>
                      <option value="3D">3D</option>
                      <option value="4DX">4DX</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Rows:</span>
                      <input 
                        type="number" 
                        value={screen.seatLayout.rows}
                        onChange={(e) => handleScreenChange(index, 'rows', e.target.value)}
                        className="bg-gray-700 p-2 rounded text-white w-16"
                        required
                        min="1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Cols:</span>
                      <input 
                        type="number" 
                        value={screen.seatLayout.cols}
                        onChange={(e) => handleScreenChange(index, 'cols', e.target.value)}
                        className="bg-gray-700 p-2 rounded text-white w-16"
                        required
                        min="1"
                      />
                    </div>
                    <button type="button" onClick={() => removeScreen(index)} className="text-red-400 hover:text-red-300 px-2"><FaTrash /></button>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="bg-green-600 hover:bg-green-700 w-full py-3 rounded font-bold">
              {isEditing ? 'Update Theatre' : 'Save Theatre'}
            </button>
          </form>
        </div>
      )}

      {/* Theatre List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theatres.map(theatre => (
          <div key={theatre._id} className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-red-500">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold">{theatre.name}</h3>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(theatre)} className="text-blue-400 hover:text-blue-300"><FaEdit /></button>
                <button onClick={() => handleDelete(theatre._id)} className="text-red-400 hover:text-red-300"><FaTrash /></button>
              </div>
            </div>
            <p className="text-gray-400 flex items-center text-sm mb-4"><FaMapMarkerAlt className="mr-2"/> {theatre.city} - {theatre.address}</p>
            
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-300">Screens:</p>
              {theatre.screens.map((s, i) => (
                <div key={i} className="text-xs text-gray-400 flex justify-between">
                   <span>{s.name} ({s.type})</span>
                   <span>{s.capacity} Seats</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-700 flex flex-wrap gap-2">
               {theatre.facilities.map((f, i) => (
                 <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">{f}</span>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTheatresPage;