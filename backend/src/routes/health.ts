import { Router, Request, Response } from 'express';
import { cacheService } from '../services/cache';
import { config } from '../config';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const cacheStats = cacheService.getStats();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: cacheStats,
    apiKeys: {
      browserless: !!config.browserlessApiKey && config.browserlessApiKey !== '',
      scraperApi: !!config.scraperApiKey && config.scraperApiKey !== '',
      pandascore: !!config.pandascoreApiKey && config.pandascoreApiKey !== '' && config.pandascoreApiKey !== 'your_pandascore_api_key_here',
    },
  });
});

export default router;
