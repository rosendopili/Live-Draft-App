import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing on server.');
  const genAI = new GoogleGenAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
};

app.post('/api/recommend', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ recommendation: response.text() });
  } catch (error: any) {
    console.error('Advisor Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the static frontend files
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (!process.env.VERCEL) {
  app.listen(3000, () => console.log('Advisor Server running on port 3000'));
}

export default app;
