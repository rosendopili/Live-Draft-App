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
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
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

    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.includes(';base64,')) {
      const parts = image.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Data = parts[1];
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are an expert OCR vision system specialized in reading physical fantasy football draft boards. Your sole job is to transcribe player draft stickers from a photo into structured JSON data.

### GRID AND POSITION RULES
1. Spatial Mapping: Draft boards are organized in a grid of Rounds (Rows) and Teams/Picks (Columns).
   - Horizontal position determines Column / Team Pick order.
   - Vertical position determines Round number (starting from Round 1 at the top).
2. Read Direction: Scan row-by-row from top-left to bottom-right.
3. Empty Spots: Ignore empty slots where no sticker has been placed yet. Do NOT invent or predict future picks.

### EXTRACTION & CORRECTION RULES
1. Name Extraction: Correct slight spelling errors or handwriting ambiguities to the standard NFL player name (e.g., if sticker says "J. Jefferson", output "Justin Jefferson").
2. Position Standard: Normalize positions to strictly one of: ["QB", "RB", "WR", "TE", "K", "DST"].
3. NFL Team Standard: Normalize NFL teams to standard 2 or 3-letter uppercase abbreviations.
4. Contextual Disambiguation: If a player's name is partially blocked or blurry, use the surrounding position label and team abbreviation on the sticker to resolve their identity correctly.
5. Confidence Rating: Assign a float value from 0.0 to 1.0 based on how clear and legible the sticker text is.

${totalTeams ? `Note: User specifies that this draft board has approx ${totalTeams} teams (columns).` : ''}
${totalRounds ? `Note: User specifies that this draft board has approx ${totalRounds} rounds (rows).` : ''}
${customInstructions ? `Additional User Instructions: ${customInstructions}` : ''}

Output strictly formatted JSON matching the required schema.`;

    const promptText = `Analyze this physical fantasy football draft board photo. Identify all placed draft stickers, map their grid coordinates (round number and team column), extract full normalized NFL player names, standardized positions, and 2-3 letter uppercase NFL team abbreviations. Calculate overall pick numbers based on standard grid structure. Assign confidence scores between 0.0 and 1.0 for each sticker.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drafted_players: {
              type: Type.ARRAY,
              description: 'List of all detected player stickers on the draft board.',
              items: {
                type: Type.OBJECT,
                properties: {
                  round: { type: Type.INTEGER, description: 'Draft round number starting at 1' },
                  pick: { type: Type.INTEGER, description: 'Pick number within the round' },
                  player_name: { type: Type.STRING, description: 'Corrected full name of NFL player' },
                  position: { type: Type.STRING, description: 'QB, RB, WR, TE, K, or DST' },
                  nfl_team: { type: Type.STRING, description: '3-letter uppercase abbreviation' },
                  confidence_score: { type: Type.NUMBER, description: 'Float from 0.0 to 1.0' },
                },
                required: ['round', 'pick', 'player_name', 'position', 'nfl_team', 'confidence_score'],
              },
            },
          },
          required: ['drafted_players'],
        },
      },
    });

    const duration = Date.now() - startTime;
    const rawText = response.text || '{}';
    let parsedData = JSON.parse(rawText);

    const rawPlayers = parsedData.drafted_players || [];
    let maxTeamCol = Number(totalTeams) || 12;

    const formattedPicks = rawPlayers.map((p: any) => {
      const roundNum = Number(p.round) || 1;
      const pickInRound = Number(p.pick) || 1;
      return {
        round: roundNum,
        pick_in_round: pickInRound,
        overall_pick: ((roundNum - 1) * maxTeamCol + pickInRound),
        team_column: pickInRound,
        team_name: (teamNames && teamNames[pickInRound]) || `Team ${pickInRound}`,
        player_name: p.player_name || 'Unknown Player',
        position: p.position || 'WR',
        nfl_team: p.nfl_team || 'NFL',
        confidence: p.confidence_score || 0.9,
        status: 'confirmed'
      };
    });

    res.json({
      draft_info: { total_teams: maxTeamCol, total_rounds: Number(totalRounds) || 16, teams: [] },
      picks: formattedPicks,
      summary: { total_detected: formattedPicks.length, avg_confidence: 0.9 },
      processing_time_ms: duration
    });
  } catch (error: any) {
    console.error('OCR API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/recommend', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { myTeamName, myTeamColumn, prompt } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt || `Give fantasy draft advice for ${myTeamName}`
    });
    res.json({ recommendation: response.text || 'No recommendation available.' });
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
