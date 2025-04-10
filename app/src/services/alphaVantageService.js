import { config } from '../config';
import { getFromLocalStorage, saveToLocalStorage } from '../utils';

const ALPHA_VANTAGE_API_KEY = config.alphaVantageApiKey;
const BASE_URL = 'https://www.alphavantage.co/query';

const CACHE_KEYS = {
  INTRADAY: 'alphavantage_intraday_',
  DAILY: 'alphavantage_daily_',
  WEEKLY: 'alphavantage_weekly_',
  MONTHLY: 'alphavantage_monthly_',
  COMPANY_OVERVIEW: 'alphavantage_company_overview_',
  EARNINGS: 'alphavantage_earnings_',
  EARNINGS_TRANSCRIPT: 'alphavantage_earnings_transcript_',
  INSIDER_TRANSACTIONS: 'alphavantage_insider_transactions_',
  CRYPTO_EXCHANGE_RATE: 'alphavantage_crypto_exchange_rate_',
  REAL_GDP: 'alphavantage_real_gdp',
  REAL_GDP_PER_CAPITA: 'alphavantage_real_gdp_per_capita',
  INFLATION: 'alphavantage_inflation',
  UNEMPLOYMENT: 'alphavantage_unemployment',
};

// Helper function to check if cached data is valid
const isCacheValid = (cachedData, hours = 24) => {
  if (!cachedData || !cachedData.timestamp) return false;

  const cacheTime = new Date(cachedData.timestamp);
  const currentTime = new Date();
  const diffHours = (currentTime - cacheTime) / (1000 * 60 * 60); // Convert ms to hours

  return diffHours < hours; // Cache is valid if less than specified hours old
};

// Helper function to fetch data from Alpha Vantage
const fetchAlphaVantageData = async (params) => {
  const queryParams = new URLSearchParams({
    ...params,
    apikey: ALPHA_VANTAGE_API_KEY,
  });

  try {
    const response = await fetch(`${BASE_URL}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check for Alpha Vantage error messages
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    if (data['Information']) {
      console.warn('Alpha Vantage API notice:', data['Information']);
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching data from Alpha Vantage:', error);
    throw error;
  }
};

// Get intraday data for a stock
export const getIntradayData = async (symbol, interval = '5min') => {
  const cacheKey = `${CACHE_KEYS.INTRADAY}${symbol}_${interval}`;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 1 hour for intraday)
  if (cachedData && isCacheValid(cachedData, 1)) {
    console.log(`Using cached intraday data for ${symbol}`);
    return cachedData.data;
  }
  
  try {
    console.log(`Fetching new intraday data for ${symbol}`);
    const data = await fetchAlphaVantageData({
      function: 'TIME_SERIES_INTRADAY',
      symbol,
      interval,
      outputsize: 'compact',
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    // If fetch fails but we have cached data (even if old), use it as fallback
    if (cachedData) {
      console.log(`Using stale cached intraday data for ${symbol} as fallback`);
      return cachedData.data;
    }
    throw error;
  }
};

// Get daily time series data
export const getDailyData = async (symbol, outputsize = 'compact') => {
  const cacheKey = `${CACHE_KEYS.DAILY}${symbol}`;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 24 hours)
  if (cachedData && isCacheValid(cachedData, 24)) {
    console.log(`Using cached daily data for ${symbol}`);
    return cachedData.data;
  }
  
  try {
    console.log(`Fetching new daily data for ${symbol}`);
    const data = await fetchAlphaVantageData({
      function: 'TIME_SERIES_DAILY',
      symbol,
      outputsize,
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get weekly time series data
export const getWeeklyData = async (symbol) => {
  const cacheKey = `${CACHE_KEYS.WEEKLY}${symbol}`;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 24 hours)
  if (cachedData && isCacheValid(cachedData, 24)) {
    console.log(`Using cached weekly data for ${symbol}`);
    return cachedData.data;
  }
  
  try {
    console.log(`Fetching new weekly data for ${symbol}`);
    const data = await fetchAlphaVantageData({
      function: 'TIME_SERIES_WEEKLY',
      symbol,
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get monthly time series data
export const getMonthlyData = async (symbol) => {
  const cacheKey = `${CACHE_KEYS.MONTHLY}${symbol}`;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 24 hours)
  if (cachedData && isCacheValid(cachedData, 24)) {
    console.log(`Using cached monthly data for ${symbol}`);
    return cachedData.data;
  }
  
  try {
    console.log(`Fetching new monthly data for ${symbol}`);
    const data = await fetchAlphaVantageData({
      function: 'TIME_SERIES_MONTHLY',
      symbol,
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get company overview
export const getCompanyOverview = async (symbol) => {
  const cacheKey = `${CACHE_KEYS.COMPANY_OVERVIEW}${symbol}`;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 7 days for company info)
  if (cachedData && isCacheValid(cachedData, 24 * 7)) {
    console.log(`Using cached company overview for ${symbol}`);
    return cachedData.data;
  }
  
  try {
    console.log(`Fetching new company overview for ${symbol}`);
    const data = await fetchAlphaVantageData({
      function: 'OVERVIEW',
      symbol,
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get earnings data
export const getEarnings = async (symbol) => {
  const cacheKey = `${CACHE_KEYS.EARNINGS}${symbol}`;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 7 days for earnings)
  if (cachedData && isCacheValid(cachedData, 24 * 7)) {
    console.log(`Using cached earnings data for ${symbol}`);
    return cachedData.data;
  }
  
  try {
    console.log(`Fetching new earnings data for ${symbol}`);
    const data = await fetchAlphaVantageData({
      function: 'EARNINGS',
      symbol,
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get earnings call transcript
export const getEarningsTranscript = async (symbol, quarter, fiscalYear) => {
  const cacheKey = `${CACHE_KEYS.EARNINGS_TRANSCRIPT}${symbol}_${quarter}_${fiscalYear}`;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 30 days for transcripts)
  if (cachedData && isCacheValid(cachedData, 24 * 30)) {
    console.log(`Using cached earnings transcript for ${symbol}`);
    return cachedData.data;
  }
  
  try {
    console.log(`Fetching new earnings transcript for ${symbol}`);
    const data = await fetchAlphaVantageData({
      function: 'EARNINGS_CALL_TRANSCRIPT',
      symbol,
      quarter,
      fiscalYear,
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get insider transactions
export const getInsiderTransactions = async (symbol) => {
  const cacheKey = `${CACHE_KEYS.INSIDER_TRANSACTIONS}${symbol}`;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 7 days for insider transactions)
  if (cachedData && isCacheValid(cachedData, 24 * 7)) {
    console.log(`Using cached insider transactions for ${symbol}`);
    return cachedData.data;
  }
  
  try {
    console.log(`Fetching new insider transactions for ${symbol}`);
    const data = await fetchAlphaVantageData({
      function: 'INSIDER_TRANSACTIONS',
      symbol,
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get crypto exchange rate
export const getCryptoExchangeRate = async (fromCurrency, toCurrency) => {
  const cacheKey = `${CACHE_KEYS.CRYPTO_EXCHANGE_RATE}${fromCurrency}_${toCurrency}`;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 1 hour for crypto rates)
  if (cachedData && isCacheValid(cachedData, 1)) {
    console.log(`Using cached crypto exchange rate for ${fromCurrency} to ${toCurrency}`);
    return cachedData.data;
  }
  
  try {
    console.log(`Fetching new crypto exchange rate for ${fromCurrency} to ${toCurrency}`);
    const data = await fetchAlphaVantageData({
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: fromCurrency,
      to_currency: toCurrency,
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get real GDP data
export const getRealGDP = async () => {
  const cacheKey = CACHE_KEYS.REAL_GDP;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 30 days for economic data)
  if (cachedData && isCacheValid(cachedData, 24 * 30)) {
    console.log('Using cached real GDP data');
    return cachedData.data;
  }
  
  try {
    console.log('Fetching new real GDP data');
    const data = await fetchAlphaVantageData({
      function: 'REAL_GDP',
      interval: 'quarterly',
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get real GDP per capita
export const getRealGDPPerCapita = async () => {
  const cacheKey = CACHE_KEYS.REAL_GDP_PER_CAPITA;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 30 days for economic data)
  if (cachedData && isCacheValid(cachedData, 24 * 30)) {
    console.log('Using cached real GDP per capita data');
    return cachedData.data;
  }
  
  try {
    console.log('Fetching new real GDP per capita data');
    const data = await fetchAlphaVantageData({
      function: 'REAL_GDP_PER_CAPITA',
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get inflation data
export const getInflation = async () => {
  const cacheKey = CACHE_KEYS.INFLATION;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 30 days for economic data)
  if (cachedData && isCacheValid(cachedData, 24 * 30)) {
    console.log('Using cached inflation data');
    return cachedData.data;
  }
  
  try {
    console.log('Fetching new inflation data');
    const data = await fetchAlphaVantageData({
      function: 'INFLATION',
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Get unemployment rate
export const getUnemploymentRate = async () => {
  const cacheKey = CACHE_KEYS.UNEMPLOYMENT;
  const cachedData = getFromLocalStorage(cacheKey);
  
  // Use cached data if valid (refresh every 30 days for economic data)
  if (cachedData && isCacheValid(cachedData, 24 * 30)) {
    console.log('Using cached unemployment rate data');
    return cachedData.data;
  }
  
  try {
    console.log('Fetching new unemployment rate data');
    const data = await fetchAlphaVantageData({
      function: 'UNEMPLOYMENT',
    });
    
    // Cache the data
    saveToLocalStorage(cacheKey, {
      data,
      timestamp: new Date().toISOString(),
    });
    
    return data;
  } catch (error) {
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};
