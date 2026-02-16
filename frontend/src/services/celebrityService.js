import api from './api';

export const getCelebrities = async () => {
  const response = await api.get('/celebrities');
  return response.data;
};

export const createCelebrity = async (data) => {
  const isFormData = data instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.post('/celebrities', data, config);
  return response.data;
};

export const updateCelebrity = async (id, data) => {
  const isFormData = data instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.put(`/celebrities/${id}`, data, config);
  return response.data;
};

export const deleteCelebrity = async (id) => {
    const response = await api.delete(`/celebrities/${id}`);
    return response.data;
};