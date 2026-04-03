const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/enhance', requireAuth, aiController.enhanceText);
router.get('/usage', requireAuth, aiController.getUsageStats);

module.exports = router;