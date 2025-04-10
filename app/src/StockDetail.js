import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStocks, fetchCompanyNews, fetchHistoricalData, getAIAnalysis } from './server';
import { getFromLocalStorage, saveToLocalStorage } from './utils';
import { stockNames } from './constants';
import { ThemeContext } from './App';
import './styles/PersonalizationButton.css';
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import CompanyOverview from './components/CompanyOverview';
import EarningsData from './components/EarningsData';
import InsiderTransactions from './components/InsiderTransactions';
import './styles/StockDetail.css';
import './styles/CompanyOverview.css';
import './styles/EarningsData.css';
import './styles/InsiderTransactions.css';

function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [chartTimeRange, setChartTimeRange] = useState('1d');

  // --- State ---
  const [stockData, setStockData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [rangeData, setRangeData] = useState({
    high: 0,
    low: 0,
    chartData: null
  });

  // Function to check if cached data is still valid (less than 24 hours old)
  const isCacheValid = useCallback((cachedData, hours = 24) => {
    if (!cachedData || !cachedData.timestamp) return false;

    const cacheTime = new Date(cachedData.timestamp);
    const currentTime = new Date();
    const diffHours = (currentTime - cacheTime) / (1000 * 60 * 60); // Convert ms to hours

    return diffHours < hours; // Cache is valid if less than specified hours old
  }, []);

  // Function to get cached historical data or fetch new data
  const getHistoricalData = useCallback(async (stockSymbol, range) => {
    // Check for cached historical data
    const cacheKey = `historical_data_${stockSymbol}_${range}`;
    const cachedData = getFromLocalStorage(cacheKey);

    // If we have valid cached data, use it (refresh every 24 hours)
    if (cachedData && isCacheValid(cachedData)) {
      console.log(`Using cached historical data for ${range}`);
      return cachedData.data;
    }

    // Otherwise fetch new data
    try {
      console.log(`Fetching new historical data for ${range}`);
      const response = await fetchHistoricalData(stockSymbol, range);
      const historicalData = response.data;

      // Cache the new data with timestamp
      saveToLocalStorage(cacheKey, {
        data: historicalData,
        timestamp: new Date().toISOString()
      });

      return historicalData;
    } catch (error) {
      console.error(`Error fetching historical data for ${range}:`, error);
      // If fetch fails but we have cached data (even if old), use it as fallback
      if (cachedData) {
        return cachedData.data;
      }
      return null; // Return null if no fallback
    }
  }, [isCacheValid]);

  // Process historical data and update range data
  const processRangeData = useCallback((historicalData, stockDataFallback) => {
    try {
      if (historicalData && historicalData.h && historicalData.l &&
        Array.isArray(historicalData.h) && Array.isArray(historicalData.l) &&
        historicalData.h.length > 0 && historicalData.l.length > 0) {

        // Filter out any non-finite values before calculating max/min
        const validHighs = historicalData.h.filter(val => isFinite(val));
        const validLows = historicalData.l.filter(val => isFinite(val));

        if (validHighs.length > 0 && validLows.length > 0) {
          const highPrice = Math.max(...validHighs);
          const lowPrice = Math.min(...validLows);

          // Check if values are valid numbers and not Infinity
          const validHigh = isFinite(highPrice) ? highPrice : (isFinite(stockDataFallback?.dayHigh) ? stockDataFallback.dayHigh : 0);
          const validLow = isFinite(lowPrice) ? lowPrice : (isFinite(stockDataFallback?.dayLow) ? stockDataFallback.dayLow : 0);

          setRangeData({
            high: validHigh,
            low: validLow,
            chartData: historicalData
          });
          return;
        }
      }

      // If we get here, we need to use fallback data
      if (stockDataFallback) {
        // Use day high/low from quote data as fallback
        setRangeData({
          high: isFinite(stockDataFallback.dayHigh) ? stockDataFallback.dayHigh : 0,
          low: isFinite(stockDataFallback.dayLow) ? stockDataFallback.dayLow : 0,
          chartData: historicalData
        });
      } else {
        // Ultimate fallback if no data is available
        setRangeData({
          high: 0,
          low: 0,
          chartData: null
        });
      }
    } catch (err) {
      console.error("Error in processRangeData:", err);
      // Ultimate fallback
      setRangeData({
        high: 0,
        low: 0,
        chartData: null
      });
    }
  }, []);

  // Function to fetch range data using the cached historical data function
  const fetchRangeData = useCallback(async (range) => {
    try {
      const historicalData = await getHistoricalData(symbol, range);

      // Check if we got valid historical data
      if (historicalData && (historicalData.h || historicalData.l)) {
        processRangeData(historicalData, stockData);
      } else {
        // Use fallback data if historical data is invalid
        console.log("Using fallback data for range: " + range);
        if (stockData) {
          setRangeData({
            high: isFinite(stockData.dayHigh) ? stockData.dayHigh : 0,
            low: isFinite(stockData.dayLow) ? stockData.dayLow : 0,
            chartData: null
          });
        }
      }
    } catch (err) {
      console.error("Error processing range data:", err);
      // Use fallback data if available
      if (stockData) {
        setRangeData({
          high: isFinite(stockData.dayHigh) ? stockData.dayHigh : 0,
          low: isFinite(stockData.dayLow) ? stockData.dayLow : 0,
          chartData: null
        });
      }
    }
  }, [symbol, stockData, getHistoricalData, processRangeData]);

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

  // Set initial theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Function to get cached stock data or fetch new data
  const getStockData = useCallback(async (stockSymbol) => {
    // Check for cached stock data
    const cacheKey = `stock_data_${stockSymbol}`;
    const cachedData = getFromLocalStorage(cacheKey);

    // If we have valid cached data, use it (refresh every 24 hours)
    if (cachedData && isCacheValid(cachedData)) {
      console.log('Using cached stock data');
      return cachedData.data;
    }

    // Otherwise fetch new data
    try {
      console.log('Fetching new stock data');
      const stocksData = await getStocks([stockSymbol]);
      const stockDetails = stocksData[stockSymbol];

      if (!stockDetails) {
        throw new Error(`No data available for ${stockSymbol}`);
      }

      // Validate the stock data to ensure we have valid numbers
      const validateNumber = (value) => isFinite(value) ? value : 0;

      // Calculate percentage change if API value is invalid
      let changePercent = validateNumber(stockDetails.dp);
      const currentPrice = validateNumber(stockDetails.c);
      const previousClose = validateNumber(stockDetails.pc);
      const change = validateNumber(stockDetails.d);

      // If percentage is invalid but we have current and previous prices, calculate it
      if ((changePercent === 0 || !isFinite(changePercent)) && previousClose > 0) {
        changePercent = ((currentPrice - previousClose) / previousClose) * 100;
      }

      const processedData = {
        symbol: stockSymbol,
        companyName: stockNames.find(stock => stock.symbol === stockSymbol)?.name || stockSymbol,
        currentPrice: currentPrice,
        change: change,
        changePercent: changePercent,
        dayHigh: validateNumber(stockDetails.h),
        dayLow: validateNumber(stockDetails.l),
        openPrice: validateNumber(stockDetails.o),
        previousClose: previousClose
      };

      // Cache the new data with timestamp
      saveToLocalStorage(cacheKey, {
        data: processedData,
        timestamp: new Date().toISOString()
      });

      return processedData;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // If fetch fails but we have cached data (even if old), use it as fallback
      if (cachedData) {
        return cachedData.data;
      }
      throw error; // Re-throw if we have no fallback
    }
  }, [isCacheValid]);

  // Function to get cached news or fetch new news
  const getNewsData = useCallback(async (stockSymbol) => {
    // Check for cached news
    const cacheKey = `news_data_${stockSymbol}`;
    const cachedNews = getFromLocalStorage(cacheKey);

    // If we have valid cached news, use it (refresh every 24 hours)
    if (cachedNews && isCacheValid(cachedNews)) {
      console.log('Using cached news data');
      return cachedNews.data;
    }

    // Otherwise fetch new news
    try {
      console.log('Fetching new news data');
      const newsData = await fetchCompanyNews(stockSymbol);

      // Cache the new news with timestamp
      saveToLocalStorage(cacheKey, {
        data: newsData.data,
        timestamp: new Date().toISOString()
      });

      return newsData.data;
    } catch (error) {
      console.error('Error fetching news:', error);
      // If fetch fails but we have cached data (even if old), use it as fallback
      if (cachedNews) {
        return cachedNews.data;
      }
      return []; // Return empty array if no fallback
    }
  }, [isCacheValid]);

  // Function to get cached analysis or fetch new one
  const getAnalysis = useCallback(async (stockSymbol) => {
    // Check for cached analysis
    const cacheKey = `ai_analysis_${stockSymbol}`;
    const cachedAnalysis = getFromLocalStorage(cacheKey);

    // If we have valid cached analysis, use it
    if (cachedAnalysis && isCacheValid(cachedAnalysis)) {
      console.log('Using cached AI analysis');
      return cachedAnalysis.data;
    }

    // Otherwise fetch new analysis
    try {
      console.log('Fetching new AI analysis');
      const analysis = await getAIAnalysis(stockSymbol);

      // Cache the new analysis with timestamp
      saveToLocalStorage(cacheKey, {
        data: analysis,
        timestamp: new Date().toISOString()
      });

      return analysis;
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      // If fetch fails but we have cached data (even if old), use it as fallback
      if (cachedAnalysis) {
        return cachedAnalysis.data;
      }
      return "Unable to load market analysis at this time.";
    }
  }, [isCacheValid]);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get stock data (from cache or fetch new)
        try {
          const stockDetails = await getStockData(symbol);
          setStockData(stockDetails);
        } catch (stockErr) {
          console.error("Error fetching stock data:", stockErr);
          // Set default stock data to prevent crashes
          setStockData({
            symbol: symbol,
            companyName: stockNames.find(stock => stock.symbol === symbol)?.name || symbol,
            currentPrice: 0,
            change: 0,
            changePercent: 0,
            dayHigh: 0,
            dayLow: 0,
            openPrice: 0,
            previousClose: 0
          });
        }

        // Fetch initial range data (from cache or fetch new)
        try {
          await fetchRangeData(chartTimeRange);
        } catch (rangeErr) {
          console.error("Error fetching range data:", rangeErr);
          // Set default range data
          setRangeData({
            high: 0,
            low: 0,
            chartData: null
          });
        }

        // Get news data (from cache or fetch new)
        try {
          const newsData = await getNewsData(symbol);
          setNews(newsData);
        } catch (newsErr) {
          console.error("Error fetching news data:", newsErr);
          setNews([]);
        }

        // Get AI analysis (from cache or fetch new)
        try {
          const analysis = await getAnalysis(symbol);
          setAiAnalysis(analysis);
        } catch (analysisErr) {
          console.error("Error fetching AI analysis:", analysisErr);
          setAiAnalysis("Unable to load market analysis at this time.");
        }

      } catch (err) {
        console.error("Error fetching stock page data:", err);
        setError(err.message || `Failed to load data for ${symbol}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Set up auto-refresh every 5 seconds
    const refreshInterval = setInterval(() => {
      // Only refresh stock data, not news or AI analysis
      getStockData(symbol).then(stockDetails => {
        setStockData(stockDetails);
      }).catch(err => {
        console.error("Error refreshing stock data:", err);
      });

      // Also refresh chart data
      fetchRangeData(chartTimeRange).catch(err => {
        console.error("Error refreshing chart data:", err);
      });
    }, 5000);

    return () => clearInterval(refreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, chartTimeRange]);

  const handleTimeRangeChange = (direction) => {
    const ranges = ['1d', '1w', '1m'];
    const currentIndex = ranges.indexOf(chartTimeRange);
    let newIndex;

    if (direction === 'next') {
      newIndex = currentIndex === ranges.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? ranges.length - 1 : currentIndex - 1;
    }

    setChartTimeRange(ranges[newIndex]);
  };

  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  if (loading && !stockData) {
    return <div className="loading-message">Loading stock details for {symbol}...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div id="top" className="stock-detail-container" data-theme={theme}>
      <ThemeToggleButton />
      <div className="stock-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="header-content">
          <h1>{symbol}</h1>
          <p>{stockData.companyName}</p>
        </div>
      </div>

      <div className="section-navigation">
        <button onClick={() => scrollToSection('price')} className="section-nav-item">
          <span className="section-nav-icon">📊</span> Price
        </button>
        <button onClick={() => scrollToSection('news')} className="section-nav-item">
          <span className="section-nav-icon">📰</span> News
        </button>
        <button onClick={() => scrollToSection('ai-analysis')} className="section-nav-item">
          <span className="section-nav-icon">🤖</span> AI Analysis
        </button>
        <button onClick={() => scrollToSection('company')} className="section-nav-item">
          <span className="section-nav-icon">🏢</span> Company
        </button>
        <button onClick={() => scrollToSection('earnings')} className="section-nav-item">
          <span className="section-nav-icon">💰</span> Earnings
        </button>
        <button onClick={() => scrollToSection('insider')} className="section-nav-item">
          <span className="section-nav-icon">👥</span> Insider
        </button>
      </div>

      <div className="stock-detail-content">
        <h2 id="price" className="section-title">Price Information</h2>
        <div className="current-price-section">
          <div className="current-price">
            <h2>${isFinite(stockData.currentPrice) ? stockData.currentPrice.toFixed(2) : '0.00'}</h2>
            <span className={`price-change ${stockData.change >= 0 ? 'positive' : 'negative'}`}>
              {stockData.change >= 0 ? '+' : ''}{isFinite(stockData.change) ? stockData.change.toFixed(2) : '0.00'}
              ({isFinite(stockData.changePercent) ? Math.abs(stockData.changePercent).toFixed(2) : '0.00'}%)
            </span>
          </div>

          <div className="price-details">
            <div className="price-stat">
              <span className="label">Open</span>
              <span>${isFinite(stockData.openPrice) ? stockData.openPrice.toFixed(2) : '0.00'}</span>
            </div>
            <div className="price-stat">
              <span className="label">Previous Close</span>
              <span>${isFinite(stockData.previousClose) ? stockData.previousClose.toFixed(2) : '0.00'}</span>
            </div>
            <div className="price-stat">
              <span className="label">{`${chartTimeRange.toUpperCase()} High`}</span>
              <span>${isFinite(rangeData.high) ? rangeData.high.toFixed(2) : '0.00'}</span>
            </div>
            <div className="price-stat">
              <span className="label">{`${chartTimeRange.toUpperCase()} Low`}</span>
              <span>${isFinite(rangeData.low) ? rangeData.low.toFixed(2) : '0.00'}</span>
            </div>
          </div>

          <div className="price-time-range">
            <button
              className="time-range-button"
              onClick={() => handleTimeRangeChange('prev')}
            >
              <FaChevronLeft />
            </button>
            <span className="time-range-label">{chartTimeRange.toUpperCase()}</span>
            <button
              className="time-range-button"
              onClick={() => handleTimeRangeChange('next')}
            >
              <FaChevronRight />
            </button>
          </div>

          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="news" className="section-title">Latest News</h2>
        <div className="news-section">
          <div className="news-list">
            {news.map((item, index) => (
              <div key={index} className="news-item">
                <h4>{item.headline}</h4>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
              </div>
            ))}
          </div>
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="ai-analysis" className="section-title">AI Market Analysis</h2>
        <div className="ai-insight-section">
          <div className="ai-insight-content">
            {aiAnalysis}
          </div>
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="company" className="section-title">Company Overview</h2>
        <div className="company-overview-wrapper">
          <CompanyOverview symbol={symbol} />
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="earnings" className="section-title">Earnings Data</h2>
        <div className="earnings-data-wrapper">
          <EarningsData symbol={symbol} />
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>

        <h2 id="insider" className="section-title">Insider Transactions</h2>
        <div className="insider-transactions-wrapper">
          <InsiderTransactions symbol={symbol} />
          <button onClick={() => scrollToSection('top')} className="back-to-top">
            <span className="back-to-top-icon">⬆️</span> Back to Top
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockDetail;
