import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { getShows } from '../services/showService';
import { FaClock, FaMapMarkerAlt, FaVideo, FaArrowLeft, FaCalendarAlt, FaLanguage, FaFilm, FaTheaterMasks } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MoviePage = () => {
  const { id } = useParams();
  const { currencySymbol } = useSelector((state) => state.settings);
  
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const movieRes = await api.get(`/movies/${id}`);
      setMovie(movieRes.data);
      const showsData = await getShows({ movieId: id });
      const futureShows = showsData.filter(s => new Date(s.startTime) > new Date());
      setShows(futureShows);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const cities = [...new Set(shows.map(show => show.theatre?.city).filter(Boolean))];

  const getFilteredTheatres = () => {
     if (!selectedCity) return [];
     const filtered = shows.filter(show => show.theatre?.city === selectedCity);
     
     const theatreMap = {};
     filtered.forEach(show => {
         const tId = show.theatre._id;
         if (!theatreMap[tId]) {
             theatreMap[tId] = { ...show.theatre, shows: [] };
         }
         theatreMap[tId].shows.push(show);
     });
     return Object.values(theatreMap);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-center animate-pulse">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
          Loading Movie Details...
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-red-600 dark:text-red-400 mb-4">Movie Not Found</h2>
          <Link
            to="/"
            className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const theatreList = getFilteredTheatres();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pb-20">
      
      {/* Hero Section */}
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
         {/* Background Image with Overlay */}
         <div className="absolute inset-0">
            <img 
              src={movie.posterUrl} 
              className="w-full h-full object-cover" 
              alt="backdrop" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-gray-50/95 dark:via-gray-900/95 to-gray-50/80 dark:to-gray-900/80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-50 dark:from-gray-900 via-transparent to-gray-50 dark:to-gray-900"></div>
         </div>
         
         {/* Content */}
         <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 h-full">
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img 
                 src={movie.posterUrl} 
                 alt={movie.title} 
                 className="w-48 md:w-64 rounded-xl shadow-2xl border-4 border-white dark:border-gray-800" 
              />
            </div>

            {/* Movie Info */}
            <div className="text-gray-900 dark:text-white text-center md:text-left flex-1">
                <Link 
                  to="/" 
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white inline-flex items-center mb-4 text-sm transition-colors"
                >
                  <FaArrowLeft className="mr-2"/> Back to Movies
                </Link>
                
                <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                  {movie.title}
                </h1>
                
                {/* Info Pills */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-5">
                    <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 shadow-sm">
                      <FaLanguage className="text-blue-500" /> {movie.language}
                    </span>
                    <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 shadow-sm">
                      <FaFilm className="text-purple-500" /> {movie.genre}
                    </span>
                    <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 shadow-sm">
                      <FaClock className="text-red-500" /> {movie.duration}m
                    </span>
                    <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium flex items-center gap-2 shadow-sm">
                      <FaCalendarAlt className="text-green-500" /> {new Date(movie.releaseDate).getFullYear()}
                    </span>
                </div>

                {/* Description - Desktop */}
                <p className="text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed hidden md:block text-base">
                  {movie.description}
                </p>
            </div>
         </div>
      </div>
      
      {/* Description - Mobile */}
      <div className="container mx-auto px-4 md:hidden mb-8">
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed text-center">
            {movie.description}
          </p>
      </div>

      {/* Booking Section */}
      <div className="container mx-auto px-4">
         <div className="flex items-center gap-3 mb-6">
            <FaTheaterMasks className="text-red-600 dark:text-red-400 text-2xl" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Book Tickets
            </h2>
         </div>
         
         {cities.length === 0 ? (
             <div className="bg-white dark:bg-gray-800 p-12 rounded-xl text-center border border-gray-200 dark:border-gray-700">
                 <div className="mb-4">
                   <FaCalendarAlt className="text-5xl text-gray-400 dark:text-gray-600 mx-auto" />
                 </div>
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                   No Shows Scheduled
                 </h3>
                 <p className="text-gray-600 dark:text-gray-400">
                   Showtimes for this movie will be available soon.
                 </p>
             </div>
         ) : (
             <>
                {/* City Selection */}
                <div className="mb-8">
                    <label className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-3 block">
                      Select Your City
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                       {cities.map(city => (
                           <button 
                             key={city}
                             onClick={() => setSelectedCity(city)}
                             className={`px-6 py-3 rounded-lg whitespace-nowrap transition-all font-medium border-2 ${
                               selectedCity === city 
                                 ? 'bg-red-600 dark:bg-red-500 border-red-600 dark:border-red-500 text-white shadow-lg scale-105' 
                                 : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-gray-700'
                             }`}
                           >
                              <FaMapMarkerAlt className="inline mr-2"/> {city}
                           </button>
                       ))}
                    </div>
                </div>

                {/* Theatre List */}
                {selectedCity ? (
                    <div className="space-y-6 animate-fade-in">
                        {theatreList.map(theatre => (
                            <div 
                              key={theatre._id} 
                              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                            >
                                {/* Theatre Header */}
                                <div className="flex flex-col lg:flex-row justify-between mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
                                    <div className="mb-3 lg:mb-0">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                                           <FaVideo className="text-red-500" /> {theatre.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                          <FaMapMarkerAlt className="text-gray-400" />
                                          {theatre.address}
                                        </p>
                                    </div>
                                    
                                    {/* Facilities */}
                                    <div className="flex flex-wrap gap-2">
                                        {theatre.facilities?.map((f, i) => (
                                            <span 
                                              key={i} 
                                              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600"
                                            >
                                              {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Showtimes */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {theatre.shows.map(show => (
                                        <Link 
                                           key={show._id} 
                                           to={`/booking/${show._id}`}
                                           className="group bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900 border-2 border-gray-200 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 rounded-lg p-4 transition-all hover:shadow-md flex flex-col items-center justify-center text-center"
                                        >
                                            <span className="text-base font-bold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 mb-1">
                                                {new Date(show.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                {show.screenName}
                                            </span>
                                            <span className="text-sm text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 font-bold">
                                                {currencySymbol}{show.price}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-xl border-2 border-dashed border-blue-200 dark:border-gray-600">
                        <p className="text-gray-700 dark:text-gray-300 text-center font-medium">
                          👆 Select a city above to view theatres and showtimes
                        </p>
                    </div>
                )}
             </>
         )}
      </div>
    </div>
  );
};

export default MoviePage;