import { Router, Request, Response } from 'express';
import { cacheService } from '../services/cache';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const cacheStats = cacheService.getStats();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cache: cacheStats,
  });
});

export default router;
