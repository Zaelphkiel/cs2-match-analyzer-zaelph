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
      console.log('[AI] OpenAI client initialized via ProxyAPI');
    } else {
      console.warn('[AI] API key not configured');
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
      console.log('[AI] AI not configured, using fallback');
      return null;
    }

    try {
      const team1Map = team1Stats.find(m => m.name.toLowerCase() === mapName.toLowerCase());
      const team2Map = team2Stats.find(m => m.name.toLowerCase() === mapName.toLowerCase());

      const team1PlayersStr = team1Players.length > 0 
        ? team1Players.slice(0, 3).map(p => `${p.name} (Rating: ${p.rating.toFixed(2)}, K/D: ${p.kd.toFixed(2)})`).join(', ')
        : 'No player data available';
      
      const team2PlayersStr = team2Players.length > 0
        ? team2Players.slice(0, 3).map(p => `${p.name} (Rating: ${p.rating.toFixed(2)}, K/D: ${p.kd.toFixed(2)})`).join(', ')
        : 'No player data available';

      const prompt = `You are a CS2 esports analyst. Analyze the following match on ${mapName}:

TEAM 1: ${match.team1.name}
Ranking: #${match.team1.ranking || 'Unknown'}
Recent Form: ${match.team1.recentForm.length > 0 ? match.team1.recentForm.join(', ') : 'No recent data'}
Map Stats (${mapName}): ${team1Map ? `Win Rate: ${team1Map.winRate.toFixed(1)}%, Played: ${team1Map.playedCount}, CT: ${team1Map.ctWinRate.toFixed(1)}%, T: ${team1Map.tWinRate.toFixed(1)}%` : 'No data'}
Top Players: ${team1PlayersStr}

TEAM 2: ${match.team2.name}
Ranking: #${match.team2.ranking || 'Unknown'}
Recent Form: ${match.team2.recentForm.length > 0 ? match.team2.recentForm.join(', ') : 'No recent data'}
Map Stats (${mapName}): ${team2Map ? `Win Rate: ${team2Map.winRate.toFixed(1)}%, Played: ${team2Map.playedCount}, CT: ${team2Map.ctWinRate.toFixed(1)}%, T: ${team2Map.tWinRate.toFixed(1)}%` : 'No data'}
Top Players: ${team2PlayersStr}

Based on this data, provide your prediction. Respond with ONLY valid JSON in this exact format:
{
  "winner": "${match.team1.name}",
  "probability": 65.5,
  "expectedRounds": 26,
  "reasoning": "Brief explanation"
}

The winner must be exactly "${match.team1.name}" or "${match.team2.name}". The probability should be between 50-85.`;

      console.log(`[AI] Analyzing map ${mapName} for ${match.team1.name} vs ${match.team2.name}...`);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional CS2 esports analyst. You MUST respond with ONLY valid JSON, nothing else. No markdown, no code blocks, just pure JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        console.log('[AI] Empty response from AI');
        return null;
      }

      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```\s*/g, '').replace(/```\s*$/g, '');
      }
      
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('[AI] No JSON found in response:', content);
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
    mapPredictions: { mapName: string; winner: string; probability: number }[]
  ): Promise<{
    winner: string;
    probability: number;
    totalMaps: number;
    confidence: number;
    reasoning: string;
  } | null> {
    if (!this.client) {
      console.log('[AI] AI not configured, using fallback');
      return null;
    }

    try {
      const team1PlayersStr = team1Players.length > 0
        ? team1Players.slice(0, 3).map(p => `${p.name} (Rating: ${p.rating.toFixed(2)})`).join(', ')
        : 'No player data';
      
      const team2PlayersStr = team2Players.length > 0
        ? team2Players.slice(0, 3).map(p => `${p.name} (Rating: ${p.rating.toFixed(2)})`).join(', ')
        : 'No player data';

      const prompt = `You are a CS2 esports analyst. Analyze the overall match outcome:

MATCH: ${match.team1.name} vs ${match.team2.name}
Event: ${match.event}
Format: ${match.format}

TEAM 1: ${match.team1.name}
Ranking: #${match.team1.ranking || 'Unknown'}
Recent Form: ${match.team1.recentForm.length > 0 ? match.team1.recentForm.join(', ') : 'No data'}
Overall Stats: ${team1Stats.length} maps tracked
Top Players: ${team1PlayersStr}

TEAM 2: ${match.team2.name}
Ranking: #${match.team2.ranking || 'Unknown'}
Recent Form: ${match.team2.recentForm.length > 0 ? match.team2.recentForm.join(', ') : 'No data'}
Overall Stats: ${team2Stats.length} maps tracked
Top Players: ${team2PlayersStr}

MAP PREDICTIONS:
${mapPredictions.map(p => `${p.mapName}: ${p.winner} (${p.probability.toFixed(1)}%)`).join('\n')}

Based on all data, provide your overall match prediction. Respond with ONLY valid JSON:
{
  "winner": "${match.team1.name}",
  "probability": 68.5,
  "totalMaps": 3,
  "confidence": 75.0,
  "reasoning": "Brief explanation"
}

The winner must be exactly "${match.team1.name}" or "${match.team2.name}". Probability should be 50-85.`;

      console.log(`[AI] Analyzing overall match ${match.team1.name} vs ${match.team2.name}...`);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional CS2 esports analyst. You MUST respond with ONLY valid JSON, nothing else. No markdown, no code blocks, just pure JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        console.log('[AI] Empty response from AI');
        return null;
      }

      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```\s*/g, '').replace(/```\s*$/g, '');
      }

      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log('[AI] No JSON found in response:', content);
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
