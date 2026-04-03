const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, resumeController.getResume);
router.post('/', requireAuth, resumeController.saveResume);

module.exports = router;