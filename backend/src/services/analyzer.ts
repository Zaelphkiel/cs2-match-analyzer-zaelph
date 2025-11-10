import { Match, MatchAnalysis, MapPrediction, MapStats, Player } from '../types';
import { HLTVScraper } from '../scraper/hltv';
import { LiquidpediaScraper } from '../scraper/liquidpedia';
import { PandaScoreScraper } from '../scraper/pandascore';

export class MatchAnalyzer {
  private hltvScraper: HLTVScraper;
  private liquidpediaScraper: LiquidpediaScraper;
  private pandascoreScraper: PandaScoreScraper;

  constructor() {
    this.hltvScraper = new HLTVScraper();
    this.liquidpediaScraper = new LiquidpediaScraper();
    this.pandascoreScraper = new PandaScoreScraper();
  }

  async analyzeMatch(match: Match): Promise<MatchAnalysis> {
    console.log(`[Analyzer] Starting analysis for match: ${match.team1.name} vs ${match.team2.name}`);

    const [
      team1Stats,
      team2Stats,
      team1MapStats,
      team2MapStats,
      team1Players,
      team2Players,
      h2h,
      hltvNews,
      psTeam1Stats,
      psTeam2Stats,
      psH2H,
      psTeam1MapStats,
      psTeam2MapStats,
      psTeam1Players,
      psTeam2Players,
      psNews,
    ] = await Promise.all([
      this.hltvScraper.getTeamStats(match.team1.name),
      this.hltvScraper.getTeamStats(match.team2.name),
      this.liquidpediaScraper.getTeamMapStats(match.team1.name),
      this.liquidpediaScraper.getTeamMapStats(match.team2.name),
      this.liquidpediaScraper.getPlayerStats(match.team1.name),
      this.liquidpediaScraper.getPlayerStats(match.team2.name),
      this.liquidpediaScraper.getH2HHistory(match.team1.name, match.team2.name),
      this.hltvScraper.getNews([match.team1.name, match.team2.name]),
      this.pandascoreScraper.getTeamStats(match.team1.name),
      this.pandascoreScraper.getTeamStats(match.team2.name),
      this.pandascoreScraper.getH2HHistory(match.team1.name, match.team2.name),
      this.pandascoreScraper.getTeamMapStats(match.team1.name),
      this.pandascoreScraper.getTeamMapStats(match.team2.name),
      this.pandascoreScraper.getPlayerStats(match.team1.name),
      this.pandascoreScraper.getPlayerStats(match.team2.name),
      this.pandascoreScraper.getNews([match.team1.name, match.team2.name]),
    ]);

    if (team1Stats || psTeam1Stats) {
      match.team1.ranking = team1Stats?.ranking || psTeam1Stats?.ranking || 0;
      match.team1.recentForm = (team1Stats?.recentForm || psTeam1Stats?.recentForm || []).slice(0, 5);
    }

    if (team2Stats || psTeam2Stats) {
      match.team2.ranking = team2Stats?.ranking || psTeam2Stats?.ranking || 0;
      match.team2.recentForm = (team2Stats?.recentForm || psTeam2Stats?.recentForm || []).slice(0, 5);
    }

    const mergedTeam1MapStats = this.mergeMapStats(team1MapStats, psTeam1MapStats);
    const mergedTeam2MapStats = this.mergeMapStats(team2MapStats, psTeam2MapStats);
    const mergedH2H = [...h2h, ...psH2H].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 10);
    
    const mergedTeam1Players = [...team1Players, ...psTeam1Players].slice(0, 5);
    const mergedTeam2Players = [...team2Players, ...psTeam2Players].slice(0, 5);
    const mergedNews = [...hltvNews, ...psNews].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 15);

    const mapPredictions = this.generateMapPredictions(
      match.maps || ['TBD', 'TBD', 'TBD'],
      mergedTeam1MapStats,
      mergedTeam2MapStats
    );

    const overallPrediction = this.generateOverallPrediction(
      match,
      mergedTeam1MapStats,
      mergedTeam2MapStats,
      mapPredictions
    );

    const analysis: MatchAnalysis = {
      teamAnalysis: {
        team1: {
          strengths: this.generateStrengths(mergedTeam1MapStats, mergedTeam1Players),
          weaknesses: this.generateWeaknesses(mergedTeam1MapStats, mergedTeam1Players),
          mapPool: mergedTeam1MapStats,
          keyPlayers: mergedTeam1Players,
        },
        team2: {
          strengths: this.generateStrengths(mergedTeam2MapStats, mergedTeam2Players),
          weaknesses: this.generateWeaknesses(mergedTeam2MapStats, mergedTeam2Players),
          mapPool: mergedTeam2MapStats,
          keyPlayers: mergedTeam2Players,
        },
      },
      h2h: mergedH2H,
      mapPredictions: mapPredictions,
      overallPrediction: overallPrediction,
      news: mergedNews,
      lastUpdated: new Date().toISOString(),
    };

    console.log(`[Analyzer] Analysis complete for match: ${match.team1.name} vs ${match.team2.name}`);
    return analysis;
  }

  private generateMapPredictions(
    maps: string[],
    team1Stats: MapStats[],
    team2Stats: MapStats[]
  ): MapPrediction[] {
    return maps
      .filter(map => map !== 'TBD')
      .map(mapName => {
        const team1Map = team1Stats.find(m => m.name === mapName);
        const team2Map = team2Stats.find(m => m.name === mapName);

        const team1WinRate = team1Map?.winRate || 50;
        const team2WinRate = team2Map?.winRate || 50;

        const totalRate = team1WinRate + team2WinRate;
        const team1Probability = (team1WinRate / totalRate) * 100;
        const team2Probability = 100 - team1Probability;

        const winner = team1Probability > team2Probability ? 'Team 1' : 'Team 2';
        const probability = Math.max(team1Probability, team2Probability);

        const expectedRounds = Math.floor(Math.random() * 7) + 23;
        const overUnderLine = 26.5;

        return {
          mapName: mapName,
          winner: winner,
          probability: probability,
          totalRounds: expectedRounds,
          overUnder: {
            line: overUnderLine,
            prediction: expectedRounds > overUnderLine ? 'over' : 'under',
            confidence: Math.abs(expectedRounds - overUnderLine) * 10 + 50,
          },
        };
      });
  }

  private generateOverallPrediction(
    match: Match,
    team1Stats: MapStats[],
    team2Stats: MapStats[],
    mapPredictions: MapPrediction[]
  ): any {
    const team1Wins = mapPredictions.filter(p => p.winner === 'Team 1').length;
    const team2Wins = mapPredictions.length - team1Wins;

    const winner = team1Wins > team2Wins ? match.team1.name : match.team2.name;
    const winnerMaps = Math.max(team1Wins, team2Wins);
    const loserMaps = Math.min(team1Wins, team2Wins);

    const totalMaps = winnerMaps + loserMaps;
    const probability = (winnerMaps / totalMaps) * 100;

    return {
      winner: winner,
      probability: probability,
      totalMaps: totalMaps,
      over2Maps: totalMaps > 2,
      confidence: probability > 60 ? 75 + Math.random() * 15 : 55 + Math.random() * 15,
    };
  }

  private generateStrengths(mapStats: MapStats[], players: Player[]): string[] {
    const strengths: string[] = [];

    const bestMaps = mapStats
      .filter(m => m.winRate > 60)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 2);

    if (bestMaps.length > 0) {
      strengths.push(`Strong performance on ${bestMaps.map(m => m.name).join(' and ')}`);
    }

    const topPlayer = players.sort((a, b) => b.rating - a.rating)[0];
    if (topPlayer && topPlayer.rating > 1.1) {
      strengths.push(`${topPlayer.name} in excellent form (${topPlayer.rating.toFixed(2)} rating)`);
    }

    const ctMaps = mapStats.filter(m => m.bestSide === 'CT' && m.ctWinRate > 55);
    if (ctMaps.length >= 3) {
      strengths.push('Excellent CT-side fundamentals across multiple maps');
    }

    if (strengths.length === 0) {
      strengths.push('Consistent team performance');
      strengths.push('Good map diversity in pool');
    }

    return strengths;
  }

  private generateWeaknesses(mapStats: MapStats[], players: Player[]): string[] {
    const weaknesses: string[] = [];

    const weakMaps = mapStats
      .filter(m => m.winRate < 45)
      .sort((a, b) => a.winRate - b.winRate)
      .slice(0, 2);

    if (weakMaps.length > 0) {
      weaknesses.push(`Struggles on ${weakMaps.map(m => m.name).join(' and ')}`);
    }

    const weakPlayer = players.sort((a, b) => a.rating - b.rating)[0];
    if (weakPlayer && weakPlayer.rating < 0.95) {
      weaknesses.push(`${weakPlayer.name} needs to improve performance`);
    }

    const tMaps = mapStats.filter(m => m.bestSide === 'T' && m.tWinRate < 45);
    if (tMaps.length >= 2) {
      weaknesses.push('T-side execution needs work on several maps');
    }

    if (weaknesses.length === 0) {
      weaknesses.push('Minor inconsistencies in pistol rounds');
      weaknesses.push('Can struggle against aggressive playstyles');
    }

    return weaknesses;
  }

  private mergeMapStats(stats1: MapStats[], stats2: MapStats[]): MapStats[] {
    const mapStatsMap = new Map<string, MapStats>();

    [...stats1, ...stats2].forEach(stat => {
      if (!mapStatsMap.has(stat.name)) {
        mapStatsMap.set(stat.name, stat);
      } else {
        const existing = mapStatsMap.get(stat.name)!;
        const totalPlayed = existing.playedCount + stat.playedCount;
        const avgWinRate = (existing.winRate * existing.playedCount + stat.winRate * stat.playedCount) / totalPlayed;
        const avgCTWinRate = (existing.ctWinRate * existing.playedCount + stat.ctWinRate * stat.playedCount) / totalPlayed;
        const avgTWinRate = (existing.tWinRate * existing.playedCount + stat.tWinRate * stat.playedCount) / totalPlayed;

        mapStatsMap.set(stat.name, {
          name: stat.name,
          playedCount: totalPlayed,
          winRate: avgWinRate,
          ctWinRate: avgCTWinRate,
          tWinRate: avgTWinRate,
          bestSide: avgCTWinRate > avgTWinRate ? 'CT' : 'T',
        });
      }
    });

    return Array.from(mapStatsMap.values()).sort((a, b) => b.playedCount - a.playedCount);
  }
}
