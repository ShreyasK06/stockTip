import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBitcoin, FaNewspaper, FaChartLine } from 'react-icons/fa';
import CryptoList from './components/CryptoList';
import { ThemeContext } from './App';
import './styles/CryptoData.css';
import './styles/CryptoCard.css';
import './styles/MarketNews.css';
import './styles/CryptoSection.css';
import './styles/PersonalizationButton.css';

function CryptoData() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Theme toggle button component
  const ThemeToggleButton = () => {
    const { isDarkMode, updateAppTheme } = useContext(ThemeContext);

    const toggleTheme = () => {
      updateAppTheme('blue', !isDarkMode);
    };

    return (
      <div className="theme-toggle-wrapper">
        <button
          className={`theme-toggle-button ${isDarkMode ? 'dark' : 'light'}`}
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
        >
          <div className="toggle-track">
            <div className="toggle-indicator">
              <span className="toggle-icon">
                {isDarkMode ? '🌙' : '☀️'}
              </span>
            </div>
          </div>
        </button>
      </div>
    );
  };

  return (
    <div id="top" className="crypto-data-container">
      <ThemeToggleButton />
      <div className="crypto-data-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="header-content">
          <h1>Cryptocurrency Data</h1>
          <p>Real-time cryptocurrency exchange rates and market information</p>
        </div>
      </div>

      <div className="section-navigation">
        <button onClick={() => scrollToSection('rates')} className="section-nav-item">
          <span className="section-nav-icon">💰</span> Crypto Cards
        </button>
        <button onClick={() => scrollToSection('news')} className="section-nav-item">
          <span className="section-nav-icon">📰</span> Crypto News
        </button>
        <button onClick={() => scrollToSection('analysis')} className="section-nav-item">
          <span className="section-nav-icon">🤖</span> AI Analysis
        </button>
      </div>

      <div className="crypto-data-content">
        <h2 id="rates" className="section-title">Cryptocurrency Cards</h2>
        <div className="crypto-cards-section">
          <CryptoList />
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="news" className="section-title">Crypto News</h2>
        <div className="crypto-news-section">
          <div className="news-header">
            <FaNewspaper className="section-icon" />
            <h3>Latest Cryptocurrency News</h3>
          </div>
          <div className="news-list">
            <div className="news-item">
              <h4>Bitcoin Surges Past $60,000 as Institutional Interest Grows</h4>
              <p>Bitcoin has surged past $60,000 as institutional investors continue to show interest in the cryptocurrency. The move comes as more companies add Bitcoin to their balance sheets.</p>
              <a href="#">Read more</a>
            </div>
            <div className="news-item">
              <h4>Ethereum 2.0 Upgrade on Track for Q3 Completion</h4>
              <p>The Ethereum 2.0 upgrade is on track for completion in Q3, according to developers. The upgrade will move Ethereum from proof-of-work to proof-of-stake, significantly reducing energy consumption.</p>
              <a href="#">Read more</a>
            </div>
            <div className="news-item">
              <h4>Regulatory Clarity Coming for Cryptocurrencies, Says SEC Chair</h4>
              <p>The SEC Chair has indicated that regulatory clarity for cryptocurrencies is coming soon. This could provide a clearer framework for crypto companies to operate within.</p>
              <a href="#">Read more</a>
            </div>
          </div>
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="analysis" className="section-title">AI Market Analysis</h2>
        <div className="crypto-analysis-section">
          <div className="ai-insight-header">
            <FaChartLine className="section-icon" />
            <h3>AI-Powered Market Analysis</h3>
          </div>
          <div className="ai-insight-content">
            <p>The cryptocurrency market is showing signs of a bullish trend in the medium term. Bitcoin's recent price action suggests accumulation by long-term holders, which historically precedes upward movements. Ethereum continues to show strength with increasing network activity and decreasing supply on exchanges.</p>
            <p>Altcoins are displaying mixed signals, with layer-1 protocols outperforming DeFi tokens. Market sentiment analysis indicates cautious optimism among retail investors, while institutional interest remains strong based on derivatives market data.</p>
            <p>Key resistance levels to watch include $65,000 for Bitcoin and $3,500 for Ethereum. A breakthrough above these levels could trigger a broader market rally. Conversely, support levels at $52,000 and $2,800 respectively should hold to maintain the current bullish structure.</p>
          </div>
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>
      </div>
    </div>
  );
}

export default CryptoData;
