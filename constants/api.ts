const API_BASE_URL = 'https://cs2-backend-zaelph.onrender.com';

export const api = {
  async getMatches() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  },

  async getMatchDetails(matchId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching match details:', error);
      return null;
    }
  },

  async analyzeMatch(matchId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/analyze`, {
        method: 'POST',
      });
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error analyzing match:', error);
      return null;
    }
  },
};
