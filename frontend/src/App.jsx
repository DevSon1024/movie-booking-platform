import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getSettings } from './redux/slices/settingsSlice'; // Import action
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MoviePage from './pages/MoviePage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminTheatresPage from './pages/admin/AdminTheatresPage';
import AdminShowsPage from './pages/admin/AdminShowsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage'; // Import Settings Page

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

function App() {
  const dispatch = useDispatch();

  // FETCH GLOBAL SETTINGS ON APP MOUNT
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/movie/:id" element={<MoviePage />} />

        <Route path="" element={<ProtectedRoute />}>
           <Route path="/booking/:showId" element={<BookingPage />} />
           <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminDashboard />}>
             <Route index element={<div className="p-4 text-gray-400">Select an option from the sidebar.</div>} />
             <Route path="movies" element={<AdminMoviesPage />} />
             <Route path="theatres" element={<AdminTheatresPage />} />
             <Route path="shows" element={<AdminShowsPage />} />
             <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;