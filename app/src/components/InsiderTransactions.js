import React, { useState, useEffect } from 'react';
import { getInsiderTransactions } from '../services/alphaVantageService';
import { FaUserSecret, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import '../styles/InsiderTransactions.css';

const InsiderTransactions = ({ symbol }) => {
  const [transactionsData, setTransactionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactionsData = async () => {
      try {
        setLoading(true);
        const data = await getInsiderTransactions(symbol);
        setTransactionsData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching insider transactions:', err);
        setError('Failed to load insider transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionsData();
  }, [symbol]);

  if (loading) {
    return <div className="insider-loading">Loading insider transactions...</div>;
  }

  if (error) {
    return <div className="insider-error">{error}</div>;
  }

  if (!transactionsData || !transactionsData.transactions || transactionsData.transactions.length === 0) {
    return <div className="insider-error">No insider transactions available</div>;
  }

  // Get the most recent transactions (limit to 5)
  const recentTransactions = transactionsData.transactions.slice(0, 5);

  return (
    <div className="insider-container">
      <div className="insider-header">
        <FaUserSecret className="section-icon" />
        <h3>Recent Insider Transactions</h3>
      </div>
      
      <div className="insider-content">
        <div className="insider-table">
          <div className="insider-table-header">
            <div className="insider-cell">Date</div>
            <div className="insider-cell">Insider</div>
            <div className="insider-cell">Title</div>
            <div className="insider-cell">Transaction</div>
            <div className="insider-cell">Shares</div>
            <div className="insider-cell">Value</div>
          </div>
          
          {recentTransactions.map((transaction, index) => {
            const transactionType = transaction.transactionType;
            const isPurchase = transactionType.includes('Purchase') || transactionType.includes('Buy');
            
            return (
              <div key={index} className="insider-table-row">
                <div className="insider-cell">{transaction.transactionDate}</div>
                <div className="insider-cell">{transaction.reportingName}</div>
                <div className="insider-cell">{transaction.reportingInsiderTitle}</div>
                <div className={`insider-cell transaction-type ${isPurchase ? 'purchase' : 'sale'}`}>
                  {isPurchase ? <FaArrowUp /> : <FaArrowDown />}
                  {transaction.transactionType}
                </div>
                <div className="insider-cell">{transaction.transactionShares}</div>
                <div className="insider-cell">
                  ${parseFloat(transaction.transactionValue).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="insider-summary">
        <p className="insider-note">
          Insider transactions can provide insights into how company executives and directors view the stock's value.
        </p>
      </div>
    </div>
  );
};

export default InsiderTransactions;
