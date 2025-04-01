import React from 'react';
import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  if (!video || !video.snippet) {
    return null;
  }

  const { id, snippet } = video;
  const videoId = typeof id === 'object' ? id.videoId : id;
  
  return (
    <Link to={`/video/${videoId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="video-card">
        <img 
          src={snippet.thumbnails.medium.url} 
          alt={snippet.title} 
          className="video-thumbnail" 
        />
        <div className="video-info">
          <h3 className="video-title">{snippet.title}</h3>
          <p className="video-channel">{snippet.channelTitle}</p>
          <div className="video-stats">
            <span className="video-date">
              {new Date(snippet.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
