const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { calculateGroupBalances, getSimplifiedBalances } = require('../services/balanceService');
const { getOptimalSettlements } = require('../services/settlementOptimizer');
const { sendTemplatedEmail, EMAIL_TYPES } = require('../services/emailService');

/**
 * Get balances for a group
 */
const getGroupBalances = async (req, res) => {
  try {
    const balances = await calculateGroupBalances(req.params.groupId);
    const { creditors, debtors } = await getSimplifiedBalances(req.params.groupId);

    return sendSuccess(res, 'Balances retrieved successfully', {
      balances,
      creditors,
      debtors,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get optimal settlement suggestions
 */
const getOptimalSettlementSuggestions = async (req, res) => {
  try {
    const balanceService = {
      getSimplifiedBalances: (groupId) => getSimplifiedBalances(groupId),
    };

    const settlements = await getOptimalSettlements(req.params.groupId, balanceService);

    return sendSuccess(res, 'Optimal settlements retrieved successfully', {
      settlements,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Create a settlement
 */
const createSettlement = async (req, res) => {
  try {
    const { paidTo, amount, paymentMethod, notes } = req.body;

    if (!paidTo || !amount) {
      return sendError(res, 'Paid to and amount are required', 400);
    }

    if (amount <= 0) {
      return sendError(res, 'Amount must be greater than 0', 400);
    }

    if (paidTo === req.user._id.toString()) {
      return sendError(res, 'Cannot settle with yourself', 400);
    }

    // Verify both users are group members
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return sendError(res, 'Group not found', 404);
    }

    const groupMemberIds = [
      ...group.members.map((m) => m.user.toString()),
      group.createdBy.toString(),
    ];

    if (
      !groupMemberIds.includes(req.user._id.toString()) ||
      !groupMemberIds.includes(paidTo)
    ) {
      return sendError(res, 'Both users must be group members', 400);
    }

    // Check balance
    const balances = await calculateGroupBalances(req.params.groupId);
    const userBalance = balances.find(
      (b) => b.userId.toString() === req.user._id.toString()
    );

    if (!userBalance || userBalance.balance >= 0) {
      return sendError(res, 'You do not owe any money in this group', 400);
    }

    const owedAmount = Math.abs(userBalance.balance);
    if (amount > owedAmount) {
      return sendError(res, `Amount cannot exceed owed amount of ${owedAmount}`, 400);
    }

    // Create settlement
    const settlement = await Settlement.create({
      group: req.params.groupId,
      paidBy: req.user._id,
      paidTo,
      amount,
      currency: group.currency,
      paymentMethod,
      notes,
      status: 'pending',
      createdBy: req.user._id,
    });

    await settlement.populate('paidBy', 'name email');
    await settlement.populate('paidTo', 'name email');
    await settlement.populate('group', 'name currency');

    return sendSuccess(res, 'Settlement created successfully', { settlement }, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Confirm/Complete a settlement
 */
const confirmSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.settlementId);

    if (!settlement) {
      return sendError(res, 'Settlement not found', 404);
    }

    // Only the person receiving payment can confirm
    if (settlement.paidTo.toString() !== req.user._id.toString()) {
      return sendError(res, 'Only the recipient can confirm this settlement', 403);
    }

    if (settlement.status === 'completed') {
      return sendError(res, 'Settlement is already completed', 400);
    }

    settlement.status = 'completed';
    settlement.settledAt = new Date();
    await settlement.save();

    await settlement.populate('paidBy', 'name email');
    await settlement.populate('paidTo', 'name email');
    await settlement.populate('group', 'name currency');

    // Send confirmation emails (async)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const paidByUser = settlement.paidBy;
      const paidToUser = settlement.paidTo;

      // Email to payer
      sendTemplatedEmail(EMAIL_TYPES.SETTLEMENT_CONFIRMED, paidByUser.email, {
        userName: paidByUser.name,
        groupName: settlement.group.name,
        amount: settlement.amount,
        currency: settlement.currency,
        paidByName: paidByUser.name,
        paidToName: paidToUser.name,
      }).catch(console.error);

      // Email to recipient
      sendTemplatedEmail(EMAIL_TYPES.SETTLEMENT_CONFIRMED, paidToUser.email, {
        userName: paidToUser.name,
        groupName: settlement.group.name,
        amount: settlement.amount,
        currency: settlement.currency,
        paidByName: paidByUser.name,
        paidToName: paidToUser.name,
      }).catch(console.error);
    }

    return sendSuccess(res, 'Settlement confirmed successfully', { settlement });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get all settlements for a group
 */
const getGroupSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('paidBy', 'name email')
      .populate('paidTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Settlements retrieved successfully', { settlements });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get settlement by ID
 */
const getSettlementById = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.settlementId)
      .populate('paidBy', 'name email')
      .populate('paidTo', 'name email')
      .populate('group', 'name currency');

    if (!settlement) {
      return sendError(res, 'Settlement not found', 404);
    }

    return sendSuccess(res, 'Settlement retrieved successfully', { settlement });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Cancel a settlement
 */
const cancelSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.settlementId);

    if (!settlement) {
      return sendError(res, 'Settlement not found', 404);
    }

    // Only creator or recipient can cancel
    if (
      settlement.createdBy.toString() !== req.user._id.toString() &&
      settlement.paidTo.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 'You do not have permission to cancel this settlement', 403);
    }

    if (settlement.status === 'completed') {
      return sendError(res, 'Cannot cancel a completed settlement', 400);
    }

    settlement.status = 'cancelled';
    await settlement.save();

    return sendSuccess(res, 'Settlement cancelled successfully', { settlement });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getGroupBalances,
  getOptimalSettlementSuggestions,
  createSettlement,
  confirmSettlement,
  getGroupSettlements,
  getSettlementById,
  cancelSettlement,
};
