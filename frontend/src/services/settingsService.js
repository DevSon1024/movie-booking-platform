import api from './api';

export const fetchSettingsAPI = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettingsAPI = async (data) => {
  const response = await api.put('/settings', data);
  return response.data;
};