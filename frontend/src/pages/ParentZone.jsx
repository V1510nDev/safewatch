import React, { useState } from 'react';

const ParentZone = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    timeLimit: 60, // minutes
    contentFilterLevel: 'strict',
    allowedCategories: ['education', 'animation', 'science', 'music', 'gaming']
  });

  // Default parent password
  const PARENT_PASSWORD = 'parent123';

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (password === PARENT_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle checkbox changes for allowed categories
      if (checked) {
        setSettings({
          ...settings,
          allowedCategories: [...settings.allowedCategories, name]
        });
      } else {
        setSettings({
          ...settings,
          allowedCategories: settings.allowedCategories.filter(cat => cat !== name)
        });
      }
    } else {
      // Handle other input changes
      setSettings({
        ...settings,
        [name]: value
      });
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    // In a real app, we would save these settings to localStorage or a backend
    // For this simplified version, we'll just show a success message
    alert('Settings saved successfully!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  return (
    <div className="parent-zone">
      <h2 className="parent-zone-header">Parent Zone</h2>
      
      {!isAuthenticated ? (
        <div className="parent-login">
          <p>This area is for parents only. Please enter the parent password to continue.</p>
          <p>Default password: parent123</p>
          
          <form onSubmit={handleLogin} className="parent-zone-form">
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password:</label>
              <input
                type="password"
                id="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="form-button">Login</button>
          </form>
        </div>
      ) : (
        <div className="parent-settings">
          <h3>Parental Control Settings</h3>
          
          <form onSubmit={handleSaveSettings} className="parent-zone-form">
            <div className="form-group">
              <label htmlFor="timeLimit" className="form-label">Daily Time Limit (minutes):</label>
              <input
                type="number"
                id="timeLimit"
                name="timeLimit"
                className="form-input"
                value={settings.timeLimit}
                onChange={handleSettingsChange}
                min="5"
                max="240"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contentFilterLevel" className="form-label">Content Filter Level:</label>
              <select
                id="contentFilterLevel"
                name="contentFilterLevel"
                className="form-input"
                value={settings.contentFilterLevel}
                onChange={handleSettingsChange}
              >
                <option value="strict">Strict (Recommended for kids under 8)</option>
                <option value="moderate">Moderate (Recommended for kids 8-12)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Allowed Categories:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <input
                    type="checkbox"
                    id="education"
                    name="education"
                    checked={settings.allowedCategories.includes('education')}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="education"> Education</label>
                </div>
                
                <div>
                  <input
                    type="checkbox"
                    id="animation"
                    name="animation"
                    checked={settings.allowedCategories.includes('animation')}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="animation"> Animation</label>
                </div>
                
                <div>
                  <input
                    type="checkbox"
                    id="science"
                    name="science"
                    checked={settings.allowedCategories.includes('science')}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="science"> Science & Technology</label>
                </div>
                
                <div>
                  <input
                    type="checkbox"
                    id="music"
                    name="music"
                    checked={settings.allowedCategories.includes('music')}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="music"> Music</label>
                </div>
                
                <div>
                  <input
                    type="checkbox"
                    id="gaming"
                    name="gaming"
                    checked={settings.allowedCategories.includes('gaming')}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="gaming"> Gaming</label>
                </div>
                
                <div>
                  <input
                    type="checkbox"
                    id="sports"
                    name="sports"
                    checked={settings.allowedCategories.includes('sports')}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="sports"> Sports</label>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="form-button">Save Settings</button>
              <button type="button" className="form-button" onClick={handleLogout} style={{ backgroundColor: '#f44336' }}>Logout</button>
            </div>
          </form>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Blocked Videos</h3>
            <p>The following videos are explicitly blocked:</p>
            <ul>
              <li>Video ID: jIqWSbIbxn0 (Contains graphic content)</li>
              <li>Video ID: gkpXk_15xdI (Contains profanity)</li>
            </ul>
            <p>Additionally, any videos containing inappropriate keywords or content will be automatically blocked.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentZone;
