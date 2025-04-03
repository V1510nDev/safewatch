import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
}) ;

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // You could add auth tokens here in a real app
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle session timeouts or auth errors here
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      console.error('Authentication error');
    }
    return Promise.reject(error);
  }
);

// Get popular videos for homepage
export const getPopularVideos = async () => {
  try {
    const response = await api.get('/popular');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular videos:', error);
    throw error;
  }
};

// Search videos
export const searchVideos = async (query) => {
  try {
    const response = await api.get('/search', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
};

// Get video details
export const getVideoDetails = async (videoId) => {
  try {
    const response = await api.get(`/video/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
};

// Get video categories
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get videos by category
export const getCategoryVideos = async (categoryId) => {
  try {
    const response = await api.get(`/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category videos:', error);
    throw error;
  }
};

// Get user settings
export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

// Save user settings
export const saveSettings = async (settings) => {
  try {
    const response = await api.post('/settings/save', settings);
    return response.data;
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// Verify parent password
export const verifyParentPassword = async (password) => {
  try {
    const response = await api.post('/auth/verify-parent', { password });
    return response.data;
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
};

export default {
  getPopularVideos,
  searchVideos,
  getVideoDetails,
  getCategories,
  getCategoryVideos,
  getSettings,
  saveSettings,
  verifyParentPassword
};
