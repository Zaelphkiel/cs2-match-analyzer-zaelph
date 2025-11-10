import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { config } from './config';
import matchesRouter from './routes/matches';
import healthRouter from './routes/health';

const app: Express = express();

app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'CS2 Analytics Backend',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      matches: '/api/matches',
      matchDetails: '/api/matches/:id',
      analyze: '/api/matches/:id/analyze',
    },
  });
});

app.use('/health', healthRouter);
app.use('/api/matches', matchesRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('CS2 Analytics Backend Server');
  console.log('='.repeat(60));
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Server running on port: ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/matches`);
  console.log(`Browserless: ${config.browserlessApiKey ? 'Configured ✓' : 'Not configured ✗'}`);
  console.log(`ScraperAPI: ${config.scraperApiKey ? 'Configured ✓' : 'Not configured ✗'}`);
  console.log('='.repeat(60));
});

export default app;
