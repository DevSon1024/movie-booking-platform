import axios from 'axios';

// Create a configured instance of Axios
const api = axios.create({
  baseURL: '/api', // Proxy in vite.config.js will handle the localhost:5000 part
  withCredentials: true, // IMPORTANT: Allows sending cookies (JWT) to backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;