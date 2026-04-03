const { GoogleGenAI } = require('@google/genai');
const User = require('../models/User');
const EnhanceUsage = require('../models/EnhanceUsage');

exports.enhanceText = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date().toISOString().split('T')[0];
    let usage = await EnhanceUsage.findOne({ userId: req.userId, date: today });
    
    if (!usage) {
      usage = new EnhanceUsage({ userId: req.userId, date: today, count: 0 });
    }

    if (usage.count >= user.dailyLimit) {
      return res.status(429).json({ 
        error: `Daily limit of ${user.dailyLimit} reached. Please try again tomorrow.` 
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    usage.count += 1;
    await usage.save();

    res.json({ result: response.text, remaining: user.dailyLimit - usage.count });
  } catch (error) {
    console.error('AI Enhance Error:', error);
    res.status(500).json({ error: 'Failed to enhance text' });
  }
};

exports.getUsageStats = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const today = new Date().toISOString().split('T')[0];
        const usage = await EnhanceUsage.findOne({ userId: req.userId, date: today });

        res.json({
            enhanceUsageToday: usage ? usage.count : 0,
            dailyLimit: user.dailyLimit
        });
    } catch (error) {
        console.error('Get Usage Stats Error:', error);
        res.status(500).json({ error: 'Failed to get usage stats' });
    }
}