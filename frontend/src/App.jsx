import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import VideoPage from './pages/VideoPage';
import CategoryPage from './pages/CategoryPage';
import ParentZone from './pages/ParentZone';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/video/:id" element={<VideoPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/parent" element={<ParentZone />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
