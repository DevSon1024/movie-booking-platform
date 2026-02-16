import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { getShows } from '../services/showService';
import citiesData from '../data/cities.json';
import Reviews from '../components/Reviews';
import CachedImage from '../components/CachedImage';
import { 
  FaClock, 
  FaMapMarkerAlt, 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaStar,
  FaTicketAlt,
  FaTimes,
  FaSearch,
  FaUser, 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const MoviePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({ average: 0, count: 0 });
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  const fetchData = async () => {
    try {
      const movieRes = await api.get(`/movies/${id}`);
      setMovie(movieRes.data);
      
      const reviewsRes = await api.get(`/reviews/movie/${id}`);
      setRatingStats({
        average: reviewsRes.data.averageRating,
        count: reviewsRes.data.count
      });

      const showsData = await getShows({ movieId: id });
      const activeShows = showsData.filter(s => 
        s.status === 'active' && new Date(s.startTime) > new Date()
      );
      
      setShows(activeShows);
      
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load movie details');
      setLoading(false);
    }
  };

  const availableCities = [...new Set(shows.map(show => show.theatre?.city).filter(Boolean))];
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchCity(value);
    
    if (value.length > 1) {
      const filtered = citiesData.filter(item => 
        item.city.toLowerCase().startsWith(value.toLowerCase())
      ).slice(0, 5);
      setCitySuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCityFromSuggestion = (city) => {
    setSearchCity(city);
    setCitySuggestions([]);
    setShowSuggestions(false);
    if (availableCities.includes(city)) {
       setSelectedCity(city);
    }
  };

  const filteredAvailableCities = availableCities.filter(city => 
    city.toLowerCase().includes(searchCity.toLowerCase())
  );

  const getAvailableDates = () => {
    const dates = [...new Set(shows.map(show => {
      const date = new Date(show.startTime);
      return date.toISOString().split('T')[0];
    }))];
    return dates.sort();
  };

  const availableDates = getAvailableDates();

  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTheatresForCityAndDate = () => {
    if (!selectedCity || !selectedDate) return [];
    
    const filtered = shows.filter(show => {
      const showDate = new Date(show.startTime).toISOString().split('T')[0];
      return show.theatre?.city === selectedCity && 
             showDate === selectedDate &&
             show.status === 'active';
    });
    
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

  const theatreList = getTheatresForCityAndDate();

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleShowtimeClick = (showId) => {
    setShowBookingModal(false);
    navigate(`/booking/${showId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading Movie...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-600 dark:text-red-400 mb-4">Movie Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white px-6 py-2.5 rounded-full text-base transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 font-sans">
      
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img 
            src={movie.posterUrl} 
            className="w-full h-full object-cover blur-md scale-110" 
            alt="backdrop" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-gray-900/80"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-10 md:py-14">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white inline-flex items-center mb-8 text-sm font-medium transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform"/> 
            Back
          </button>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
            <div className="flex-shrink-0 group perspective-1000">
              <CachedImage 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-56 md:w-72 rounded-xl shadow-2xl border-2 border-gray-700 dark:border-gray-800 group-hover:rotate-1 transition-transform duration-500" 
                fallbackSrc="/placeholder-movie.svg"
                lazy={false}
              />
            </div>

            <div className="flex-1 text-white text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                {movie.title}
              </h1>

              <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg flex items-center gap-2 border border-white/10">
                  <FaStar className="text-yellow-400 text-lg" />
                  <span className="font-bold text-lg">
                    {ratingStats.average > 0 ? `${ratingStats.average}/5` : 'Rating not given yet'}
                  </span>
                  {ratingStats.average > 0 && (
                      <span className="text-gray-400 text-sm hidden sm:inline">({ratingStats.count} Reviews)</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-8">
                <div className="bg-gray-800/80 px-4 py-1.5 rounded text-sm border border-gray-700">
                  <span className="font-medium text-gray-200">{movie.genre}</span>
                </div>
                <div className="bg-gray-800/80 px-4 py-1.5 rounded text-sm border border-gray-700 flex items-center gap-2 text-gray-300">
                  <FaClock className="text-red-400" />
                  <span>{formatRuntime(movie.duration)}</span>
                </div>
                <div className="bg-gray-800/80 px-4 py-1.5 rounded text-sm border border-gray-700 flex items-center gap-2 text-gray-300">
                  <FaCalendarAlt className="text-blue-400" />
                  <span>{new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric' })}</span>
                </div>
                <div className="bg-gray-800/80 px-4 py-1.5 rounded text-sm border border-gray-700 text-gray-300">
                  {movie.language}
                </div>
                <div className="bg-red-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider self-center">
                  U/A
                </div>
              </div>

              <button 
                onClick={() => setShowBookingModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-3.5 rounded-full font-bold text-base shadow-lg hover:shadow-red-600/30 hover:scale-105 transition-all flex items-center gap-2 mx-auto md:mx-0"
              >
                <FaTicketAlt />
                Book Tickets
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Synopsis
              </h2>
              <div className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
                {movie.description}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                 <FaUser className="text-red-500" /> Cast
              </h2>
              
              {movie.cast && movie.cast.length > 0 ? (
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                   {movie.cast.map((person, idx) => (
                     <div key={`cast-${idx}`} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 transition-all group">
                       <div className="h-36 sm:h-44 overflow-hidden">
                         <CachedImage 
                           src={person.image} 
                           alt={person.name} 
                           className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                           fallbackSrc="/placeholder-movie.svg"
                         />
                       </div>
                       <div className="p-3 text-center">
                         <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{person.name}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{person.role}</p>
                       </div>
                     </div>
                   ))}
                 </div>
              ) : (
                <p className="text-base text-gray-500">Cast info updating...</p>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Movie Info</h3>
                
                <div className="space-y-4 text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Release Date</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(movie.releaseDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Duration</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{formatRuntime(movie.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Language</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{movie.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <span className={`font-semibold px-3 py-1 rounded text-xs ${
                      movie.status === 'RUNNING' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : movie.status === 'UPCOMING'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {movie.status}
                    </span>
                  </div>
                </div>
             </div>
          </div>

        </div>

        <div className="mt-16">
          <Reviews movieId={id} movieStatus={movie.status} />
        </div>

      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {movie.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select showtime</p>
                </div>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                
                {!selectedCity ? (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-red-500" /> Select City
                    </h3>
                    
                    <div className="relative mb-8" ref={searchRef}>
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={searchCity}
                        onChange={handleSearchChange}
                        className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-xl pl-12 pr-4 py-3 text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all"
                        autoComplete="off"
                      />
                      
                      {showSuggestions && citySuggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
                          {citySuggestions.map((item, index) => (
                            <button
                              key={`suggestion-${item.city}-${index}`}
                              onClick={() => selectCityFromSuggestion(item.city)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm flex justify-between border-b border-gray-100 dark:border-gray-600 last:border-0"
                            >
                              <span>{item.city}</span>
                              <span className="text-gray-400">{item.state}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {availableCities.length === 0 ? (
                      <div className="text-center py-8">
                         <p className="text-base text-gray-500">No shows active currently.</p>
                      </div>
                    ) : filteredAvailableCities.length === 0 ? (
                      <div className="text-center py-8 text-base text-gray-500">
                         No cities match your search.
                         {searchCity && <button onClick={() => setSearchCity('')} className="text-red-500 ml-1 underline">Clear</button>}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {filteredAvailableCities.map((city, idx) => (
                          <button
                            key={`city-${city}-${idx}`}
                            onClick={() => { setSelectedCity(city); setSearchCity(''); }}
                            className="bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 rounded-xl p-4 transition-all text-center shadow-sm"
                          >
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                              {city}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-red-500 text-lg" />
                        <span className="text-base font-bold text-gray-900 dark:text-white">{selectedCity}</span>
                      </div>
                      <button
                        onClick={() => { setSelectedCity(''); setSearchCity(''); }}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-bold"
                      >
                        CHANGE
                      </button>
                    </div>

                    <div className="mb-8">
                      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                        {availableDates.map((date, idx) => (
                          <button
                            key={`date-${date}-${idx}`}
                            onClick={() => setSelectedDate(date)}
                            className={`px-5 py-3 rounded-xl whitespace-nowrap transition-all text-sm font-bold border ${
                              selectedDate === date
                                ? 'bg-red-600 border-red-600 text-white shadow-md'
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-400'
                            }`}
                          >
                            {formatDateDisplay(date)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {theatreList.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                           <p className="text-base text-gray-500">No shows available for this date.</p>
                        </div>
                      ) : (
                        theatreList.map((theatre, idx) => (
                          <div 
                            key={`theatre-${theatre._id}-${idx}`}
                            className="bg-white dark:bg-gray-700/40 rounded-xl p-6 border border-gray-100 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                                <div>
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{theatre.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{theatre.address}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              {theatre.shows
                                .filter(show => show.status === 'active')
                                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                                .map((show, showIdx) => (
                                  <button
                                    key={`show-${show._id}-${showIdx}`}
                                    onClick={() => handleShowtimeClick(show._id)}
                                    className="group relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg px-5 py-2.5 transition-all min-w-[100px]"
                                  >
                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400">
                                      {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                      {show.screenName}
                                    </div>
                                  </button>
                                ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MoviePage;