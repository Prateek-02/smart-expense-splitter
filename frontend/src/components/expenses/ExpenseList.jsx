import ExpenseItem from './ExpenseItem';

const ExpenseList = ({ expenses, onEdit, onDelete, canEdit }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No expenses found. Add your first expense!
      </div>
    );
  }

  return (
    <div>
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense._id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
};

export default ExpenseList;
