import { useState, useEffect, useMemo, useRef } from 'react';
import { FaPlus, FaTrash, FaEdit, FaMapMarkerAlt, FaVideo, FaSearch, FaList, FaTh } from 'react-icons/fa';
import { getTheatres, createTheatre, updateTheatre, deleteTheatre } from '../../services/theatreService';
import toast from 'react-hot-toast';
import TheatreForm from '../../components/admin/TheatreForm'; // New Component

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const searchInputRef = useRef(null);
  
  // View State
  const [viewMode, setViewMode] = useState(localStorage.getItem('adminTheatresView') || 'grid');

  useEffect(() => {
    const handleKeyDown = (e) => {
      // '?' is Shift + /
      if (e.key === '?' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('adminTheatresView', viewMode);
  }, [viewMode]);

  useEffect(() => { fetchTheatres(); }, []);

  const fetchTheatres = async () => {
    try {
      const data = await getTheatres();
      
      // Preserve original index for Sr. No. rendering
      const formattedData = data.map((item, index) => ({
           ...item,
           originalIndex: index + 1
      }));
      
      setTheatres(formattedData);
    } catch (error) { toast.error('Failed to load theatres'); }
  };

  const handleSave = async (data) => {
    try {
      const payload = { ...data, facilities: typeof data.facilities === 'string' ? data.facilities.split(',').map(f=>f.trim()).filter(f=>f) : data.facilities };
      if (editingTheatre) {
        await updateTheatre(editingTheatre._id, payload);
        toast.success('Theatre Updated');
      } else {
        await createTheatre(payload);
        toast.success('Theatre Created');
      }
      setIsModalOpen(false);
      fetchTheatres();
    } catch (e) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete theatre?')) {
      await deleteTheatre(id);
      toast.success('Deleted');
      fetchTheatres();
    }
  };

  const filteredTheatres = useMemo(() => {
    if (!searchQuery) return theatres;
    return theatres.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [theatres, searchQuery]);

  return (
    <div className="p-2 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Theatres Management</h1>
          <p className="text-gray-500">Manage theatre locations and screens</p>
        </div>
        <div className="flex items-center gap-4">
             {/* View Toggle */}
             <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="List View"
                 >
                    <FaList />
                 </button>
                 <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    title="Grid View"
                 >
                    <FaTh />
                 </button>
             </div>
             <button onClick={() => { setEditingTheatre(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center font-semibold">
               <FaPlus className="mr-2" /> Add Theatre
             </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute top-3.5 right-4 pointer-events-none">
           <kbd className="hidden sm:inline-block bg-gray-100 dark:bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-mono shadow-sm">Shift + /</kbd>
        </div>
        <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="Search theatres by name or city..." 
          className="w-full bg-white dark:bg-gray-800 pl-12 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
      </div>

      {viewMode === 'list' ? (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-100 dark:border-gray-700">
         <div className="overflow-x-auto">
           <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase font-semibold">
                 <tr>
                   <th className="p-4 w-16 text-center">Sr.</th>
                   <th className="p-4">Theatre Name</th>
                   <th className="p-4">City</th>
                   <th className="p-4">Screens</th>
                   <th className="p-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                 {filteredTheatres.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                       <td className="p-4 text-center text-gray-500 dark:text-gray-400 font-medium">
                          {t.originalIndex}
                       </td>
                       <td className="p-4">
                          <div className="font-bold text-gray-900 dark:text-white">{t.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={t.address}>{t.address}</div>
                       </td>
                       <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                          {t.city}
                       </td>
                       <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                              <FaVideo className="text-blue-500" /> {t.screens.length} Screens
                          </span>
                       </td>
                       <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                              <button onClick={() => { setEditingTheatre(t); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 transition" title="Edit">
                                 <FaEdit size={16} />
                              </button>
                              <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:text-red-700 transition" title="Delete">
                                 <FaTrash size={16} />
                              </button>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {filteredTheatres.length === 0 && (
                    <tr>
                       <td colSpan="5" className="p-8 text-center text-gray-500">No theatres found.</td>
                    </tr>
                 )}
              </tbody>
           </table>
         </div>
      </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTheatres.map(t => (
          <div key={t._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 relative hover:translate-y-[-2px] transition-all flex flex-col">
             <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex-1 pr-2">{t.name}</h3>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded outline outline-1 outline-gray-200 dark:outline-gray-600">
                   #{t.originalIndex}
                </div>
             </div>
             
             <p className="text-sm text-gray-500 mb-4 flex items-center gap-1"><FaMapMarkerAlt className="text-red-500 shrink-0"/> {t.city}, {t.address}</p>
             
             <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex-1">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Screens</p>
               {t.screens.map((s,i) => (
                 <div key={i} className="flex justify-between text-sm dark:text-gray-300 border-b last:border-0 border-gray-200 dark:border-gray-600 pb-1 last:pb-0">
                    <span>{s.name}</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 rounded-full">{s.type}</span>
                 </div>
               ))}
             </div>
             
             <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => { setEditingTheatre(t); setIsModalOpen(true); }} className="flex-1 flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 py-2 rounded-lg font-semibold text-sm transition">
                    <FaEdit /> Edit
                </button>
                <button onClick={() => handleDelete(t._id)} className="flex-1 flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 py-2 rounded-lg font-semibold text-sm transition">
                    <FaTrash /> Delete
                </button>
             </div>
          </div>
        ))}
        {filteredTheatres.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
            No theatres found matching your search.
          </div>
        )}
      </div>
      )}

      {isModalOpen && (
        <TheatreForm 
          isEditing={!!editingTheatre}
          initialData={editingTheatre}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
};
export default AdminTheatresPage;