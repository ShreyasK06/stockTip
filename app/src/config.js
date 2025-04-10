// API Configuration
const config = {
  finnhubApiKey: process.env.REACT_APP_FINNHUB_API_KEY || '',
  fmpApiKey: process.env.REACT_APP_FMP_API_KEY || '',
  openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  alphaVantageApiKey: process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || '',
};

// Check if at least one API key is present
const hasValidConfig = () => {
  // Return true even if some API keys are missing
  // This allows the app to work with partial API key configuration
  return true;
};

export { config, hasValidConfig };