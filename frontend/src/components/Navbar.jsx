import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FaTicketAlt, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { siteName } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700 relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-red-500">
            <FaTicketAlt />
            <span>{siteName || 'MovieDeck'}</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-red-400 transition text-white">Movies</Link>
            {userInfo ? (
              <div className="flex items-center space-x-4">
                {userInfo.role === "admin" && (
                  <Link to="/admin" className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-bold transition flex items-center gap-2">
                    <span>🛡️ Admin</span>
                  </Link>
                )}
                <div className="flex items-center space-x-1 text-gray-300">
                  <FaUserCircle className="text-xl" />
                  <span className="font-semibold">{userInfo.name}</span>
                </div>
                <button onClick={handleLogout} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition">
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="hover:text-white text-gray-300">Login</Link>
                <Link to="/register" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white text-2xl focus:outline-none">
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 absolute w-full left-0 animate-fade-in">
          <div className="flex flex-col p-4 space-y-4">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-white hover:text-red-400">Movies</Link>
            {userInfo ? (
              <>
                <div className="text-gray-400 border-b border-gray-700 pb-2">
                  Signed in as <span className="text-white font-bold">{userInfo.name}</span>
                </div>
                {userInfo.role === "admin" && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="text-red-400 font-bold">
                    Access Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="bg-gray-700 text-white py-2 rounded text-left px-4">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-white">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="bg-red-600 text-white py-2 rounded text-center">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;