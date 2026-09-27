import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Proxy weather and flood analysis to Gemini
  app.get('/api/rainfall-history', (req, res) => {
    // Generate 30 days of mock rainfall data for Bangkok
    const data = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        rainfall: Math.floor(Math.random() * 80) + (i > 20 ? 40 : 0), // Higher rainfall in the last 10 days
      };
    });
    res.json(data);
  });

  app.post('/api/analyze-flood-risk', async (req, res) => {
    try {
      const { region, weatherData } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `
          As an expert hydrologist and meteorologist for the "FloodEvac" emergency system, 
          analyze the following data for the region: ${region}.
          Weather Data: ${JSON.stringify(weatherData)}

          Please provide a 10-DAY EVACUATION PLANNING FORECAST:
          1. Risk Level (Low, Medium, High, Extreme)
          2. 10-Day Prediction: A day-by-day outlook for the next 10 days.
          3. Evacuation Plan: Specific steps for residents in ${region} (e.g., "Evacuate Zone A if water hits 0.8m").
          4. High-Risk Roads: List specific roads or routes that will become impassable.
          5. Required Supplies: Essential items for a 10-day evacuation period.
          
          Format the response as JSON with fields: 
          riskLevel, 
          tenDayForecast (array of {day, risk, notes}), 
          evacuationPlan (string), 
          highRiskRoads (array of strings), 
          supplies (array of strings),
          analysis (string).
        `,
      });

      const text = response.text;
      const jsonStr = text.replace(/```json|```/g, '').trim();
      res.json(JSON.parse(jsonStr));
    } catch (error) {
      console.error('Error analyzing flood risk:', error);
      res.status(500).json({ error: 'Failed to analyze risk' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In development, use Vite's dev server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

