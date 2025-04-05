import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { getStocks, fetchHistoricalData, getAIAnalysis } from './server';
import { stockNames } from './constants';
import './StockDetail.css';

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const newsData = location.state?.newsData || [];
  const [aiThinking, setAiThinking] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [historicalData, setHistoricalData] = useState(null);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'analysis',
      content: `Hello! I'm your AI investment advisor. How can I help you analyze ${symbol} stock?`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'question',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const aiResponse = await getAIAnalysis(symbol, inputMessage);
      
      setMessages(prev => [...prev, {
        type: 'analysis',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'analysis',
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper function to check if cached analysis is still valid (less than 24 hours old)
  const isAnalysisCacheValid = (cachedData) => {
    if (!cachedData || !cachedData.timestamp) return false;
    const now = new Date().getTime();
    const cacheAge = now - cachedData.timestamp;
    return cacheAge < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  };

  // Helper function to check if cached historical data is still valid (less than 24 hours old)
  const isHistoricalDataCacheValid = (cachedData) => {
    if (!cachedData || !cachedData.timestamp) return false;
    const now = new Date().getTime();
    const cacheAge = now - cachedData.timestamp;
    return cacheAge < 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Try to get stock data for the symbol
        const stockResponse = await getStocks([symbol]); // Modified to accept array of symbols
        
        if (!stockResponse[symbol]) {
          setError('Stock not found');
          return;
        }
        
        setStockData(stockResponse[symbol]);

        // Check localStorage for cached analysis
        const cachedAnalysis = JSON.parse(localStorage.getItem(`analysis_${symbol}`));

        if (isAnalysisCacheValid(cachedAnalysis)) {
          setAiReview(cachedAnalysis.analysis);
        } else {
          setAiThinking(true);
          // Use the actual company name from the API response if available
          const aiResult = await getAIAnalysis(symbol);
          // Cache the new analysis
          localStorage.setItem(`analysis_${symbol}`, JSON.stringify({
            analysis: aiResult,
            timestamp: new Date().getTime()
          }));
          setAiReview(aiResult);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
        setAiThinking(false);
      }
    };

    loadData();
  }, [symbol]);

  const renderAIReview = () => {
    if (loading) return <div className="loading">Loading analysis...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!stockData) return <div className="no-data">No data available</div>;

    return (
      <div className="ai-review-container">
        <div className="review-header">
          <h3>Market Analysis</h3>
          <div className="ai-controls">
            <span className="model-badge">AI Insights</span>
            <button 
              className="ask-ai-button"
              onClick={() => setShowChatbot(true)}
            >
              Ask AI
            </button>
          </div>
        </div>
        <div className="review-content">
          {aiReview}
        </div>

        {showChatbot && (
          <div className="chatbot-overlay">
            <div className="ai-chatbot-container">
              <div className="chatbot-header">
                <div className="chatbot-header-content">
                  <h3>Investment Advisor</h3>
                  <span className="stock-badge">{symbol}</span>
                </div>
                <button 
                  className="close-chatbot"
                  onClick={() => setShowChatbot(false)}
                >
                  ×
                </button>
              </div>
              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div key={index} className={`chat-message ${message.type}`}>
                    <div className="message-header">
                      <span className="ai-badge">
                        {message.type === 'question' ? 'You' : 'Advisor'}
                      </span>
                      <span className="timestamp">{message.timestamp}</span>
                    </div>
                    <div className="message-content">
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="chat-message analysis">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="chat-input-container">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about this stock..."
                  className="chat-input"
                  disabled={isTyping}
                />
                <button type="submit" className="send-button" disabled={isTyping}>
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStockPrice = () => {
    if (!stockData) return null;

    const isPositive = stockData.d >= 0;
    const changeColor = isPositive ? '#4caf50' : '#f44336';
    const changeBackground = isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)';
    const changeIcon = isPositive ? '▲' : '▼';

    // Helper function to get the correct price data based on time range
    const getPriceData = () => {
      if (timeRange === '24h' || !historicalData) {
        return {
          high: stockData.h,
          low: stockData.l,
          label: '24h'
        };
      }

      // For historical data, get the max and min values
      return {
        high: Math.max(...historicalData.h),
        low: Math.min(...historicalData.l),
        label: timeRange === '1w' ? '1 Week' : '1 Month'
      };
    };

    const priceData = getPriceData();

    return (
      <div className="current-price-section">
        <div className="price-info">
          <div className="price-header">
            <div className="main-price">
              <span className="price-label">Current Price</span>
              <span className="price-value">${stockData.c.toFixed(2)}</span>
            </div>
            <div
              className="price-change"
              style={{
                backgroundColor: changeBackground,
                color: changeColor
              }}
            >
              <span>{changeIcon}</span>
              <span>{Math.abs(stockData.d).toFixed(2)}%</span>
            </div>
          </div>

          <div className="price-details">
            <div className="price-stat">
              <i className="fas fa-arrow-up"></i>
              <span>{priceData.label} High: ${priceData.high.toFixed(2)}</span>
            </div>
            <div className="price-stat">
              <i className="fas fa-arrow-down"></i>
              <span>{priceData.label} Low: ${priceData.low.toFixed(2)}</span>
            </div>
          </div>

          <div className="time-range-toggle">
            <button
              className={`time-range-button ${timeRange === '24h' ? 'active' : ''}`}
              onClick={() => setTimeRange('24h')}
            >
              24H
            </button>
            <button
              className={`time-range-button ${timeRange === '1w' ? 'active' : ''}`}
              onClick={() => setTimeRange('1w')}
            >
              1W
            </button>
            <button
              className={`time-range-button ${timeRange === '1m' ? 'active' : ''}`}
              onClick={() => setTimeRange('1m')}
            >
              1M
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderNews = () => {
    if (!newsData.length) {
      return <div className="no-news">No recent news available</div>;
    }

    return (
      <div className="news-section">
        <h3>Latest News</h3>
        <div className="news-list">
          {newsData.map((news, index) => (
            <div key={index} className="news-item">
              <h4>{news.headline}</h4>
              <p>{news.summary}</p>
              <div className="news-meta">
                <span>{new Date(news.datetime * 1000).toLocaleDateString()}</span>
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="read-more"
                >
                  Read More
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const loadHistoricalData = async () => {
      if (timeRange === '24h') {
        return;
      }

      setIsLoadingHistorical(true);
      
      try {
        // Check localStorage for cached historical data
        const cacheKey = `historical_${symbol}_${timeRange}`;
        const cachedData = JSON.parse(localStorage.getItem(cacheKey));

        if (isHistoricalDataCacheValid(cachedData)) {
          setHistoricalData(cachedData.data);
          setIsLoadingHistorical(false);
          return;
        }

        const response = await fetchHistoricalData(symbol, timeRange);
        setHistoricalData(response.data);

        // Cache the new historical data
        localStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: new Date().getTime()
        }));

      } catch (error) {
        console.error('Error loading historical data:', error);
      } finally {
        setIsLoadingHistorical(false);
      }
    };

    loadHistoricalData();
  }, [symbol, timeRange]);

  // Find the stock name from the stockNames array
  const stockName = stockNames.find(stock => stock.symbol === symbol)?.name || 'Loading...';

  return (
    <div className="stock-detail-page">
      <div className="stock-header">
        <h1>{stockName}</h1>
        <span className="symbol">{symbol}</span>
      </div>

      <div className="stock-detail-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        
        <div className="time-range-toggle">
          <button
            className={`time-range-button ${timeRange === '24h' ? 'active' : ''}`}
            onClick={() => setTimeRange('24h')}
          >
            24H
          </button>
          <button
            className={`time-range-button ${timeRange === '1w' ? 'active' : ''}`}
            onClick={() => setTimeRange('1w')}
          >
            1W
          </button>
          <button
            className={`time-range-button ${timeRange === '1m' ? 'active' : ''}`}
            onClick={() => setTimeRange('1m')}
          >
            1M
          </button>
        </div>
      </div>

      <div className="stock-detail-content">
        <div className="main-content">
          {renderStockPrice()}
          {renderAIReview()}
        </div>
        <div className="side-content">
          {renderNews()}
        </div>
      </div>
    </div>
  );
};

export default StockDetail;