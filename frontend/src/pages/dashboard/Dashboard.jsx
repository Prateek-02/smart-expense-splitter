import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGroups } from '../../hooks/useGroups';
import { useAuth } from '../../hooks/useAuth';
import GroupList from '../../components/groups/GroupList';
import Loader from '../../components/common/Loader';
import { settlementService } from '../../services/settlementService';

const Dashboard = () => {
  const { groups, fetchGroups, loading } = useGroups();
  const { user } = useAuth();
  const [balances, setBalances] = useState({});

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    // Fetch balances for each group
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
          console.error('Error fetching balance for group:', err);
        }
      }
      setBalances(balanceMap);
    };

    if (groups.length > 0 && user) {
      fetchBalances();
    }
  }, [groups, user]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
        <Link
          to="/groups"
          className="px-6 py-3 bg-indigo-600 text-white no-underline rounded hover:bg-indigo-700"
        >
          Create Group
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Groups</h2>
        <GroupList groups={groups} balances={balances} />
      </div>
    </div>
  );
};

export default Dashboard;
