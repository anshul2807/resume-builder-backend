const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

router.get('/users', requireAuth, requireAdmin, adminController.getUsers);
router.patch('/users/:id/limit', requireAuth, requireAdmin, adminController.updateUserLimit);

module.exports = router;