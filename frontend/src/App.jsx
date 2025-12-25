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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        {/* Navbar is outside Routes so it shows on every page */}
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/movie/:id" element={<MoviePage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* We will add Booking/Admin routes later */}
            {/* Protect Booking Route so only logged in users can see it */}
            <Route path="/book/:id" element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            {/* Protected Profile Route */}
            <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Toast Notifications */}
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
