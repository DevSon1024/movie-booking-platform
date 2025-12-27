import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettingsAPI } from '../../services/settingsService';
import { getSettings, setGlobalSettings } from '../../redux/slices/settingsSlice';
import toast from 'react-hot-toast';
import { FaSave, FaGlobe, FaMoneyBill } from 'react-icons/fa';

const AdminSettingsPage = () => {
  const dispatch = useDispatch();
  // Read current global state
  const { siteName, currencySymbol } = useSelector((state) => state.settings);
  
  const [formData, setFormData] = useState({
    siteName: '',
    currencySymbol: '',
    currencyCode: 'USD'
  });

  // Sync local form state with Redux state on load
  useEffect(() => {
    setFormData({
      siteName: siteName,
      currencySymbol: currencySymbol,
      currencyCode: 'USD'
    });
  }, [siteName, currencySymbol]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateSettingsAPI(formData);
      
      // Update Redux Store immediately
      dispatch(setGlobalSettings({
          siteName: updated.siteName,
          currencySymbol: updated.currencySymbol
      }));
      
      toast.success('Settings Saved Successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <FaGlobe className="text-blue-500" /> Global Settings
      </h1>
      
      <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Website Name */}
            <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">Website Name</label>
                <div className="flex items-center bg-gray-700 rounded overflow-hidden">
                    <span className="pl-4 text-gray-400"><FaGlobe /></span>
                    <input 
                        type="text" 
                        name="siteName"
                        value={formData.siteName}
                        onChange={handleChange}
                        className="bg-transparent text-white p-3 w-full focus:outline-none"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">This will be visible in the navigation bar.</p>
            </div>

            {/* Currency Configuration */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2">Currency Symbol</label>
                    <div className="flex items-center bg-gray-700 rounded overflow-hidden">
                        <span className="pl-4 text-gray-400"><FaMoneyBill /></span>
                        <input 
                            type="text" 
                            name="currencySymbol"
                            placeholder="$"
                            value={formData.currencySymbol}
                            onChange={handleChange}
                            className="bg-transparent text-white p-3 w-full focus:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-400 text-sm font-bold mb-2">Currency Code</label>
                    <input 
                        type="text" 
                        name="currencyCode"
                        value={formData.currencyCode}
                        onChange={handleChange}
                        className="bg-gray-700 text-white p-3 rounded w-full focus:outline-none"
                        placeholder="USD"
                    />
                </div>
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded w-full flex justify-center items-center gap-2 transition"
                >
                    <FaSave /> Save Changes
                </button>
            </div>

        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;