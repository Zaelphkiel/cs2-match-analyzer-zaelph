import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  browserlessApiKey: process.env.BROWSERLESS_API_KEY || '',
  scraperApiKey: process.env.SCRAPER_API_KEY || '',
  pandascoreApiKey: process.env.PANDASCORE_API_KEY || '',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.proxyapi.ru/deepseek/v1',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  vertexAccessToken: process.env.VERTEX_ACCESS_TOKEN || '',
  vertexProjectId: process.env.VERTEX_PROJECT_ID || '',
  vertexRegion: process.env.VERTEX_REGION || 'us-central1',
  aiProvider: process.env.AI_PROVIDER || 'vertex',
  nodeEnv: process.env.NODE_ENV || 'development',
  browserlessUrl: 'https://chrome.browserless.io',
  scraperApiUrl: 'https://api.scraperapi.com',
  pandascoreUrl: 'https://api.pandascore.co',
};

if (!config.browserlessApiKey) {
  console.warn('WARNING: BROWSERLESS_API_KEY not set');
}

if (!config.scraperApiKey) {
  console.warn('WARNING: SCRAPER_API_KEY not set');
}

if (!config.pandascoreApiKey) {
  console.warn('WARNING: PANDASCORE_API_KEY not set');
}

if (!config.deepseekApiKey && !config.vertexAccessToken && !config.geminiApiKey) {
  console.warn('WARNING: No AI API key configured - AI analysis will use fallback data');
}

if (config.aiProvider === 'vertex' && !config.vertexAccessToken) {
  console.warn('WARNING: VERTEX_ACCESS_TOKEN not set but Vertex AI provider selected');
}

if (config.aiProvider === 'vertex' && !config.vertexProjectId) {
  console.warn('WARNING: VERTEX_PROJECT_ID not set but Vertex AI provider selected');
}

console.log('Config loaded:', {
  port: config.port,
  nodeEnv: config.nodeEnv,
  browserlessConfigured: !!config.browserlessApiKey,
  scraperApiConfigured: !!config.scraperApiKey,
  pandascoreConfigured: !!config.pandascoreApiKey,
  deepseekConfigured: !!config.deepseekApiKey,
  geminiConfigured: !!config.geminiApiKey,
  vertexConfigured: !!config.vertexAccessToken && !!config.vertexProjectId,
  aiProvider: config.aiProvider,
});
