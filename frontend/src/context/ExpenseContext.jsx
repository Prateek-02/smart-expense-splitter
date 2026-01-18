import { createContext, useContext, useState } from 'react';
import { expenseService } from '../services/expenseService';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroupExpenses = async (groupId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await expenseService.getGroupExpenses(groupId);
      if (response.success) {
        setExpenses(response.data.expenses);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (groupId, expenseData) => {
    try {
      setError(null);
      const response = await expenseService.createExpense(groupId, expenseData);
      if (response.success) {
        setExpenses([...expenses, response.data.expense]);
        return { success: true, expense: response.data.expense };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create expense';
      setError(message);
      return { success: false, message };
    }
  };

  const updateExpense = async (expenseId, expenseData) => {
    try {
      setError(null);
      const response = await expenseService.updateExpense(expenseId, expenseData);
      if (response.success) {
        setExpenses(expenses.map((e) => (e._id === expenseId ? response.data.expense : e)));
        return { success: true, expense: response.data.expense };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update expense';
      setError(message);
      return { success: false, message };
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      setError(null);
      const response = await expenseService.deleteExpense(expenseId);
      if (response.success) {
        setExpenses(expenses.filter((e) => e._id !== expenseId));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete expense';
      setError(message);
      return { success: false, message };
    }
  };

  const value = {
    expenses,
    loading,
    error,
    fetchGroupExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
