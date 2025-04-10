import React, { createContext, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import StockList from './StockList';
import StockDetail from './StockDetail';
import EconomicData from './EconomicData';
import CryptoData from './CryptoData';
import { updateTheme } from './utils/themeManager';
import './App.css';

export const ThemeContext = createContext();

function App() {
  const [themeColor, setThemeColor] = useState(() =>
    localStorage.getItem('themeColor') || 'blue'
  );
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem('isDarkMode') === 'true'
  );

  useEffect(() => {
    updateTheme(themeColor, isDarkMode);
  }, [themeColor, isDarkMode]);

  const updateAppTheme = (color, darkMode) => {
    setThemeColor(color);
    setIsDarkMode(darkMode);
    localStorage.setItem('themeColor', color);
    localStorage.setItem('isDarkMode', darkMode);
  };

  return (
    <ThemeContext.Provider value={{ themeColor, isDarkMode, updateAppTheme }}>
      <div className={`App ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
        <Routes>
          <Route path="/" element={<StockList />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/economic-data" element={<EconomicData />} />
          <Route path="/crypto-data" element={<CryptoData />} />
        </Routes>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
