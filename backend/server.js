// server.js - Simplified SafeWatch backend
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3000'
}));
app.use(express.json());

// YouTube API key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Direct blocklist for known problematic videos
const BLOCKED_VIDEO_IDS = [
  'jIqWSbIbxn0', // Graphic violence example
  'gkpXk_15xdI'  // Profanity example
];

// Inappropriate content keywords
const INAPPROPRIATE_KEYWORDS = [
  // Profanity
  'fuck', 'shit', 'ass', 'damn', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 
  'whore', 'slut', 'bastard', 'piss', 'crap', 'hell', 'jerk', 'butt', 
  'tits', 'boobs', 'penis', 'vagina', 'sex', 'porn', 'nsfw', 'xxx',
  'explicit', 'mature', 'adult', 'swear', 'curse', 'profanity',
  
  // Violence
  'gore', 'blood', 'death', 'kill', 'murder', 'dead', 'die', 'shot', 'gun', 
  'knife', 'weapon', 'fight', 'violent', 'shooting', 'stabbing', 'assault',
  'attack', 'beat', 'hit', 'punch', 'kick', 'slap', 'injury', 'wound', 'hurt',
  'pain', 'suffer', 'victim', 'brutal', 'graphic', 'disturbing', 'accident',
  'crash', 'explosion', 'war', 'combat', 'battle', 'horror', 'terror', 'scary'
];

// Content filtering functions
function isVideoAppropriate(video) {
  // Check direct blocklist
  if (video.id && BLOCKED_VIDEO_IDS.includes(video.id)) {
    console.log(`Video ${video.id} blocked: In direct blocklist`);
    return false;
  }

  // Check title and description for keywords
  if (video.snippet && (video.snippet.title || video.snippet.description)) {
    const text = ((video.snippet.title || '') + ' ' + (video.snippet.description || '')).toLowerCase();
    
    for (const keyword of INAPPROPRIATE_KEYWORDS) {
      if (text.includes(keyword)) {
        console.log(`Video ${video.id} blocked: Contains inappropriate keyword "${keyword}"`);
        return false;
      }
    }
  }

  // Check for age restrictions
  if (video.contentDetails && video.contentDetails.contentRating) {
    const contentRating = video.contentDetails.contentRating;
    
    // Check YouTube content rating
    if (contentRating.ytRating === 'ytAgeRestricted') {
      console.log(`Video ${video.id} blocked: Age restricted by YouTube`);
      return false;
    }
  }

  // If passed all checks, video is appropriate
  return true;
}

function filterVideos(videos) {
  if (!Array.isArray(videos)) return [];
  return videos.filter(video => isVideoAppropriate(video));
}

function isSearchQueryAppropriate(query) {
  if (!query) return true;
  
  const lowerQuery = query.toLowerCase();
  
  for (const keyword of INAPPROPRIATE_KEYWORDS) {
    if (lowerQuery.includes(keyword)) {
      console.log(`Query blocked: Contains inappropriate keyword "${keyword}"`);
      return false;
    }
  }
  
  return true;
}

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Search videos
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    // Check if query is appropriate
    if (!isSearchQueryAppropriate(query)) {
      return res.status(403).json({
        success: false,
        message: 'Search query contains inappropriate content'
      });
    }
    
    // Call YouTube API
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 25,
        q: query,
        type: 'video',
        safeSearch: 'strict',
        key: YOUTUBE_API_KEY
      }
    });
    
    // Filter videos
    const filteredVideos = filterVideos(response.data.items);
    
    return res.json({
      success: true,
      videos: filteredVideos
    });
  } catch (error) {
    console.error('Error searching videos:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error searching videos',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Get video details
app.get('/api/video/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if video is in blocklist
    if (BLOCKED_VIDEO_IDS.includes(id)) {
      return res.status(403).json({
        success: false,
        message: 'This video is not appropriate for children'
      });
    }
    
    // Call YouTube API
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id,
        key: YOUTUBE_API_KEY
      }
    });
    
    // Check if video exists
    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    const video = response.data.items[0];
    
    // Check if video is appropriate
    if (!isVideoAppropriate(video)) {
      return res.status(403).json({
        success: false,
        message: 'This video is not appropriate for children'
      });
    }
    
    return res.json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Error getting video details:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error getting video details',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Get popular videos
app.get('/api/popular', async (req, res) => {
  try {
    // Call YouTube API
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        chart: 'mostPopular',
        maxResults: 25,
        videoCategoryId: '10', // Music category
        regionCode: 'US',
        safeSearch: 'strict',
        key: YOUTUBE_API_KEY
      }
    });
    
    // Filter videos
    const filteredVideos = filterVideos(response.data.items);
    
    return res.json({
      success: true,
      videos: filteredVideos
    });
  } catch (error) {
    console.error('Error getting popular videos:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error getting popular videos',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Get video categories
app.get('/api/categories', async (req, res) => {
  try {
    // Call YouTube API
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videoCategories`, {
      params: {
        part: 'snippet',
        regionCode: 'US',
        key: YOUTUBE_API_KEY
      }
    });
    
    // Filter out inappropriate categories
    const filteredCategories = response.data.items.filter(category => {
      const title = category.snippet.title.toLowerCase();
      return !INAPPROPRIATE_KEYWORDS.some(keyword => title.includes(keyword));
    });
    
    return res.json({
      success: true,
      categories: filteredCategories
    });
  } catch (error) {
    console.error('Error getting categories:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error getting categories',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Get videos by category
app.get('/api/category/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Call YouTube API
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        chart: 'mostPopular',
        maxResults: 25,
        videoCategoryId: id,
        regionCode: 'US',
        safeSearch: 'strict',
        key: YOUTUBE_API_KEY
      }
    });
    
    // Filter videos
    const filteredVideos = filterVideos(response.data.items);
    
    return res.json({
      success: true,
      videos: filteredVideos
    });
  } catch (error) {
    console.error('Error getting category videos:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error getting category videos',
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Direct blocklist enabled for ${BLOCKED_VIDEO_IDS.length} videos`);
  console.log(`Keyword filtering enabled for ${INAPPROPRIATE_KEYWORDS.length} keywords`);
});
