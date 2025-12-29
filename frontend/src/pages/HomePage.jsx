import { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaTicketAlt, FaStar, FaCalendarAlt, FaPlay, FaChevronRight, FaChevronLeft } from 'react-icons/fa';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('RUNNING'); // Default to Now Showing
  const [recStartIndex, setRecStartIndex] = useState(0);

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

  // Recommended Movies (Random Selection)
  const recommendedMovies = useMemo(() => {
    return [...movies].sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [movies]);

  const itemsPerSlide = 5;

  const nextRecSlide = () => {
    if (recStartIndex + itemsPerSlide < recommendedMovies.length) {
      setRecStartIndex(recStartIndex + 1);
    }
  };

  const prevRecSlide = () => {
    if (recStartIndex > 0) {
      setRecStartIndex(recStartIndex - 1);
    }
  };


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
          <p className="text-sm font-medium">Loading Latest Movies...</p>
       </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-white transition-colors duration-300">
      
      {/* --- HERO SECTION (CAROUSEL) - SMALLER LAYOUT --- */}
      {featuredMovies.length > 0 && (
        <div className="relative w-full h-[250px] md:h-[400px] overflow-hidden group">
           {/* Background Image with Gradient Overlay */}
           <div 
             className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform scale-105"
             style={{ backgroundImage: `url(${featuredMovies[currentSlide].posterUrl})` }}
           >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent"></div>
           </div>

           {/* Content */}
           <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 flex flex-col items-start animate-fade-in-up">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] md:text-xs font-bold uppercase tracking-wide mb-2">
                 Trending Now
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-1 drop-shadow-lg">
                 {featuredMovies[currentSlide].title}
              </h1>
              <div className="flex items-center text-gray-300 text-xs md:text-sm mb-4 space-x-3">
                 <span>{featuredMovies[currentSlide].genre}</span>
                 <span>•</span>
                 <span>{featuredMovies[currentSlide].duration} mins</span>
                 <span>•</span>
                 <span>{featuredMovies[currentSlide].language}</span>
              </div>
              <Link 
                to={`/movie/${featuredMovies[currentSlide]._id}`}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center transition shadow-lg hover:scale-105"
              >
                 <FaTicketAlt className="mr-2" /> Book Tickets
              </Link>
           </div>

           {/* Slide Indicators */}
           <div className="absolute bottom-4 right-6 flex gap-1.5 z-20">
              {featuredMovies.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-red-600 w-6' : 'bg-white/50 hover:bg-white'}`}
                  />
              ))}
           </div>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 py-8">

        {/* --- RECOMMENDED CAROUSEL --- */}
        {recommendedMovies.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="w-1 h-6 bg-red-600 rounded-full mr-3"></span>
              Recommended for You
            </h2>
            <div className="relative group/carousel">
               {/* Left Arrow */}
               <button 
                 onClick={prevRecSlide}
                 disabled={recStartIndex === 0}
                 className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg backdrop-blur-sm transition-all duration-200 ${recStartIndex === 0 ? 'opacity-0 cursor-default' : 'opacity-0 group-hover/carousel:opacity-100 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-white'}`}
               >
                 <FaChevronLeft />
               </button>

               {/* Carousel Window */}
               <div className="overflow-hidden -mx-2">
                 <div 
                   className="flex transition-transform duration-500 ease-out"
                   style={{ transform: `translateX(-${recStartIndex * (100 / (window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 4 : 5))}%)` }}
                 >
                   {recommendedMovies.map((movie) => (
                      <div key={movie._id} className="min-w-[50%] md:min-w-[25%] lg:min-w-[20%] px-2">
                          <Link to={`/movie/${movie._id}`} className="block relative rounded-lg overflow-hidden group">
                              <div className="aspect-[2/3] overflow-hidden rounded-lg">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300 flex items-center justify-center">
                                    <FaPlay className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition duration-300 text-3xl drop-shadow-lg" />
                                </div>
                              </div>
                              <div className="mt-2">
                                <h4 className="text-sm font-bold truncate text-gray-800 dark:text-gray-100 group-hover:text-red-600 transition">{movie.title}</h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{movie.genre}</p>
                              </div>
                          </Link>
                      </div>
                   ))}
                 </div>
               </div>

               {/* Right Arrow */}
               <button 
                 onClick={nextRecSlide}
                 disabled={recStartIndex + itemsPerSlide >= recommendedMovies.length}
                 className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg backdrop-blur-sm transition-all duration-200 ${recStartIndex + itemsPerSlide >= recommendedMovies.length ? 'opacity-0 cursor-default' : 'opacity-0 group-hover/carousel:opacity-100 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-white'}`}
               >
                 <FaChevronRight />
               </button>
            </div>
          </div>
        )}
        
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
           <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Movies</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Explore movies in theatres near you</p>
           </div>
           
           {/* Modern Pill Filters - Smaller */}
           <div className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 inline-flex">
              {['RUNNING', 'UPCOMING', 'ALL'].map((status) => (
                  <button 
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                        filter === status 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                      {status === 'RUNNING' ? 'Now Showing' : status === 'UPCOMING' ? 'Coming Soon' : 'All'}
                  </button>
              ))}
           </div>
        </div>

        {/* Movies Grid - Smaller Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMovies.map((movie) => (
            <Link 
              to={`/movie/${movie._id}`} 
              key={movie._id} 
              className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col h-full"
            >
              {/* Poster Image */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-in-out"
                />
                
                {/* Language Tag */}
                <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white px-1.5 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider">
                    {movie.language}
                </div>

                {/* Hover Overlay Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transform translate-y-2 group-hover:translate-y-0 transition duration-300 flex items-center gap-1.5">
                      Book <FaChevronRight className="text-[10px]" />
                   </span>
                </div>
              </div>
              
              {/* Card Details - Smaller Text */}
              <div className="p-3 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">{movie.genre}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-[10px]">
                       <FaCalendarAlt className="mr-1" />
                       {new Date(movie.releaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center text-yellow-500 text-[10px] font-bold">
                       <FaStar className="mr-1" />
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Movies Found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">There are no movies in this category right now.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;