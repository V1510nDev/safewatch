import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'white' }}>
          Safe<span>Watch</span> 🔍
        </Link>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/search" 
            className={`nav-item ${location.pathname === '/search' ? 'active' : ''}`}
          >
            Search
          </Link>
          <Link 
            to="/parent" 
            className={`nav-item ${location.pathname === '/parent' ? 'active' : ''}`}
          >
            Parent Zone
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
