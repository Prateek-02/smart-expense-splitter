/**
 * Format currency based on currency code
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

/**
 * Format number with 2 decimal places
 */
export const formatNumber = (num) => {
  return parseFloat(num || 0).toFixed(2);
};
