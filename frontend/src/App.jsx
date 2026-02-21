import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { getSettings } from "./redux/slices/settingsSlice";

import Navbar from "./components/Navbar";
import ProfileCompletionPrompt from "./components/ProfileCompletionPrompt";

// Lazy load all page components
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MoviePage = lazy(() => import("./pages/MoviePage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const MyBookingsPage = lazy(() => import("./pages/MyBookingsPage"));
const PaymentOptionsPage = lazy(() => import("./pages/PaymentOptionsPage"));
const MyReviews = lazy(() => import("./pages/MyReviews"));

// Lazy load route components
const ProtectedRoute = lazy(() => import("./routes/ProtectedRoute"));
const AdminRoute = lazy(() => import('./routes/AdminRoute'));

// Lazy load admin components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminMoviesPage = lazy(() => import('./pages/admin/AdminMoviesPage'));
const AdminTheatresPage = lazy(() => import('./pages/admin/AdminTheatresPage'));
const AdminShowsPage = lazy(() => import('./pages/admin/AdminShowsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-14 h-14 border-4 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-lg text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans transition-colors duration-300">
      <Navbar />

      <main>
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/my-reviews" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
          <Route path="/payment-options" element={<ProtectedRoute><PaymentOptionsPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminDashboard />}>
              <Route index element={<AdminOverview />} />
              <Route path="movies" element={<AdminMoviesPage />} />
              <Route path="theatres" element={<AdminTheatresPage />} />
              <Route path="shows" element={<AdminShowsPage />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      </main>

      <ProfileCompletionPrompt />
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;