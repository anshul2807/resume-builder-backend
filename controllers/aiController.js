const { GoogleGenAI } = require('@google/genai');
const User = require('../models/User');

exports.enhanceText = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.tokens < 1) {
      return res.status(402).json({
        error: 'Not enough tokens. Please purchase more tokens.'
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    user.tokens -= 1;
    await user.save();

    res.json({ result: response.text, remaining: user.tokens });
  } catch (error) {
    console.error('AI Enhance Error:', error);
    res.status(500).json({ error: 'Failed to enhance text' });
  }
};

exports.getUsageStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      tokens: user.tokens
    });
  } catch (error) {
    console.error('Get Usage Stats Error:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
};

exports.deductDownload = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.tokens < 5) {
      return res.status(402).json({ error: 'Not enough tokens to download. Downloading costs 5 tokens.' });
    }

    user.tokens -= 5;
    await user.save();

    res.json({ success: true, tokens: user.tokens });
  } catch (error) {
    console.error('Deduct Download Error:', error);
    res.status(500).json({ error: 'Failed to deduct tokens for download' });
  }
};

// ─── Import Resume ──────────────────────────────────────────────────────────
exports.importResume = async (req, res) => {
  try {
    const { text, base64, mimeType } = req.body;

    if (!text && !base64) {
      return res.status(400).json({ error: 'No resume content provided.' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const IMPORT_COST = 10;
    if (user.tokens < IMPORT_COST) {
      return res.status(402).json({
        error: `Not enough tokens. Importing costs ${IMPORT_COST} tokens.`
      });
    }

    const EXTRACTION_PROMPT = `You are an expert resume parser. Extract ALL information from the resume and return ONLY a single valid JSON object with exactly this structure (use "" for missing text, [] for missing arrays):

{
  "personalInfo": { "fullName": "", "phone": "", "location": "", "email": "", "github": "", "linkedin": "", "portfolio": "" },
  "summary": "",
  "experience": [{ "role": "", "company": "", "location": "", "duration": "", "points": [] }],
  "projects": [{ "title": "", "tech": "", "link": "", "liveLink": "", "points": [] }],
  "skills": { "languages": "", "frameworks": "", "databases": "", "tools": "", "specializations": "" },
  "education": [{ "degree": "", "school": "", "location": "", "duration": "", "score": "" }],
  "achievements": []
}

Rules: Return ONLY raw JSON, no markdown fences, no extra text. Each bullet becomes a separate string in points[]. Skills go into sub-categories as comma-separated strings. Certifications/awards go in achievements[].

Resume:`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    let contents;
    if (base64) {
      contents = [{ parts: [{ text: EXTRACTION_PROMPT }, { inlineData: { mimeType: mimeType || 'application/pdf', data: base64 } }] }];
    } else {
      contents = `${EXTRACTION_PROMPT}\n\n${text}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });
    const rawText = (response.text || '').trim();

    // Strip markdown fences if present (handles multiline)
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/is, '')
      .replace(/\s*```\s*$/s, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('[importResume] JSON parse failed. Raw:', rawText.slice(0, 300));
      return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    user.tokens -= IMPORT_COST;
    await user.save();

    res.json({ parsed, remaining: user.tokens });
  } catch (error) {
    console.error('Import Resume Error:', error);
    res.status(500).json({ error: 'Failed to import resume. Please try again.' });
  }
};