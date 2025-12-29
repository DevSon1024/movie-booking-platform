import { useEffect, useState, useMemo } from 'react';
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
      
      {/* --- HERO SECTION (CAROUSEL) - UPDATED --- */}
      {featuredMovies.length > 0 && (
        <div className="relative w-full h-[450px] md:h-[500px] overflow-hidden group bg-gray-900">
           
           {/* Background Image (Blurred & Darkened) */}
           <div 
             className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out opacity-40 blur-sm transform scale-105"
             style={{ backgroundImage: `url(${featuredMovies[currentSlide].posterUrl})` }}
           ></div>
           
           {/* Heavy Gradient Overlay for Readability */}
           <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

           {/* Content Container */}
           <div className="absolute inset-0 container mx-auto px-4 flex items-center justify-between z-10">
              
              {/* Left Side: Text Info */}
              <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-start animate-fade-in-up pl-4 md:pl-8">
                  <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide mb-4 shadow-lg">
                     Trending #1
                  </span>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-xl leading-tight">
                     {featuredMovies[currentSlide].title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center text-gray-300 text-sm mb-6 gap-3 md:gap-4">
                     <span className="bg-white/10 px-2 py-1 rounded backdrop-blur-sm border border-white/10">{featuredMovies[currentSlide].genre}</span>
                     <span className="hidden md:inline">•</span>
                     <span className="flex items-center gap-1"><FaClock className="text-xs" /> {featuredMovies[currentSlide].duration} mins</span>
                     <span className="hidden md:inline">•</span>
                     <span className="flex items-center gap-1"><FaGlobe className="text-xs" /> {featuredMovies[currentSlide].language}</span>
                  </div>

                  <p className="text-gray-400 text-sm mb-8 line-clamp-2 md:line-clamp-3 max-w-lg hidden sm:block">
                     {featuredMovies[currentSlide].description}
                  </p>

                  <div className="flex gap-4">
                    <Link 
                        to={`/movie/${featuredMovies[currentSlide]._id}`}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-sm font-bold flex items-center transition-all shadow-lg hover:scale-105 hover:shadow-red-600/40"
                    >
                        <FaTicketAlt className="mr-2" /> Book Now
                    </Link>
                    <button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-full text-sm font-bold flex items-center transition backdrop-blur-md">
                        <FaPlay className="mr-2 text-xs" /> Watch Trailer
                    </button>
                  </div>
              </div>

              {/* Right Side: Proper Poster Image (Hidden on Mobile) */}
              <div className="hidden md:flex w-1/2 justify-center items-center pr-8 relative">
                  <div className="relative w-[280px] h-[400px] lg:w-[320px] lg:h-[450px] perspective-1000 group-hover:perspective-none transition-all duration-500">
                      <img 
                        src={featuredMovies[currentSlide].posterUrl} 
                        alt={featuredMovies[currentSlide].title} 
                        className="w-full h-full object-cover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-3 group-hover:rotate-0 transition-all duration-700 ease-out border-4 border-white/5 ring-1 ring-white/10"
                      />
                      {/* Reflection Effect */}
                      <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/20 blur-xl rounded-[100%]"></div>
                  </div>
              </div>

           </div>

           {/* Slide Indicators */}
           <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
              {featuredMovies.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-red-600 w-8' : 'bg-gray-600 w-2 hover:bg-gray-400'}`}
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
                 className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm transition-all duration-200 transform hover:scale-110 ${recStartIndex === 0 ? 'opacity-0 cursor-default hidden' : 'opacity-100 text-gray-800 dark:text-white'}`}
               >
                 <FaChevronLeft />
               </button>

               {/* Carousel Window */}
               <div className="overflow-hidden -mx-2 py-4"> 
                 <div 
                   className="flex transition-transform duration-500 ease-out"
                   style={{ transform: `translateX(-${recStartIndex * (100 / (window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 4 : 5))}%)` }}
                 >
                   {recommendedMovies.map((movie) => (
                      <div key={movie._id} className="min-w-[50%] md:min-w-[25%] lg:min-w-[20%] px-2">
                          <Link to={`/movie/${movie._id}`} className="block relative rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300">
                              <div className="aspect-[2/3] overflow-hidden rounded-t-lg">
                                <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                      <FaPlay className="text-white text-sm ml-0.5" />
                                    </div>
                                </div>
                              </div>
                              <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                <h4 className="text-sm font-bold truncate text-gray-800 dark:text-gray-100 group-hover:text-red-600 transition">{movie.title}</h4>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[70%]">{movie.genre}</p>
                                    <div className="flex items-center text-[10px] text-yellow-500 font-bold">
                                        <FaStar className="mr-0.5" /> {(Math.random() * 2 + 3).toFixed(1)}
                                    </div>
                                </div>
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
                 className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm transition-all duration-200 transform hover:scale-110 ${recStartIndex + itemsPerSlide >= recommendedMovies.length ? 'opacity-0 cursor-default hidden' : 'opacity-100 text-gray-800 dark:text-white'}`}
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
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
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

// Add FaGlobe, FaClock to imports if not present
import { FaGlobe, FaClock } from 'react-icons/fa';

export default HomePage;