const Resume = require('../models/Resume');

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });
    res.json(resume ? resume.data : {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
};

exports.saveResume = async (req, res) => {
  try {
    await Resume.findOneAndUpdate(
      { userId: req.userId },
      { data: req.body },
      { new: true, upsert: true }
    );
    res.json({ message: 'Resume saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save resume' });
  }
};