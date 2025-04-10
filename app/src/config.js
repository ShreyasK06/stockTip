// API Configuration
const config = {
  finnhubApiKey: process.env.REACT_APP_FINNHUB_API_KEY || '',
  fmpApiKey: process.env.REACT_APP_FMP_API_KEY || '',
  openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
  alphaVantageApiKey: process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || 'BZ65G11VSU2N40TD',
};

// Check if all required API keys are present
const hasValidConfig = () => {
  return config.finnhubApiKey && config.fmpApiKey && config.openaiApiKey;
};

export { config, hasValidConfig };