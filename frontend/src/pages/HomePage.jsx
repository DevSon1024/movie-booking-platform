import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaTicketAlt, FaStar, FaCalendarAlt, FaPlay, FaChevronRight } from 'react-icons/fa';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('RUNNING'); // Default to Now Showing

  useEffect(() => {
    const fetchMovies = async () => {
      try {
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

  const filteredMovies = movies.filter(movie => {
      if(filter === 'ALL') return true;
      return movie.status === filter;
  });

  // Get top 3 latest movies for Hero Slider
  const featuredMovies = movies.slice(0, 3);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide Hero
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % (featuredMovies.length || 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredMovies]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
       <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
          <p>Loading Latest Movies...</p>
       </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-white transition-colors duration-300">
      
      {/* --- HERO SECTION (CAROUSEL) --- */}
      {featuredMovies.length > 0 && (
        <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden group">
           {/* Background Image with Gradient Overlay */}
           <div 
             className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform scale-105"
             style={{ backgroundImage: `url(${featuredMovies[currentSlide].posterUrl})` }}
           >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent"></div>
           </div>

           {/* Content */}
           <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 z-10 flex flex-col items-start animate-fade-in-up">
              <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide mb-3">
                 Trending Now
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
                 {featuredMovies[currentSlide].title}
              </h1>
              <div className="flex items-center text-gray-300 text-sm md:text-base mb-6 space-x-4">
                 <span>{featuredMovies[currentSlide].genre}</span>
                 <span>•</span>
                 <span>{featuredMovies[currentSlide].duration} mins</span>
                 <span>•</span>
                 <span>{featuredMovies[currentSlide].language}</span>
              </div>
              <Link 
                to={`/movie/${featuredMovies[currentSlide]._id}`}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold flex items-center transition shadow-lg hover:scale-105"
              >
                 <FaTicketAlt className="mr-2" /> Book Tickets
              </Link>
           </div>

           {/* Slide Indicators */}
           <div className="absolute bottom-6 right-6 flex gap-2 z-20">
              {featuredMovies.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-red-600 w-8' : 'bg-white/50 hover:bg-white'}`}
                  />
              ))}
           </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 py-12">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
           <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Movies</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Discover what's playing in theatres near you</p>
           </div>
           
           {/* Modern Pill Filters */}
           <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 inline-flex">
              {['RUNNING', 'UPCOMING', 'ALL'].map((status) => (
                  <button 
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                        filter === status 
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                      {status === 'RUNNING' ? 'Now Showing' : status === 'UPCOMING' ? 'Coming Soon' : 'All'}
                  </button>
              ))}
           </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <Link 
              to={`/movie/${movie._id}`} 
              key={movie._id} 
              className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col h-full"
            >
              {/* Poster Image with Zoom Effect */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500 ease-in-out"
                />
                
                {/* Language Tag */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider">
                    {movie.language}
                </div>

                {/* Hover Overlay Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition duration-300 flex items-center gap-2">
                      Book <FaChevronRight className="text-xs" />
                   </span>
                </div>
              </div>
              
              {/* Card Details */}
              <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{movie.genre}</p>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                       <FaCalendarAlt className="mr-1.5" />
                       {new Date(movie.releaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center text-yellow-500 text-xs font-bold">
                       <FaStar className="mr-1" />
                       {/* Mock Rating */}
                       {(Math.random() * (5 - 3) + 3).toFixed(1)}
                    </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredMovies.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                   <FaPlay className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Movies Found</h3>
                <p className="text-gray-500 dark:text-gray-400">There are no movies in this category right now.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;