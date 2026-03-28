import * as cheerio from 'cheerio';
import { BrowserlessScraper } from './browserless';
import { ScraperApiClient } from './scraperapi';
import { Match, Team, News } from '../types';

export class HLTVScraper {
  private browserless: BrowserlessScraper;
  private scraperApi: ScraperApiClient;

  constructor() {
    this.browserless = new BrowserlessScraper();
    this.scraperApi = new ScraperApiClient();
  }

  async getMatches(): Promise<Match[]> {
    try {
      console.log('[HLTV] Fetching matches...');
      const html = await this.scraperApi.scrape('https://www.hltv.org/matches');
      
      const $ = cheerio.load(html);
      const matches: Match[] = [];

      $('.upcomingMatch, .liveMatch').each((_, element) => {
        try {
          const $match = $(element);
          const matchUrl = $match.find('a.match').attr('href');
          const matchId = matchUrl?.split('/')[2] || `match_${Date.now()}_${Math.random()}`;
          
          const team1Name = $match.find('.matchTeam:first .matchTeamName').text().trim();
          const team2Name = $match.find('.matchTeam:last .matchTeamName').text().trim();
          const team1Logo = $match.find('.matchTeam:first img').attr('src') || '';
          const team2Logo = $match.find('.matchTeam:last img').attr('src') || '';
          
          const event = $match.find('.matchEvent').text().trim();
          const timeElement = $match.find('.matchTime, .matchMeta').text().trim();
          const isLive = $match.hasClass('liveMatch');
          
          const format = $match.find('.matchMeta').text().includes('bo3') ? 'BO3' : 
                        $match.find('.matchMeta').text().includes('bo1') ? 'BO1' : 'BO3';

          const match: Match = {
            id: matchId,
            team1: {
              id: `team_${team1Name.toLowerCase().replace(/\s/g, '_')}`,
              name: team1Name || 'TBD',
              logo: team1Logo.startsWith('http') ? team1Logo : `https://www.hltv.org${team1Logo}`,
              ranking: 0,
              winRate: 0,
              recentForm: [],
            },
            team2: {
              id: `team_${team2Name.toLowerCase().replace(/\s/g, '_')}`,
              name: team2Name || 'TBD',
              logo: team2Logo.startsWith('http') ? team2Logo : `https://www.hltv.org${team2Logo}`,
              ranking: 0,
              winRate: 0,
              recentForm: [],
            },
            status: isLive ? 'live' : 'upcoming',
            startTime: this.parseMatchTime(timeElement),
            event: event || 'Unknown Event',
            format: format,
            hltvUrl: matchUrl ? `https://www.hltv.org${matchUrl}` : undefined,
          };

          if (isLive) {
            const score1 = $match.find('.matchTeam:first .matchTeamScore').text().trim();
            const score2 = $match.find('.matchTeam:last .matchTeamScore').text().trim();
            
            if (score1 && score2) {
              match.currentScore = {
                team1: parseInt(score1) || 0,
                team2: parseInt(score2) || 0,
              };
            }
          }

          if (match.team1.name && match.team2.name) {
            matches.push(match);
          }
        } catch (error) {
          console.error('[HLTV] Error parsing match:', error);
        }
      });

      console.log(`[HLTV] Found ${matches.length} matches`);
      return matches;
    } catch (error) {
      console.error('[HLTV] Error fetching matches:', error);
      return [];
    }
  }

  async getMatchDetails(matchUrl: string): Promise<any> {
    try {
      console.log(`[HLTV] Fetching match details: ${matchUrl}`);
      const html = await this.scraperApi.scrape(matchUrl);
      const $ = cheerio.load(html);

      const details: any = {
        maps: [],
        stream: '',
        vetos: [],
      };

      $('.mapholder .mapname').each((_, el) => {
        const mapName = $(el).text().trim();
        if (mapName) {
          details.maps.push(mapName);
        }
      });

      const streamLink = $('.stream-box a').attr('href');
      if (streamLink) {
        details.stream = streamLink;
      }

      return details;
    } catch (error) {
      console.error('[HLTV] Error fetching match details:', error);
      return null;
    }
  }

  async getTeamStats(teamName: string): Promise<any> {
    try {
      console.log(`[HLTV] Fetching team stats: ${teamName}`);
      const searchUrl = `https://www.hltv.org/search?term=${encodeURIComponent(teamName)}`;
      const html = await this.scraperApi.scrape(searchUrl);
      const $ = cheerio.load(html);

      const teamUrl = $('.search-result .teams a').first().attr('href');
      if (!teamUrl) {
        return null;
      }

      const teamHtml = await this.scraperApi.scrape(`https://www.hltv.org${teamUrl}`);
      const $team = cheerio.load(teamHtml);

      const stats: any = {
        ranking: 0,
        winRate: 0,
        recentForm: [],
        roster: [],
        mapStats: [],
      };

      const rankingText = $team('.profile-team-stat .ranking').text();
      stats.ranking = parseInt(rankingText.replace(/[^0-9]/g, '')) || 0;

      $team('.bodyshot-team a').each((_, el) => {
        const playerName = $team(el).find('.text-ellipsis').text().trim();
        if (playerName) {
          stats.roster.push(playerName);
        }
      });

      $team('.past-matches .result').each((_, el) => {
        const result = $team(el).hasClass('won') ? 'W' : 'L';
        stats.recentForm.push(result);
      });

      return stats;
    } catch (error) {
      console.error(`[HLTV] Error fetching team stats for ${teamName}:`, error);
      return null;
    }
  }

  async getNews(teamNames: string[]): Promise<News[]> {
    try {
      console.log('[HLTV] Fetching news...');
      const html = await this.scraperApi.scrape('https://www.hltv.org/news');
      const $ = cheerio.load(html);
      const news: News[] = [];

      $('.news-item').each((_, element) => {
        try {
          const $item = $(element);
          const title = $item.find('.newstext').text().trim();
          const link = $item.find('a').attr('href');
          const timestamp = $item.find('.newsrecent').text().trim();

          const isRelevant = teamNames.some(team => 
            title.toLowerCase().includes(team.toLowerCase())
          );

          if (isRelevant && title && link) {
            news.push({
              id: link.split('/').pop() || `news_${Date.now()}`,
              timestamp: this.parseNewsTime(timestamp),
              title: title,
              content: title,
              importance: this.calculateImportance(title),
              source: 'HLTV',
            });
          }
        } catch (error) {
          console.error('[HLTV] Error parsing news item:', error);
        }
      });

      console.log(`[HLTV] Found ${news.length} relevant news items`);
      return news.slice(0, 10);
    } catch (error) {
      console.error('[HLTV] Error fetching news:', error);
      return [];
    }
  }

  private parseMatchTime(timeStr: string): string {
    try {
      const now = new Date();
      
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const matchDate = new Date(now);
        matchDate.setHours(hours, minutes, 0, 0);
        
        if (matchDate < now) {
          matchDate.setDate(matchDate.getDate() + 1);
        }
        
        return matchDate.toISOString();
      }
      
      return now.toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  private parseNewsTime(timeStr: string): string {
    try {
      const now = new Date();
      
      if (timeStr.includes('hour')) {
        const hours = parseInt(timeStr);
        return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
      }
      
      if (timeStr.includes('minute')) {
        const minutes = parseInt(timeStr);
        return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
      }
      
      return now.toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  private calculateImportance(title: string): 'high' | 'medium' | 'low' {
    const highKeywords = ['roster', 'change', 'signs', 'leaves', 'benched', 'standin'];
    const mediumKeywords = ['practice', 'bootcamp', 'interview', 'statement'];
    
    const titleLower = title.toLowerCase();
    
    if (highKeywords.some(keyword => titleLower.includes(keyword))) {
      return 'high';
    }
    
    if (mediumKeywords.some(keyword => titleLower.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }
}
