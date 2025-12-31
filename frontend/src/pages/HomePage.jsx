import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaTicketAlt, FaStar, FaCalendarAlt, FaPlay, FaChevronRight, FaChevronLeft, FaGlobe, FaClock, FaFire } from 'react-icons/fa';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  
  // Carousel states
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [nowShowingIndex, setNowShowingIndex] = useState(0);

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

  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      if(filter === 'ALL') return true;
      return movie.status === filter;
    });
  }, [movies, filter]);

  // Logic for Hero Section (Top 3 Highest Rated or Most Reviews)
  const trendingMovies = useMemo(() => {
    return [...movies]
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 3);
  }, [movies]);

  // Logic for Now Showing Carousel
  const nowShowingMovies = useMemo(() => {
    return movies.filter(m => m.status === 'RUNNING');
  }, [movies]);

  const itemsPerSlide = 4;

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentHeroSlide((prev) => (prev + 1) % (trendingMovies.length || 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [trendingMovies]);

  const nextNowShowing = () => {
    if (nowShowingIndex + itemsPerSlide < nowShowingMovies.length) {
      setNowShowingIndex(nowShowingIndex + 1);
    }
  };

  const prevNowShowing = () => {
    if (nowShowingIndex > 0) {
      setNowShowingIndex(nowShowingIndex - 1);
    }
  };

  const getRatingDisplay = (rating) => {
    return rating > 0 ? (
      <span className="flex items-center gap-1">
        <FaStar className="text-yellow-400" /> {rating.toFixed(1)}/5
      </span>
    ) : (
      <span className="text-gray-400 italic text-xs">Rating not given yet</span>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
       <div className="animate-pulse flex flex-col items-center">
          <div className="w-14 h-14 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
          <p className="text-lg font-medium">Loading Movies...</p>
       </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-white transition-colors duration-300 font-sans">
      
      {/* --- HERO SECTION (TRENDING) --- */}
      {trendingMovies.length > 0 && (
        <div className="relative w-full h-[550px] overflow-hidden group bg-gray-900">
           <div 
             className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out opacity-30 blur-sm transform scale-105"
             style={{ backgroundImage: `url(${trendingMovies[currentHeroSlide].posterUrl})` }}
           ></div>
           
           <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-transparent"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

           <div className="absolute inset-0 container mx-auto px-6 flex items-center justify-between z-10">
              <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col items-start animate-fade-in-up pl-4 md:pl-8">
                  <span className="bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-1.5 rounded text-sm font-bold uppercase tracking-wide mb-6 shadow-xl flex items-center gap-2">
                     <FaFire /> Trending #{currentHeroSlide + 1}
                  </span>
                  <h1 className="text-4xl md:text-4xl font-extrabold text-white mb-6 drop-shadow-2xl leading-tight">
                     {trendingMovies[currentHeroSlide].title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center text-gray-300 text-base mb-8 gap-4 md:gap-6">
                     <span className="bg-white/10 px-3 py-1 rounded backdrop-blur-sm border border-white/10">{trendingMovies[currentHeroSlide].genre}</span>
                     <span className="flex items-center gap-2"><FaClock /> {trendingMovies[currentHeroSlide].duration} mins</span>
                     <span className="flex items-center gap-2"><FaGlobe /> {trendingMovies[currentHeroSlide].language}</span>
                  </div>

                  <p className="text-gray-300 text-md mb-8 line-clamp-3 max-w-xl hidden sm:block leading-relaxed">
                     {trendingMovies[currentHeroSlide].description}
                  </p>

                  <div className="flex gap-5">
                    <Link 
                        to={`/movie/${trendingMovies[currentHeroSlide]._id}`}
                        className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-full text-base font-bold flex items-center transition-all shadow-xl hover:scale-105"
                    >
                        <FaTicketAlt className="mr-2" /> Book Now
                    </Link>
                    <button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full text-base font-bold flex items-center transition backdrop-blur-md">
                        <FaPlay className="mr-2" /> Watch Trailer
                    </button>
                  </div>
              </div>

              <div className="hidden md:flex w-1/2 justify-center items-center pr-10 relative">
                  <div className="relative w-[340px] h-[500px] perspective-1000 group-hover:perspective-none transition-all duration-500">
                      <img 
                        src={trendingMovies[currentHeroSlide].posterUrl} 
                        alt={trendingMovies[currentHeroSlide].title} 
                        className="w-full h-full object-cover rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] transform rotate-2 group-hover:rotate-0 transition-all duration-700 ease-out border-4 border-white/5"
                      />
                  </div>
              </div>
           </div>

           <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
              {trendingMovies.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentHeroSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${currentHeroSlide === idx ? 'bg-red-600 w-10' : 'bg-gray-600 w-3 hover:bg-gray-400'}`}
                  />
              ))}
           </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12">

        {/* --- NOW SHOWING (CAROUSEL) --- */}
        {nowShowingMovies.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white border-l-4 border-red-600 pl-4">
                  Now Showing
                </h2>
                <div className="flex gap-2">
                    <button 
                        onClick={prevNowShowing}
                        disabled={nowShowingIndex === 0}
                        className={`p-3 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-gray-800 transition ${nowShowingIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <FaChevronLeft />
                    </button>
                    <button 
                        onClick={nextNowShowing}
                        disabled={nowShowingIndex + itemsPerSlide >= nowShowingMovies.length}
                        className={`p-3 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-gray-800 transition ${nowShowingIndex + itemsPerSlide >= nowShowingMovies.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <FaChevronRight />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden -mx-3 py-2">
                <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${nowShowingIndex * (100 / (window.innerWidth < 768 ? 1 : itemsPerSlide))}%)` }}
                >
                    {nowShowingMovies.map((movie) => (
                        <div key={movie._id} className="min-w-[100%] md:min-w-[50%] lg:min-w-[25%] px-3">
                            <Link to={`/movie/${movie._id}`} className="block group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full bg-white dark:bg-gray-800">
                                <div className="aspect-[2/3] overflow-hidden">
                                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center p-4">
                                        <span className="bg-red-600 text-white px-6 py-2 rounded-full font-bold mb-3 transform translate-y-4 group-hover:translate-y-0 transition duration-300">Book Now</span>
                                        <p className="text-white text-center text-sm line-clamp-3 px-2 transform translate-y-4 group-hover:translate-y-0 transition duration-300 delay-75">
                                            {movie.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-md font-bold text-gray-900 dark:text-white truncate mb-1">{movie.title}</h3>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400" >{movie.genre}</span>
                                        <div className="font-bold">
                                            {getRatingDisplay(movie.averageRating)}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
        
        {/* --- ALL MOVIES GRID --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
           <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Movies</h2>
              <p className="text-base text-gray-500 dark:text-gray-400 mt-1">Browse upcoming and running movies</p>
           </div>
           
           <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex">
              {['ALL', 'RUNNING', 'UPCOMING'].map((status) => (
                  <button 
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                        filter === status 
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                      {status === 'RUNNING' ? 'Now Showing' : status === 'UPCOMING' ? 'Coming Soon' : 'All Movies'}
                  </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <Link 
              to={`/movie/${movie._id}`} 
              key={movie._id} 
              className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col h-full"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out"
                />
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 text-xs font-bold rounded uppercase">
                    {movie.language}
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider font-semibold">{movie.genre}</p>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                       <FaCalendarAlt className="mr-2" />
                       {new Date(movie.releaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm font-bold">
                       {getRatingDisplay(movie.averageRating)}
                    </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredMovies.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full mb-6">
                   <FaPlay className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Movies Found</h3>
                <p className="text-base text-gray-500 dark:text-gray-400">Try changing your filter settings.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;