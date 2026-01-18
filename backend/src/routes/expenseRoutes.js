const express = require('express');
const router = express.Router();
const {
  createExpense,
  getGroupExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMyExpenses,
} = require('../controllers/expenseController');
const { authenticate } = require('../middlewares/authMiddleware');
const { isGroupMember } = require('../middlewares/roleMiddleware');

// All routes require authentication
router.use(authenticate);

router.get('/my-expenses', getMyExpenses);
router.get('/group/:groupId', isGroupMember, getGroupExpenses);
router.post('/group/:groupId', isGroupMember, createExpense);
router.get('/:expenseId', getExpenseById);
router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);

module.exports = router;
