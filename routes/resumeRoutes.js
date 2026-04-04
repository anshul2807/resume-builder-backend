const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/',     requireAuth, resumeController.getResumes);
router.get('/:id',  requireAuth, resumeController.getResumeById);
router.post('/',    requireAuth, resumeController.createResume);
router.put('/:id',  requireAuth, resumeController.updateResume);
router.delete('/:id', requireAuth, resumeController.deleteResume);

module.exports = router;