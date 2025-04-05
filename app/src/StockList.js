import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStocks, searchSymbol, fetchCompanyNews, fetchMarketNews } from './server';
import { stockNames } from './constants';
import './StockList.css';
import PersonalizationButton from './Components/PersonalizationButton.js';

const DEFAULT_SYMBOLS = ['AAPL', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'MSFT'];

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const StockSelectorModal = ({ isOpen, onClose, selectedStocks, onStocksChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStocks, setFilteredStocks] = useState([...stockNames]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = stockNames.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks([...stockNames]);
    }
  }, [searchQuery]);

  const toggleStock = (symbol) => {
    if (selectedStocks.includes(symbol)) {
      onStocksChange(selectedStocks.filter(s => s !== symbol));
    } else if (selectedStocks.length < 6) {
      onStocksChange([...selectedStocks, symbol]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="stock-selector-modal-overlay">
      <div className="stock-selector-modal">
        <div className="modal-header">
          <h2>Select Stocks (Max 6)</h2>
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="stock-search-input"
          />
        </div>

        <div className="selected-stocks">
          <h3>Selected Stocks ({selectedStocks.length}/6)</h3>
          <div className="selected-stocks-grid">
            {selectedStocks.map(symbol => (
              <div key={symbol} className="selected-stock-item">
                <span>{symbol}</span>
                <button onClick={() => toggleStock(symbol)}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="stock-list-container">
          {filteredStocks.map(stock => (
            <div
              key={stock.symbol}
              className={`stock-list-item ${selectedStocks.includes(stock.symbol) ? 'selected' : ''}`}
              onClick={() => toggleStock(stock.symbol)}
            >
              <span className="stock-symbol">{stock.symbol}</span>
              <span className="stock-name">{stock.name}</span>
              {selectedStocks.includes(stock.symbol) &&
                <span className="selected-indicator">✓</span>
              }
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-button">Done</button>
        </div>
      </div>
    </div>
  );
};

function StockList() {
  const navigate = useNavigate();
  const [stocksData, setStocksData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [usingCache, setUsingCache] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [marketNews, setMarketNews] = useState([]);
  const [showMarketNews, setShowMarketNews] = useState(false);
  const searchRef = useRef(null);

  const [selectedStocks, setSelectedStocks] = useState(() => {
    const saved = localStorage.getItem('selectedStocks');
    return saved ? JSON.parse(saved) : DEFAULT_SYMBOLS;
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('selectedStocks', JSON.stringify(selectedStocks));
  }, [selectedStocks]);

  const debouncedSearch = useCallback((query) => {
    if (query.length >= 2) {
      searchSymbol(query)
        .then(results => {
          navigate(`/stock/${results[0].symbol}`);
        })
        .catch(error => {
          console.error('Search error:', error);
        });
    }
  }, [navigate]);

  const handleSymbolSelect = (symbol) => {
    setShowResults(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/stock/${symbol}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStocks(selectedStocks);
        if (data) {
          setStocksData(data);
          const hasCache = Object.values(data).some(stock => stock.fromCache);
          setUsingCache(hasCache);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedStocks]);

  const handleStockClick = async (symbol) => {
    try {
      const news = await fetchCompanyNews(symbol);
      const newsArray = Array.isArray(news.data) ? news.data : [];
      navigate(`/stock/${symbol}`, {
        state: {
          newsData: newsArray
        }
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      navigate(`/stock/${symbol}`, {
        state: {
          newsData: []
        }
      });
    }
  };

  const handleMarketNewsClick = async () => {
    setIsLoadingNews(true);
    try {
      const response = await fetchMarketNews();
      setMarketNews(response.data);
      setShowMarketNews(true);
    } catch (error) {
      console.error('Error fetching market news:', error);
    } finally {
      setIsLoadingNews(false);
    }
  };

  const MarketNewsModel = () => {
    if (!showMarketNews) return null;

    return (
      <div className="market-news-modal-overlay">
        <div className="market-news-modal">
          <div className="market-news-header">
            <h2>Market News</h2>
            <button
              className="market-news-close"
              onClick={() => setShowMarketNews(false)}
            >
              ×
            </button>
          </div>
          <div className="market-news-container">
            <div className="market-news-grid">
              {marketNews.map((news, index) => (
                <div key={index} className="news-card">
                  <h4>{news.headline}</h4>
                  <p>{news.summary}</p>
                  <div className="news-meta">
                    <span className="news-date">
                      {new Date(news.datetime * 1000).toLocaleDateString()}
                    </span>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="read-more"
                    >
                      Read More →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide search when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY) {
        setIsSearchVisible(false);
      } else {
        setIsSearchVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="app-container">
      <PersonalizationButton />
      <div className={`top-bar ${isSearchVisible ? 'visible' : 'hidden'}`}>
        <div className="search-wrapper" ref={searchRef}>
          <button
            className={`search-icon-button ${isSelectorOpen ? 'active' : ''}`}
            onClick={() => setIsSelectorOpen(true)}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </button>
        </div>
      </div>

      <header className="App-header">
        <h1>
          <span onClick={() => window.location.href = "https://shreyask06.github.io/MyWebsite/"}>
            Stock Market View
          </span>
        </h1>
        <div className="controls">
          <div className="status-container">
            <p className="last-update">Last Updated: {lastUpdate}</p>
          </div>
          <div className="buttons-container">
            <button
              className="market-news-button"
              onClick={handleMarketNewsClick}
              disabled={isLoadingNews}
            >
              {isLoadingNews ? 'Loading...' : 'Market News'}
            </button>
            <button
              className="view-toggle"
              onClick={() => setIsGridView(!isGridView)}
            >
              {isGridView ? 'List' : 'Grid'}
            </button>
          </div>
        </div>

        <div className={`stocks-container ${isGridView ? 'grid-view' : 'list-view'}`}>
          {!isGridView && (
            <div className="list-header">
              <div className="list-header-company">Company</div>
              <div className="list-header-price">Price</div>
              <div className="list-header-change">Change</div>
              <div className="list-header-high">High</div>
              <div className="list-header-low">Low</div>
            </div>
          )}
          {stocksData ? (
            Object.entries(stocksData).map(([symbol, data]) => (
              <div
                key={symbol}
                className="stock-card"
                onClick={() => handleStockClick(symbol)}
              >
                {isGridView ? (
                  <>
                    <div className="stock-card-header">
                      <p className="stock-name">
                        {stockNames.find(stock => stock.symbol === symbol)?.name || symbol}
                      </p>
                      <h2 className="stock-symbol">{symbol}</h2>
                    </div>
                    <div className="price-section">
                      <div className="price-container">
                        <div className={`price-change ${data.d >= 0 ? 'positive' : 'negative'}`}>
                          {data.d >= 0 ? '▲' : '▼'} {Math.abs(data.d).toFixed(2)}%
                        </div>
                        <p className="current-price">${data.c.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="price-extremes">
                      <div className="price-extreme-item">
                        <span className="extreme-label">Low</span>
                        <span className="extreme-value">${data.l.toFixed(2)}</span>
                      </div>
                      <div className="price-extreme-item">
                        <span className="extreme-label">High</span>
                        <span className="extreme-value">${data.h.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="company-info">
                      <h2>{stockNames[symbol]}</h2>
                      <span className="symbol">{symbol}</span>
                    </div>
                    <div className="price-section">
                      ${data.c.toFixed(2)}
                    </div>
                    <div className={`change-section ${data.d >= 0 ? 'positive' : 'negative'}`}>
                      {data.d >= 0 ? '+' : ''}{data.d.toFixed(2)}%
                    </div>
                    <div className="high-section">
                      ${data.h.toFixed(2)}
                    </div>
                    <div className="low-section">
                      ${data.l.toFixed(2)}
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
        <MarketNewsModel />
      </header>
      <StockSelectorModal
        isOpen={isSelectorOpen}
        onClose={() => {
          setIsSelectorOpen(false);
        }}
        selectedStocks={selectedStocks}
        onStocksChange={(newSelectedStocks) => {
          setSelectedStocks(newSelectedStocks);
          localStorage.setItem('selectedStocks', JSON.stringify(newSelectedStocks));
          // Immediately fetch data for the new selection
          getStocks(newSelectedStocks)
            .then(newData => {
              setStocksData(newData);
              setLastUpdate(new Date().toLocaleTimeString());
            })
            .catch(error => {
              console.error('Error updating stocks:', error);
              setLastUpdate('Update failed');
            });
        }}
      />
    </div>
  );
}

export default StockList;
































