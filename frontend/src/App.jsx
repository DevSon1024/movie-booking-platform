import { useEffect } from "react";
import { Routes, Route } from "react-router-dom"; 
import { Toaster } from "react-hot-toast"; 
import { useDispatch } from "react-redux";
import { getSettings } from "./redux/slices/settingsSlice";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import MoviePage from "./pages/MoviePage";
import BookingPage from "./pages/BookingPage";

// Admin Imports
import AdminRoute from './routes/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard'; // Layout
import AdminOverview from './pages/admin/AdminOverview';   // Stats (New)
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminTheatresPage from './pages/admin/AdminTheatresPage'; 
import AdminShowsPage from './pages/admin/AdminShowsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  return (
    // Default background matches theme
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans transition-colors duration-300">
      <Navbar />

      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/movie/:id" element={<MoviePage />} />

          {/* User */}
          <Route path="/booking/:id" element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            {/* AdminDashboard acts as the Layout (Sidebar) */}
            <Route element={<AdminDashboard />}>
              {/* Index route shows Stats */}
              <Route index element={<AdminOverview />} />
              
              <Route path="movies" element={<AdminMoviesPage />} />
              <Route path="theatres" element={<AdminTheatresPage />} />
              <Route path="shows" element={<AdminShowsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;