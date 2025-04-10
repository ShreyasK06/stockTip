import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStocks } from './server';
import { stockNames } from './constants';
import { ThemeContext } from './App';
import { checkMarketStatus } from './utils';
import './styles/StockView.css';
import './styles/StockSelector.css';
import './styles/StockCard.css';
import './styles/GridView.css';
import './styles/ListView.css';
import './styles/PersonalizationButton.css';

const DEFAULT_SYMBOLS = ['AAPL', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'MSFT'];

function StockList() {
  const navigate = useNavigate();
  const [stocksData, setStocksData] = useState({});
  const [isGridView, setIsGridView] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, status: 'Checking...', nextEvent: '' });

  const [selectedStocks, setSelectedStocks] = useState(() => {
    const saved = localStorage.getItem('selectedStocks');
    return saved ? JSON.parse(saved) : DEFAULT_SYMBOLS;
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('selectedStocks', JSON.stringify(selectedStocks));
  }, [selectedStocks]);

  const fetchStockData = async () => {
    try {
      const data = await getStocks(selectedStocks);
      setStocksData(data || {});
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  // Effect to check market status
  useEffect(() => {
    // Check market status immediately
    const checkStatus = () => {
      const status = checkMarketStatus();
      setMarketStatus(status);
    };

    checkStatus();

    // Update market status every minute
    const statusInterval = setInterval(checkStatus, 60000);

    return () => clearInterval(statusInterval);
  }, []);

  // Effect to fetch stock data
  useEffect(() => {
    // Initial fetch regardless of market status
    fetchStockData();

    // Set up refresh interval
    let interval;
    if (marketStatus.isOpen) {
      // If market is open, refresh every 5 seconds
      interval = setInterval(fetchStockData, 5000);
    } else {
      // If market is closed, refresh every 5 minutes
      interval = setInterval(fetchStockData, 300000);
    }

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStocks, marketStatus.isOpen]);

  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  const renderStockCards = () => {
    return selectedStocks.map(symbol => {
      const stock = stocksData[symbol] || {};
      const isPositive = stock.c >= 0;
      const stockInfo = stockNames.find(s => s.symbol === symbol) || { symbol, name: symbol };

      return (
        <div
          key={symbol}
          className="stock-card"
          onClick={() => handleStockClick(symbol)}
        >
          {isGridView ? (
            <>
              <div className="stock-card-header">
                <div className="stock-symbol">{symbol}</div>
                <div className="stock-name">{stockInfo.name}</div>
              </div>
              <div className="price-section">
                <div className="current-price">
                  ${stock.c ? stock.c.toFixed(2) : '0.00'}
                </div>
                <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                  ${stock.d ? Math.abs(stock.d).toFixed(2) : '0.00'}
                </div>
              </div>
              <div className="price-extremes">
                <div className="price-extreme-item">
                  <span className="extreme-label">Low</span>
                  <span className="extreme-value">${stock.l ? stock.l.toFixed(2) : '0.00'}</span>
                </div>
                <div className="price-extreme-item">
                  <span className="extreme-label">High</span>
                  <span className="extreme-value">${stock.h ? stock.h.toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="stock-info">
                <span className="stock-symbol">{symbol}</span>
                <span className="stock-name">{stockInfo.name}</span>
              </div>
              <div className="current-price">
                ${stock.c ? stock.c.toFixed(2) : '0.00'}
              </div>
              <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                ${stock.d ? Math.abs(stock.d).toFixed(2) : '0.00'}
              </div>
              <div className="extreme-value">
                ${stock.l ? stock.l.toFixed(2) : '0.00'}
              </div>
              <div className="extreme-value">
                ${stock.h ? stock.h.toFixed(2) : '0.00'}
              </div>
            </>
          )}
        </div>
      );
    });
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
    <div className="app-container">
      <ThemeToggleButton />

      <header className="App-header">
        <h1>
          <span onClick={() => window.location.href = "https://shreyask06.github.io/MyWebsite/"}>
            Stock Market View
          </span>
        </h1>
        <div className="controls">
          <div className="status-container">
            <p className="market-status">
              Market Status: <span className={marketStatus.isOpen ? 'status-open' : 'status-closed'}>{marketStatus.status}</span>
              <span className="next-event"> • {marketStatus.nextEvent}</span>
            </p>
            <p className="last-update">
              Last Updated: {lastUpdate}
            </p>
          </div>
          <div className="buttons-container">
            {/* Market News button removed - now in Economic Data page */}
            <button
              className="economic-data-button"
              onClick={() => navigate('/economic-data')}
            >
              Economic Data
            </button>
            <button
              className="crypto-data-button"
              onClick={() => navigate('/crypto-data')}
            >
              Crypto Data
            </button>
            <button
              className="view-toggle"
              onClick={() => setIsGridView(!isGridView)}
            >
              {isGridView ? 'List View' : 'Grid View'}
            </button>
            <button
              className="stock-selector-button"
              onClick={() => setIsSelectorOpen(true)}
            >
              Select Stocks
            </button>
          </div>
        </div>

        <div className={`stock-cards-container ${isGridView ? 'grid-view' : 'list-view'}`}>
          {!isGridView && (
            <div className="list-header">
              <div>Stock</div>
              <div>Price</div>
              <div>Change</div>
              <div>Low</div>
              <div>High</div>
            </div>
          )}
          {renderStockCards()}
        </div>

        {isSelectorOpen && (
          <StockSelectorModal
            isOpen={isSelectorOpen}
            onClose={() => setIsSelectorOpen(false)}
            selectedStocks={selectedStocks}
            onStocksChange={(newSelectedStocks) => {
              setSelectedStocks(newSelectedStocks);
              localStorage.setItem('selectedStocks', JSON.stringify(newSelectedStocks));
            }}
          />
        )}
      </header>
    </div>
  );
}

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
          <h2>Select Stocks</h2>
          <p className="selection-count">
            {selectedStocks.length} selected out of 6
          </p>
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="stock-search-input"
          />
        </div>

        <div className="stock-list-container">
          {filteredStocks.map((stock) => (
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
          <button onClick={onClose} className="done-button">Done</button>
        </div>
      </div>
    </div>
  );
};

export default StockList;
