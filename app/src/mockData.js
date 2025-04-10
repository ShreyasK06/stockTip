// Mock data for when API keys are not available

export const mockStockData = {
  AAPL: {
    c: 187.32,
    h: 188.45,
    l: 186.21,
    o: 187.15,
    pc: 186.78,
    t: 1686956400,
    name: "Apple Inc.",
    change: 0.54,
    percentChange: 0.29
  },
  MSFT: {
    c: 342.66,
    h: 344.23,
    l: 340.12,
    o: 341.87,
    pc: 340.45,
    t: 1686956400,
    name: "Microsoft Corporation",
    change: 2.21,
    percentChange: 0.65
  },
  GOOGL: {
    c: 138.21,
    h: 139.45,
    l: 137.32,
    o: 138.76,
    pc: 137.98,
    t: 1686956400,
    name: "Alphabet Inc.",
    change: 0.23,
    percentChange: 0.17
  },
  AMZN: {
    c: 129.33,
    h: 130.45,
    l: 128.76,
    o: 129.87,
    pc: 128.45,
    t: 1686956400,
    name: "Amazon.com, Inc.",
    change: 0.88,
    percentChange: 0.69
  },
  TSLA: {
    c: 248.48,
    h: 250.32,
    l: 246.78,
    o: 247.65,
    pc: 245.34,
    t: 1686956400,
    name: "Tesla, Inc.",
    change: 3.14,
    percentChange: 1.28
  },
  META: {
    c: 287.05,
    h: 288.76,
    l: 285.43,
    o: 286.54,
    pc: 284.32,
    t: 1686956400,
    name: "Meta Platforms, Inc.",
    change: 2.73,
    percentChange: 0.96
  },
  NFLX: {
    c: 418.23,
    h: 420.45,
    l: 416.78,
    o: 417.65,
    pc: 415.87,
    t: 1686956400,
    name: "Netflix, Inc.",
    change: 2.36,
    percentChange: 0.57
  },
  NVDA: {
    c: 422.76,
    h: 425.32,
    l: 420.45,
    o: 421.87,
    pc: 418.65,
    t: 1686956400,
    name: "NVIDIA Corporation",
    change: 4.11,
    percentChange: 0.98
  }
};

export const mockNewsData = {
  AAPL: [
    {
      category: "technology",
      datetime: 1686956400,
      headline: "Apple Announces New MacBook Pro with M2 Chip",
      id: 1001,
      image: "https://example.com/image1.jpg",
      related: "AAPL",
      source: "CNBC",
      summary: "Apple has announced a new MacBook Pro featuring the M2 chip, promising improved performance and battery life.",
      url: "https://example.com/news/1"
    },
    {
      category: "technology",
      datetime: 1686870000,
      headline: "Apple's iOS 17 to Include Major Updates to Messages App",
      id: 1002,
      image: "https://example.com/image2.jpg",
      related: "AAPL",
      source: "The Verge",
      summary: "The upcoming iOS 17 update will include significant enhancements to the Messages app, including new features and improved performance.",
      url: "https://example.com/news/2"
    },
    {
      category: "business",
      datetime: 1686783600,
      headline: "Apple Stock Rises on Strong Quarterly Earnings",
      id: 1003,
      image: "https://example.com/image3.jpg",
      related: "AAPL",
      source: "Bloomberg",
      summary: "Apple's stock price increased following the release of quarterly earnings that exceeded analyst expectations.",
      url: "https://example.com/news/3"
    }
  ],
  MSFT: [
    {
      category: "technology",
      datetime: 1686956400,
      headline: "Microsoft Unveils New AI Features for Office 365",
      id: 2001,
      image: "https://example.com/image4.jpg",
      related: "MSFT",
      source: "TechCrunch",
      summary: "Microsoft has announced new AI-powered features for Office 365, designed to enhance productivity and collaboration.",
      url: "https://example.com/news/4"
    },
    {
      category: "business",
      datetime: 1686870000,
      headline: "Microsoft's Cloud Business Continues Strong Growth",
      id: 2002,
      image: "https://example.com/image5.jpg",
      related: "MSFT",
      source: "Reuters",
      summary: "Microsoft's Azure cloud services reported continued strong growth, maintaining its position as a leader in the cloud computing market.",
      url: "https://example.com/news/5"
    }
  ]
};

export const mockMarketNews = [
  {
    category: "business",
    datetime: 1686956400,
    headline: "Fed Holds Interest Rates Steady, Signals Future Increases",
    id: 3001,
    image: "https://example.com/image6.jpg",
    related: "SPY,QQQ,DIA",
    source: "Wall Street Journal",
    summary: "The Federal Reserve has decided to maintain current interest rates but indicated potential increases in the coming months to address inflation concerns.",
    url: "https://example.com/news/6"
  },
  {
    category: "economy",
    datetime: 1686870000,
    headline: "US Inflation Rate Drops to 3.2% in Latest Report",
    id: 3002,
    image: "https://example.com/image7.jpg",
    related: "SPY,QQQ,DIA",
    source: "CNBC",
    summary: "The latest Consumer Price Index report shows inflation has decreased to 3.2%, providing some relief to consumers and investors.",
    url: "https://example.com/news/7"
  },
  {
    category: "markets",
    datetime: 1686783600,
    headline: "S&P 500 Reaches New All-Time High",
    id: 3003,
    image: "https://example.com/image8.jpg",
    related: "SPY",
    source: "Bloomberg",
    summary: "The S&P 500 index has reached a new record high, driven by strong performance in technology and financial sectors.",
    url: "https://example.com/news/8"
  },
  {
    category: "economy",
    datetime: 1686697200,
    headline: "Retail Sales Exceed Expectations in June",
    id: 3004,
    image: "https://example.com/image9.jpg",
    related: "XRT,WMT,TGT",
    source: "Reuters",
    summary: "Retail sales data for June has surpassed analyst expectations, indicating strong consumer spending despite inflation concerns.",
    url: "https://example.com/news/9"
  },
  {
    category: "business",
    datetime: 1686610800,
    headline: "Major Banks Report Strong Quarterly Earnings",
    id: 3005,
    image: "https://example.com/image10.jpg",
    related: "JPM,BAC,C,WFC",
    source: "Financial Times",
    summary: "Leading US banks have reported better-than-expected quarterly earnings, suggesting resilience in the financial sector.",
    url: "https://example.com/news/10"
  }
];

export const mockHistoricalData = {
  AAPL: {
    "1D": [
      { time: "09:30", price: 186.78 },
      { time: "10:00", price: 186.92 },
      { time: "10:30", price: 187.15 },
      { time: "11:00", price: 187.32 },
      { time: "11:30", price: 187.45 },
      { time: "12:00", price: 187.21 },
      { time: "12:30", price: 187.18 },
      { time: "13:00", price: 187.25 },
      { time: "13:30", price: 187.42 },
      { time: "14:00", price: 187.56 },
      { time: "14:30", price: 187.48 },
      { time: "15:00", price: 187.35 },
      { time: "15:30", price: 187.29 },
      { time: "16:00", price: 187.32 }
    ],
    "1W": [
      { time: "Monday", price: 185.23 },
      { time: "Tuesday", price: 185.87 },
      { time: "Wednesday", price: 186.42 },
      { time: "Thursday", price: 186.78 },
      { time: "Friday", price: 187.32 }
    ],
    "1M": [
      { time: "Week 1", price: 182.45 },
      { time: "Week 2", price: 183.76 },
      { time: "Week 3", price: 185.21 },
      { time: "Week 4", price: 187.32 }
    ],
    "3M": [
      { time: "January", price: 175.32 },
      { time: "February", price: 180.45 },
      { time: "March", price: 187.32 }
    ],
    "1Y": [
      { time: "Q1", price: 165.78 },
      { time: "Q2", price: 172.34 },
      { time: "Q3", price: 180.56 },
      { time: "Q4", price: 187.32 }
    ],
    "5Y": [
      { time: "2019", price: 72.45 },
      { time: "2020", price: 132.69 },
      { time: "2021", price: 177.57 },
      { time: "2022", price: 129.93 },
      { time: "2023", price: 187.32 }
    ]
  }
};

export const mockAIAnalysis = {
  AAPL: {
    summary: "Apple Inc. (AAPL) continues to show strong financial performance with robust iPhone sales and growing services revenue. The company's focus on innovation and expanding its ecosystem provides a solid foundation for future growth. Recent product launches and upcoming AI initiatives position Apple well against competitors.",
    strengths: [
      "Strong brand loyalty and ecosystem integration",
      "Consistent revenue growth from services segment",
      "Robust cash position allowing for significant shareholder returns",
      "Continued innovation in product development"
    ],
    weaknesses: [
      "Dependence on iPhone sales for significant portion of revenue",
      "Regulatory challenges in multiple markets",
      "Supply chain vulnerabilities",
      "Increasing competition in key product categories"
    ],
    opportunities: [
      "Expansion into emerging markets",
      "Growth in wearables and home devices",
      "Development of AR/VR technologies",
      "Further monetization of services ecosystem"
    ],
    threats: [
      "Intensifying competition in smartphone market",
      "Potential economic downturn affecting consumer spending",
      "Regulatory pressures regarding App Store policies",
      "Rising component costs affecting margins"
    ],
    recommendation: "Based on current financial metrics and market position, Apple presents a favorable investment opportunity for long-term investors. The company's strong fundamentals, consistent innovation, and expanding services revenue stream provide multiple avenues for continued growth."
  }
};

export const mockCryptoData = {
  BTC: {
    price: 29876.45,
    change: 234.56,
    percentChange: 0.79,
    marketCap: "582.4B",
    volume: "23.1B",
    supply: "19.5M",
    name: "Bitcoin"
  },
  ETH: {
    price: 1876.32,
    change: 45.67,
    percentChange: 2.49,
    marketCap: "225.7B",
    volume: "12.3B",
    supply: "120.2M",
    name: "Ethereum"
  },
  XRP: {
    price: 0.5432,
    change: 0.0123,
    percentChange: 2.32,
    marketCap: "28.9B",
    volume: "1.2B",
    supply: "53.2B",
    name: "Ripple"
  },
  LTC: {
    price: 87.65,
    change: -1.23,
    percentChange: -1.38,
    marketCap: "6.5B",
    volume: "432.1M",
    supply: "73.4M",
    name: "Litecoin"
  },
  ADA: {
    price: 0.3765,
    change: 0.0087,
    percentChange: 2.36,
    marketCap: "13.2B",
    volume: "567.8M",
    supply: "35.1B",
    name: "Cardano"
  },
  DOT: {
    price: 5.43,
    change: 0.12,
    percentChange: 2.26,
    marketCap: "6.8B",
    volume: "234.5M",
    supply: "1.2B",
    name: "Polkadot"
  }
};
