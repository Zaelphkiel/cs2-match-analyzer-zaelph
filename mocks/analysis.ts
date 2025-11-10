import { MatchAnalysis } from '@/types/match';

export const mockAnalysis: Record<string, MatchAnalysis> = {
  '1': {
    teamAnalysis: {
      team1: {
        strengths: [
          'Exceptional aim and individual skill across the board',
          'Strong map pool with 70%+ win rate on 5 maps',
          'Excellent CT-side setups and rotations',
          'Deep tactical playbook with varied strategies',
        ],
        weaknesses: [
          'Can struggle against aggressive T-side pushes',
          'Occasionally slow to adapt mid-game',
          'Lower win rate (45%) against top 5 teams on Vertigo',
        ],
        mapPool: [
          {
            name: 'Mirage',
            playedCount: 47,
            winRate: 74.5,
            ctWinRate: 58.3,
            tWinRate: 41.7,
            bestSide: 'CT',
          },
          {
            name: 'Dust2',
            playedCount: 38,
            winRate: 71.1,
            ctWinRate: 52.6,
            tWinRate: 47.4,
            bestSide: 'CT',
          },
          {
            name: 'Inferno',
            playedCount: 42,
            winRate: 69.0,
            ctWinRate: 55.0,
            tWinRate: 45.0,
            bestSide: 'CT',
          },
        ],
        keyPlayers: [
          { name: 's1mple', rating: 1.28, kd: 1.35, recentPerformance: 89 },
          { name: 'electronic', rating: 1.15, kd: 1.21, recentPerformance: 82 },
          { name: 'Perfecto', rating: 1.08, kd: 1.12, recentPerformance: 76 },
        ],
      },
      team2: {
        strengths: [
          'Aggressive T-side with high success rate',
          'Strong individual skill and clutch ability',
          'Excellent Vertigo and Ancient performance',
          'Good at adapting strategies mid-game',
        ],
        weaknesses: [
          'Can be predictable on CT-side setups',
          'Lower win rate on Dust2 (52%)',
          'Struggles against disciplined defensive teams',
        ],
        mapPool: [
          {
            name: 'Ancient',
            playedCount: 35,
            winRate: 77.1,
            ctWinRate: 48.6,
            tWinRate: 51.4,
            bestSide: 'T',
          },
          {
            name: 'Vertigo',
            playedCount: 31,
            winRate: 74.2,
            ctWinRate: 51.6,
            tWinRate: 48.4,
            bestSide: 'CT',
          },
          {
            name: 'Mirage',
            playedCount: 40,
            winRate: 65.0,
            ctWinRate: 53.8,
            tWinRate: 46.2,
            bestSide: 'CT',
          },
        ],
        keyPlayers: [
          { name: 'ropz', rating: 1.25, kd: 1.32, recentPerformance: 87 },
          { name: 'rain', rating: 1.18, kd: 1.24, recentPerformance: 81 },
          { name: 'karrigan', rating: 1.02, kd: 1.05, recentPerformance: 74 },
        ],
      },
    },
    h2h: [
      {
        date: '2025-01-15',
        winner: 'Natus Vincere',
        score: '2-1',
        event: 'BLAST Premier World Final 2024',
      },
      {
        date: '2024-12-08',
        winner: 'FaZe Clan',
        score: '2-0',
        event: 'IEM Cologne 2024',
      },
      {
        date: '2024-11-20',
        winner: 'Natus Vincere',
        score: '2-1',
        event: 'ESL Pro League S19',
      },
      {
        date: '2024-10-12',
        winner: 'Natus Vincere',
        score: '2-0',
        event: 'BLAST Premier Fall Groups',
      },
    ],
    mapPredictions: [
      {
        mapName: 'Dust2',
        winner: 'Natus Vincere',
        probability: 68.3,
        totalRounds: 27,
        overUnder: {
          line: 26.5,
          prediction: 'over',
          confidence: 62.1,
        },
      },
      {
        mapName: 'Mirage',
        winner: 'Natus Vincere',
        probability: 58.7,
        totalRounds: 29,
        overUnder: {
          line: 26.5,
          prediction: 'over',
          confidence: 71.4,
        },
      },
      {
        mapName: 'Inferno',
        winner: 'FaZe Clan',
        probability: 54.2,
        totalRounds: 28,
        overUnder: {
          line: 26.5,
          prediction: 'over',
          confidence: 65.8,
        },
      },
    ],
    overallPrediction: {
      winner: 'Natus Vincere',
      probability: 61.4,
      totalMaps: 3,
      over2Maps: true,
      confidence: 73.2,
    },
    news: [
      {
        id: 'n1',
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
        title: 's1mple reported in excellent form during practice',
        content: 'According to insider sources, s1mple has been dominating scrims with a 1.45 rating over the past week.',
        importance: 'high',
      },
      {
        id: 'n2',
        timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
        title: 'FaZe Clan announces no roster changes',
        content: 'Team confirms all five players will compete in the upcoming match despite recent speculation.',
        importance: 'medium',
      },
    ],
    lastUpdated: new Date().toISOString(),
  },
  '2': {
    teamAnalysis: {
      team1: {
        strengths: [
          'Versatile map pool with multiple ban options',
          'Strong individual aim across all positions',
          'Excellent retake coordination',
        ],
        weaknesses: [
          'Inconsistent performance under pressure',
          'Lower T-side win rate on Anubis',
        ],
        mapPool: [
          {
            name: 'Anubis',
            playedCount: 32,
            winRate: 65.6,
            ctWinRate: 59.4,
            tWinRate: 40.6,
            bestSide: 'CT',
          },
        ],
        keyPlayers: [
          { name: 'NiKo', rating: 1.31, kd: 1.38, recentPerformance: 91 },
          { name: 'huNter-', rating: 1.19, kd: 1.26, recentPerformance: 84 },
        ],
      },
      team2: {
        strengths: [
          'Disciplined CT-side play',
          'Strong clutch statistics',
          'Excellent Anubis performance',
        ],
        weaknesses: [
          'Can be slow to execute on T-side',
          'Lower adaptability mid-match',
        ],
        mapPool: [
          {
            name: 'Anubis',
            playedCount: 38,
            winRate: 71.1,
            ctWinRate: 56.8,
            tWinRate: 43.2,
            bestSide: 'CT',
          },
        ],
        keyPlayers: [
          { name: 'ZywOo', rating: 1.34, kd: 1.41, recentPerformance: 93 },
          { name: 'apEX', rating: 1.11, kd: 1.17, recentPerformance: 78 },
        ],
      },
    },
    h2h: [
      {
        date: '2025-01-20',
        winner: 'Team Vitality',
        score: '2-1',
        event: 'IEM Katowice 2025',
      },
      {
        date: '2024-12-15',
        winner: 'G2 Esports',
        score: '2-0',
        event: 'BLAST Premier World Final',
      },
    ],
    mapPredictions: [
      {
        mapName: 'Anubis',
        winner: 'Team Vitality',
        probability: 56.8,
        totalRounds: 28,
        overUnder: {
          line: 26.5,
          prediction: 'over',
          confidence: 68.2,
        },
      },
    ],
    overallPrediction: {
      winner: 'Team Vitality',
      probability: 54.3,
      totalMaps: 2,
      over2Maps: false,
      confidence: 61.7,
    },
    news: [],
    lastUpdated: new Date().toISOString(),
  },
};
