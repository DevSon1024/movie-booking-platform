import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSettingsAPI } from '../../services/settingsService';
import { setGlobalSettings } from '../../redux/slices/settingsSlice';
import toast from 'react-hot-toast';
import { FaSave, FaGlobe, FaMoneyBill } from 'react-icons/fa';

const AdminSettingsPage = () => {
  const dispatch = useDispatch();
  const { siteName, currencySymbol } = useSelector((state) => state.settings);
  
  const [formData, setFormData] = useState({
    siteName: '',
    currencySymbol: '',
    currencyCode: 'USD'
  });

  useEffect(() => {
    setFormData({
      siteName: siteName || '',
      currencySymbol: currencySymbol || '',
      currencyCode: 'USD'
    });
  }, [siteName, currencySymbol]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateSettingsAPI(formData);
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white flex items-center gap-3">
        <FaGlobe className="text-red-600" /> Global Settings
      </h1>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Website Name */}
            <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Website Name</label>
                <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-red-500">
                    <span className="pl-4 text-gray-500 dark:text-gray-400"><FaGlobe /></span>
                    <input 
                        type="text" 
                        name="siteName"
                        value={formData.siteName}
                        onChange={handleChange}
                        className="bg-transparent text-gray-900 dark:text-white p-3 w-full focus:outline-none"
                    />
                </div>
            </div>

            {/* Currency */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Currency Symbol</label>
                    <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-red-500">
                        <span className="pl-4 text-gray-500 dark:text-gray-400"><FaMoneyBill /></span>
                        <input 
                            type="text" 
                            name="currencySymbol"
                            value={formData.currencySymbol}
                            onChange={handleChange}
                            className="bg-transparent text-gray-900 dark:text-white p-3 w-full focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg w-full flex justify-center items-center gap-2 transition shadow-md"
            >
                <FaSave /> Save Changes
            </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage;