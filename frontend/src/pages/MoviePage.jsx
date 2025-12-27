import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { getShows } from '../services/showService';
import { FaClock, FaMapMarkerAlt, FaVideo, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
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
      // Filter out past shows
      const futureShows = showsData.filter(s => new Date(s.startTime) > new Date());
      setShows(futureShows);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  // Get unique cities, safely checking if theatre exists
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

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
  if (!movie) return <div className="text-white text-center mt-20">Movie not found</div>;

  const theatreList = getFilteredTheatres();

  return (
    <div className="bg-gray-900 min-h-screen pb-20">
      
      {/* Hero Section */}
      <div className="relative w-full md:h-[450px]">
         <div className="absolute inset-0 bg-gray-900">
            <img src={movie.posterUrl} className="w-full h-full object-cover opacity-20 blur-sm" alt="backdrop" />
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
         
         <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 h-full">
            <img 
               src={movie.posterUrl} 
               alt={movie.title} 
               className="w-48 md:w-56 rounded-lg shadow-2xl border-4 border-gray-800" 
            />
            <div className="text-white text-center md:text-left flex-1">
                <Link to="/" className="text-gray-400 hover:text-white inline-flex items-center mb-4 text-sm"><FaArrowLeft className="mr-2"/> Back to Movies</Link>
                <h1 className="text-3xl md:text-5xl font-bold mb-3">{movie.title}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-300 mb-4">
                    <span className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">{movie.language}</span>
                    <span className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">{movie.genre}</span>
                    <span className="flex items-center gap-1"><FaClock className="text-red-500"/> {movie.duration}m</span>
                    <span className="flex items-center gap-1"><FaCalendarAlt className="text-blue-500"/> {new Date(movie.releaseDate).getFullYear()}</span>
                </div>
                <p className="text-gray-400 max-w-2xl leading-relaxed hidden md:block">{movie.description}</p>
            </div>
         </div>
      </div>
      
      {/* Description Mobile */}
      <div className="container mx-auto px-4 md:hidden text-gray-400 text-sm text-center mb-8">
          {movie.description}
      </div>

      {/* Booking Section */}
      <div className="container mx-auto px-4">
         <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-600 pl-4">Get Tickets</h2>
         
         {cities.length === 0 ? (
             <div className="bg-gray-800 p-8 rounded text-center text-gray-400">
                 No shows scheduled for this movie yet.
             </div>
         ) : (
             <>
                <div className="mb-8">
                    <label className="text-gray-400 text-sm mb-2 block">Select City</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                       {cities.map(city => (
                           <button 
                             key={city}
                             onClick={() => setSelectedCity(city)}
                             className={`px-4 py-2 rounded whitespace-nowrap transition border ${selectedCity === city ? 'bg-red-600 border-red-600 text-white' : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'}`}
                           >
                              <FaMapMarkerAlt className="inline mr-1"/> {city}
                           </button>
                       ))}
                    </div>
                </div>

                {selectedCity ? (
                    <div className="space-y-6 animate-fade-in">
                        {theatreList.map(theatre => (
                            <div key={theatre._id} className="bg-gray-800 rounded-lg p-5 md:p-6 shadow-lg border border-gray-700">
                                <div className="flex flex-col md:flex-row justify-between mb-4 border-b border-gray-700 pb-4">
                                    <div className="mb-2 md:mb-0">
                                        <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                                           <FaVideo className="text-red-500"/> {theatre.name}
                                        </h3>
                                        <p className="text-xs md:text-sm text-gray-400 md:ml-6 mt-1">{theatre.address}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 md:ml-6">
                                        {/* FIX: Added ?. check to prevent crash if facilities is missing */}
                                        {theatre.facilities?.map((f, i) => (
                                            <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded h-fit">{f}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {theatre.shows.map(show => (
                                        <Link 
                                           key={show._id} 
                                           to={`/booking/${show._id}`}
                                           className="flex-1 min-w-[100px] max-w-[140px] group flex flex-col items-center bg-gray-700 hover:bg-green-600 border border-gray-600 hover:border-green-500 rounded p-2 md:p-3 transition"
                                        >
                                            <span className="text-sm font-bold text-white group-hover:text-white">
                                                {new Date(show.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            <span className="text-[10px] text-gray-400 group-hover:text-green-100 uppercase mt-1">
                                                {show.screenName}
                                            </span>
                                            <span className="text-xs text-green-400 group-hover:text-white font-bold mt-1">
                                                {currencySymbol}{show.price}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 italic p-4 bg-gray-800 rounded border border-gray-700">
                        Select a city above to view theaters and showtimes.
                    </div>
                )}
             </>
         )}
      </div>
    </div>
  );
};

export default MoviePage;