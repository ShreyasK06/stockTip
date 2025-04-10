import { mockStockData, mockNewsData, mockMarketNews, mockHistoricalData, mockAIAnalysis, mockCryptoData } from './mockData';

// Function to get stock data from mock data
export const getMockStockData = (symbol) => {
  if (mockStockData[symbol]) {
    return mockStockData[symbol];
  }
  return null;
};

// Function to get news data from mock data
export const getMockNewsData = (symbol) => {
  if (mockNewsData[symbol]) {
    return mockNewsData[symbol];
  }
  return [];
};

// Function to get market news from mock data
export const getMockMarketNews = () => {
  return mockMarketNews;
};

// Function to get historical data from mock data
export const getMockHistoricalData = (symbol, timeRange) => {
  if (mockHistoricalData[symbol] && mockHistoricalData[symbol][timeRange]) {
    return mockHistoricalData[symbol][timeRange];
  }
  return [];
};

// Function to get AI analysis from mock data
export const getMockAIAnalysis = (symbol) => {
  if (mockAIAnalysis[symbol]) {
    return mockAIAnalysis[symbol];
  }
  return {
    summary: "No analysis available for this stock.",
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    recommendation: "No recommendation available."
  };
};

// Function to get crypto data from mock data
export const getMockCryptoData = (symbol) => {
  if (mockCryptoData[symbol]) {
    return mockCryptoData[symbol];
  }
  return null;
};

// Function to get all crypto data
export const getAllMockCryptoData = () => {
  return mockCryptoData;
};
