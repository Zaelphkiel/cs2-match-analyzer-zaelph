import OpenAI from 'openai';
import { config } from '../config';
import { Match, MapStats, Player } from '../types';

export class AIService {
  private client: OpenAI | null = null;

  constructor() {
    if (config.deepseekApiKey) {
      this.client = new OpenAI({
        apiKey: config.deepseekApiKey,
        baseURL: config.deepseekBaseUrl,
      });
      console.log('[AI] DeepSeek client initialized');
    } else {
      console.warn('[AI] DeepSeek API key not configured');
    }
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
    if (!this.client) {
      console.log('[AI] DeepSeek not configured, using fallback');
      return null;
    }

    try {
      const team1Map = team1Stats.find(m => m.name.toLowerCase() === mapName.toLowerCase());
      const team2Map = team2Stats.find(m => m.name.toLowerCase() === mapName.toLowerCase());

      const prompt = `You are a CS2 esports analyst. Analyze the following match on ${mapName}:

TEAM 1: ${match.team1.name}
Ranking: #${match.team1.ranking}
Recent Form: ${match.team1.recentForm.join(', ')}
Map Stats (${mapName}): ${team1Map ? `Win Rate: ${team1Map.winRate}%, Played: ${team1Map.playedCount}, CT: ${team1Map.ctWinRate}%, T: ${team1Map.tWinRate}%` : 'No data'}
Top Players: ${team1Players.slice(0, 3).map(p => `${p.name} (Rating: ${p.rating.toFixed(2)}, K/D: ${p.kd.toFixed(2)})`).join(', ')}

TEAM 2: ${match.team2.name}
Ranking: #${match.team2.ranking}
Recent Form: ${match.team2.recentForm.join(', ')}
Map Stats (${mapName}): ${team2Map ? `Win Rate: ${team2Map.winRate}%, Played: ${team2Map.playedCount}, CT: ${team2Map.ctWinRate}%, T: ${team2Map.tWinRate}%` : 'No data'}
Top Players: ${team2Players.slice(0, 3).map(p => `${p.name} (Rating: ${p.rating.toFixed(2)}, K/D: ${p.kd.toFixed(2)})`).join(', ')}

Provide your analysis in this exact JSON format (ONLY JSON, no other text):
{
  "winner": "Team 1 Name or Team 2 Name",
  "probability": 65.5,
  "expectedRounds": 26,
  "reasoning": "Brief explanation of your prediction"
}`;

      console.log(`[AI] Analyzing map ${mapName} for ${match.team1.name} vs ${match.team2.name}...`);

      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional CS2 esports analyst. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        console.log('[AI] Empty response from DeepSeek');
        return null;
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('[AI] No JSON found in response');
        return null;
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log(`[AI] Map analysis complete: ${result.winner} with ${result.probability}%`);
      
      return result;
    } catch (error) {
      console.error('[AI] Error analyzing map:', error);
      return null;
    }
  }

  async analyzeOverallMatch(
    match: Match,
    team1Stats: MapStats[],
    team2Stats: MapStats[],
    team1Players: Player[],
    team2Players: Player[],
    mapPredictions: Array<{ mapName: string; winner: string; probability: number }>
  ): Promise<{
    winner: string;
    probability: number;
    totalMaps: number;
    confidence: number;
    reasoning: string;
  } | null> {
    if (!this.client) {
      console.log('[AI] DeepSeek not configured, using fallback');
      return null;
    }

    try {
      const prompt = `You are a CS2 esports analyst. Analyze the overall match outcome:

MATCH: ${match.team1.name} vs ${match.team2.name}
Event: ${match.event}
Format: ${match.format}

TEAM 1: ${match.team1.name}
Ranking: #${match.team1.ranking}
Recent Form: ${match.team1.recentForm.join(', ')}
Overall Stats: ${team1Stats.length} maps tracked
Top Players: ${team1Players.slice(0, 3).map(p => `${p.name} (Rating: ${p.rating.toFixed(2)})`).join(', ')}

TEAM 2: ${match.team2.name}
Ranking: #${match.team2.ranking}
Recent Form: ${match.team2.recentForm.join(', ')}
Overall Stats: ${team2Stats.length} maps tracked
Top Players: ${team2Players.slice(0, 3).map(p => `${p.name} (Rating: ${p.rating.toFixed(2)})`).join(', ')}

MAP PREDICTIONS:
${mapPredictions.map(p => `${p.mapName}: ${p.winner} (${p.probability.toFixed(1)}%)`).join('\n')}

Based on all data, provide your overall match prediction in this exact JSON format (ONLY JSON):
{
  "winner": "Team 1 Name or Team 2 Name",
  "probability": 68.5,
  "totalMaps": 3,
  "confidence": 75.0,
  "reasoning": "Brief explanation considering all factors"
}`;

      console.log(`[AI] Analyzing overall match ${match.team1.name} vs ${match.team2.name}...`);

      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional CS2 esports analyst. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        console.log('[AI] Empty response from DeepSeek');
        return null;
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('[AI] No JSON found in response');
        return null;
      }

      const result = JSON.parse(jsonMatch[0]);
      console.log(`[AI] Overall analysis complete: ${result.winner} with ${result.probability}%`);
      
      return result;
    } catch (error) {
      console.error('[AI] Error analyzing overall match:', error);
      return null;
    }
  }
}
