const API_BASE_URL = 'https://cs2-backend-zaelph.onrender.com';

export const api = {
  async getMatches() {
    try {
      console.log('[API] Fetching matches from:', `${API_BASE_URL}/api/matches`);
      const response = await fetch(`${API_BASE_URL}/api/matches`);
      console.log('[API] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API] Matches data:', data);
      
      if (data.success && Array.isArray(data.data)) {
        console.log('[API] Successfully loaded', data.data.length, 'matches');
        return data.data;
      }
      
      console.warn('[API] Invalid response format:', data);
      return [];
    } catch (error) {
      console.error('[API] Error fetching matches:', error);
      return [];
    }
  },

  async getMatchDetails(matchId: string) {
    try {
      console.log('[API] Fetching match details for:', matchId);
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}`);
      console.log('[API] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API] Match details:', data);
      
      if (data.success && data.data) {
        console.log('[API] Successfully loaded match details');
        return data.data;
      }
      
      console.warn('[API] Invalid response format:', data);
      return null;
    } catch (error) {
      console.error('[API] Error fetching match details:', error);
      return null;
    }
  },

  async analyzeMatch(matchId: string) {
    try {
      console.log('[API] Analyzing match:', matchId);
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/analyze`, {
        method: 'POST',
      });
      console.log('[API] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API] Analysis data:', data);
      
      if (data.success && data.data) {
        console.log('[API] Successfully analyzed match');
        return data.data;
      }
      
      console.warn('[API] Invalid response format:', data);
      return null;
    } catch (error) {
      console.error('[API] Error analyzing match:', error);
      return null;
    }
  },
}
