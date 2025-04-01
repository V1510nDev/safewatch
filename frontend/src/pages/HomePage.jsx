import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import VideoCard from '../components/VideoCard';
import { getPopularVideos, getCategories, getCategoryVideos } from '../services/api';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch popular videos on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const popularData = await getPopularVideos();
        setVideos(popularData.videos || []);
        
        const categoriesData = await getCategories();
        setCategories(categoriesData.categories || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Something went wrong. Please try again later.');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch videos when category changes
  useEffect(() => {
    const fetchCategoryVideos = async () => {
      if (!selectedCategory) return;
      
      try {
        setLoading(true);
        const data = await getCategoryVideos(selectedCategory.id);
        setVideos(data.videos || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching category videos:', err);
        setError('Something went wrong. Please try again later.');
        setLoading(false);
      }
    };

    fetchCategoryVideos();
  }, [selectedCategory]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="home-page">
      <SearchBar />
      
      {/* Categories */}
      <div className="categories">
        <button 
          className={`category-button ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </button>
        {categories.map(category => (
          <button 
            key={category.id}
            className={`category-button ${selectedCategory?.id === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category.snippet.title}
          </button>
        ))}
      </div>
      
      {/* Featured Section */}
      <h2>{selectedCategory ? selectedCategory.snippet.title : 'Featured Videos'}</h2>
      
      {/* Loading State */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}
      
      {/* Error State */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Videos Grid */}
      {!loading && !error && (
        <div className="video-grid">
          {videos.length > 0 ? (
            videos.map(video => (
              <VideoCard key={typeof video.id === 'object' ? video.id.videoId : video.id} video={video} />
            ))
          ) : (
            <p>No videos found. Try another category.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
