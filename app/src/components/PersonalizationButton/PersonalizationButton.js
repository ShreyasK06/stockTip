import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaCog } from 'react-icons/fa';
import './PersonalizationButton.css';

const PersonalizationModal = ({ onClose, themeColor, setThemeColor, isDarkMode, setIsDarkMode }) => {
  const getThemeColor = (color) => {
    const colors = {
      blue: '#61dafb',
      green: '#4CAF50',
      red: '#f44336',
      yellow: '#ffeb3b'
    };
    return colors[color] || colors.blue;
  };

  const handleThemeColorChange = (color) => {
    setThemeColor(color);
    localStorage.setItem('themeColor', color);
    document.documentElement.style.setProperty('--primary-color', getThemeColor(color));
  };

  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', newMode);
    document.body.className = newMode ? 'dark-theme' : 'light-theme';
  };

  return ReactDOM.createPortal(
    <div className="modal-container">
      <div className="modal-overlay" onClick={onClose} />
      <div className={`personalization-modal ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Personalization</h3>

        <div className="color-options">
          {['blue', 'green', 'red', 'yellow'].map(color => (
            <div
              key={color}
              className={`color-option ${themeColor === color ? 'selected' : ''}`}
              style={{
                background: getThemeColor(color),
                color: ['yellow'].includes(color) ? '#000' : '#fff'
              }}
              onClick={() => handleThemeColorChange(color)}
            >
              {color}
            </div>
          ))}
        </div>

        <button
          className="theme-toggle"
          onClick={handleThemeToggle}
          style={{ backgroundColor: getThemeColor(themeColor) }}
        >
          Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div>
    </div>,
    document.body
  );
};

const PersonalizationButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const timeoutRef = useRef(null);
  
  // Initialize from localStorage with fallbacks
  const [themeColor, setThemeColor] = useState(() => 
    localStorage.getItem('themeColor') || 'blue'
  );
  
  const [isDarkMode, setIsDarkMode] = useState(() => 
    localStorage.getItem('isDarkMode') === 'true'
  );

  // Initialize theme on component mount
  useEffect(() => {
    const savedThemeColor = localStorage.getItem('themeColor') || 'blue';
    const savedDarkMode = localStorage.getItem('isDarkMode') === 'true';
    
    setThemeColor(savedThemeColor);
    setIsDarkMode(savedDarkMode);
    
    // Apply the saved theme
    document.body.className = savedDarkMode ? 'dark-theme' : 'light-theme';
    document.documentElement.style.setProperty('--primary-color', getThemeColor(savedThemeColor));
  }, []);

  const getThemeColor = (color) => {
    const colors = {
      blue: '#61dafb',
      green: '#4CAF50',
      red: '#f44336',
      yellow: '#ffeb3b'
    };
    return colors[color] || colors.blue;
  };

  const hideButton = () => {
    if (!isModalOpen) {
      setIsVisible(false);
    }
  };

  const showButton = () => {
    setIsVisible(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(hideButton, 2000);
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        setIsButtonVisible(false);
      } else {
        setIsButtonVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    timeoutRef.current = setTimeout(hideButton, 2000);
    document.addEventListener('mousemove', showButton);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousemove', showButton);
    };
  }, [isModalOpen]);

  return (
    <div 
      className={`personalization-wrapper ${isVisible ? 'visible' : 'hidden'} ${isButtonVisible ? 'visible' : 'hidden'}`}
      onMouseEnter={showButton}
    >
      <button
        type="button"
        className={`personalization-button ${isDarkMode ? 'dark-theme' : 'light-theme'}`}
        onClick={() => setIsModalOpen(true)}
        aria-label="Open personalization settings"
        style={{ borderColor: `${getThemeColor(themeColor)}40` }}
      >
        <FaCog 
          size={20} 
          style={{ color: getThemeColor(themeColor) }}
        />
      </button>

      {isModalOpen && (
        <PersonalizationModal
          onClose={() => setIsModalOpen(false)}
          themeColor={themeColor}
          setThemeColor={setThemeColor}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      )}
    </div>
  );
};

export default PersonalizationButton;












