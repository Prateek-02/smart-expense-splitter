import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupService } from '../../services/groupService';
import { expenseService } from '../../services/expenseService';
import { settlementService } from '../../services/settlementService';
import { useAuth } from '../../hooks/useAuth';
import ExpenseList from '../../components/expenses/ExpenseList';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import SettleUpModal from '../../components/settlements/SettleUpModal';
import SettlementCard from '../../components/settlements/SettlementCard';
import { formatCurrency } from '../../utils/formatCurrency';

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [balances, setBalances] = useState([]);
  const [optimalSettlements, setOptimalSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const [groupRes, expensesRes, settlementsRes, balancesRes, optimalRes] = await Promise.all([
        groupService.getGroupById(groupId),
        expenseService.getGroupExpenses(groupId),
        settlementService.getGroupSettlements(groupId),
        settlementService.getGroupBalances(groupId),
        settlementService.getOptimalSettlements(groupId),
      ]);

      if (groupRes.success) setGroup(groupRes.data.group);
      if (expensesRes.success) setExpenses(expensesRes.data.expenses);
      if (settlementsRes.success) setSettlements(settlementsRes.data.settlements);
      if (balancesRes.success) setBalances(balancesRes.data.balances);
      if (optimalRes.success) setOptimalSettlements(optimalRes.data.settlements);
    } catch (err) {
      console.error('Error fetching group data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (expenseData) => {
    try {
      const response = await expenseService.createExpense(groupId, expenseData);
      if (response.success) {
        setExpenses([response.data.expense, ...expenses]);
        setShowExpenseForm(false);
        fetchGroupData(); // Refresh balances
      }
    } catch (err) {
      console.error('Error creating expense:', err);
    }
  };

  const handleUpdateExpense = async (expenseData) => {
    try {
      const response = await expenseService.updateExpense(editingExpense._id, expenseData);
      if (response.success) {
        setExpenses(expenses.map((e) => (e._id === editingExpense._id ? response.data.expense : e)));
        setEditingExpense(null);
        fetchGroupData();
      }
    } catch (err) {
      console.error('Error updating expense:', err);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const response = await expenseService.deleteExpense(expenseId);
      if (response.success) {
        setExpenses(expenses.filter((e) => e._id !== expenseId));
        fetchGroupData();
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleSettleUp = async (settlementData) => {
    try {
      const response = await settlementService.createSettlement(groupId, settlementData);
      if (response.success) {
        setSettlements([response.data.settlement, ...settlements]);
        setShowSettleModal(false);
        fetchGroupData();
      }
    } catch (err) {
      console.error('Error creating settlement:', err);
    }
  };

  const handleConfirmSettlement = async (settlementId) => {
    try {
      const response = await settlementService.confirmSettlement(settlementId);
      if (response.success) {
        setSettlements(settlements.map((s) => (s._id === settlementId ? response.data.settlement : s)));
        fetchGroupData();
      }
    } catch (err) {
      console.error('Error confirming settlement:', err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await groupService.addMember(groupId, memberEmail);
      if (response.success) {
        setGroup(response.data.group);
        setMemberEmail('');
        setShowAddMemberModal(false);
        fetchGroupData();
      } else {
        alert(response.message || 'Failed to add member');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      const response = await groupService.removeMember(groupId, memberId);
      if (response.success) {
        setGroup(response.data.group);
        fetchGroupData();
      } else {
        alert(response.message || 'Failed to remove member');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      const response = await groupService.updateMemberRole(groupId, memberId, newRole);
      if (response.success) {
        setGroup(response.data.group);
        fetchGroupData();
      } else {
        alert(response.message || 'Failed to update member role');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update member role');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    try {
      const response = await groupService.deleteGroup(groupId);
      if (response.success) {
        navigate('/groups');
      } else {
        alert(response.message || 'Failed to delete group');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete group');
    }
  };

  const isGroupAdmin = group?.createdBy?._id?.toString() === user?._id?.toString() || 
    group?.members?.some((m) => {
      const memberUserId = m.user?._id?.toString() || m.user?.toString();
      return memberUserId === user?._id?.toString() && m.role === 'admin';
    });

  if (loading) return <Loader />;
  if (!group) return <div className="p-8">Group not found</div>;

  const userBalance = balances.find((b) => b.userId === user?._id);
  
  // Create a map to ensure unique members (creator might also be in members array)
  const membersMap = new Map();
  
  // Add creator first
  membersMap.set(group.createdBy._id.toString(), {
    _id: group.createdBy._id,
    name: group.createdBy.name,
    user: group.createdBy,
  });
  
  // Add other members (will overwrite if creator is also in members array, but that's fine)
  group.members.forEach((m) => {
    const memberId = m.user._id.toString();
    if (!membersMap.has(memberId)) {
      membersMap.set(memberId, {
        _id: m.user._id,
        name: m.user.name,
        user: m.user,
      });
    }
  });
  
  const groupMembers = Array.from(membersMap.values());

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <button
            onClick={() => navigate('/groups')}
            className="px-4 py-2 bg-gray-400 text-white border-none rounded cursor-pointer hover:bg-gray-500"
          >
            ← Back to Groups
          </button>
          {isGroupAdmin && (
            <button
              onClick={handleDeleteGroup}
              className="px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-700"
            >
              Delete Group
            </button>
          )}
        </div>
        <h1 className="text-3xl font-bold">{group.name}</h1>
        {group.description && <p className="text-gray-600 mt-2">{group.description}</p>}
      </div>

      {/* Members Management Section */}
      {isGroupAdmin && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Members</h2>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white border-none rounded cursor-pointer hover:bg-indigo-700"
            >
              Add Member
            </button>
          </div>
          <div className="space-y-2">
            {/* Creator */}
            <div className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="font-semibold">{group.createdBy.name}</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Creator</span>
                <span className="text-gray-500 text-sm">{group.createdBy.email}</span>
              </div>
            </div>
            {/* Other Members */}
            {group.members.map((member, index) => {
              const memberUserId = member.user?._id?.toString() || member.user?.toString() || member.user;
              const creatorId = group.createdBy._id?.toString() || group.createdBy?.toString();
              const isCreator = memberUserId === creatorId;
              
              if (isCreator) return null;
              
              return (
                <div key={memberUserId || `member-${index}`} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{member.user?.name || 'Unknown'}</span>
                    {member.role === 'admin' && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Admin</span>
                    )}
                    <span className="text-gray-500 text-sm">{member.user?.email || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role || 'member'}
                      onChange={(e) => handleUpdateMemberRole(memberUserId, e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(memberUserId)}
                      className="px-3 py-1 bg-red-500 text-white text-sm border-none rounded cursor-pointer hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
            {group.members.length === 0 && (
              <p className="text-gray-600 text-center py-4">No additional members yet</p>
            )}
          </div>
        </div>
      )}

      {/* Balances Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {balances.map((balance) => (
            <div key={balance.userId} className="p-4 bg-white rounded border border-gray-200">
              <div className="font-bold">{balance.userName || 'Unknown'}</div>
              <div className={`text-xl mt-2 ${balance.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {balance.balance >= 0 ? '+' : ''}{formatCurrency(balance.balance, group.currency)}
              </div>
            </div>
          ))}
        </div>

        {/* Optimal Settlements */}
        {optimalSettlements.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Suggested Settlements</h3>
            <div className="flex flex-col gap-2">
              {optimalSettlements.map((settlement, idx) => (
                <div key={idx} className="p-3 bg-white rounded border border-gray-200">
                  {settlement.paidByName} should pay {settlement.paidToName} {formatCurrency(settlement.amount, group.currency)}
                  {settlement.paidBy === user?._id && (
                    <button
                      onClick={() => {
                        setSelectedSettlement(settlement);
                        setShowSettleModal(true);
                      }}
                      className="ml-4 px-2 py-1 bg-indigo-600 text-white border-none rounded cursor-pointer hover:bg-indigo-700"
                    >
                      Settle
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expenses Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Expenses</h2>
          <button
            onClick={() => {
              setEditingExpense(null);
              setShowExpenseForm(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white border-none rounded cursor-pointer hover:bg-indigo-700"
          >
            Add Expense
          </button>
        </div>
        <ExpenseList
          expenses={expenses}
          onEdit={(expense) => {
            setEditingExpense(expense);
            setShowExpenseForm(true);
          }}
          onDelete={handleDeleteExpense}
          canEdit={isGroupAdmin}
        />
      </div>

      {/* Settlements Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Settlements</h2>
        {settlements.length === 0 ? (
          <p className="text-gray-600">No settlements yet</p>
        ) : (
          settlements.map((settlement) => (
            <SettlementCard
              key={settlement._id}
              settlement={settlement}
              onConfirm={handleConfirmSettlement}
              canConfirm={settlement.paidTo?._id === user?._id}
            />
          ))
        )}
      </div>

      {/* Expense Form Modal */}
      <Modal
        isOpen={showExpenseForm}
        onClose={() => {
          setShowExpenseForm(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseForm
          onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
          onCancel={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          groupMembers={groupMembers}
          initialData={editingExpense}
        />
      </Modal>

      {/* Settle Up Modal */}
      <SettleUpModal
        isOpen={showSettleModal}
        onClose={() => {
          setShowSettleModal(false);
          setSelectedSettlement(null);
        }}
        onSubmit={handleSettleUp}
        paidTo={selectedSettlement?.paidTo}
        amount={selectedSettlement?.amount}
        currency={group.currency}
      />

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setMemberEmail('');
        }}
        title="Add Member to Group"
      >
        <form onSubmit={handleAddMember} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1">Member Email *</label>
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full p-2 mt-1 border border-gray-300 rounded"
            />
            <p className="text-sm text-gray-500 mt-1">
              The user must have an account with this email address.
            </p>
          </div>
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => {
                setShowAddMemberModal(false);
                setMemberEmail('');
              }}
              className="px-4 py-2 bg-gray-400 text-white border-none rounded cursor-pointer hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white border-none rounded cursor-pointer hover:bg-indigo-700"
            >
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GroupDetails;
