import { formatCurrency } from '../../utils/formatCurrency';
import { SETTLEMENT_STATUS } from '../../utils/constants';

const SettlementCard = ({ settlement, onConfirm, onCancel, canConfirm }) => {
  const paidBy = settlement.paidBy?.name || 'Unknown';
  const paidTo = settlement.paidTo?.name || 'Unknown';
  const currency = settlement.currency || 'USD';
  const status = settlement.status;

  const getStatusColor = () => {
    switch (status) {
      case SETTLEMENT_STATUS.COMPLETED:
        return 'bg-green-500';
      case SETTLEMENT_STATUS.PENDING:
        return 'bg-yellow-500';
      case SETTLEMENT_STATUS.CANCELLED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="m-0 text-lg font-semibold">
              {paidBy} → {paidTo}
            </h3>
            <span className={`px-2 py-1 rounded text-xs uppercase text-white ${getStatusColor()}`}>
              {status}
            </span>
          </div>
          <p className="my-1 text-gray-600">
            <strong>Amount:</strong> {formatCurrency(settlement.amount, currency)}
          </p>
          {settlement.paymentMethod && (
            <p className="my-1 text-gray-600">
              <strong>Payment Method:</strong> {settlement.paymentMethod}
            </p>
          )}
          {settlement.notes && (
            <p className="my-1 text-gray-600">
              <strong>Notes:</strong> {settlement.notes}
            </p>
          )}
          {settlement.settledAt && (
            <p className="my-1 text-gray-600">
              <strong>Settled:</strong> {new Date(settlement.settledAt).toLocaleString()}
            </p>
          )}
        </div>
        {status === SETTLEMENT_STATUS.PENDING && canConfirm && (
          <div className="flex gap-2">
            {onConfirm && (
              <button
                onClick={() => onConfirm(settlement._id)}
                className="px-4 py-2 bg-green-500 text-white border-none rounded cursor-pointer hover:bg-green-600"
              >
                Confirm
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => onCancel(settlement._id)}
                className="px-4 py-2 bg-red-500 text-white border-none rounded cursor-pointer hover:bg-red-600"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementCard;
