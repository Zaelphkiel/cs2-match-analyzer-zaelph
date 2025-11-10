import { Router, Request, Response } from 'express';
import { HLTVScraper } from '../scraper/hltv';
import { MatchAnalyzer } from '../services/analyzer';
import { cacheService } from '../services/cache';
import { Match } from '../types';

const router = Router();
const hltvScraper = new HLTVScraper();
const analyzer = new MatchAnalyzer();

router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('[API] GET /matches - Fetching all matches');

    const cached = cacheService.get<Match[]>('all_matches');
    if (cached) {
      console.log('[API] Returning cached matches');
      return res.json({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    const matches = await hltvScraper.getMatches();
    
    cacheService.set('all_matches', matches, 2);

    console.log(`[API] Returning ${matches.length} matches`);
    res.json({
      success: true,
      data: matches,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error fetching matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API] GET /matches/${id} - Fetching match details`);

    const cacheKey = `match_${id}`;
    const cached = cacheService.get<Match>(cacheKey);
    if (cached) {
      console.log('[API] Returning cached match');
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const matches = await hltvScraper.getMatches();
    const match = matches.find(m => m.id === id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found',
      });
    }

    cacheService.set(cacheKey, match, 2);

    res.json({
      success: true,
      data: match,
      cached: false,
    });
  } catch (error) {
    console.error('[API] Error fetching match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch match',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[API] POST /matches/${id}/analyze - Analyzing match`);

    const cacheKey = `analysis_${id}`;
    const cached = cacheService.get(cacheKey);
    if (cached) {
      console.log('[API] Returning cached analysis');
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const matches = await hltvScraper.getMatches();
    const match = matches.find(m => m.id === id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found',
      });
    }

    const analysis = await analyzer.analyzeMatch(match);
    
    cacheService.set(cacheKey, analysis, 10);

    res.json({
      success: true,
      data: analysis,
      cached: false,
    });
  } catch (error) {
    console.error('[API] Error analyzing match:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze match',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
