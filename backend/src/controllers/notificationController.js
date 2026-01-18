const Settlement = require('../models/Settlement');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { calculateGroupBalances } = require('../services/balanceService');
const { sendTemplatedEmail, EMAIL_TYPES } = require('../services/emailService');
const User = require('../models/User');
const Group = require('../models/Group');

/**
 * Get notifications for current user
 * This is a simple implementation - in production, you'd have a Notification model
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = [];

    // Get pending settlements where user is owed money
    const pendingSettlements = await Settlement.find({
      paidTo: userId,
      status: 'pending',
    })
      .populate('paidBy', 'name email')
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    pendingSettlements.forEach((settlement) => {
      notifications.push({
        type: 'settlement_pending',
        message: `${settlement.paidBy.name} wants to settle ${settlement.amount} ${settlement.currency} in ${settlement.group.name}`,
        settlementId: settlement._id,
        groupId: settlement.group._id,
        createdAt: settlement.createdAt,
      });
    });

    // Get groups where user has negative balance (owes money)
    const groups = await Group.find({
      $or: [{ createdBy: userId }, { 'members.user': userId }],
      isActive: true,
    });

    for (const group of groups) {
      const balances = await calculateGroupBalances(group._id);
      const userBalance = balances.find(
        (b) => b.userId.toString() === userId.toString()
      );

      if (userBalance && userBalance.balance < -0.01) {
        notifications.push({
          type: 'balance_owed',
          message: `You owe ${Math.abs(userBalance.balance).toFixed(2)} ${group.currency} in ${group.name}`,
          groupId: group._id,
          amount: Math.abs(userBalance.balance),
          createdAt: new Date(),
        });
      }
    }

    // Sort by creation date
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return sendSuccess(res, 'Notifications retrieved successfully', {
      notifications,
      unreadCount: notifications.length,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Send reminder emails for pending settlements
 */
const sendSettlementReminders = async () => {
  try {
    // Get all pending settlements older than 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const pendingSettlements = await Settlement.find({
      status: 'pending',
      createdAt: { $lt: threeDaysAgo },
    })
      .populate('paidTo', 'name email isEmailVerified')
      .populate('group', 'name currency');

    for (const settlement of pendingSettlements) {
      if (settlement.paidTo.isEmailVerified && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const balances = await calculateGroupBalances(settlement.group._id);
        const userBalance = balances.find(
          (b) => b.userId.toString() === settlement.paidTo._id.toString()
        );

        if (userBalance && userBalance.balance > 0) {
          await sendTemplatedEmail(EMAIL_TYPES.SETTLEMENT_REMINDER, settlement.paidTo.email, {
            userName: settlement.paidTo.name,
            groupName: settlement.group.name,
            amountOwed: settlement.amount,
            currency: settlement.group.currency,
          });
        }
      }
    }

    console.log(`Sent ${pendingSettlements.length} settlement reminders`);
  } catch (error) {
    console.error('Error sending settlement reminders:', error);
  }
};

module.exports = {
  getNotifications,
  sendSettlementReminders,
};
