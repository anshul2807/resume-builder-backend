const Resume = require('../models/Resume');

// GET all resumes for a user
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
};

// GET a single resume by ID
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
};

// POST - create a new resume
exports.createResume = async (req, res) => {
  try {
    const resume = new Resume({
      userId: req.userId,
      data: req.body,
    });

    await resume.save();
    res.status(201).json({ message: 'Resume created successfully', resume });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create resume' });
  }
};

// PUT - update a resume by ID
exports.updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { data: req.body },
      { new: true }
    );
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ message: 'Resume updated successfully', resume });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update resume' });
  }
};

// DELETE - delete a resume by ID
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resume' });
  }
};