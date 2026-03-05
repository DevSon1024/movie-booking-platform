import { movies } from '../mockData/movies';
import { theatres } from '../mockData/theatres';
import { shows } from '../mockData/shows';
import { users, dummyUser, dummyAdmin } from '../mockData/user';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const apiMock = {
  get: async (url, config) => {
    await delay(500);
    
    // Movies
    if (url.includes('/movies/all')) return { data: movies };
    if (url.includes('/movies')) {
      // Find ID if it exists: e.g., /movies/m1
      const pathOnly = url.split('?')[0];
      const match = pathOnly.match(/\/movies\/([^/]+)/);
      if (match && match[1] && match[1] !== 'all') {
        const id = match[1];
        const movie = movies.find(m => m._id === id) || movies[0];
        return { data: movie };
      }
      return { data: movies };
    }
    
    // Theatres
    if (url.includes('/theatres')) return { data: theatres };
    
    // Shows
    if (url.includes('/shows')) return { data: shows };
    
    // Admin Stats
    if (url.includes('/admin/stats')) {
      return { 
        data: {
          revenue: 12500,
          ticketsSold: 850,
          activeMovies: movies.length,
          totalUsers: users.length,
          totalTheatres: theatres.length,
          revenueTrend: [
            { date: '2023-10-01', dailyRevenue: 1200, dailyTickets: 80 },
            { date: '2023-10-02', dailyRevenue: 1500, dailyTickets: 100 },
            { date: '2023-10-03', dailyRevenue: 900, dailyTickets: 60 },
            { date: '2023-10-04', dailyRevenue: 2100, dailyTickets: 140 },
            { date: '2023-10-05', dailyRevenue: 1800, dailyTickets: 120 },
            { date: '2023-10-06', dailyRevenue: 2500, dailyTickets: 170 },
            { date: '2023-10-07', dailyRevenue: 2500, dailyTickets: 180 },
          ]
        } 
      };
    }
    
    // Bookings
    if (url.includes('/bookings')) return { data: [] };
    
    // Settings
    if (url.includes('/settings')) return { data: { currencySymbol: '$', siteName: 'Dummy Movies' } };
    
    // Users
    if (url.includes('/admin/users') || url.includes('/users')) {
      return { data: { users, totalPages: 1 } };
    }
    
    return { data: {} };
  },
  
  post: async (url, data, config) => {
    await delay(500);
    if (url.includes('/users/login') || url.includes('/users/register')) {
      return { data: dummyAdmin };
    }
    if (url.includes('/users/logout')) {
      return { data: { success: true } };
    }
    if (url.includes('/movies')) return { data: { success: true, movie: movies[0] } };
    if (url.includes('/theatres')) return { data: { success: true, theatre: theatres[0] } };
    if (url.includes('/shows')) return { data: { success: true, show: shows[0] } };
    if (url.includes('/bookings')) return { data: { success: true, booking: { _id: "b1" } } };
    
    return { data: { success: true } };
  },
  
  put: async (url, data, config) => {
    await delay(500);
    return { data: { success: true } };
  },
  
  delete: async (url, config) => {
    await delay(500);
    return { data: { success: true } };
  },
  
  patch: async (url, data, config) => {
    await delay(500);
    return { data: { success: true } };
  }
};

export default apiMock;
