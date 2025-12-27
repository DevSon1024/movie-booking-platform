import api from './api';

export const getShows = async (filters = {}) => {
  // Convert object { movieId: '123' } to query string ?movieId=123
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/shows?${params}`);
  return response.data;
};

export const createShow = async (showData) => {
  const response = await api.post('/shows', showData);
  return response.data;
};

export const deleteShow = async (id) => {
    const response = await api.delete(`/shows/${id}`);
    return response.data;
};