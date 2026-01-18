const { SPLIT_TYPES } = require('../utils/constants');
const { toDecimal, add, roundCurrency } = require('../utils/precision');

/**
 * Validate and calculate split amounts based on split type
 */
const calculateSplit = (amount, splitType, participants, splitData = {}) => {
  const splitDetails = [];
  const totalAmount = toDecimal(amount);

  switch (splitType) {
    case SPLIT_TYPES.EQUAL:
      return calculateEqualSplit(totalAmount, participants);

    case SPLIT_TYPES.PERCENTAGE:
      return calculatePercentageSplit(totalAmount, participants, splitData.percentages);

    case SPLIT_TYPES.EXACT:
      return calculateExactSplit(totalAmount, participants, splitData.amounts);

    default:
      throw new Error('Invalid split type');
  }
};

/**
 * Equal split - divide amount equally among participants
 */
const calculateEqualSplit = (totalAmount, participants) => {
  if (!participants || participants.length === 0) {
    throw new Error('At least one participant is required');
  }

  const participantCount = participants.length;
  const amountPerPerson = totalAmount.dividedBy(participantCount);
  const roundedAmount = roundCurrency(amountPerPerson.toNumber());

  // Handle rounding differences
  const splitDetails = participants.map((userId) => ({
    user: userId,
    amount: roundedAmount,
  }));

  // Adjust the last participant to account for rounding
  const totalSplit = toDecimal(roundedAmount).times(participantCount);
  const difference = totalAmount.minus(totalSplit);
  if (!difference.isZero()) {
    splitDetails[splitDetails.length - 1].amount = roundCurrency(
      add(splitDetails[splitDetails.length - 1].amount, difference.toNumber())
    );
  }

  return splitDetails;
};

/**
 * Percentage split - divide based on custom percentages
 */
const calculatePercentageSplit = (totalAmount, participants, percentages) => {
  if (!percentages || Object.keys(percentages).length !== participants.length) {
    throw new Error('Percentages must be provided for all participants');
  }

  let totalPercentage = 0;
  const splitDetails = participants.map((userId) => {
    const percentage = percentages[userId] || 0;
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }
    totalPercentage = add(totalPercentage, percentage);
    const amount = totalAmount.times(percentage).dividedBy(100);
    return {
      user: userId,
      amount: roundCurrency(amount.toNumber()),
      percentage: roundCurrency(percentage),
    };
  });

  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Percentages must sum to 100');
  }

  // Adjust for rounding differences
  const totalSplit = splitDetails.reduce(
    (sum, detail) => add(sum, detail.amount),
    0
  );
  const difference = totalAmount.minus(toDecimal(totalSplit));
  if (!difference.isZero() && Math.abs(difference.toNumber()) > 0.01) {
    splitDetails[splitDetails.length - 1].amount = roundCurrency(
      add(splitDetails[splitDetails.length - 1].amount, difference.toNumber())
    );
  }

  return splitDetails;
};

/**
 * Exact split - use exact amounts specified
 */
const calculateExactSplit = (totalAmount, participants, amounts) => {
  if (!amounts || Object.keys(amounts).length !== participants.length) {
    throw new Error('Exact amounts must be provided for all participants');
  }

  let totalSplit = toDecimal(0);
  const splitDetails = participants.map((userId) => {
    const amount = amounts[userId] || 0;
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    totalSplit = totalSplit.plus(amount);
    return {
      user: userId,
      amount: roundCurrency(amount),
    };
  });

  if (Math.abs(totalSplit.minus(totalAmount).toNumber()) > 0.01) {
    throw new Error('Sum of exact amounts must equal total amount');
  }

  return splitDetails;
};

/**
 * Validate split data before saving
 */
const validateSplit = (amount, splitType, participants, splitData) => {
  if (!amount || amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (!participants || participants.length === 0) {
    throw new Error('At least one participant is required');
  }

  // Remove duplicates
  const uniqueParticipants = [...new Set(participants.map((p) => p.toString()))];
  if (uniqueParticipants.length !== participants.length) {
    throw new Error('Duplicate participants are not allowed');
  }

  return calculateSplit(amount, splitType, participants, splitData);
};

module.exports = {
  calculateSplit,
  calculateEqualSplit,
  calculatePercentageSplit,
  calculateExactSplit,
  validateSplit,
};
