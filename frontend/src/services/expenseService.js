import api from './api';

export const expenseService = {
  createExpense: async (groupId, expenseData) => {
    const response = await api.post(`/expenses/group/${groupId}`, expenseData);
    return response.data;
  },

  getGroupExpenses: async (groupId) => {
    const response = await api.get(`/expenses/group/${groupId}`);
    return response.data;
  },

  getExpenseById: async (expenseId) => {
    const response = await api.get(`/expenses/${expenseId}`);
    return response.data;
  },

  updateExpense: async (expenseId, expenseData) => {
    const response = await api.put(`/expenses/${expenseId}`, expenseData);
    return response.data;
  },

  deleteExpense: async (expenseId) => {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  },

  getMyExpenses: async () => {
    const response = await api.get('/expenses/my-expenses');
    return response.data;
  },
};
