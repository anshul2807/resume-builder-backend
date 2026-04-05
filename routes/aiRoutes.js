const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/enhance', requireAuth, aiController.enhanceText);
router.get('/usage', requireAuth, aiController.getUsageStats);
router.post('/deduct-download', requireAuth, aiController.deductDownload);

module.exports = router;