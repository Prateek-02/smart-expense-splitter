const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticate);

router.get('/', getNotifications);

module.exports = router;
