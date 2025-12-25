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
              <div className="flex items-center space-x-4">
                {/* 1. ADMIN DASHBOARD LINK (Only visible to Admins) */}
                {userInfo.role === "admin" && (
                  <Link
                    to="/admin"
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-bold transition flex items-center gap-2"
                  >
                    <span>🛡️ Admin Panel</span>
                  </Link>
                )}

                {/* User Name Badge */}
                <div className="flex items-center space-x-1 text-gray-300">
                  <FaUserCircle className="text-xl" />
                  <span className="font-semibold">{userInfo.name}</span>
                </div>

                {/* Logout Button */}
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