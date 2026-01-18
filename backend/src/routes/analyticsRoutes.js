const express = require('express');
const router = express.Router();
const {
  getGroupAnalytics,
  getUserAnalytics,
} = require('../controllers/analyticsController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isGroupMember } = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authenticate);

router.get('/user', getUserAnalytics);
router.get('/group/:groupId', isGroupMember, getGroupAnalytics);

module.exports = router;
