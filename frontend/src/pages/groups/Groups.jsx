import { useEffect, useState } from 'react';
import { useGroups } from '../../hooks/useGroups';
import GroupList from '../../components/groups/GroupList';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { settlementService } from '../../services/settlementService';

const Groups = () => {
  const { groups, fetchGroups, createGroup, loading } = useGroups();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', currency: 'USD' });
  const [balances, setBalances] = useState({});

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      const balanceMap = {};
      for (const group of groups) {
        try {
          const response = await settlementService.getGroupBalances(group._id);
          if (response.success) {
            const userBalance = response.data.balances.find(
              (b) => b.userId === user?._id
            );
            if (userBalance) {
              balanceMap[group._id] = userBalance.balance;
            }
          }
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      }
      setBalances(balanceMap);
    };

    if (groups.length > 0 && user) {
      fetchBalances();
    }
  }, [groups, user]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const result = await createGroup(formData);
    if (result.success) {
      setShowCreateModal(false);
      setFormData({ name: '', description: '', currency: 'USD' });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Groups</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-indigo-600 text-white border-none rounded cursor-pointer hover:bg-indigo-700"
        >
          Create Group
        </button>
      </div>

      <GroupList groups={groups} balances={balances} />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Group"
      >
        <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
          <div>
            <label>Group Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full p-2 mt-1 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full p-2 mt-1 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label>Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full p-2 mt-1 border border-gray-300 rounded"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-400 text-white border-none rounded cursor-pointer hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white border-none rounded cursor-pointer hover:bg-indigo-700"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Groups;
