import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing');
  }
  return new GoogleGenAI(apiKey);
};

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/ocr', async (req, res) => {
  const startTime = Date.now();
  try {
    const { image, totalTeams, totalRounds, customInstructions, teamNames } = req.body;

    if (!image) return res.status(400).json({ error: 'No image' });

    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.includes(';base64,')) {
      const parts = image.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Data = parts[1];
    }

    const ai = getGeminiClient();
    // Using gemini-1.5-flash as it is the most stable production model for vision
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are a fantasy football draft board OCR system. Transcribe stickers into JSON.
Teams: ${totalTeams || 12}, Rounds: ${totalRounds || 16}. ${customInstructions || ''}`;

    const promptText = `Extract all draft stickers: round, pick, player_name, position, nfl_team, confidence_score.`;

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: systemPrompt + '
' + promptText }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drafted_players: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  round: { type: Type.INTEGER },
                  pick: { type: Type.INTEGER },
                  player_name: { type: Type.STRING },
                  position: { type: Type.STRING },
                  nfl_team: { type: Type.STRING },
                  confidence_score: { type: Type.NUMBER }
                },
                required: ['round', 'pick', 'player_name', 'position', 'nfl_team', 'confidence_score']
              }
            }
          },
          required: ['drafted_players']
        }
      }
    });

    const response = await result.response;
    const rawText = response.text();
    const parsedData = JSON.parse(rawText);
    const rawPlayers = parsedData.drafted_players || [];
    
    let maxTeamCol = Number(totalTeams) || 12;
    let maxRoundNum = Number(totalRounds) || 16;

    const formattedPicks = rawPlayers.map((p: any) => {
      const round = Number(p.round) || 1;
      const pickInRound = Number(p.pick) || 1;
      const overallPick = ((round - 1) * maxTeamCol + pickInRound);
      return {
        round,
        pick_in_round: pickInRound,
        overall_pick: overallPick,
        team_column: pickInRound,
        team_name: (teamNames && teamNames[pickInRound]) || `Team ${pickInRound}`,
        player_name: p.player_name || 'Unknown',
        position: p.position || 'WR',
        nfl_team: p.nfl_team || 'NFL',
        confidence: p.confidence_score || 0.9,
        status: 'confirmed'
      };
    });

    res.json({
      draft_info: { total_teams: maxTeamCol, total_rounds: maxRoundNum, teams: [] },
      picks: formattedPicks,
      summary: { total_detected: formattedPicks.length, avg_confidence: 0.9 }
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/recommend', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(req.body.prompt || 'Give fantasy draft advice');
    const response = await result.response;
    res.json({ recommendation: response.text() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
  }
  if (!process.env.VERCEL) app.listen(PORT);
}
startServer();
export default app;
