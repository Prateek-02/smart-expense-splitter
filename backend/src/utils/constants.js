module.exports = {
  // Expense split types
  SPLIT_TYPES: {
    EQUAL: 'equal',
    PERCENTAGE: 'percentage',
    EXACT: 'exact',
  },

  // User roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // Group roles
  GROUP_ROLES: {
    MEMBER: 'member',
    ADMIN: 'admin',
  },

  // Expense categories
  EXPENSE_CATEGORIES: [
    'Food & Dining',
    'Transport',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Travel',
    'Health & Fitness',
    'Education',
    'Other',
  ],

  // Settlement status
  SETTLEMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  // JWT
  JWT_EXPIRY: '7d',

  // Email templates
  EMAIL_TYPES: {
    EXPENSE_ADDED: 'expense_added',
    SETTLEMENT_CONFIRMED: 'settlement_confirmed',
    SETTLEMENT_REMINDER: 'settlement_reminder',
    PASSWORD_RESET: 'password_reset',
    EMAIL_VERIFICATION: 'email_verification',
    GROUP_INVITATION: 'group_invitation',
  },
};
