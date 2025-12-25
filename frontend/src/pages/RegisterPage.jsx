import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access Global State
  const { userInfo, loading, error } = useSelector((state) => state.auth);

  // 1. Redirect if registration is successful (Auto-Login behavior)
  useEffect(() => {
    if (userInfo) {
      toast.success(`Welcome, ${userInfo.name}!`);
      navigate('/'); // Go straight to Home, no need to login again
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [userInfo, error, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 2. Client-side Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // 3. Dispatch Register Action
    // We send name, email, password. Backend handles the rest.
    dispatch(register({ 
      name: formData.name, 
      email: formData.email, 
      password: formData.password 
    }));
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">Create Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-gray-400 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            className="w-full bg-gray-700 text-white rounded p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-gray-400 mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            className="w-full bg-gray-700 text-white rounded p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Password Field */}
        <div>
          <label className="block text-gray-400 mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="w-full bg-gray-700 text-white rounded p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-gray-400 mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            className="w-full bg-gray-700 text-white rounded p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition duration-200 mt-4"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-red-500 hover:underline">
          Login here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;