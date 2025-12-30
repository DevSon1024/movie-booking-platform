import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { getShows } from '../services/showService';
import citiesData from '../data/cities.json';
import Reviews from '../components/Reviews';
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
  const { currencySymbol } = useSelector((state) => state.settings);
  
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Search Autocomplete State
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    // Scroll to top immediately when ID changes or component mounts
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
      const showsData = await getShows({ movieId: id });
      
      // Filter out cancelled shows AND past shows
      const activeShows = showsData.filter(s => 
        s.status === 'active' && new Date(s.startTime) > new Date()
      );
      
      setShows(activeShows);
      
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load movie details');
      setLoading(false);
    }
  };

  // Get unique cities from shows (available cities)
  const availableCities = [...new Set(shows.map(show => show.theatre?.city).filter(Boolean))];
  
  // Handle Search Input Change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchCity(value);
    
    if (value.length > 1) {
      // Search from the global JSON list
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

  // Select City from Suggestion
  const selectCityFromSuggestion = (city) => {
    setSearchCity(city);
    setCitySuggestions([]);
    setShowSuggestions(false);
    // If the selected city has shows, select it automatically
    if (availableCities.includes(city)) {
       setSelectedCity(city);
    }
  };

  // Filter existing available cities for the grid view based on search input
  const filteredAvailableCities = availableCities.filter(city => 
    city.toLowerCase().includes(searchCity.toLowerCase())
  );

  // Get unique dates from shows
  const getAvailableDates = () => {
    const dates = [...new Set(shows.map(show => {
      const date = new Date(show.startTime);
      return date.toISOString().split('T')[0];
    }))];
    return dates.sort();
  };

  const availableDates = getAvailableDates();

  // Format date for display
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get theatres for selected city and date
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

  // Convert minutes to hours format
  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Navigate to booking page
  const handleShowtimeClick = (showId) => {
    setShowBookingModal(false);
    navigate(`/booking/${showId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading Movie...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-red-600 dark:text-red-400 mb-4">Movie Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white px-5 py-2 rounded-full text-sm transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      
      {/* Hero Section with Movie Info */}
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 opacity-30">
          <img 
            src={movie.posterUrl} 
            className="w-full h-full object-cover blur-md scale-110" 
            alt="backdrop" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-gray-900/80"></div>
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 py-8 md:py-10">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white inline-flex items-center mb-6 text-xs font-medium transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform"/> 
            Back
          </button>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
            {/* Movie Poster */}
            <div className="flex-shrink-0 group perspective-1000">
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-48 md:w-60 rounded-lg shadow-2xl border-2 border-gray-700 dark:border-gray-800 group-hover:rotate-1 transition-transform duration-500" 
              />
            </div>

            {/* Movie Details */}
            <div className="flex-1 text-white text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
                {movie.title}
              </h1>

              {/* Rating Badge */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-5">
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span className="font-bold text-sm">8.5/10</span>
                  <span className="text-gray-400 text-xs hidden sm:inline">(View Reviews)</span>
                </div>
              </div>

              {/* Movie Meta Info */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                <div className="bg-gray-800/80 px-3 py-1 rounded text-xs border border-gray-700">
                  <span className="font-medium text-gray-200">{movie.genre}</span>
                </div>
                <div className="bg-gray-800/80 px-3 py-1 rounded text-xs border border-gray-700 flex items-center gap-1.5 text-gray-300">
                  <FaClock className="text-red-400" />
                  <span>{formatRuntime(movie.duration)}</span>
                </div>
                <div className="bg-gray-800/80 px-3 py-1 rounded text-xs border border-gray-700 flex items-center gap-1.5 text-gray-300">
                  <FaCalendarAlt className="text-blue-400" />
                  <span>{new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric' })}</span>
                </div>
                <div className="bg-gray-800/80 px-3 py-1 rounded text-xs border border-gray-700 text-gray-300">
                  {movie.language}
                </div>
                <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider self-center">
                  U/A
                </div>
              </div>

              {/* Book Tickets Button */}
              <button 
                onClick={() => setShowBookingModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:shadow-red-600/30 hover:scale-105 transition-all flex items-center gap-2 mx-auto md:mx-0"
              >
                <FaTicketAlt />
                Book Tickets
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: About & Cast */}
          <div className="lg:col-span-2 space-y-10">
            {/* About the Movie */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Synopsis
              </h2>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
                {movie.description}
              </div>
            </section>

            {/* Cast & Crew */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                 <FaUser className="text-red-500" /> Cast
              </h2>
              
              {/* Cast Grid */}
              {movie.cast && movie.cast.length > 0 ? (
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                   {movie.cast.map((person, idx) => (
                     <div key={`cast-${idx}`} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 transition-all group">
                       <div className="h-32 sm:h-40 overflow-hidden">
                         <img 
                           src={person.image} 
                           alt={person.name} 
                           className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                           onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=No+Image'}}
                         />
                       </div>
                       <div className="p-2 text-center">
                         <p className="font-bold text-gray-900 dark:text-white text-xs line-clamp-1">{person.name}</p>
                         <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{person.role}</p>
                       </div>
                     </div>
                   ))}
                 </div>
              ) : (
                <p className="text-sm text-gray-500">Cast info updating...</p>
              )}

              {/* Crew Pills */}
              {movie.crew && movie.crew.length > 0 && (
                 <div className="mt-8">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Crew</h3>
                   <div className="flex flex-wrap gap-3">
                     {movie.crew.map((person, idx) => (
                       <div key={`crew-${idx}`} className="flex items-center gap-2 bg-white dark:bg-gray-800 pr-3 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm p-1">
                          <img 
                             src={person.image} 
                             alt={person.name} 
                             className="w-8 h-8 rounded-full object-cover" 
                          />
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{person.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{person.role}</p>
                          </div>
                       </div>
                     ))}
                   </div>
                 </div>
              )}
            </section>
          </div>

          {/* Right Column: Movie Info */}
          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Movie Info</h3>
                
                <div className="space-y-3 text-sm">
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
                    <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
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

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Applicable Offers</h4>
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs p-3 rounded border border-green-100 dark:border-green-900/30 border-dashed">
                       Get 10% off using bank cards on weekends.
                    </div>
                </div>
             </div>
          </div>

        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <Reviews movieId={id} movieStatus={movie.status} />
        </div>

      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {movie.title}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Select showtime</p>
                </div>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                
                {/* City Selection */}
                {!selectedCity ? (
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-red-500" /> Select City
                    </h3>
                    
                    {/* Search Bar */}
                    <div className="relative mb-6" ref={searchRef}>
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={searchCity}
                        onChange={handleSearchChange}
                        className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all"
                        autoComplete="off"
                      />
                      
                      {/* Suggestions */}
                      {showSuggestions && citySuggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl mt-1 max-h-40 overflow-y-auto">
                          {citySuggestions.map((item, index) => (
                            <button
                              key={`suggestion-${item.city}-${index}`}
                              onClick={() => selectCityFromSuggestion(item.city)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs flex justify-between border-b border-gray-100 dark:border-gray-600 last:border-0"
                            >
                              <span>{item.city}</span>
                              <span className="text-gray-400">{item.state}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cities Grid */}
                    {availableCities.length === 0 ? (
                      <div className="text-center py-8">
                         <p className="text-sm text-gray-500">No shows active currently.</p>
                      </div>
                    ) : filteredAvailableCities.length === 0 ? (
                      <div className="text-center py-8 text-sm text-gray-500">
                         No cities match your search.
                         {searchCity && <button onClick={() => setSearchCity('')} className="text-red-500 ml-1 underline">Clear</button>}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {filteredAvailableCities.map((city, idx) => (
                          <button
                            key={`city-${city}-${idx}`}
                            onClick={() => { setSelectedCity(city); setSearchCity(''); }}
                            className="bg-gray-50 dark:bg-gray-700 hover:bg-white dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 rounded-lg p-3 transition-all text-center"
                          >
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                              {city}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Selected City & Change Option */}
                    <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedCity}</span>
                      </div>
                      <button
                        onClick={() => { setSelectedCity(''); setSearchCity(''); }}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-bold"
                      >
                        CHANGE
                      </button>
                    </div>

                    {/* Date Selection */}
                    <div className="mb-6">
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {availableDates.map((date, idx) => (
                          <button
                            key={`date-${date}-${idx}`}
                            onClick={() => setSelectedDate(date)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all text-xs font-bold border ${
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

                    {/* Theatres List */}
                    <div className="space-y-3">
                      {theatreList.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                           <p className="text-sm text-gray-500">No shows available for this date.</p>
                        </div>
                      ) : (
                        theatreList.map((theatre, idx) => (
                          <div 
                            key={`theatre-${theatre._id}-${idx}`}
                            className="bg-white dark:bg-gray-700/40 rounded-lg p-4 border border-gray-100 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-1">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{theatre.name}</h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{theatre.address}</p>
                                </div>
                                <div className="flex gap-2">
                                   <div className="text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded border border-green-100 dark:border-green-900">M-Ticket</div>
                                   <div className="text-[10px] text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-900">F&B</div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {theatre.shows
                                .filter(show => show.status === 'active')
                                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                                .map((show, showIdx) => (
                                  <button
                                    key={`show-${show._id}-${showIdx}`}
                                    onClick={() => handleShowtimeClick(show._id)}
                                    className="group relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded px-4 py-2 transition-all min-w-[90px]"
                                  >
                                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400">
                                      {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </div>
                                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
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