import api from './api';

// Fetch dashboard analytics
export const getAdminStats = async (startDate, endDate) => {
  let query = '';
  if (startDate && endDate) {
    query = `?startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await api.get(`/admin/stats${query}`);
  return response.data;
};