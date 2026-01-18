import { formatCurrency } from '../../utils/formatCurrency';

const ExpenseItem = ({ expense, onEdit, onDelete, canEdit }) => {
  const paidBy = expense.paidBy?.name || 'Unknown';
  const currency = expense.currency || 'USD';

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="m-0 mb-2 text-xl font-semibold">{expense.description}</h3>
          <p className="m-1 text-gray-600">
            <strong>Amount:</strong> {formatCurrency(expense.amount, currency)}
          </p>
          <p className="m-1 text-gray-600">
            <strong>Paid by:</strong> {paidBy}
          </p>
          <p className="m-1 text-gray-600">
            <strong>Category:</strong> {expense.category}
          </p>
          <p className="m-1 text-gray-600">
            <strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}
          </p>
          {expense.notes && (
            <p className="m-1 text-gray-600">
              <strong>Notes:</strong> {expense.notes}
            </p>
          )}
          <div className="mt-2">
            <strong>Split:</strong>
            <ul className="m-1 pl-6 list-disc">
              {expense.splitDetails?.map((split, idx) => (
                <li key={idx} className="text-gray-600">
                  {split.user?.name || 'Unknown'}: {formatCurrency(split.amount, currency)}
                  {split.percentage && ` (${split.percentage}%)`}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {canEdit && (onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(expense)}
                className="px-2 py-1 bg-indigo-600 text-white border-none rounded cursor-pointer hover:bg-indigo-700"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(expense._id)}
                className="px-2 py-1 bg-red-500 text-white border-none rounded cursor-pointer hover:bg-red-600"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseItem;
