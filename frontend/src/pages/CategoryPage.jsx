import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import { getCategoryVideos } from '../services/api';

const CategoryPage = () => {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);
  const [categoryTitle, setCategoryTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryVideos = async () => {
      try {
        setLoading(true);
        setError('');
        
        const data = await getCategoryVideos(id);
        setVideos(data.videos || []);
        
        // Set category title if available
        if (data.videos && data.videos.length > 0) {
          setCategoryTitle(data.videos[0].snippet.categoryTitle || `Category ${id}`);
        } else {
          setCategoryTitle(`Category ${id}`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching category videos:', err);
        setError('Something went wrong. Please try again later.');
        setLoading(false);
      }
    };

    fetchCategoryVideos();
  }, [id]);

  return (
    <div className="category-page">
      <h2>{categoryTitle} Videos</h2>
      
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
            <p>No videos found in this category.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
