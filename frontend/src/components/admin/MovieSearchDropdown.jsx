import { useState, useEffect, useRef } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const MovieSearchDropdown = ({ 
  movies = [], 
  value = "", 
  onChange, 
  mode = "id", // "id" returns movie._id, "title" returns movie.title
  placeholder = "Search movies...", 
  inputRef = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Initialize search term based on passed value
  useEffect(() => {
    if (value) {
      if (mode === "id") {
        const selectedMovie = movies.find(m => m._id === value);
        if (selectedMovie) setSearchTerm(selectedMovie.title);
      } else {
        setSearchTerm(value);
      }
    } else {
      setSearchTerm("");
    }
  }, [value, movies, mode]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // If they didn't select anything and we are in 'id' mode, revert to the selected title
        if (mode === "id" && value) {
             const selectedMovie = movies.find(m => m._id === value);
             if(selectedMovie) setSearchTerm(selectedMovie.title);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, movies, mode]);

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);
    setIsOpen(true);
    
    // If in title mode, typing directly updates the parent's value
    if (mode === "title") {
      onChange(newTerm);
    } else if (mode === "id" && newTerm === "") {
      // If they clear the input in ID mode, clear the parent value
      onChange("");
    }
  };

  const handleSelectMovie = (movie) => {
    setSearchTerm(movie.title);
    setIsOpen(false);
    onChange(mode === "id" ? movie._id : movie.title);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onChange("");
    setIsOpen(false);
    if(inputRef && inputRef.current) inputRef.current.focus();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg pl-9 pr-8 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
        />
        {searchTerm && (
          <button 
            type="button"
            onClick={clearSearch} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {isOpen && filteredMovies.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          {filteredMovies.map(movie => (
            <div 
              key={movie._id}
              onClick={() => handleSelectMovie(movie)}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0"
            >
              <img 
                src={movie.posterUrl || "/placeholder-movie.svg"} 
                alt={movie.title}
                className="w-10 h-14 object-cover rounded"
                onError={(e) => { e.target.src = "/placeholder-movie.svg"; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{movie.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    movie.status === 'RUNNING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    movie.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {movie.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{movie.genre}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isOpen && searchTerm && filteredMovies.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No movies found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default MovieSearchDropdown;
