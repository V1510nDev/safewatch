import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

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

export default {
  getPopularVideos,
  searchVideos,
  getVideoDetails,
  getCategories,
  getCategoryVideos
};
