import React, { useState, useEffect } from 'react';
import { getCompanyOverview } from '../services/alphaVantageService';
import { FaBuilding, FaGlobe, FaIndustry, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import '../styles/CompanyOverview.css';

const CompanyOverview = ({ symbol }) => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const data = await getCompanyOverview(symbol);
        setCompanyData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching company overview:', err);
        setError('Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [symbol]);

  if (loading) {
    return <div className="company-overview-loading">Loading company information...</div>;
  }

  if (error) {
    return <div className="company-overview-error">{error}</div>;
  }

  if (!companyData || Object.keys(companyData).length === 0) {
    return <div className="company-overview-error">No company information available</div>;
  }

  return (
    <div className="company-overview-container">
      <div className="company-overview-header">
        <FaBuilding className="section-icon" />
        <h3>Company Overview</h3>
      </div>
      
      <div className="company-overview-content">
        <div className="company-overview-description">
          <p>{companyData.Description || 'No description available'}</p>
        </div>
        
        <div className="company-overview-grid">
          <div className="company-overview-item">
            <div className="item-label"><FaGlobe /> Sector</div>
            <div className="item-value">{companyData.Sector || 'N/A'}</div>
          </div>
          
          <div className="company-overview-item">
            <div className="item-label"><FaIndustry /> Industry</div>
            <div className="item-value">{companyData.Industry || 'N/A'}</div>
          </div>
          
          <div className="company-overview-item">
            <div className="item-label"><FaMoneyBillWave /> Market Cap</div>
            <div className="item-value">
              {companyData.MarketCapitalization 
                ? `$${(Number(companyData.MarketCapitalization) / 1000000000).toFixed(2)} B` 
                : 'N/A'}
            </div>
          </div>
          
          <div className="company-overview-item">
            <div className="item-label"><FaChartLine /> P/E Ratio</div>
            <div className="item-value">{companyData.PERatio || 'N/A'}</div>
          </div>
          
          <div className="company-overview-item">
            <div className="item-label">Dividend Yield</div>
            <div className="item-value">
              {companyData.DividendYield 
                ? `${(Number(companyData.DividendYield) * 100).toFixed(2)}%` 
                : 'N/A'}
            </div>
          </div>
          
          <div className="company-overview-item">
            <div className="item-label">52-Week High</div>
            <div className="item-value">${companyData['52WeekHigh'] || 'N/A'}</div>
          </div>
          
          <div className="company-overview-item">
            <div className="item-label">52-Week Low</div>
            <div className="item-value">${companyData['52WeekLow'] || 'N/A'}</div>
          </div>
          
          <div className="company-overview-item">
            <div className="item-label">Beta</div>
            <div className="item-value">{companyData.Beta || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOverview;
