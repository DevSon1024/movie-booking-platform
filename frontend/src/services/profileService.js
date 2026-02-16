import api from '../services/api';

/**
 * Get current user profile
 */
export const getProfile = async () => {
  try {
    const { data } = await api.get('/users/profile');
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData) => {
  try {
    const { data } = await api.put('/users/profile', profileData);
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (passwordData) => {
  try {
    const { data } = await api.put('/users/password', passwordData);
    return data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};
