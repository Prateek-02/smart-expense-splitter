/**
 * Currency conversion service
 * For now, returns 1:1 conversion (can be extended with real API)
 */
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // TODO: Integrate with real currency conversion API (e.g., ExchangeRate-API, Fixer.io)
  // For now, return 1:1 conversion
  console.warn(`Currency conversion from ${fromCurrency} to ${toCurrency} not implemented. Using 1:1 ratio.`);
  return amount;
};

/**
 * Format amount with currency symbol
 */
const formatAmount = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

module.exports = {
  convertCurrency,
  formatAmount,
};
