import axios from 'axios';
import apiMock from './apiMock';

// Check if we should use mock data
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

let api;

if (useMockData) {
  console.log("⚠️ USING MOCK DATA SERVICES (Demo Mode)");
  api = apiMock;
} else {
  // Create a configured instance of Axios for real backend
  api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api', 
    withCredentials: true, // IMPORTANT: Allows sending cookies (JWT) to backend
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default api;