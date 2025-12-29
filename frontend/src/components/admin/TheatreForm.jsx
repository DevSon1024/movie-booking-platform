import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPlus, FaTrash, FaVideo, FaSave } from 'react-icons/fa';
import citiesData from '../../data/cities.json';

const TheatreForm = ({ initialData, isEditing, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '', city: '', address: '', facilities: '',
    screens: [{ name: 'Screen 1', type: 'Standard', seatLayout: { rows: 10, cols: 10 } }]
  });
  
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        ...initialData,
        facilities: Array.isArray(initialData.facilities) ? initialData.facilities.join(', ') : initialData.facilities
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'city') {
      if (value.length > 1) {
        const filtered = citiesData.filter(c => c.city.toLowerCase().startsWith(value.toLowerCase())).slice(0,5);
        setCitySuggestions(filtered);
        setShowSuggestions(true);
      } else setShowSuggestions(false);
    }
  };

  const handleScreenChange = (index, field, value) => {
    const newScreens = [...formData.screens];
    if (field === 'rows' || field === 'cols') newScreens[index].seatLayout[field] = parseInt(value) || 0;
    else newScreens[index][field] = value;
    setFormData({ ...formData, screens: newScreens });
  };

  const addScreen = () => setFormData(p => ({ ...p, screens: [...p.screens, { name: `Screen ${p.screens.length+1}`, type: 'Standard', seatLayout: {rows:10,cols:10} }] }));
  
  const removeScreen = (i) => {
    if(formData.screens.length > 1) setFormData(p => ({...p, screens: p.screens.filter((_, idx) => idx !== i)}));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FaVideo className="text-blue-500"/> {isEditing ? 'Update Theatre' : 'Add Theatre'}
          </h2>
          <button onClick={onClose}><FaTimes className="text-gray-500 hover:text-red-500 text-xl"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="theatre-form" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            {/* Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              </div>
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-gray-500">City</label>
                <input name="city" value={formData.city} onChange={handleChange} className="w-full p-2.5 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" required autoComplete="off"/>
                {showSuggestions && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 shadow-lg rounded mt-1 border dark:border-gray-600">
                    {citySuggestions.map((c,i) => (
                      <li key={i} onClick={()=>{setFormData({...formData, city: c.city}); setShowSuggestions(false);}} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm dark:text-white">{c.city}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500">Address</label>
                <input name="address" value={formData.address} onChange={handleChange} className="w-full p-2.5 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500">Facilities (comma separated)</label>
                <input name="facilities" value={formData.facilities} onChange={handleChange} className="w-full p-2.5 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>

            {/* Screens */}
            <div className="border-t pt-4 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-700 dark:text-gray-300">Screens & Layout</h3>
                 <button type="button" onClick={addScreen} className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 font-bold flex items-center gap-1"><FaPlus/> Add Screen</button>
              </div>
              <div className="space-y-3">
                {formData.screens.map((screen, idx) => (
                   <div key={idx} className="flex flex-col md:flex-row gap-2 items-end bg-gray-50 dark:bg-gray-700/50 p-3 rounded border dark:border-gray-600">
                      <div className="flex-1 w-full"><label className="text-[10px] uppercase text-gray-500">Name</label><input value={screen.name} onChange={(e)=>handleScreenChange(idx,'name',e.target.value)} className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:text-white" /></div>
                      <div className="w-full md:w-32"><label className="text-[10px] uppercase text-gray-500">Type</label>
                        <select value={screen.type} onChange={(e)=>handleScreenChange(idx,'type',e.target.value)} className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:text-white">
                          <option>Standard</option><option>IMAX</option><option>3D</option>
                        </select>
                      </div>
                      <div className="w-20"><label className="text-[10px] uppercase text-gray-500">Rows</label><input type="number" value={screen.seatLayout.rows} onChange={(e)=>handleScreenChange(idx,'rows',e.target.value)} className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:text-white" /></div>
                      <div className="w-20"><label className="text-[10px] uppercase text-gray-500">Cols</label><input type="number" value={screen.seatLayout.cols} onChange={(e)=>handleScreenChange(idx,'cols',e.target.value)} className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:text-white" /></div>
                      <button type="button" onClick={()=>removeScreen(idx)} className="p-2.5 text-red-500 hover:bg-red-50 rounded"><FaTrash/></button>
                   </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
           <button onClick={onClose} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
           <button type="submit" form="theatre-form" className="px-5 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 flex items-center gap-2"><FaSave/> Save</button>
        </div>
      </div>
    </div>
  );
};
export default TheatreForm;