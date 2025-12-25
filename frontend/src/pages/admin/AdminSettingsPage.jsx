import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    currency: '$',
    siteName: 'MovieDeck',
    maintenanceMode: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('siteSettings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    toast.success('Settings Saved!');
    // In a real app, you would dispatch a Redux action to update the app globally
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-6">System Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 mb-2">Currency Symbol</label>
          <select 
            value={settings.currency} 
            onChange={(e) => setSettings({...settings, currency: e.target.value})}
            className="w-full bg-gray-700 p-3 rounded text-white"
          >
            <option value="$">USD ($)</option>
            <option value="₹">INR (₹)</option>
            <option value="€">EUR (€)</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-400 mb-2">Website Name</label>
          <input 
            value={settings.siteName} 
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            className="w-full bg-gray-700 p-3 rounded text-white" 
          />
        </div>

        <div className="flex items-center space-x-3 bg-gray-700 p-4 rounded">
          <input 
            type="checkbox" 
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
            className="w-5 h-5"
          />
          <span className="text-white">Enable Maintenance Mode (Stops all bookings)</span>
        </div>

        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded w-full">
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;