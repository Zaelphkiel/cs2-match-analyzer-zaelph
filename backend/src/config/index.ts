import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  browserlessApiKey: process.env.BROWSERLESS_API_KEY || '',
  scraperApiKey: process.env.SCRAPER_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  browserlessUrl: 'https://chrome.browserless.io',
  scraperApiUrl: 'https://api.scraperapi.com',
};

if (!config.browserlessApiKey) {
  console.warn('WARNING: BROWSERLESS_API_KEY not set');
}

if (!config.scraperApiKey) {
  console.warn('WARNING: SCRAPER_API_KEY not set');
}

console.log('Config loaded:', {
  port: config.port,
  nodeEnv: config.nodeEnv,
  browserlessConfigured: !!config.browserlessApiKey,
  scraperApiConfigured: !!config.scraperApiKey,
});
