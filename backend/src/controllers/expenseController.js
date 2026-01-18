const Expense = require('../models/Expense');
const Group = require('../models/Group');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { validateSplit } = require('../services/splitServices');
const { sendTemplatedEmail, EMAIL_TYPES } = require('../services/emailService');
const { calculateGroupBalances } = require('../services/balanceService');

/**
 * Create a new expense
 */
const createExpense = async (req, res) => {
  try {
    const {
      description,
      amount,
      paidBy,
      splitType,
      participants,
      splitData,
      category,
      date,
      notes,
    } = req.body;

    if (!description || !amount || !paidBy || !splitType || !participants) {
      return sendError(res, 'Missing required fields', 400);
    }

    // Validate participants are group members
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return sendError(res, 'Group not found', 404);
    }

    const groupMemberIds = group.members.map((m) => m.user.toString());
    const allParticipants = [...new Set([paidBy, ...participants].map((p) => p.toString()))];

    const invalidParticipants = allParticipants.filter(
      (p) => !groupMemberIds.includes(p) && p !== group.createdBy.toString()
    );

    if (invalidParticipants.length > 0) {
      return sendError(res, 'All participants must be group members', 400);
    }

    // Validate and calculate split
    const splitDetails = validateSplit(amount, splitType, allParticipants, splitData);

    // Create expense
    const expense = await Expense.create({
      description,
      amount,
      currency: group.currency,
      group: req.params.groupId,
      paidBy,
      splitType,
      splitDetails,
      category: category || 'Other',
      date: date || new Date(),
      notes,
      createdBy: req.user._id,
    });

    await expense.populate('paidBy', 'name email');
    await expense.populate('splitDetails.user', 'name email');
    await expense.populate('group', 'name currency');

    // Send notifications to participants (async)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const paidByUser = expense.paidBy;
      splitDetails.forEach(async (split) => {
        if (split.user.toString() !== paidBy.toString()) {
          const participant = await require('../models/User').findById(split.user);
          if (participant && participant.isEmailVerified) {
            sendTemplatedEmail(EMAIL_TYPES.EXPENSE_ADDED, participant.email, {
              userName: participant.name,
              groupName: group.name,
              expenseDescription: description,
              amount,
              currency: group.currency,
              paidByName: paidByUser.name,
              userShare: split.amount,
            }).catch(console.error);
          }
        }
      });
    }

    return sendSuccess(res, 'Expense created successfully', { expense }, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get all expenses for a group
 */
const getGroupExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name email')
      .populate('splitDetails.user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    return sendSuccess(res, 'Expenses retrieved successfully', { expenses });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get expense by ID
 */
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId)
      .populate('paidBy', 'name email')
      .populate('splitDetails.user', 'name email')
      .populate('group', 'name currency')
      .populate('createdBy', 'name email');

    if (!expense) {
      return sendError(res, 'Expense not found', 404);
    }

    return sendSuccess(res, 'Expense retrieved successfully', { expense });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Update expense
 */
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) {
      return sendError(res, 'Expense not found', 404);
    }

    // Check if user can edit (creator or group admin)
    const canEdit =
      expense.createdBy.toString() === req.user._id.toString() || req.isGroupAdmin;

    if (!canEdit) {
      return sendError(res, 'You do not have permission to edit this expense', 403);
    }

    const {
      description,
      amount,
      paidBy,
      splitType,
      participants,
      splitData,
      category,
      date,
      notes,
    } = req.body;

    const updates = {};

    if (description) updates.description = description;
    if (category) updates.category = category;
    if (date) updates.date = date;
    if (notes !== undefined) updates.notes = notes;

    // If amount, splitType, or participants changed, recalculate split
    if (amount || splitType || participants) {
      const finalAmount = amount || expense.amount;
      const finalSplitType = splitType || expense.splitType;
      const finalParticipants = participants || expense.splitDetails.map((s) => s.user);

      const group = await Group.findById(expense.group);
      const allParticipants = [
        ...new Set([paidBy || expense.paidBy, ...finalParticipants].map((p) => p.toString())),
      ];

      const splitDetails = validateSplit(
        finalAmount,
        finalSplitType,
        allParticipants,
        splitData
      );

      updates.amount = finalAmount;
      updates.splitType = finalSplitType;
      updates.splitDetails = splitDetails;
      if (paidBy) updates.paidBy = paidBy;
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.expenseId,
      updates,
      { new: true, runValidators: true }
    )
      .populate('paidBy', 'name email')
      .populate('splitDetails.user', 'name email');

    return sendSuccess(res, 'Expense updated successfully', { expense: updatedExpense });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Delete expense
 */
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId);
    if (!expense) {
      return sendError(res, 'Expense not found', 404);
    }

    // Check if user can delete (creator or group admin)
    const canDelete =
      expense.createdBy.toString() === req.user._id.toString() || req.isGroupAdmin;

    if (!canDelete) {
      return sendError(res, 'You do not have permission to delete this expense', 403);
    }

    await Expense.findByIdAndDelete(req.params.expenseId);

    return sendSuccess(res, 'Expense deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get expenses for current user across all groups
 */
const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      $or: [{ paidBy: req.user._id }, { 'splitDetails.user': req.user._id }],
    })
      .populate('paidBy', 'name email')
      .populate('splitDetails.user', 'name email')
      .populate('group', 'name currency')
      .sort({ date: -1, createdAt: -1 })
      .limit(50);

    return sendSuccess(res, 'Expenses retrieved successfully', { expenses });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  createExpense,
  getGroupExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMyExpenses,
};
