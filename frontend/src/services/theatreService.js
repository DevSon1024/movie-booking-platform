import api from './api';

// Get all theatres
export const getTheatres = async () => {
  const response = await api.get('/theatres');
  return response.data;
};

// Create theatre
export const createTheatre = async (theatreData) => {
  const response = await api.post('/theatres', theatreData);
  return response.data;
};

// Update theatre
export const updateTheatre = async (id, theatreData) => {
  const response = await api.put(`/theatres/${id}`, theatreData);
  return response.data;
};

// Delete theatre
export const deleteTheatre = async (id) => {
  const response = await api.delete(`/theatres/${id}`);
  return response.data;
};