import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; 
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import MoviePage from "./pages/MoviePage";
import BookingPage from "./pages/BookingPage";

// --- NEW ADMIN IMPORTS ---
import AdminRoute from './routes/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/movie/:id" element={<MoviePage />} />

            {/* USER ROUTES */}
            <Route path="/book/:id" element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* --- ADMIN ROUTES (NEW) --- */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="" element={<AdminDashboard />}>
                {/* These nest inside the Dashboard's <Outlet /> */}
                <Route path="movies" element={<AdminMoviesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Route>

          </Routes>
        </main>

        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;