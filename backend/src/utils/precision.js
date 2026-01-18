const Decimal = require('decimal.js');

// Set precision for financial calculations
Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP });

/**
 * Round to 2 decimal places for currency display
 */
const roundCurrency = (amount) => {
  return new Decimal(amount).toDecimalPlaces(2).toNumber();
};

/**
 * Ensure amount is a valid Decimal
 */
const toDecimal = (amount) => {
  return new Decimal(amount || 0);
};

/**
 * Add two amounts with precision
 */
const add = (a, b) => {
  return toDecimal(a).plus(toDecimal(b)).toNumber();
};

/**
 * Subtract two amounts with precision
 */
const subtract = (a, b) => {
  return toDecimal(a).minus(toDecimal(b)).toNumber();
};

/**
 * Multiply two amounts with precision
 */
const multiply = (a, b) => {
  return toDecimal(a).times(toDecimal(b)).toNumber();
};

/**
 * Divide two amounts with precision
 */
const divide = (a, b) => {
  if (toDecimal(b).isZero()) {
    throw new Error('Division by zero');
  }
  return toDecimal(a).dividedBy(toDecimal(b)).toNumber();
};

module.exports = {
  roundCurrency,
  toDecimal,
  add,
  subtract,
  multiply,
  divide,
  Decimal,
};
