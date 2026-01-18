const { toDecimal, subtract, add } = require('../utils/precision');

/**
 * Minimize the number of settlements required using a greedy algorithm
 * This implements a simplified version of the debt minimization algorithm
 */
const optimizeSettlements = (creditors, debtors) => {
  const settlements = [];
  
  // Create copies to avoid mutating original arrays
  const creditorsCopy = creditors.map(c => ({ ...c, remaining: c.amount }));
  const debtorsCopy = debtors.map(d => ({ ...d, remaining: d.amount }));

  // Sort by amount (largest first for better optimization)
  creditorsCopy.sort((a, b) => b.remaining - a.remaining);
  debtorsCopy.sort((a, b) => b.remaining - a.remaining);

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditorsCopy.length && debtorIndex < debtorsCopy.length) {
    const creditor = creditorsCopy[creditorIndex];
    const debtor = debtorsCopy[debtorIndex];

    if (creditor.remaining < 0.01) {
      creditorIndex++;
      continue;
    }

    if (debtor.remaining < 0.01) {
      debtorIndex++;
      continue;
    }

    // Calculate settlement amount
    const settlementAmount = Math.min(creditor.remaining, debtor.remaining);

    if (settlementAmount > 0.01) {
      settlements.push({
        paidBy: debtor.userId,
        paidTo: creditor.userId,
        paidByName: debtor.userName,
        paidToName: creditor.userName,
        amount: parseFloat(settlementAmount.toFixed(2)),
      });

      creditor.remaining = subtract(creditor.remaining, settlementAmount);
      debtor.remaining = subtract(debtor.remaining, settlementAmount);
    }

    if (creditor.remaining < 0.01) {
      creditorIndex++;
    }
    if (debtor.remaining < 0.01) {
      debtorIndex++;
    }
  }

  return settlements;
};

/**
 * Get optimal settlement suggestions for a group
 */
const getOptimalSettlements = async (groupId, balanceService) => {
  const { creditors, debtors } = await balanceService.getSimplifiedBalances(groupId);
  return optimizeSettlements(creditors, debtors);
};

module.exports = {
  optimizeSettlements,
  getOptimalSettlements,
};
