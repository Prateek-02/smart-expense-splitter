import { useState } from 'react';
import { SPLIT_TYPES, EXPENSE_CATEGORIES } from '../../utils/constants';

const ExpenseForm = ({ onSubmit, onCancel, groupMembers, initialData = null }) => {
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    paidBy: initialData?.paidBy || '',
    splitType: initialData?.splitType || SPLIT_TYPES.EQUAL,
    participants: initialData?.participants || [],
    category: initialData?.category || 'Other',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: initialData?.notes || '',
    percentages: initialData?.percentages || {},
    amounts: initialData?.amounts || {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleParticipantToggle = (userId) => {
    const participants = formData.participants.includes(userId)
      ? formData.participants.filter((id) => id !== userId)
      : [...formData.participants, userId];
    setFormData({ ...formData, participants });
  };

  const handlePercentageChange = (userId, value) => {
    setFormData({
      ...formData,
      percentages: { ...formData.percentages, [userId]: parseFloat(value) || 0 },
    });
  };

  const handleAmountChange = (userId, value) => {
    setFormData({
      ...formData,
      amounts: { ...formData.amounts, [userId]: parseFloat(value) || 0 },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const splitData = {};
    if (formData.splitType === SPLIT_TYPES.PERCENTAGE) {
      splitData.percentages = formData.percentages;
    } else if (formData.splitType === SPLIT_TYPES.EXACT) {
      splitData.amounts = formData.amounts;
    }
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      splitData,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block mb-1">Description *</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full p-2 mt-1 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block mb-1">Amount *</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0.01"
          required
          className="w-full p-2 mt-1 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block mb-1">Paid By *</label>
        <select
          name="paidBy"
          value={formData.paidBy}
          onChange={handleChange}
          required
          className="w-full p-2 mt-1 border border-gray-300 rounded"
        >
          <option value="">Select payer</option>
          {groupMembers.map((member) => (
            <option key={member._id || member.user?._id} value={member._id || member.user?._id}>
              {member.name || member.user?.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 mt-1 border border-gray-300 rounded"
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 mt-1 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block mb-1">Split Type *</label>
        <select
          name="splitType"
          value={formData.splitType}
          onChange={handleChange}
          className="w-full p-2 mt-1 border border-gray-300 rounded"
        >
          <option value={SPLIT_TYPES.EQUAL}>Equal</option>
          <option value={SPLIT_TYPES.PERCENTAGE}>Percentage</option>
          <option value={SPLIT_TYPES.EXACT}>Exact Amount</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">Participants *</label>
        <div className="mt-2 flex flex-col gap-2">
          {groupMembers.map((member, index) => {
            const memberId = member._id || member.user?._id;
            const memberName = member.name || member.user?.name;
            // Use string conversion and index as fallback to ensure unique keys
            const uniqueKey = memberId ? memberId.toString() : `member-${index}`;
            return (
              <div key={uniqueKey} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.participants.includes(memberId)}
                  onChange={() => handleParticipantToggle(memberId)}
                  className="cursor-pointer"
                />
                <span>{memberName}</span>
                {formData.participants.includes(memberId) && formData.splitType === SPLIT_TYPES.PERCENTAGE && (
                  <input
                    type="number"
                    placeholder="%"
                    value={formData.percentages[memberId] || ''}
                    onChange={(e) => handlePercentageChange(memberId, e.target.value)}
                    className="w-20 p-1 border border-gray-300 rounded"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                )}
                {formData.participants.includes(memberId) && formData.splitType === SPLIT_TYPES.EXACT && (
                  <input
                    type="number"
                    placeholder="Amount"
                    value={formData.amounts[memberId] || ''}
                    onChange={(e) => handleAmountChange(memberId, e.target.value)}
                    className="w-24 p-1 border border-gray-300 rounded"
                    min="0"
                    step="0.01"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full p-2 mt-1 border border-gray-300 rounded"
        />
      </div>

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400 text-white border-none rounded cursor-pointer hover:bg-gray-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white border-none rounded cursor-pointer hover:bg-indigo-700"
        >
          {initialData ? 'Update' : 'Create'} Expense
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
