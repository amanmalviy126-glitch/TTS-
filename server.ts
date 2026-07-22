import express from 'express';
import path from 'path';
import { GoogleGenAI, Modality } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI SDK
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
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

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Vocalize AI API', time: new Date().toISOString() });
});

// Text-to-Speech API Endpoint
app.post('/api/tts/generate', async (req, res) => {
  try {
    const { text, voiceName, accent, gender, geminiVoice, speed, pitch, format } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required.' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Falling back to local synthesizer.',
      });
    }

    // Construct accent & cadence prompt instructions for natural output
    const promptText = `Speak in natural, realistic American English with a authentic ${accent || 'General American'} regional accent. Accent traits: ${accent}. Tone: ${gender || 'Neutral'}, Voice profile: ${voiceName || 'Sarah'}. Speed rate: ${speed || 1.0}x, pitch: ${pitch || 1.0}. Text: "${text.trim()}"`;

    const selectedVoice = geminiVoice || (gender === 'Male' ? 'Puck' : 'Kore');

    // Call Gemini TTS model
    const response = await ai.models.generateContent({
      model:'gemini-2.5-flash-preview-tts',
contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const candidatePart = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = candidatePart?.inlineData?.data;

    if (base64Audio) {
      const charCount = text.length;
      const estimatedDuration = Math.max(1, Math.round((charCount / 15) / (speed || 1)));

      return res.json({
        audioBase64: base64Audio,
        isPcm: true,
        sampleRate: 24000,
        format: format || 'wav',
        durationSeconds: estimatedDuration,
      });
    }

    // Fallback if audio part wasn't returned
    res.status(500).json({ error: 'Failed to generate audio stream from AI service.' });
  } catch (error: any) {
    console.error('Error generating speech with Gemini TTS:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process Text-to-Speech request.',
    });
  }
});

// English Spell-Check & Grammar Improvement Endpoint
app.post('/api/spellcheck', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required for spell check.' });
    }

    const ai = getGenAI();
    if (!ai) {
      // Basic client/regex fallback if no API key
      return res.json({
        hasErrors: false,
        correctedText: text,
        suggestions: [],
      });
    }

    const prompt = `You are a professional American English proofreader. Analyze the following text for spelling, grammar, punctuation, and clarity mistakes.
Return a JSON object with:
- "correctedText": string with all corrections applied.
- "hasErrors": boolean (true if any spelling, grammar, or punctuation errors were found).
- "suggestions": array of objects with keys "original", "suggestion", "reason".

Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);

    res.json({
      hasErrors: parsed.hasErrors || false,
      correctedText: parsed.correctedText || text,
      suggestions: parsed.suggestions || [],
    });
  } catch (error: any) {
    console.error('Error in spellcheck API:', error);
    res.status(500).json({ error: 'Spellcheck service unavailable' });
  }
});

async function startServer() {
  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vocalize AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
