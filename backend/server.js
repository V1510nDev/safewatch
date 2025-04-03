// server.js - Improved SafeWatch backend with security enhancements
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const fuzzysort = require('fuzzysort');

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'safewatch' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3000'
}) );
app.use(express.json());

// Create limiter middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// Apply to all API routes
app.use('/api', apiLimiter);

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
  'fuck', 'shit', 'ass', 'damn', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'whore',
  'slut', 'bastard', 'piss', 'crap', 'hell', 'jerk', 'butt', 'tits', 'boobs', 'penis',
  'vagina', 'sex', 'porn', 'nsfw', 'xxx', 'explicit', 'mature', 'adult', 'swear', 'curse',
  'profanity',
  
  // Violence
  'gore', 'blood', 'death', 'kill', 'murder', 'dead', 'die', 'shot', 'gun', 'knife',
  'weapon', 'fight', 'violent', 'shooting', 'stabbing', 'assault', 'attack', 'beat', 'hit',
  'punch', 'kick', 'slap', 'injury', 'wound', 'hurt', 'pain', 'suffer', 'victim', 'brutal',
  'graphic', 'disturbing', 'accident', 'crash', 'explosion', 'war', 'combat', 'battle',
  'horror', 'terror', 'scary'
];

// Settings storage
// In a real app, you would use a database
const userSettings = new Map() ;

// Content filtering functions
function isVideoAppropriate(video, userIp) {
  // Check direct blocklist
  if (video.id && BLOCKED_VIDEO_IDS.includes(video.id)) {
    logger.info('Video blocked', {
      videoId: video.id,
      reason: 'direct_blocklist',
      userIp
    });
    return false;
  }

  // Check title and description for keywords with fuzzy matching
  if (video.snippet && (video.snippet.title || video.snippet.description)) {
    const text = ((video.snippet.title || '') + ' ' + (video.snippet.description || '')).toLowerCase();
    
    // Split text into words for better matching
    const words = text.split(/\s+/);
    
    for (const keyword of INAPPROPRIATE_KEYWORDS) {
      // Check exact matches first (faster)
      if (text.includes(keyword)) {
        logger.info('Video blocked', {
          videoId: video.id,
          reason: 'keyword_match',
          keyword,
          userIp
        });
        return false;
      }
      
      // Check fuzzy matches with threshold
      for (const word of words) {
        if (word.length > 3) { // Only check words of sufficient length
          const result = fuzzysort.single(keyword, word);
          if (result && result.score > -5) { // Adjust threshold as needed
            logger.info('Video blocked', {
              videoId: video.id,
              reason: 'fuzzy_keyword_match',
              keyword,
              matchedWord: word,
              userIp
            });
            return false;
          }
        }
      }
    }
  }

  // Check for age restrictions
  if (video.contentDetails && video.contentDetails.contentRating) {
    const contentRating = video.contentDetails.contentRating;
    // Check YouTube content rating
    if (contentRating.ytRating === 'ytAgeRestricted') {
      logger.info('Video blocked', {
        videoId: video.id,
        reason: 'age_restricted',
        userIp
      });
      return false;
    }
  }

  // If passed all checks, video is appropriate
  return true;
}

function filterVideos(videos, userIp) {
  if (!Array.isArray(videos)) return [];
  return videos.filter(video => isVideoAppropriate(video, userIp));
}

function isSearchQueryAppropriate(query) {
  if (!query) return true;
  
  const lowerQuery = query.toLowerCase();
  for (const keyword of INAPPROPRIATE_KEYWORDS) {
    if (lowerQuery.includes(keyword)) {
      logger.info('Query blocked', {
        query,
        reason: 'inappropriate_keyword',
        keyword
      });
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

// Parent authentication endpoint
app.post('/api/auth/verify-parent', async (req, res) => {
  try {
    const { password } = req.body;
    const userIp = req.ip;
    
    // In production, you would use a hashed password stored in a database
    // This is a simplified example
    const correctPassword = process.env.PARENT_PASSWORD || 'parent123';
    
    if (password === correctPassword) {
      logger.info('Parent authentication successful', { userIp });
      return res.json({ success: true });
    } else {
      logger.warn('Parent authentication failed', { userIp });
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    logger.error('Error in parent authentication', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
});

// Save settings endpoint
app.post('/api/settings/save', (req, res) => {
  try {
    const { timeLimit, contentFilterLevel, allowedCategories } = req.body;
    const userIp = req.ip;
    
    userSettings.set(userIp, {
      timeLimit,
      contentFilterLevel,
      allowedCategories,
      updatedAt: new Date()
    });
    
    logger.info('Settings saved', {
      userIp,
      settings: { timeLimit, contentFilterLevel, allowedCategories }
    });
    
    return res.json({ success: true });
  } catch (error) {
    logger.error('Error saving settings', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: 'Error saving settings' });
  }
});

// Get settings endpoint
app.get('/api/settings', (req, res) => {
  try {
    const userIp = req.ip;
    const settings = userSettings.get(userIp) || {
      timeLimit: 60,
      contentFilterLevel: 'strict',
      allowedCategories: ['education', 'animation', 'science', 'music']
    };
    
    logger.info('Settings retrieved', { userIp });
    return res.json({ success: true, settings });
  } catch (error) {
    logger.error('Error getting settings', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: 'Error getting settings' });
  }
});

// Search videos
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    const userIp = req.ip;

    // Check if query is appropriate
    if (!isSearchQueryAppropriate(query)) {
      logger.info('Search blocked', {
        query,
        userIp,
        reason: 'inappropriate_query'
      });
      
      return res.status(403).json({ 
        success: false, 
        message: 'Search query contains inappropriate content' 
      });
    }

    // Call YouTube API
    logger.info('Search request', {
      query,
      userIp
    });
    
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
    const filteredVideos = filterVideos(response.data.items, userIp);
    
    logger.info('Search completed', {
      query,
      userIp,
      totalResults: response.data.items.length,
      filteredResults: filteredVideos.length
    });
    
    return res.json({ success: true, videos: filteredVideos });
  } catch (error) {
    logger.error('Search error', {
      error: error.message,
      stack: error.stack
    });
    
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
    const userIp = req.ip;

    // Check if video is in blocklist
    if (BLOCKED_VIDEO_IDS.includes(id)) {
      logger.info('Video details blocked', {
        videoId: id,
        reason: 'direct_blocklist',
        userIp
      });
      
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
      logger.info('Video not found', { videoId: id, userIp });
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const video = response.data.items[0];

    // Check if video is appropriate
    if (!isVideoAppropriate(video, userIp)) {
      return res.status(403).json({ 
        success: false, 
        message: 'This video is not appropriate for children' 
      });
    }

    logger.info('Video details retrieved', { videoId: id, userIp });
    return res.json({ success: true, video });
  } catch (error) {
    logger.error('Error getting video details', {
      error: error.message,
      stack: error.stack,
      videoId: req.params.id
    });
    
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
    const userIp = req.ip;
    
    // Get user settings to apply content filtering level
    const settings = userSettings.get(userIp) || { contentFilterLevel: 'strict' };
    
    logger.info('Popular videos request', { userIp, contentFilterLevel: settings.contentFilterLevel });
    
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
    const filteredVideos = filterVideos(response.data.items, userIp);
    
    logger.info('Popular videos retrieved', {
      userIp,
      totalResults: response.data.items.length,
      filteredResults: filteredVideos.length
    });
    
    return res.json({ success: true, videos: filteredVideos });
  } catch (error) {
    logger.error('Error getting popular videos', {
      error: error.message,
      stack: error.stack
    });
    
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
    const userIp = req.ip;
    
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
    
    logger.info('Categories retrieved', {
      userIp,
      totalCategories: response.data.items.length,
      filteredCategories: filteredCategories.length
    });
    
    return res.json({ success: true, categories: filteredCategories });
  } catch (error) {
    logger.error('Error getting categories', {
      error: error.message,
      stack: error.stack
    });
    
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
    const userIp = req.ip;
    
    // Get user settings
    const settings = userSettings.get(userIp);
    
    // Check if category is allowed for this user
    if (settings && settings.allowedCategories && 
        !settings.allowedCategories.includes(id)) {
      logger.info('Category access blocked', {
        categoryId: id,
        userIp,
        reason: 'category_not_allowed'
      });
      
      return res.status(403).json({ 
        success: false, 
        message: 'This category is not allowed by parental settings' 
      });
    }
    
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
    const filteredVideos = filterVideos(response.data.items, userIp);
    
    logger.info('Category videos retrieved', {
      categoryId: id,
      userIp,
      totalResults: response.data.items.length,
      filteredResults: filteredVideos.length
    });
    
    return res.json({ success: true, videos: filteredVideos });
  } catch (error) {
    logger.error('Error getting category videos', {
      error: error.message,
      stack: error.stack,
      categoryId: req.params.id
    });
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error getting category videos', 
      error: error.response?.data?.error?.message || error.message 
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Direct blocklist enabled for ${BLOCKED_VIDEO_IDS.length} videos`);
  logger.info(`Keyword filtering enabled for ${INAPPROPRIATE_KEYWORDS.length} keywords`);
});
