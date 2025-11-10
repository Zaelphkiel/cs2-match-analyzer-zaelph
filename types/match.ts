export interface Team {
  id: string;
  name: string;
  logo: string;
  ranking: number;
  winRate: number;
  recentForm: ('W' | 'L' | 'D')[];
}

export interface Player {
  name: string;
  rating: number;
  kd: number;
  recentPerformance: number;
}

export interface MapStats {
  name: string;
  playedCount: number;
  winRate: number;
  ctWinRate: number;
  tWinRate: number;
  bestSide: 'CT' | 'T';
}

export interface H2HMatch {
  date: string;
  winner: string;
  score: string;
  event: string;
}

export interface News {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  importance: 'high' | 'medium' | 'low';
}

export interface MapPrediction {
  mapName: string;
  winner: string;
  probability: number;
  totalRounds: number;
  overUnder: {
    line: number;
    prediction: 'over' | 'under';
    confidence: number;
  };
}

export interface MatchAnalysis {
  teamAnalysis: {
    team1: {
      strengths: string[];
      weaknesses: string[];
      mapPool: MapStats[];
      keyPlayers: Player[];
    };
    team2: {
      strengths: string[];
      weaknesses: string[];
      mapPool: MapStats[];
      keyPlayers: Player[];
    };
  };
  h2h: H2HMatch[];
  mapPredictions: MapPrediction[];
  overallPrediction: {
    winner: string;
    probability: number;
    totalMaps: number;
    over2Maps: boolean;
    confidence: number;
  };
  news: News[];
  lastUpdated: string;
}

export interface MapPick {
  map: string;
  pickedBy: string;
  number: number;
}

export interface Match {
  id: string;
  team1: Team;
  team2: Team;
  status: 'live' | 'upcoming' | 'finished';
  startTime: string;
  event: string;
  format: string;
  currentScore?: {
    team1: number;
    team2: number;
  };
  currentMap?: {
    name: string;
    score: {
      team1: number;
      team2: number;
    };
  };
  maps?: string[];
  mapsPicks?: MapPick[];
  stream?: string;
  analysis?: MatchAnalysis;
}
