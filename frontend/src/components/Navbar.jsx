import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { FaTicketAlt, FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold text-red-500"
          >
            <FaTicketAlt />
            <span>MovieDeck</span>
          </Link>

          {/* Menu Items */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-red-400 transition">
              Movies
            </Link>

            {userInfo ? (
              // Show this if Logged In
              <div className="flex items-center space-x-4">
                {userInfo.role === "admin" && (
                  <span className="bg-red-600 px-2 py-1 rounded text-xs font-bold uppercase">
                    Admin
                  </span>
                )}
                <div className="flex items-center space-x-1 text-gray-300">
                  <FaUserCircle />
                  <span>{userInfo.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              // Show this if Logged Out
              <div className="space-x-4">
                <Link to="/login" className="hover:text-white text-gray-300">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;