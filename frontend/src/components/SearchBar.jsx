import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Basic client-side filtering for inappropriate search terms
    const inappropriateTerms = [
      'porn', 'sex', 'nude', 'naked', 'xxx', 'adult',
      'gore', 'blood', 'death', 'kill', 'murder', 'violent'
    ];
    
    const lowerQuery = query.toLowerCase();
    
    // Check if query contains inappropriate terms
    for (const term of inappropriateTerms) {
      if (lowerQuery.includes(term)) {
        setError('Sorry, that search isn\'t allowed. Please try something else.');
        return;
      }
    }
    
    // Clear any previous errors
    setError('');
    
    // Navigate to search page with query
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search for kid-friendly videos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default SearchBar;
