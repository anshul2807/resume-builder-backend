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