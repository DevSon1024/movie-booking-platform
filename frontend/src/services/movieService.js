import api from './api';

// Admin: Fetch all movies with search & sort
export const getAdminMovies = async (keyword = '', sort = '') => {
  const response = await api.get(`/movies/all?keyword=${keyword}&sort=${sort}`);
  return response.data;
};

// Admin: Create Movie
export const createMovie = async (movieData) => {
  const config = movieData instanceof FormData
    ? { headers: { 'Content-Type': undefined } }
    : { headers: { 'Content-Type': 'application/json' } };
  const response = await api.post('/movies', movieData, config);  return response.data;
};

// Admin: Update Movie
export const updateMovie = async (id, movieData) => {
  const config = {
    headers: {
      'Content-Type': movieData instanceof FormData ? 'multipart/form-data' : 'application/json',
    },
  };
  const response = await api.put(`/movies/${id}`, movieData, config);
  return response.data;
};

// Admin: Soft Delete Movie
export const deleteMovie = async (id) => {
  const response = await api.delete(`/movies/${id}`);
  return response.data;
};