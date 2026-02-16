import api from './api';

/**
 * Get all users with pagination and search
 */
export const getAllUsers = async (page = 1, search = '') => {
  try {
    const { data } = await api.get(`/admin/users`, {
      params: { page, limit: 20, search },
    });
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get user details by ID
 */
export const getUserDetails = async (userId) => {
  try {
    const { data } = await api.get(`/admin/users/${userId}`);
    return data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (userId) => {
  try {
    const { data } = await api.get(`/admin/users/${userId}/stats`);
    return data;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  try {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Update user
 */
export const updateUser = async (userId, userData) => {
  try {
    const { data } = await api.put(`/admin/users/${userId}`, userData);
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
