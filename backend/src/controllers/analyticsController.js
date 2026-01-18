const Expense = require('../models/Expense');
const Group = require('../models/Group');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { calculateGroupBalances } = require('../services/balanceService');

/**
 * Get group analytics
 */
const getGroupAnalytics = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId);
    if (!group) {
      return sendError(res, 'Group not found', 404);
    }

    // Get all expenses
    const expenses = await Expense.find({ group: groupId });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach((expense) => {
      const category = expense.category || 'Other';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + expense.amount;
    });

    // Monthly breakdown
    const monthlyBreakdown = {};
    expenses.forEach((expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM
      monthlyBreakdown[month] = (monthlyBreakdown[month] || 0) + expense.amount;
    });

    // User contributions
    const userContributions = {};
    expenses.forEach((expense) => {
      const paidBy = expense.paidBy.toString();
      userContributions[paidBy] = (userContributions[paidBy] || 0) + expense.amount;
    });

    // Get balances
    const balances = await calculateGroupBalances(groupId);

    // Top spenders
    const topSpenders = balances
      .map((b) => ({
        userId: b.userId,
        userName: b.userName,
        totalPaid: b.totalPaid,
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 5);

    // Expense count
    const expenseCount = expenses.length;

    // Average expense
    const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

    return sendSuccess(res, 'Analytics retrieved successfully', {
      group: {
        id: group._id,
        name: group.name,
        currency: group.currency,
      },
      summary: {
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        expenseCount,
        averageExpense: parseFloat(averageExpense.toFixed(2)),
        memberCount: group.members.length + 1, // +1 for creator
      },
      categoryBreakdown,
      monthlyBreakdown,
      userContributions,
      topSpenders,
      balances,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get user analytics across all groups
 */
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all groups user is part of
    const groups = await Group.find({
      $or: [{ createdBy: userId }, { 'members.user': userId }],
      isActive: true,
    });

    const groupIds = groups.map((g) => g._id);

    // Get all expenses where user is involved
    const expenses = await Expense.find({
      group: { $in: groupIds },
      $or: [{ paidBy: userId }, { 'splitDetails.user': userId }],
    });

    // Calculate totals
    let totalPaid = 0;
    let totalOwed = 0;

    expenses.forEach((expense) => {
      if (expense.paidBy.toString() === userId.toString()) {
        totalPaid += expense.amount;
      }

      const userSplit = expense.splitDetails.find(
        (split) => split.user.toString() === userId.toString()
      );
      if (userSplit) {
        totalOwed += userSplit.amount;
      }
    });

    // Category breakdown
    const categoryBreakdown = {};
    expenses.forEach((expense) => {
      const category = expense.category || 'Other';
      const userShare = expense.splitDetails.find(
        (split) => split.user.toString() === userId.toString()
      )?.amount || 0;
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + userShare;
    });

    return sendSuccess(res, 'User analytics retrieved successfully', {
      summary: {
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        totalOwed: parseFloat(totalOwed.toFixed(2)),
        netBalance: parseFloat((totalPaid - totalOwed).toFixed(2)),
        groupCount: groups.length,
        expenseCount: expenses.length,
      },
      categoryBreakdown,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getGroupAnalytics,
  getUserAnalytics,
};
