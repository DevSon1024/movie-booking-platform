import { useState, useEffect, useRef, useMemo } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const CitySearchDropdown = ({ 
  cities = [], 
  value = "", 
  onChange, 
  placeholder = "Search cities...", 
  inputRef = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Initialize search term based on passed value
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => {
    return cities.filter(city => 
      city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  const handleInputChange = (e) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);
    setIsOpen(true);
    onChange(newTerm);
  };

  const handleSelectCity = (city) => {
    setSearchTerm(city);
    setIsOpen(false);
    onChange(city);
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
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
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

      {isOpen && filteredCities.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          {filteredCities.map((city, idx) => (
            <div 
              key={idx}
              onClick={() => handleSelectCity(city)}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{city}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isOpen && searchTerm && filteredCities.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No cities found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default CitySearchDropdown;
