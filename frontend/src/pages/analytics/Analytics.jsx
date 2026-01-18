import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';

const Analytics = () => {
  const { groupId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [groupId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      if (groupId) {
        const response = await api.get(`/analytics/group/${groupId}`);
        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } else {
        const response = await api.get('/analytics/user');
        if (response.data.success) {
          setUserAnalytics(response.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (groupId && analytics) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Group Analytics: {analytics.group.name}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
            <p className="text-3xl m-0 text-indigo-600">
              {formatCurrency(analytics.summary.totalExpenses, analytics.group.currency)}
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Number of Expenses</h3>
            <p className="text-3xl m-0 text-indigo-600">{analytics.summary.expenseCount}</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Average Expense</h3>
            <p className="text-3xl m-0 text-indigo-600">
              {formatCurrency(analytics.summary.averageExpense, analytics.group.currency)}
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Members</h3>
            <p className="text-3xl m-0 text-indigo-600">{analytics.summary.memberCount}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Category Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.categoryBreakdown).map(([category, amount]) => (
              <div key={category} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="font-bold">{category}</div>
                <div className="text-indigo-600 mt-2">
                  {formatCurrency(amount, analytics.group.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Top Spenders</h2>
          <div className="flex flex-col gap-2">
            {analytics.topSpenders.map((spender, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between">
                  <span>{spender.userName}</span>
                  <span className="font-bold text-indigo-600">
                    {formatCurrency(spender.totalPaid, analytics.group.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!groupId && userAnalytics) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Your Analytics</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Paid</h3>
            <p className="text-3xl m-0 text-green-600">
              {formatCurrency(userAnalytics.summary.totalPaid)}
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Owed</h3>
            <p className="text-3xl m-0 text-red-500">
              {formatCurrency(userAnalytics.summary.totalOwed)}
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Net Balance</h3>
            <p className={`text-3xl m-0 ${userAnalytics.summary.netBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatCurrency(userAnalytics.summary.netBalance)}
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Groups</h3>
            <p className="text-3xl m-0 text-indigo-600">{userAnalytics.summary.groupCount}</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Category Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(userAnalytics.categoryBreakdown).map(([category, amount]) => (
              <div key={category} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="font-bold">{category}</div>
                <div className="text-indigo-600 mt-2">
                  {formatCurrency(amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <div className="p-8">No analytics data available</div>;
};

export default Analytics;
