const express = require('express');
const router = express.Router();
const {
  getGroupBalances,
  getOptimalSettlementSuggestions,
  createSettlement,
  confirmSettlement,
  getGroupSettlements,
  getSettlementById,
  cancelSettlement,
} = require('../controllers/settlementController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isGroupMember } = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authenticate);

router.get('/group/:groupId/balances', isGroupMember, getGroupBalances);
router.get('/group/:groupId/optimal', isGroupMember, getOptimalSettlementSuggestions);
router.get('/group/:groupId', isGroupMember, getGroupSettlements);
router.post('/group/:groupId', isGroupMember, createSettlement);
router.get('/:settlementId', getSettlementById);
router.put('/:settlementId/confirm', confirmSettlement);
router.put('/:settlementId/cancel', cancelSettlement);

module.exports = router;
