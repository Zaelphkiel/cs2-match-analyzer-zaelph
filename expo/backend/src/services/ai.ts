import { Match, MapStats, Player } from '../types';

export class AIService {
  constructor() {
    console.log('[AI] Using fallback mock analysis');
  }

  async analyzeMapPrediction(
    match: Match,
    mapName: string,
    team1Stats: MapStats[],
    team2Stats: MapStats[],
    team1Players: Player[],
    team2Players: Player[]
  ): Promise<{
    winner: string;
    probability: number;
    expectedRounds: number;
    reasoning: string;
  } | null> {
    console.log(`[AI] Mock analysis for map ${mapName}`);
    return null;
  }

  async analyzeOverallMatch(
    match: Match,
    team1Stats: MapStats[],
    team2Stats: MapStats[],
    team1Players: Player[],
    team2Players: Player[],
    mapPredictions: { mapName: string; winner: string; probability: number }[]
  ): Promise<{
    winner: string;
    probability: number;
    totalMaps: number;
    confidence: number;
    reasoning: string;
  } | null> {
    console.log('[AI] Mock analysis for overall match');
    return null;
  }
}
