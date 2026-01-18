const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const { toDecimal, add, subtract, roundCurrency } = require('../utils/precision');

/**
 * Calculate balances for all members in a group
 */
const calculateGroupBalances = async (groupId) => {
  const expenses = await Expense.find({ group: groupId }).populate('paidBy', 'name email');
  const settlements = await Settlement.find({
    group: groupId,
    status: 'completed',
  });

  const balances = {};

  // Process expenses
  expenses.forEach((expense) => {
    const paidBy = expense.paidBy._id.toString();

    // Credit the payer
    if (!balances[paidBy]) {
      balances[paidBy] = {
        userId: paidBy,
        userName: expense.paidBy.name,
        userEmail: expense.paidBy.email,
        totalPaid: 0,
        totalOwed: 0,
        balance: 0,
      };
    }
    balances[paidBy].totalPaid = add(balances[paidBy].totalPaid, expense.amount);

    // Debit the participants
    expense.splitDetails.forEach((split) => {
      const userId = split.user.toString();
      if (!balances[userId]) {
        balances[userId] = {
          userId,
          userName: null,
          userEmail: null,
          totalPaid: 0,
          totalOwed: 0,
          balance: 0,
        };
      }
      balances[userId].totalOwed = add(balances[userId].totalOwed, split.amount);
    });
  });

  // Process settlements
  settlements.forEach((settlement) => {
    const paidBy = settlement.paidBy.toString();
    const paidTo = settlement.paidTo.toString();

    if (!balances[paidBy]) {
      balances[paidBy] = {
        userId: paidBy,
        totalPaid: 0,
        totalOwed: 0,
        balance: 0,
      };
    }
    if (!balances[paidTo]) {
      balances[paidTo] = {
        userId: paidTo,
        totalPaid: 0,
        totalOwed: 0,
        balance: 0,
      };
    }

    // Settlement reduces the debt
    balances[paidBy].totalOwed = subtract(balances[paidBy].totalOwed, settlement.amount);
    balances[paidTo].totalPaid = subtract(balances[paidTo].totalPaid, settlement.amount);
  });

  // Calculate net balance for each user
  Object.keys(balances).forEach((userId) => {
    const balance = balances[userId];
    balance.balance = roundCurrency(subtract(balance.totalPaid, balance.totalOwed));
    balance.totalPaid = roundCurrency(balance.totalPaid);
    balance.totalOwed = roundCurrency(balance.totalOwed);
  });

  return Object.values(balances);
};

/**
 * Calculate balance between two users in a group
 */
const calculateUserBalance = async (groupId, userId) => {
  const balances = await calculateGroupBalances(groupId);
  const userBalance = balances.find((b) => b.userId.toString() === userId.toString());
  return userBalance || {
    userId,
    totalPaid: 0,
    totalOwed: 0,
    balance: 0,
  };
};

/**
 * Get simplified balances (who owes whom)
 */
const getSimplifiedBalances = async (groupId) => {
  const balances = await calculateGroupBalances(groupId);
  const creditors = [];
  const debtors = [];

  balances.forEach((balance) => {
    if (balance.balance > 0.01) {
      creditors.push({
        userId: balance.userId,
        userName: balance.userName,
        amount: balance.balance,
      });
    } else if (balance.balance < -0.01) {
      debtors.push({
        userId: balance.userId,
        userName: balance.userName,
        amount: Math.abs(balance.balance),
      });
    }
  });

  return { creditors, debtors, balances };
};

module.exports = {
  calculateGroupBalances,
  calculateUserBalance,
  getSimplifiedBalances,
};
