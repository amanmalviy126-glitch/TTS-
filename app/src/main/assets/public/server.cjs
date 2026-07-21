var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
var getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", name: "Vocalize AI API", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/tts/generate", async (req, res) => {
  try {
    const { text, voiceName, accent, gender, geminiVoice, speed, pitch, format } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text prompt is required." });
    }
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is not configured. Falling back to local synthesizer."
      });
    }
    const promptText = `Speak in natural, realistic American English with a authentic ${accent || "General American"} regional accent. Accent traits: ${accent}. Tone: ${gender || "Neutral"}, Voice profile: ${voiceName || "Sarah"}. Speed rate: ${speed || 1}x, pitch: ${pitch || 1}. Text: "${text.trim()}"`;
    const selectedVoice = geminiVoice || (gender === "Male" ? "Puck" : "Kore");
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [import_genai.Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice }
          }
        }
      }
    });
    const candidatePart = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = candidatePart?.inlineData?.data;
    if (base64Audio) {
      const charCount = text.length;
      const estimatedDuration = Math.max(1, Math.round(charCount / 15 / (speed || 1)));
      return res.json({
        audioBase64: base64Audio,
        isPcm: true,
        sampleRate: 24e3,
        format: format || "wav",
        durationSeconds: estimatedDuration
      });
    }
    res.status(500).json({ error: "Failed to generate audio stream from AI service." });
  } catch (error) {
    console.error("Error generating speech with Gemini TTS:", error);
    res.status(500).json({
      error: error?.message || "Failed to process Text-to-Speech request."
    });
  }
});
app.post("/api/spellcheck", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text content is required for spell check." });
    }
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        hasErrors: false,
        correctedText: text,
        suggestions: []
      });
    }
    const prompt = `You are a professional American English proofreader. Analyze the following text for spelling, grammar, punctuation, and clarity mistakes.
Return a JSON object with:
- "correctedText": string with all corrections applied.
- "hasErrors": boolean (true if any spelling, grammar, or punctuation errors were found).
- "suggestions": array of objects with keys "original", "suggestion", "reason".

Text: "${text}"`;
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);
    res.json({
      hasErrors: parsed.hasErrors || false,
      correctedText: parsed.correctedText || text,
      suggestions: parsed.suggestions || []
    });
  } catch (error) {
    console.error("Error in spellcheck API:", error);
    res.status(500).json({ error: "Spellcheck service unavailable" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vocalize AI server running at http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
