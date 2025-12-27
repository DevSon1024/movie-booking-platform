import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaTicketAlt, FaStar, FaCalendarAlt } from 'react-icons/fa';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, RUNNING, UPCOMING

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Public endpoint fetches active movies (RUNNING & UPCOMING)
        const { data } = await api.get('/movies');
        setMovies(data);
      } catch (error) {
        console.error("Failed to fetch movies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Filter Logic
  const filteredMovies = movies.filter(movie => {
      if(filter === 'ALL') return true;
      return movie.status === filter;
  });

  if (loading) return <div className="text-center text-white mt-20">Loading Movies...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Book Your Tickets <span className="text-red-600">Instantly</span>
        </h1>
        <p className="text-gray-400 text-lg">The easiest way to catch your favorite movies.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-4 mb-10">
          {['ALL', 'RUNNING', 'UPCOMING'].map((status) => (
              <button 
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-full font-bold transition ${
                    filter === status 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                  {status === 'ALL' ? 'All Movies' : status === 'RUNNING' ? 'Now Showing' : 'Coming Soon'}
              </button>
          ))}
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredMovies.map((movie) => (
          <Link to={`/movie/${movie._id}`} key={movie._id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition duration-300 group">
            <div className="relative aspect-[2/3]">
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-0 right-0 bg-black/60 text-white px-2 py-1 text-xs font-bold rounded-bl m-2 backdrop-blur-sm">
                  {movie.language}
              </div>
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-4">
                 <button className="bg-red-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition">
                    <FaTicketAlt /> Book Now
                 </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-xl font-bold text-white mb-1 truncate">{movie.title}</h3>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>{movie.genre}</span>
                <span className="flex items-center gap-1"><FaStar className="text-yellow-500"/> {movie.duration}m</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <FaCalendarAlt /> {new Date(movie.releaseDate).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredMovies.length === 0 && (
          <div className="text-center text-gray-500 mt-10">No movies found in this category.</div>
      )}
    </div>
  );
};

export default HomePage;