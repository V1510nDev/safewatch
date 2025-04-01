import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVideoDetails } from '../services/api';
import VideoCard from '../components/VideoCard';

const VideoPage = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const data = await getVideoDetails(id);
        setVideo(data.video);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching video details:', err);
        
        if (err.response && err.response.status === 403) {
          setError('This video contains inappropriate content and is not allowed.');
        } else {
          setError('Something went wrong. Please try again later.');
        }
        
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="video-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-page">
        <div className="error-message">
          <h3>{error}</h3>
          <p>This video may not be appropriate for children.</p>
          <Link to="/" className="form-button" style={{ display: 'inline-block', marginTop: '20px' }}>
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="video-page">
        <div className="error-message">
          <h3>Video not found</h3>
          <Link to="/" className="form-button" style={{ display: 'inline-block', marginTop: '20px' }}>
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="video-page">
      <div className="video-player-container">
        <iframe
          className="video-player"
          src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
          title={video.snippet.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      
      <div className="video-details">
        <h1 className="video-player-title">{video.snippet.title}</h1>
        <p className="video-player-channel">{video.snippet.channelTitle}</p>
        <p className="video-player-description">{video.snippet.description}</p>
      </div>
    </div>
  );
};

export default VideoPage;
