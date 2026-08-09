import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body parser limit for high resolution draft board photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables. Please check Settings > Secrets in AI Studio.');
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

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Draft Board OCR Transcription Endpoint
app.post('/api/ocr', async (req, res) => {
  const startTime = Date.now();
  try {
    const { image, totalTeams, totalRounds, customInstructions, teamNames } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    // Extract mime type and base64 string from data URL
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (image.includes(';base64,')) {
      const parts = image.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Data = parts[1];
    }

    // Handle SVG data URIs or unsupported formats by defaulting to jpeg inline
    if (mimeType.includes('svg')) {
      mimeType = 'image/png';
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
3. NFL Team Standard: Normalize NFL teams to standard 2 or 3-letter uppercase abbreviations (e.g., "MIN", "KC", "SF", "PHI", "BAL", "BUF", "DAL", "DET", "LAR", "MIA", "NYJ", "GB").
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
    let parsedData;

    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('JSON Parse error on Gemini output:', rawText);
      return res.status(500).json({
        error: 'Failed to parse JSON response from vision model.',
        rawResponse: rawText,
      });
    }

    // Convert drafted_players from schema to standard application OCRResult structure
    const rawPlayers = parsedData.drafted_players || parsedData.picks || [];
    
    let maxTeamCol = Number(totalTeams) || 12;
    let maxRoundNum = Number(totalRounds) || 16;

    rawPlayers.forEach((p: any) => {
      const pickNum = Number(p.pick || p.pick_in_round || p.team_column) || 1;
      const roundNum = Number(p.round) || 1;
      if (pickNum > maxTeamCol) maxTeamCol = pickNum;
      if (roundNum > maxRoundNum) maxRoundNum = roundNum;
    });

    const allowedPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];

    const formattedPicks = rawPlayers.map((p: any) => {
      const round = Number(p.round) || 1;
      const pickInRound = Number(p.pick || p.pick_in_round || p.team_column) || 1;
      const overallPick = Number(p.overall_pick) || ((round - 1) * maxTeamCol + pickInRound);
      const confidence = Math.min(1.0, Math.max(0.0, Number(p.confidence_score ?? p.confidence) || 0.9));

      let pos = String(p.position || 'WR').toUpperCase().trim();
      if (pos === 'DEF' || pos === 'D/ST' || pos === 'DEFENSE') pos = 'DST';
      if (pos === 'PK') pos = 'K';
      if (!allowedPositions.includes(pos)) pos = 'WR';

      const playerName = p.player_name || 'Unknown Player';
      const nflTeam = String(p.nfl_team || 'NFL').toUpperCase().trim();

      return {
        round,
        pick_in_round: pickInRound,
        overall_pick: overallPick,
        team_column: pickInRound,
        team_name: p.team_name || `Team ${pickInRound}`,
        player_name: playerName,
        position: pos,
        nfl_team: nflTeam,
        raw_text: p.raw_text || `${playerName} ${pos} ${nflTeam}`,
        confidence,
        status: confidence < 0.75 ? 'needs_review' : 'confirmed',
        notes: p.notes,
      };
    });

    const teamNamesMap = teamNames || {};
    const teamsList = Array.from({ length: maxTeamCol }, (_, i) => {
      const col = i + 1;
      const customName = teamNamesMap[col] || teamNamesMap[String(col)];
      return {
        column: col,
        name: customName || `Team ${col}`,
      };
    });

    const resultData = {
      draft_info: {
        total_teams: maxTeamCol,
        total_rounds: maxRoundNum,
        detected_picks: formattedPicks.length,
        teams: teamsList,
      },
      picks: formattedPicks,
      drafted_players: rawPlayers, // Preserve original raw schema list
    };

    // Calculate summary statistics
    const totalPicks = resultData.picks.length;
    const avgConf = totalPicks > 0
      ? resultData.picks.reduce((acc: number, p: any) => acc + (p.confidence || 0), 0) / totalPicks
      : 1.0;
    const lowConfCount = resultData.picks.filter((p: any) => p.confidence < 0.75).length;

    const positionsBreakdown: Record<string, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DST: 0 };
    resultData.picks.forEach((p: any) => {
      if (positionsBreakdown[p.position] !== undefined) {
        positionsBreakdown[p.position]++;
      }
    });

    const responsePayload = {
      ...resultData,
      summary: {
        total_detected: totalPicks,
        avg_confidence: Number(avgConf.toFixed(2)),
        low_confidence_count: lowConfCount,
        positions_breakdown: positionsBreakdown,
      },
      processing_time_ms: duration,
      raw_json_string: JSON.stringify(resultData, null, 2),
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error('OCR API Processing Error:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while processing the draft board image.',
      details: String(error),
    });
  }
});

// Live Fantasy Draft Recommendation Endpoint
app.post('/api/recommend', async (req, res) => {
  try {
    const { myTeamColumn, myTeamName, scoringFormat, draftType, currentClockPick, isMyTurn, roster, posCounts, topAvailable, rosterSettings } = req.body;

    const ai = getGeminiClient();

    const prompt = `
You are an elite fantasy football draft expert and statistician.
Analyze the following draft board state and provide actionable, strategic pick recommendations for the manager of ${myTeamName} (Column ${myTeamColumn}).

League Settings & Roster Requirements:
- Scoring Format: ${scoringFormat || 'PPR'}
- Draft Format: ${draftType || 'snake'}
- Roster Construction: ${rosterSettings ? `QB: ${rosterSettings.qb}, RB: ${rosterSettings.rb}, WR: ${rosterSettings.wr}, TE: ${rosterSettings.te}, FLEX: ${rosterSettings.flex}, K: ${rosterSettings.k}, DST: ${rosterSettings.dst}, Bench: ${rosterSettings.bench}` : 'Standard (1 QB, 2 RB, 2 WR, 1 TE, 1 FLEX, 1 K, 1 DST)'}
- Current Pick On The Clock: Overall Pick #${currentClockPick || 1}
- Is Manager On The Clock Right Now?: ${isMyTurn ? 'YES! MUST PICK NOW.' : 'No, currently waiting.'}

Manager's Current Roster:
${JSON.stringify(roster || [], null, 2)}

Manager's Current Position Counts:
${JSON.stringify(posCounts || {}, null, 2)}

Top Available Unpicked Players Remaining:
${JSON.stringify(topAvailable || [], null, 2)}

Instructions:
1. Provide a concise, highly strategic breakdown (3-5 bullet points) recommending the top 2-3 players to target for their next pick.
2. Directly factor in their league's roster requirements (for instance if K or DST are 0, do not recommend them; if WR starts 3 with 2 FLEX, prioritize WR/RB depth heavily).
3. Mention tier drops, player upside, and positional scarcity. Keep tone energetic, confident, and expert-level!
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const recommendationText = response.text || 'Recommendation currently unavailable.';
    res.json({ recommendation: recommendationText });
  } catch (err: any) {
    console.error('AI Recommendation Error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate AI recommendation.' });
  }
});

// ... existing code ...
async function startServer() {
  // Vite middleware for dev or static serve for prod
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Important: we don't handle the wildcard * here for Vercel, 
    // because vercel.json handles the routing.
  }

  // Only start the listening server if we are not on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[DraftBoard OCR Vision Server] Running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

// Export the app for Vercel
export default app;

