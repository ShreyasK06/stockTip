import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaOilCan, FaNewspaper, FaPercentage } from 'react-icons/fa';
import EconomicIndicators from './components/EconomicIndicators';
import { fetchMarketNews } from './server';
import { ThemeContext } from './App';
import './styles/EconomicData.css';
import './styles/EconomicIndicators.css';
import './styles/MarketNews.css';
import './styles/PersonalizationButton.css';

function EconomicData() {
  const navigate = useNavigate();
  const [marketNews, setMarketNews] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    const getMarketNews = async () => {
      try {
        setIsLoadingNews(true);
        const response = await fetchMarketNews();
        setMarketNews(response.data || []);
      } catch (error) {
        console.error('Error fetching market news:', error);
      } finally {
        setIsLoadingNews(false);
      }
    };

    getMarketNews();
  }, []);

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
    <div id="top" className="economic-data-container">
      <ThemeToggleButton />
      <div className="economic-data-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="header-content">
          <h1>Economic Data</h1>
          <p>Key economic indicators and market trends</p>
        </div>
      </div>

      <div className="section-navigation">
        <button onClick={() => scrollToSection('indicators')} className="section-nav-item">
          <span className="section-nav-icon">📈</span> Economic Indicators
        </button>
        <button onClick={() => scrollToSection('interest')} className="section-nav-item">
          <span className="section-nav-icon">🏦</span> Interest Rates
        </button>
        <button onClick={() => scrollToSection('cpi')} className="section-nav-item">
          <span className="section-nav-icon">💳</span> CPI
        </button>
        <button onClick={() => scrollToSection('oil')} className="section-nav-item">
          <span className="section-nav-icon">⛽</span> Crude Oil
        </button>
        <button onClick={() => scrollToSection('news')} className="section-nav-item">
          <span className="section-nav-icon">📰</span> Market News
        </button>
      </div>

      <div className="economic-data-content">
        <h2 id="indicators" className="section-title">Economic Indicators</h2>
        <div className="economic-section">
          <EconomicIndicators />
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="interest" className="section-title">Interest Rates</h2>
        <div className="economic-section">
          <div className="economic-indicator-header">
            <FaPercentage className="indicator-icon" />
            <h3>Federal Reserve Interest Rates</h3>
          </div>
          <div className="interest-rates-container">
            <div className="interest-rate-card">
              <div className="rate-title">Federal Funds Rate</div>
              <div className="rate-value">5.25%</div>
              <div className="rate-change positive">+0.25% from previous</div>
              <div className="rate-date">Last updated: June 14, 2023</div>
            </div>
            <div className="interest-rate-card">
              <div className="rate-title">Prime Rate</div>
              <div className="rate-value">8.50%</div>
              <div className="rate-change positive">+0.25% from previous</div>
              <div className="rate-date">Last updated: June 14, 2023</div>
            </div>
            <div className="interest-rate-card">
              <div className="rate-title">30-Year Fixed Mortgage</div>
              <div className="rate-value">6.78%</div>
              <div className="rate-change negative">-0.12% from previous</div>
              <div className="rate-date">Last updated: July 1, 2023</div>
            </div>
            <div className="interest-rate-card">
              <div className="rate-title">10-Year Treasury Yield</div>
              <div className="rate-value">3.82%</div>
              <div className="rate-change negative">-0.05% from previous</div>
              <div className="rate-date">Last updated: July 5, 2023</div>
            </div>
          </div>
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="cpi" className="section-title">Consumer Price Index (CPI)</h2>
        <div className="economic-section">
          <div className="economic-indicator-header">
            <FaMoneyBillWave className="indicator-icon" />
            <h3>Consumer Price Index</h3>
          </div>
          <div className="cpi-container">
            <div className="cpi-chart">
              <div className="chart-placeholder">
                <div className="chart-bar" style={{ height: '60%' }}><span>Jan</span></div>
                <div className="chart-bar" style={{ height: '75%' }}><span>Feb</span></div>
                <div className="chart-bar" style={{ height: '65%' }}><span>Mar</span></div>
                <div className="chart-bar" style={{ height: '80%' }}><span>Apr</span></div>
                <div className="chart-bar" style={{ height: '70%' }}><span>May</span></div>
                <div className="chart-bar" style={{ height: '60%' }}><span>Jun</span></div>
                <div className="chart-bar active" style={{ height: '55%' }}><span>Jul</span></div>
              </div>
            </div>
            <div className="cpi-details">
              <div className="cpi-stat">
                <div className="stat-label">Current CPI</div>
                <div className="stat-value">303.841</div>
              </div>
              <div className="cpi-stat">
                <div className="stat-label">Monthly Change</div>
                <div className="stat-value negative">-0.5%</div>
              </div>
              <div className="cpi-stat">
                <div className="stat-label">Annual Inflation Rate</div>
                <div className="stat-value">3.1%</div>
              </div>
              <div className="cpi-stat">
                <div className="stat-label">Core CPI (excl. food & energy)</div>
                <div className="stat-value">4.0%</div>
              </div>
            </div>
          </div>
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="oil" className="section-title">Crude Oil Prices</h2>
        <div className="economic-section">
          <div className="economic-indicator-header">
            <FaOilCan className="indicator-icon" />
            <h3>Global Crude Oil Prices</h3>
          </div>
          <div className="oil-prices-container">
            <div className="oil-price-card">
              <div className="oil-type">WTI Crude</div>
              <div className="oil-price">$75.82</div>
              <div className="oil-change positive">+$1.24 (1.66%)</div>
              <div className="oil-date">Last updated: July 5, 2023</div>
            </div>
            <div className="oil-price-card">
              <div className="oil-type">Brent Crude</div>
              <div className="oil-price">$80.47</div>
              <div className="oil-change positive">+$0.98 (1.23%)</div>
              <div className="oil-date">Last updated: July 5, 2023</div>
            </div>
            <div className="oil-price-card">
              <div className="oil-type">OPEC Basket</div>
              <div className="oil-price">$78.95</div>
              <div className="oil-change negative">-$0.32 (0.40%)</div>
              <div className="oil-date">Last updated: July 4, 2023</div>
            </div>
          </div>
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="news" className="section-title">Market News</h2>
        <div className="economic-section">
          <div className="economic-indicator-header">
            <FaNewspaper className="indicator-icon" />
            <h3>Latest Market News</h3>
          </div>
          <div className="market-news-container">
            {isLoadingNews ? (
              <div className="loading-news">Loading market news...</div>
            ) : marketNews.length > 0 ? (
              <div className="news-list">
                {marketNews.map((item, index) => (
                  <div key={index} className="news-item">
                    <h4>{item.headline}</h4>
                    <p>{item.summary}</p>
                    <div className="news-meta">
                      <span className="news-source">{item.source}</span>
                      <span className="news-date">{new Date(item.datetime).toLocaleDateString()}</span>
                    </div>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      Read more
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-news">No market news available at the moment.</div>
            )}
          </div>
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>
      </div>
    </div>
  );
}

export default EconomicData;
