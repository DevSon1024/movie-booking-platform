import { useEffect } from "react";
import { Routes, Route } from "react-router-dom"; 
import { Toaster } from "react-hot-toast"; 
// FIX: Import Redux hooks
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
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminTheatresPage from './pages/admin/AdminTheatresPage'; 
import AdminShowsPage from './pages/admin/AdminShowsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  // FIX: Initialize Dispatch
  const dispatch = useDispatch();

  // FIX: Fetch Settings on App Mount
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
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

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route path="" element={<AdminDashboard />}>
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