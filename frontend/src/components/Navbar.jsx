import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useTheme } from "../context/ThemeContext";
import api from '../services/api';
import { 
  FaTicketAlt, FaUserCircle, FaBars, FaTimes, FaSun, FaMoon, 
  FaSignOutAlt, FaHistory, FaStar, FaCreditCard, FaQuestionCircle, FaUserCog, FaSearch 
} from "react-icons/fa";

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { siteName } = useSelector((state) => state.settings);
  const { theme, toggleTheme } = useTheme();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsSearching(true);
        try {
            const { data } = await api.get('/movies?includeAll=true');
            const filtered = data.filter(movie => 
                movie.title.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 5);
            setSearchResults(filtered);
            setShowResults(true);
        } catch (error) {
            console.error("Search failed", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchResultClick = (movieId) => {
      setSearchTerm("");
      setShowResults(false);
      navigate(`/movie/${movieId}`);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-red-600 dark:text-red-500 shrink-0">
            <FaTicketAlt />
            <span className="hidden sm:block">{siteName || 'MovieDeck'}</span>
          </Link>

          <div className="flex-1 max-w-lg mx-8 relative" ref={searchRef}>
             <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search movies..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm && setShowResults(true)}
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-red-500 transition text-base"
                />
                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                {isSearching && (
                    <div className="absolute right-3 top-3 w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                )}
             </div>

             {showResults && searchResults.length > 0 && (
                 <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-up">
                     <div className="py-2">
                        {searchResults.map((movie) => (
                            <div 
                                key={movie._id}
                                onClick={() => handleSearchResultClick(movie._id)}
                                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 transition"
                            >
                                <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded bg-gray-200" />
                                <div className="flex-1">
                                    <p className="text-base font-bold text-gray-800 dark:text-white">{movie.title}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {movie.genre} • {new Date(movie.releaseDate).getFullYear()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
             )}
          </div>

          <div className="hidden md:flex items-center space-x-6 shrink-0">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition text-base">
              Movies
            </Link>

            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-yellow-400 transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button>

            {userInfo ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition focus:outline-none"
                >
                  <FaUserCircle className="text-3xl" />
                  <span className="font-semibold text-base max-w-[100px] truncate">{userInfo.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in origin-top-right z-50">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Signed in as</p>
                      <p className="text-base font-bold text-gray-900 dark:text-white truncate">{userInfo.email}</p>
                    </div>

                    <div className="py-2">
                      {userInfo.role === "admin" && (
                        <Link 
                          to="/admin" 
                          className="flex items-center px-5 py-3 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-red-400"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaUserCog className="mr-3" /> Admin Panel
                        </Link>
                      )}
                      
                      <Link to="/profile" className="flex items-center px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsProfileOpen(false)}>
                        <FaUserCircle className="mr-3 text-gray-400" /> My Profile
                      </Link>
                      
                      <Link to="/profile" className="flex items-center px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsProfileOpen(false)}>
                        <FaHistory className="mr-3 text-gray-400" /> My Tickets
                      </Link>
                      
                      <Link to="/my-reviews" className="flex items-center px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" onClick={() => setIsProfileOpen(false)}>
                        <FaStar className="mr-3 text-gray-400" /> My Reviews
                      </Link>
                      
                      <button className="w-full flex items-center px-5 py-3 text-base text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <FaCreditCard className="mr-3 text-gray-400" /> Payment Options
                      </button>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-5 py-4 text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition"
                      >
                        <FaSignOutAlt className="mr-3" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 text-base text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition">Login</Link>
                <Link to="/register" className="px-6 py-2 text-base bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition shadow-md hover:shadow-lg">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-4 ml-2">
            <button onClick={toggleTheme} className="text-gray-600 dark:text-yellow-400">
               {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-gray-800 dark:text-white text-2xl focus:outline-none">
              {isMobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 absolute w-full left-0 shadow-xl animate-slide-down z-40">
          <div className="flex flex-col p-4 space-y-2">
            <Link to="/" onClick={() => setIsMobileOpen(false)} className="block px-4 py-3 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-base font-medium">
              🎬 Movies
            </Link>

            {userInfo ? (
              <>
                <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
                   <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                </div>

                <Link to="/profile" onClick={() => setIsMobileOpen(false)} className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-base">
                  <FaUserCircle className="mr-3" /> My Profile
                </Link>
                <Link to="/profile" onClick={() => setIsMobileOpen(false)} className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-base">
                  <FaHistory className="mr-3" /> My Tickets
                </Link>
                <Link to="/my-reviews" onClick={() => setIsMobileOpen(false)} className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-base">
                  <FaStar className="mr-3" /> My Reviews
                </Link>
                
                {userInfo.role === "admin" && (
                  <Link to="/admin" onClick={() => setIsMobileOpen(false)} className="flex items-center px-4 py-3 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 mt-2 text-base">
                    <FaUserCog className="mr-3" /> Admin Panel
                  </Link>
                )}

                <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 mt-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 text-base">
                  <FaSignOutAlt className="mr-3" /> Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Link to="/login" onClick={() => setIsMobileOpen(false)} className="px-4 py-3 text-center text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-base">
                   Login
                </Link>
                <Link to="/register" onClick={() => setIsMobileOpen(false)} className="px-4 py-3 text-center bg-red-600 text-white rounded-lg font-bold text-base">
                   Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;