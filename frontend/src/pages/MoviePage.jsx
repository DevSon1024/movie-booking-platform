import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api'; // Direct API for movie details
import { getShows } from '../services/showService'; // Correct Service for shows
import { FaClock, FaMapMarkerAlt, FaVideo, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MoviePage = () => {
  const { id } = useParams();
  
  // Data State
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  
  // Selection State
  const [selectedCity, setSelectedCity] = useState('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. Fetch Movie Details
      const movieRes = await api.get(`/movies/${id}`);
      setMovie(movieRes.data);

      // 2. Fetch All Shows for this Movie
      // THIS FIXED THE BUG: We use the service which calls /api/shows?movieId=...
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

  // --- Derived Data Logic ---
  
  // 1. Get Unique Cities from the fetched shows
  const cities = [...new Set(shows.map(show => show.theatre.city))];

  // 2. Group Shows by Theatre (filtered by City)
  const getFilteredTheatres = () => {
     if (!selectedCity) return [];

     // Filter shows by City
     const filtered = shows.filter(show => show.theatre.city === selectedCity);

     // Group by Theatre ID
     const theatreMap = {};
     filtered.forEach(show => {
         const tId = show.theatre._id;
         if (!theatreMap[tId]) {
             theatreMap[tId] = {
                 ...show.theatre,
                 shows: []
             };
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
      
      {/* Movie Header / Backdrop */}
      <div className="relative h-[400px] w-full">
         <div className="absolute inset-0 bg-gray-900">
            <img src={movie.posterUrl} className="w-full h-full object-cover opacity-20 blur-sm" alt="backdrop" />
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
         
         <div className="container mx-auto px-4 h-full flex items-end relative z-10 pb-8 gap-8">
            <img 
               src={movie.posterUrl} 
               alt={movie.title} 
               className="w-48 rounded-lg shadow-2xl border-4 border-gray-800 hidden md:block" 
            />
            <div className="text-white">
                <Link to="/" className="text-gray-400 hover:text-white flex items-center mb-4 text-sm"><FaArrowLeft className="mr-2"/> Back to Movies</Link>
                <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                    <span className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">{movie.language}</span>
                    <span className="bg-gray-800 px-3 py-1 rounded-full border border-gray-700">{movie.genre}</span>
                    <span className="flex items-center gap-1"><FaClock className="text-red-500"/> {movie.duration} mins</span>
                    <span className="bg-red-600 px-3 py-1 rounded-full text-white text-xs font-bold">{movie.status}</span>
                </div>
                <p className="text-gray-400 max-w-2xl">{movie.description}</p>
            </div>
         </div>
      </div>

      {/* Booking Section */}
      <div className="container mx-auto px-4 mt-8">
         <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-600 pl-4">Get Tickets</h2>
         
         {cities.length === 0 ? (
             <div className="bg-gray-800 p-8 rounded text-center text-gray-400">
                 No shows scheduled for this movie yet.
             </div>
         ) : (
             <>
                {/* City Selector */}
                <div className="mb-8">
                    <label className="text-gray-400 text-sm mb-2 block">Select City</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                       {cities.map(city => (
                           <button 
                             key={city}
                             onClick={() => setSelectedCity(city)}
                             className={`px-4 py-2 rounded whitespace-nowrap transition ${selectedCity === city ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                           >
                              <FaMapMarkerAlt className="inline mr-1"/> {city}
                           </button>
                       ))}
                    </div>
                </div>

                {/* Theatres & Shows List */}
                {selectedCity ? (
                    <div className="space-y-6 animate-fade-in">
                        {theatreList.map(theatre => (
                            <div key={theatre._id} className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                                <div className="flex flex-col md:flex-row justify-between mb-4 border-b border-gray-700 pb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                           <FaVideo className="text-red-500"/> {theatre.name}
                                        </h3>
                                        <p className="text-sm text-gray-400 ml-6">{theatre.address}</p>
                                    </div>
                                    <div className="flex gap-2 mt-2 md:mt-0 ml-6">
                                        {theatre.facilities && theatre.facilities.map((f, i) => (
                                            <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{f}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {theatre.shows.map(show => (
                                        <Link 
                                           key={show._id} 
                                           to={`/booking/${show._id}`}
                                           className="group flex flex-col items-center bg-gray-700 hover:bg-green-600 border border-gray-600 hover:border-green-500 rounded p-3 transition min-w-[100px]"
                                        >
                                            <span className="text-sm font-bold text-white group-hover:text-white">
                                                {new Date(show.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            <span className="text-xs text-gray-400 group-hover:text-green-100 uppercase mt-1">
                                                {show.screenName}
                                            </span>
                                            <span className="text-xs text-green-400 group-hover:text-white font-bold mt-1">
                                                ${show.price}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 italic">Please select a city to view shows.</div>
                )}
             </>
         )}
      </div>
    </div>
  );
};

export default MoviePage;