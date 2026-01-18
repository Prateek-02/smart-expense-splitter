import { useState } from 'react';
import Modal from '../common/Modal';

const SettleUpModal = ({ isOpen, onClose, onSubmit, paidTo, amount, currency = 'USD' }) => {
  const [formData, setFormData] = useState({
    amount: amount || '',
    paymentMethod: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      paidTo,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    });
    setFormData({ amount: '', paymentMethod: '', notes: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settle Up">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label>Amount ({currency}) *</label>
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
          <label>Payment Method</label>
          <input
            type="text"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            placeholder="e.g., Cash, UPI, Bank Transfer"
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 mt-1 border border-gray-300 rounded"
          />
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white border-none rounded cursor-pointer hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white border-none rounded cursor-pointer hover:bg-indigo-700"
          >
            Settle Up
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SettleUpModal;
