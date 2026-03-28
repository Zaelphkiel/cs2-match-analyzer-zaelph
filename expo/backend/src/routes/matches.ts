import { Router, Request, Response } from 'express';
import { HLTVScraper } from '../scraper/hltv';
import { PandaScoreScraper } from '../scraper/pandascore';
import { MatchAnalyzer } from '../services/analyzer';
import { cacheService } from '../services/cache';
import { Match } from '../types';

const router = Router();
const hltvScraper = new HLTVScraper();
const pandascoreScraper = new PandaScoreScraper();
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

    console.log('[API] Fetching matches from PandaScore (primary source)...');
    const pandascoreMatches = await pandascoreScraper.getMatches();
    
    let allMatches = [...pandascoreMatches];

    if (pandascoreMatches.length < 5) {
      console.log('[API] PandaScore returned few matches, trying HLTV as backup...');
      try {
        const hltvMatches = await hltvScraper.getMatches();
        const matchMap = new Map<string, Match>();
        
        pandascoreMatches.forEach(match => {
          const key = `${match.team1.name}_${match.team2.name}`;
          matchMap.set(key, match);
        });

        hltvMatches.forEach(match => {
          const key = `${match.team1.name}_${match.team2.name}`;
          if (!matchMap.has(key)) {
            matchMap.set(key, match);
          }
        });

        allMatches = Array.from(matchMap.values());
      } catch (hltvError) {
        console.error('[API] HLTV backup failed:', hltvError);
      }
    }
    
    cacheService.set('all_matches', allMatches, 2);

    console.log(`[API] Returning ${allMatches.length} matches (${pandascoreMatches.length} from PandaScore)`);
    res.json({
      success: true,
      data: allMatches,
      cached: false,
      sources: {
        pandascore: pandascoreMatches.length,
        total: allMatches.length,
      },
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

    let match: Match | null | undefined;

    if (id.startsWith('ps_')) {
      console.log('[API] Fetching from PandaScore...');
      const pandascoreId = id.replace('ps_', '');
      match = await pandascoreScraper.getMatchById(pandascoreId);
    } else {
      console.log('[API] Fetching from HLTV...');
      const matches = await hltvScraper.getMatches();
      match = matches.find(m => m.id === id);
    }

    if (!match) {
      console.log('[API] Match not found, trying to find in all matches...');
      const [hltvMatches, pandascoreMatches] = await Promise.all([
        hltvScraper.getMatches(),
        pandascoreScraper.getMatches(),
      ]);
      
      const allMatches = [...hltvMatches, ...pandascoreMatches];
      match = allMatches.find(m => m.id === id);
      
      if (!match) {
        return res.status(404).json({
          success: false,
          error: 'Match not found',
        });
      }
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

    let match: Match | null | undefined;

    if (id.startsWith('ps_')) {
      console.log('[API] Fetching match from PandaScore...');
      const pandascoreId = id.replace('ps_', '');
      match = await pandascoreScraper.getMatchById(pandascoreId);
    } else {
      console.log('[API] Fetching match from HLTV...');
      const matches = await hltvScraper.getMatches();
      match = matches.find(m => m.id === id);
    }

    if (!match) {
      console.log('[API] Match not found, trying to find in all matches...');
      const [hltvMatches, pandascoreMatches] = await Promise.all([
        hltvScraper.getMatches(),
        pandascoreScraper.getMatches(),
      ]);
      
      const allMatches = [...hltvMatches, ...pandascoreMatches];
      match = allMatches.find(m => m.id === id);
      
      if (!match) {
        return res.status(404).json({
          success: false,
          error: 'Match not found',
        });
      }
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

router.get('/sources/pandascore', async (req: Request, res: Response) => {
  try {
    console.log('[API] GET /matches/sources/pandascore - Testing PandaScore API');

    const matches = await pandascoreScraper.getMatches();
    
    res.json({
      success: true,
      source: 'PandaScore',
      matchesFound: matches.length,
      data: matches.slice(0, 5),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error testing PandaScore:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch from PandaScore',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/sources/hltv', async (req: Request, res: Response) => {
  try {
    console.log('[API] GET /matches/sources/hltv - Testing HLTV scraper');

    const matches = await hltvScraper.getMatches();
    
    res.json({
      success: true,
      source: 'HLTV',
      matchesFound: matches.length,
      data: matches.slice(0, 5),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error testing HLTV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch from HLTV',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
