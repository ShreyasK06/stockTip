import React, { useState, useEffect } from 'react';
import { getEarnings } from '../services/alphaVantageService';
import { FaChartBar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import '../styles/EarningsData.css';

const EarningsData = ({ symbol }) => {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        const data = await getEarnings(symbol);
        setEarningsData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching earnings data:', err);
        setError('Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [symbol]);

  if (loading) {
    return <div className="earnings-loading">Loading earnings data...</div>;
  }

  if (error) {
    return <div className="earnings-error">{error}</div>;
  }

  if (!earningsData || !earningsData.quarterlyEarnings || earningsData.quarterlyEarnings.length === 0) {
    return <div className="earnings-error">No earnings data available</div>;
  }

  // Get the last 4 quarters of data
  const quarterlyData = earningsData.quarterlyEarnings.slice(0, 4);

  return (
    <div className="earnings-container">
      <div className="earnings-header">
        <FaChartBar className="section-icon" />
        <h3>Quarterly Earnings</h3>
      </div>
      
      <div className="earnings-content">
        <div className="earnings-table">
          <div className="earnings-table-header">
            <div className="earnings-cell">Quarter</div>
            <div className="earnings-cell">Reported EPS</div>
            <div className="earnings-cell">Estimated EPS</div>
            <div className="earnings-cell">Surprise</div>
          </div>
          
          {quarterlyData.map((quarter, index) => {
            const reportedEPS = parseFloat(quarter.reportedEPS);
            const estimatedEPS = parseFloat(quarter.estimatedEPS);
            const surprise = reportedEPS - estimatedEPS;
            const surprisePercent = (surprise / Math.abs(estimatedEPS)) * 100;
            const isPositive = surprise >= 0;
            
            return (
              <div key={index} className="earnings-table-row">
                <div className="earnings-cell">{quarter.fiscalDateEnding}</div>
                <div className="earnings-cell">${reportedEPS.toFixed(2)}</div>
                <div className="earnings-cell">${estimatedEPS.toFixed(2)}</div>
                <div className={`earnings-cell surprise ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                  ${Math.abs(surprise).toFixed(2)} ({Math.abs(surprisePercent).toFixed(2)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="earnings-annual-summary">
        <h4>Annual EPS</h4>
        <div className="annual-eps-container">
          {earningsData.annualEarnings && earningsData.annualEarnings.slice(0, 3).map((annual, index) => (
            <div key={index} className="annual-eps-item">
              <div className="annual-eps-year">{annual.fiscalDateEnding.split('-')[0]}</div>
              <div className="annual-eps-value">${parseFloat(annual.reportedEPS).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsData;
