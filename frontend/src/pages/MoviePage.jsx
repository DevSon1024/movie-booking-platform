import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { getShows } from '../services/showService';
import citiesData from '../data/cities.json';
import { 
  FaClock, 
  FaMapMarkerAlt, 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaStar,
  FaTicketAlt,
  FaTimes,
  FaSearch,
  FaTheaterMasks,
  FaChevronRight,
  FaUser, 
  FaVideo
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
          <div className="w-16 h-16 border-4 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Movie...</p>
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
            className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-all"
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
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src={movie.posterUrl} 
            className="w-full h-full object-cover blur-sm" 
            alt="backdrop" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-900/90"></div>
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 py-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="text-white hover:text-red-400 inline-flex items-center mb-6 text-sm transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform"/> 
            Back to Home
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Movie Poster */}
            <div className="flex-shrink-0">
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-64 md:w-72 rounded-xl shadow-2xl border-4 border-gray-700 dark:border-gray-800" 
              />
            </div>

            {/* Movie Details */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {movie.title}
              </h1>

              {/* Rating Badge */}
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 border border-gray-700">
                  <FaStar className="text-yellow-400" />
                  <span className="font-bold">9.3/10</span>
                  <span className="text-gray-400 text-sm">(235K votes)</span>
                </div>
                <button className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-all">
                  Rate Now
                </button>
              </div>

              {/* Movie Meta Info */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
                  <span className="font-semibold">{movie.genre}</span>
                </div>
                <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
                  <FaClock className="text-red-400" />
                  <span>{formatRuntime(movie.duration)}</span>
                </div>
                <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-400" />
                  <span>{new Date(movie.releaseDate).toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
                  <span className="font-semibold">{movie.language}</span>
                </div>
                <div className="bg-red-600 px-4 py-2 rounded-lg font-bold">
                  U/A
                </div>
              </div>

              {/* Book Tickets Button */}
              <button 
                onClick={() => setShowBookingModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 group"
              >
                <FaTicketAlt className="text-xl" />
                Book Tickets
                <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        
        {/* About the Movie */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            About the Movie
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {movie.description}
            </p>
          </div>
        </section>

        {/* Cast & Crew */}
        {/* Cast & Crew Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
             <FaUser /> Cast & Crew
          </h2>
          
          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="mb-8">
               <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 px-1">Top Cast</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                 {movie.cast.map((person, idx) => (
                   <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                     <div className="h-48 overflow-hidden">
                       <img 
                         src={person.image} 
                         alt={person.name} 
                         className="w-full h-full object-cover"
                         onError={(e) => {e.target.src = 'https://via.placeholder.com/150?text=No+Image'}}
                       />
                     </div>
                     <div className="p-3 text-center">
                       <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{person.name}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">As <span className="text-gray-700 dark:text-gray-300 font-medium">{person.role}</span></p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* Crew */}
          {movie.crew && movie.crew.length > 0 && (
             <div>
               <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 px-1">Crew</h3>
               <div className="flex flex-wrap gap-4">
                 {movie.crew.map((person, idx) => (
                   <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-800 pr-4 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                      <img 
                         src={person.image} 
                         alt={person.name} 
                         className="w-12 h-12 rounded-full object-cover" 
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{person.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{person.role}</p>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {(!movie.cast?.length && !movie.crew?.length) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <FaTheaterMasks className="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Cast and crew information will be available soon
              </p>
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Movie Reviews
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-md border border-gray-200 dark:border-gray-700 text-center">
            <FaStar className="text-6xl text-yellow-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              Review option coming soon
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Share your thoughts and rate this movie after watching!
            </p>
          </div>
        </section>

      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen px-4 py-8">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Book Tickets for {movie.title}
                </h2>
                <button 
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                
                {/* City Selection */}
                {!selectedCity ? (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Select Your City
                    </h3>
                    
                    {/* Search Bar with Autocomplete */}
                    <div className="relative mb-6" ref={searchRef}>
                      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search for your city..."
                        value={searchCity}
                        onChange={handleSearchChange}
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg pl-12 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        autoComplete="off"
                      />
                      
                      {/* Search Suggestions */}
                      {showSuggestions && citySuggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                          {citySuggestions.map((item, index) => (
                            <button
                              key={`${item.city}-${index}`}
                              onClick={() => selectCityFromSuggestion(item.city)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm flex justify-between"
                            >
                              <span>{item.city}</span>
                              <span className="text-xs text-gray-400">{item.state}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cities Grid */}
                    {availableCities.length === 0 ? (
                      <div className="text-center py-12">
                        <FaMapMarkerAlt className="text-5xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No shows available for this movie yet
                        </p>
                      </div>
                    ) : filteredAvailableCities.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchCity && !availableCities.includes(searchCity) 
                            ? `No shows currently available in "${searchCity}"` 
                            : "No cities found matching your search"}
                        </p>
                        {searchCity && (
                          <button 
                            onClick={() => setSearchCity('')}
                            className="text-red-600 mt-2 hover:underline text-sm"
                          >
                            Clear search to see all available cities
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2">
                        {filteredAvailableCities.map(city => (
                          <button
                            key={city}
                            onClick={() => {
                              setSelectedCity(city);
                              setSearchCity('');
                            }}
                            className="bg-gray-50 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-2 border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 rounded-lg p-4 transition-all group"
                          >
                            <FaMapMarkerAlt className="text-2xl text-gray-400 group-hover:text-red-500 mx-auto mb-2 transition-colors" />
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {city}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Selected City Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-red-500 text-xl" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {selectedCity}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCity('');
                          setSearchCity('');
                        }}
                        className="text-red-600 dark:text-red-400 hover:underline text-sm font-medium"
                      >
                        Change City
                      </button>
                    </div>

                    {/* Date Selection */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Select Date
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {availableDates.map(date => (
                          <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`px-6 py-3 rounded-lg whitespace-nowrap transition-all font-medium border-2 flex-shrink-0 ${
                              selectedDate === date
                                ? 'bg-red-600 border-red-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-700'
                            }`}
                          >
                            {formatDateDisplay(date)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theatres List */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Select Theatre & Showtime
                      </h3>
                      
                      {theatreList.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <FaTheaterMasks className="text-5xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">
                            No shows available for the selected date in {selectedCity}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                          {theatreList.map(theatre => (
                            <div 
                              key={theatre._id}
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600"
                            >
                              {/* Theatre Info */}
                              <div className="mb-4">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                  {theatre.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {theatre.address}
                                </p>
                              </div>

                              {/* Showtimes */}
                              <div className="flex flex-wrap gap-3">
                                {theatre.shows
                                  .filter(show => show.status === 'active')
                                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                                  .map(show => (
                                    <button
                                      key={show._id}
                                      onClick={() => handleShowtimeClick(show._id)}
                                      className="group bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 rounded-lg px-4 py-3 transition-all min-w-[100px] text-center"
                                    >
                                      <div className="text-base font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 mb-1">
                                        {new Date(show.startTime).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                        {show.screenName}
                                      </div>
                                      <div className="text-sm text-green-600 dark:text-green-400 font-bold">
                                        {currencySymbol}{show.price}
                                      </div>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviePage;