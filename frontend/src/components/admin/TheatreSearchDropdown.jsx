import { useState, useEffect, useRef, useMemo } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const TheatreSearchDropdown = ({ 
  theatres = [], 
  value = "", 
  onChange, 
  mode = "id", // "id" returns theatre._id, "name" returns theatre.name
  placeholder = "Search theatres or cities...", 
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
        const selectedTheatre = theatres.find(t => t._id === value);
        if (selectedTheatre) setSearchTerm(selectedTheatre.name);
      } else {
        setSearchTerm(value);
      }
    } else {
      setSearchTerm("");
    }
  }, [value, theatres, mode]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // If they didn't select anything and we are in 'id' mode, revert to the selected name
        if (mode === "id" && value) {
             const selectedTheatre = theatres.find(t => t._id === value);
             if(selectedTheatre) setSearchTerm(selectedTheatre.name);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, theatres, mode]);

  const filteredTheatres = useMemo(() => {
    return theatres.filter(theatre => {
      const searchLower = searchTerm.toLowerCase();
      const matchName = theatre.name?.toLowerCase().includes(searchLower);
      const matchCity = theatre.city?.toLowerCase().includes(searchLower);
      return matchName || matchCity;
    });
  }, [theatres, searchTerm]);

  const handleInputChange = (e) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);
    setIsOpen(true);
    
    // If in name mode, typing directly updates the parent's value
    if (mode === "name") {
      onChange(newTerm);
    } else if (mode === "id" && newTerm === "") {
      // If they clear the input in ID mode, clear the parent value
      onChange("");
    }
  };

  const handleSelectTheatre = (theatre) => {
    setSearchTerm(theatre.name);
    setIsOpen(false);
    onChange(mode === "id" ? theatre._id : theatre.name);
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

      {isOpen && filteredTheatres.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          {filteredTheatres.map(theatre => (
            <div 
              key={theatre._id}
              onClick={() => handleSelectTheatre(theatre)}
              className="flex flex-col p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0"
            >
              <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{theatre.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5"><span className="font-medium text-gray-600 dark:text-gray-300">City:</span> {theatre.city}</p>
            </div>
          ))}
        </div>
      )}
      
      {isOpen && searchTerm && filteredTheatres.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No theatres found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default TheatreSearchDropdown;
