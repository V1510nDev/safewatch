import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import VideoCard from '../components/VideoCard';
import { searchVideos } from '../services/api';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;
      
      try {
        setLoading(true);
        setError('');
        
        const data = await searchVideos(query);
        setVideos(data.videos || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error searching videos:', err);
        
        if (err.response && err.response.status === 403) {
          setError('This search contains inappropriate content and is not allowed.');
        } else {
          setError('Something went wrong. Please try again later.');
        }
        
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="search-page">
      <SearchBar />
      
      <h2>Search Results for: {query}</h2>
      
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
            <p>No videos found for "{query}". Try a different search term.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
