import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

const GroupCard = ({ group, balance = null }) => {
  const memberCount = group.members?.length || 0;
  const currency = group.currency || 'USD';

  return (
    <Link
      to={`/groups/${group._id}`}
      className="no-underline text-inherit block"
    >
      <div className="border border-gray-200 rounded-lg p-6 mb-4 bg-white transition-shadow hover:shadow-lg cursor-pointer">
        <h3 className="m-0 mb-2 text-gray-800 text-xl font-semibold">{group.name}</h3>
        {group.description && (
          <p className="my-2 text-gray-600">{group.description}</p>
        )}
        <div className="flex justify-between items-center mt-4">
          <span className="text-gray-600">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
          {balance !== null && (
            <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {balance >= 0 ? '+' : ''}{formatCurrency(balance, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;
