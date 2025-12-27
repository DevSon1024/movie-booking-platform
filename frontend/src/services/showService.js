import api from './api';

export const getShows = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/shows?${params}`);
  return response.data;
};

export const createShow = async (showData) => {
  const response = await api.post('/shows', showData);
  return response.data;
};

export const updateShow = async (id, showData) => {
  const response = await api.put(`/shows/${id}`, showData);
  return response.data;
};

export const cancelShow = async (id, reason = '') => {
  const response = await api.patch(`/shows/${id}/cancel`, { reason });
  return response.data;
};

export const deleteShow = async (id) => {
  const response = await api.delete(`/shows/${id}`);
  return response.data;
};
