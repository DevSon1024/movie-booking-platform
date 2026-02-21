import { useState, useEffect, useMemo, useRef } from 'react';
import { FaPlus, FaTrash, FaEdit, FaMapMarkerAlt, FaFilm, FaSearch } from 'react-icons/fa';
import { getTheatres, createTheatre, updateTheatre, deleteTheatre } from '../../services/theatreService';
import toast from 'react-hot-toast';
import TheatreForm from '../../components/admin/TheatreForm'; // New Component

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const searchInputRef = useRef(null);

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

  useEffect(() => { fetchTheatres(); }, []);

  const fetchTheatres = async () => {
    try {
      const data = await getTheatres();
      setTheatres(data);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Theatres Management</h1>
          <p className="text-gray-500">Manage theatre locations and screens</p>
        </div>
        <button onClick={() => { setEditingTheatre(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md flex items-center font-semibold">
          <FaPlus className="mr-2" /> Add Theatre
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTheatres.map(t => (
          <div key={t._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 relative hover:translate-y-[-2px] transition-all">
             <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingTheatre(t); setIsModalOpen(true); }} className="text-gray-400 hover:text-blue-500"><FaEdit /></button>
                  <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-500"><FaTrash /></button>
                </div>
             </div>
             <p className="text-sm text-gray-500 mb-4 flex items-center gap-1"><FaMapMarkerAlt className="text-red-500"/> {t.city}, {t.address}</p>
             
             <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Screens</p>
               {t.screens.map((s,i) => (
                 <div key={i} className="flex justify-between text-sm dark:text-gray-300 border-b last:border-0 border-gray-200 dark:border-gray-600 pb-1 last:pb-0">
                    <span>{s.name}</span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 rounded-full">{s.type}</span>
                 </div>
               ))}
             </div>
          </div>
        ))}
        {filteredTheatres.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
            No theatres found matching your search.
          </div>
        )}
      </div>

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