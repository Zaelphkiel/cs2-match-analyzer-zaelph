import axios from 'axios';

async function testAIAnalysis() {
  console.log('Testing AI Analysis API...\n');

  const testPrompt = `Analyze CS2 match prediction:
  
Team 1: Natus Vincere
- Recent form: W, W, L, W, W
- Key players: s1mple (rating: 1.35, K/D: 1.52), electroNic (rating: 1.22, K/D: 1.38)
- Map stats: Dust2: 68% WR, Mirage: 62% WR, Inferno: 55% WR

Team 2: FaZe Clan
- Recent form: L, W, W, L, W
- Key players: karrigan (rating: 1.18, K/D: 1.25), rain (rating: 1.15, K/D: 1.22)
- Map stats: Dust2: 58% WR, Mirage: 65% WR, Inferno: 60% WR

Maps: Dust2, Mirage, Inferno

For each map provide: winner (Team 1 or Team 2), probability (45-75%), totalRounds (16-30), overUnderConfidence.
Return JSON array: [{ winner, probability, totalRounds, overUnderConfidence }]`;

  try {
    console.log('Sending request to AI API...');
    const response = await axios.post(
      'https://toolkit.rork.com/ai/text',
      {
        prompt: testPrompt,
        systemPrompt: 'You are a professional CS2 analyst. Return only valid JSON.',
      },
      { timeout: 15000 }
    );

    console.log('\n✅ AI API Response:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.text) {
      const jsonMatch = response.data.text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const predictions = JSON.parse(jsonMatch[0]);
        console.log('\n✅ Parsed Predictions:');
        console.log(JSON.stringify(predictions, null, 2));
      }
    }
  } catch (error: any) {
    console.error('\n❌ Error testing AI API:');
    console.error(error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAIAnalysis();
