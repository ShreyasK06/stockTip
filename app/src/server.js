const OpenAI = require("openai");
const { config, hasValidConfig } = require('./config');

const client = new OpenAI({
  apiKey: config.openaiApiKey,
  dangerouslyAllowBrowser: true
});

const finnhub = require('finnhub');
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = config.finnhubApiKey;
const finnhubClient = new finnhub.DefaultApi();

const STORAGE_KEYS = {
  STOCK_DATA: 'stockTip_stockData',
  NEWS_DATA: 'stockTip_newsData',
  MARKET_NEWS: 'stockTip_marketNews',
  HISTORICAL_DATA: 'stockTip_historicalData',
  LAST_UPDATE: 'stockTip_lastUpdate'
};

const FMP_API_KEY = config.fmpApiKey;

const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const parsed = JSON.parse(item);

    // Check if data is older than 5 minutes
    if (Date.now() - parsed.timestamp > 5 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      data: data
    }));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const fetchStockData = (symbol) => {
  return new Promise((resolve, reject) => {
    if (!hasValidConfig()) {
      reject(new Error('API keys not configured. Please check your environment variables.'));
      return;
    }

    // First try to get cached data
    const cachedData = getFromLocalStorage(STORAGE_KEYS.STOCK_DATA);
    const cachedStockData = cachedData?.data?.[symbol];

    // If we have cached data, use it immediately
    if (cachedStockData) {
      resolve({ ...cachedStockData, symbol, fromCache: true });
    }

    // Then try to fetch fresh data
    finnhubClient.quote(symbol, (error, data, response) => {
      if (error) {
        console.error(`Finnhub API Error for ${symbol}:`, error);
        if (cachedStockData) {
          // We already resolved with cached data, so just return
          return;
        }
        reject(error);
      } else {
        const stockData = { ...data, symbol };
        // Save to cache
        const existingData = getFromLocalStorage(STORAGE_KEYS.STOCK_DATA)?.data || {};
        saveToLocalStorage(STORAGE_KEYS.STOCK_DATA, {
          ...existingData,
          [symbol]: stockData
        });
        if (!cachedStockData) {
          // Only resolve if we haven't already resolved with cached data
          resolve(stockData);
        }
      }
    });
  });
};

const fetchCompanyNews = (symbol) => {
  return new Promise((resolve, reject) => {
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);

    const from = pastDate.toISOString().split('T')[0];
    const to = currentDate.toISOString().split('T')[0];

    // Try to get cached data
    const cachedData = getFromLocalStorage(STORAGE_KEYS.NEWS_DATA);
    const cachedNewsData = cachedData?.data?.[symbol];

    finnhubClient.companyNews(symbol, from, to, (error, data, response) => {
      if (error) {
        console.error(`News API Error for ${symbol}:`, error);
        // If we have cached data, return it on error
        if (cachedNewsData) {
          resolve({ data: cachedNewsData, fromCache: true });
          return;
        }
        reject(error);
      } else {
        const newsData = data.slice(0, 10);
        // Save to cache
        const existingData = getFromLocalStorage(STORAGE_KEYS.NEWS_DATA)?.data || {};
        saveToLocalStorage(STORAGE_KEYS.NEWS_DATA, {
          ...existingData,
          [symbol]: newsData
        });
        resolve({ data: newsData });
      }
    });
  });
};

const fetchHistoricalData = async (symbol, timeRange) => {
  const endDate = new Date();
  let startDate = new Date();

  // Set start date based on time range
  if (timeRange === '1w') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (timeRange === '1m') {
    startDate.setMonth(startDate.getMonth() - 1);
  }

  // Format dates as YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);

  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${startDateStr}&to=${endDateStr}&apikey=${FMP_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to match your existing format
    const transformedData = {
      c: [], // closing prices
      h: [], // high prices
      l: [], // low prices
      t: [], // timestamps
    };

    if (data.historical) {
      // FMP returns data in reverse chronological order, so reverse it
      data.historical.reverse().forEach(day => {
        transformedData.c.push(day.close);
        transformedData.h.push(day.high);
        transformedData.l.push(day.low);
        transformedData.t.push(new Date(day.date).getTime() / 1000);
      });
    }

    return { data: transformedData };
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw error;
  }
};

const getStocks = async (symbols = []) => {
  const stocksData = {};

  try {
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const data = await fetchStockData(symbol);
          // Only add to stocksData if we got valid data
          if (data && data.c !== undefined) {
            stocksData[symbol] = data;
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          // Try to get cached data
          const cachedData = getFromLocalStorage(STORAGE_KEYS.STOCK_DATA);
          if (cachedData && cachedData.data[symbol]) {
            stocksData[symbol] = { ...cachedData.data[symbol], fromCache: true };
          }
        }
      })
    );

    // Save last successful update timestamp
    saveToLocalStorage(STORAGE_KEYS.LAST_UPDATE, Date.now());
    return stocksData;
  } catch (error) {
    console.error('Error in getStocks:', error);
    // Return cached data if available
    const cachedData = getFromLocalStorage(STORAGE_KEYS.STOCK_DATA);
    return cachedData?.data || {};
  }
};

const getAIAnalysis = async (symbol, question = '') => {
  if (!hasValidConfig()) {
    throw new Error('API keys not configured. Please check your environment variables.');
  }

  try {
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant that provides stock market analysis and investment advice."
        },
        {
          role: "user",
          content: `Analyze the stock ${symbol}. ${question}`
        }
      ],
      model: "gpt-3.5-turbo",
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

const fetchMarketNews = () => {
  return new Promise((resolve, reject) => {
    // Try to get cached data first
    const cachedData = getFromLocalStorage(STORAGE_KEYS.MARKET_NEWS);
    if (cachedData?.data) {
      resolve({ data: cachedData.data, fromCache: true });
    }

    finnhubClient.marketNews("general", {}, (error, data, response) => {
      if (error) {
        console.error('Market News API Error:', error);
        if (cachedData?.data) {
          return; // Already resolved with cached data
        }
        reject(error);
      } else {
        const newsData = data.slice(0, 15); // Get top 15 market news
        saveToLocalStorage(STORAGE_KEYS.MARKET_NEWS, newsData);
        if (!cachedData?.data) {
          resolve({ data: newsData });
        }
      }
    });
  });
};

const searchSymbol = async (query) => {
  try {
    // First check cache
    const cacheKey = `search_${query.toLowerCase()}`;
    const cachedResults = getFromLocalStorage(cacheKey);
    if (cachedResults?.data) {
      return cachedResults.data;
    }

    // If no cache, make API request with retry logic
    return new Promise((resolve, reject) => {
      const makeRequest = (retryCount = 0) => {
        finnhubClient.symbolSearch(query, (error, data, response) => {
          if (error) {
            console.error('Symbol search error:', error);

            // If rate limited and we haven't retried too many times
            if (error.status === 429 && retryCount < 3) {
              setTimeout(() => {
                makeRequest(retryCount + 1);
              }, 1000 * (retryCount + 1)); // Exponential backoff
              return;
            }

            reject(error);
          } else {
            // Filter and transform the results
            const results = data.result
              .filter(item =>
                // Include both common stocks and ETFs
                (item.type === 'Common Stock' || item.type === 'ETP') &&
                // Match against both symbol and description
                (item.description.toLowerCase().includes(query.toLowerCase()) ||
                  item.symbol.toLowerCase().includes(query.toLowerCase()))
              )
              .slice(0, 8) // Limit to 8 results
              .map(item => ({
                symbol: item.symbol,
                description: item.description
              }));

            // Cache the results
            saveToLocalStorage(cacheKey, results);
            resolve(results);
          }
        });
      };

      makeRequest();
    });
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

module.exports = {
  getStocks,
  fetchCompanyNews,
  fetchHistoricalData,
  getAIAnalysis,
  fetchMarketNews,
  searchSymbol,
};





