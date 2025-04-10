import React, { useState, useEffect } from 'react';
import { getCryptoExchangeRate } from '../services/alphaVantageService';
import { FaBitcoin, FaEthereum, FaDollarSign, FaExchangeAlt } from 'react-icons/fa';
import '../styles/CryptoExchangeRates.css';

const CryptoExchangeRates = () => {
  const [cryptoRates, setCryptoRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // List of cryptocurrencies to display
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', icon: <FaBitcoin /> },
    { symbol: 'ETH', name: 'Ethereum', icon: <FaEthereum /> },
    { symbol: 'SOL', name: 'Solana', icon: <FaDollarSign /> },
    { symbol: 'ADA', name: 'Cardano', icon: <FaDollarSign /> },
    { symbol: 'DOT', name: 'Polkadot', icon: <FaDollarSign /> },
  ];

  useEffect(() => {
    const fetchCryptoRates = async () => {
      try {
        setLoading(true);
        
        // Fetch exchange rates for all cryptocurrencies in parallel
        const ratesPromises = cryptos.map(crypto => 
          getCryptoExchangeRate(crypto.symbol, 'USD')
        );
        
        const results = await Promise.all(ratesPromises);
        
        // Process and store the results
        const ratesData = {};
        results.forEach((result, index) => {
          const crypto = cryptos[index];
          if (result && result['Realtime Currency Exchange Rate']) {
            ratesData[crypto.symbol] = {
              rate: result['Realtime Currency Exchange Rate']['5. Exchange Rate'],
              lastUpdated: result['Realtime Currency Exchange Rate']['6. Last Refreshed'],
              bidPrice: result['Realtime Currency Exchange Rate']['8. Bid Price'] || 'N/A',
              askPrice: result['Realtime Currency Exchange Rate']['9. Ask Price'] || 'N/A'
            };
          }
        });
        
        setCryptoRates(ratesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching crypto exchange rates:', err);
        setError('Failed to load cryptocurrency data');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoRates();
    
    // Refresh rates every 5 minutes
    const intervalId = setInterval(fetchCryptoRates, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading && Object.keys(cryptoRates).length === 0) {
    return <div className="crypto-loading">Loading cryptocurrency exchange rates...</div>;
  }

  if (error && Object.keys(cryptoRates).length === 0) {
    return <div className="crypto-error">{error}</div>;
  }

  return (
    <div className="crypto-container">
      <div className="crypto-header">
        <FaBitcoin className="section-icon" />
        <h3>Cryptocurrency Exchange Rates</h3>
      </div>
      
      <div className="crypto-content">
        <div className="crypto-rates-grid">
          {cryptos.map(crypto => {
            const rateData = cryptoRates[crypto.symbol];
            
            if (!rateData) {
              return (
                <div key={crypto.symbol} className="crypto-card loading">
                  <div className="crypto-icon">{crypto.icon}</div>
                  <div className="crypto-name">{crypto.name}</div>
                  <div className="crypto-rate">Loading...</div>
                </div>
              );
            }
            
            const rate = parseFloat(rateData.rate);
            
            return (
              <div key={crypto.symbol} className="crypto-card">
                <div className="crypto-icon">{crypto.icon}</div>
                <div className="crypto-name">{crypto.name}</div>
                <div className="crypto-rate">
                  <FaDollarSign /> {rate.toLocaleString(undefined, { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: rate > 100 ? 2 : 4
                  })}
                </div>
                <div className="crypto-updated">
                  Last updated: {new Date(rateData.lastUpdated).toLocaleTimeString()}
                </div>
                <div className="crypto-bid-ask">
                  <div className="crypto-bid">Bid: ${parseFloat(rateData.bidPrice).toLocaleString(undefined, { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: rate > 100 ? 2 : 4
                  })}</div>
                  <div className="crypto-ask">Ask: ${parseFloat(rateData.askPrice).toLocaleString(undefined, { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: rate > 100 ? 2 : 4
                  })}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="crypto-footer">
        <div className="crypto-disclaimer">
          <FaExchangeAlt className="disclaimer-icon" />
          <p>Cryptocurrency prices are volatile and may change rapidly. All trading involves risk.</p>
        </div>
      </div>
    </div>
  );
};

export default CryptoExchangeRates;
