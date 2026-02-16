import { useState, useEffect } from "react";
import { FaPlus, FaCalendarAlt } from "react-icons/fa";
import { getAdminMovies } from "../../services/movieService";
import { useSelector } from "react-redux";
import { getTheatres } from "../../services/theatreService";
import { createShow, getShows, updateShow, deleteShow } from "../../services/showService";
import toast from "react-hot-toast";
import ShowForm from "../../components/admin/ShowForm";

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const { currencySymbol } = useSelector((state) => state.settings);

  useEffect(() => {
    const loadData = async () => {
      const [m, t, s] = await Promise.all([getAdminMovies(), getTheatres(), getShows()]);
      setMovies(m); setTheatres(t); setShows(s);
    };
    loadData();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (editingShow) await updateShow(editingShow._id, formData);
      else await createShow(formData);
      toast.success(editingShow ? 'Updated' : 'Created');
      setIsModalOpen(false);
      const s = await getShows(); setShows(s);
    } catch (e) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if(confirm("Delete show?")) { await deleteShow(id); setShows(await getShows()); toast.success('Deleted'); }
  };

  return (
    <div className="p-2 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Showtimes Management</h1>
        <button onClick={() => { setEditingShow(null); setIsModalOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow font-semibold flex items-center">
          <FaPlus className="mr-2" /> Schedule Show
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs uppercase">
            <tr>
              <th className="p-4">Movie</th>
              <th className="p-4">Theatre</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {shows.map((show) => (
              <tr key={show._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="p-4 font-bold dark:text-white">{show.movie?.title}</td>
                <td className="p-4 dark:text-gray-300">{show.theatre?.name}<div className="text-xs text-gray-500">{show.screenName}</div></td>
                <td className="p-4 dark:text-gray-300">{new Date(show.startTime).toLocaleString()}</td>
                <td className="p-4 font-bold text-green-600">{currencySymbol}{show.price}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => { setEditingShow(show); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700 font-semibold text-sm">Edit</button>
                  <button onClick={() => handleDelete(show._id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ShowForm 
          isEditing={!!editingShow}
          initialData={editingShow}
          movies={movies}
          theatres={theatres}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
};
export default AdminShowsPage;