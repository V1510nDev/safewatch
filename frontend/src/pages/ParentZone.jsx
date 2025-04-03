import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ParentZone = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    timeLimit: 60,
    contentFilterLevel: 'strict',
    allowedCategories: {
      education: true,
      animation: true,
      science: true,
      music: true,
      gaming: false
    }
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data.success) {
          setSettings(response.data.settings);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchSettings();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/verify-parent', { password });
      if (response.data.success) {
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError('Authentication error');
      console.error('Login error:', err);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      // Handle checkbox changes for allowed categories
      setSettings({
        ...settings,
        allowedCategories: {
          ...settings.allowedCategories,
          [name]: checked
        }
      });
    } else {
      // Handle other input changes
      setSettings({
        ...settings,
        [name]: value
      });
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/settings/save', { 
        timeLimit: settings.timeLimit, 
        contentFilterLevel: settings.contentFilterLevel,
        allowedCategories: settings.allowedCategories 
      });
      
      if (response.data.success) {
        setSettingsSaved(true);
        setSettingsError('');
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (err) {
      setSettingsError('Failed to save settings');
      console.error('Settings save error:', err);
    }
  };

  return (
    <div className="parent-zone">
      <h2 className="parent-zone-header">Parent Zone</h2>

      {!isAuthenticated ? (
        <div>
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
                    checked={settings.allowedCategories.education}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="education"> Education</label>
                </div>

                <div>
                  <input
                    type="checkbox"
                    id="animation"
                    name="animation"
                    checked={settings.allowedCategories.animation}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="animation"> Animation</label>
                </div>

                <div>
                  <input
                    type="checkbox"
                    id="science"
                    name="science"
                    checked={settings.allowedCategories.science}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="science"> Science</label>
                </div>

                <div>
                  <input
                    type="checkbox"
                    id="music"
                    name="music"
                    checked={settings.allowedCategories.music}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="music"> Music</label>
                </div>

                <div>
                  <input
                    type="checkbox"
                    id="gaming"
                    name="gaming"
                    checked={settings.allowedCategories.gaming}
                    onChange={handleSettingsChange}
                  />
                  <label htmlFor="gaming"> Gaming</label>
                </div>
              </div>
            </div>

            {settingsSaved && <div className="success-message">Settings saved successfully!</div>}
            {settingsError && <div className="error-message">{settingsError}</div>}

            <div className="form-actions">
              <button type="submit" className="form-button">Save Settings</button>
              <button type="button" className="form-button secondary" onClick={handleLogout}>Logout</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ParentZone;
