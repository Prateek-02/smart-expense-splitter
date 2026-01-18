import GroupCard from './GroupCard';

const GroupList = ({ groups, balances = {} }) => {
  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        No groups found. Create your first group!
      </div>
    );
  }

  return (
    <div>
      {groups.map((group) => (
        <GroupCard
          key={group._id}
          group={group}
          balance={balances[group._id]}
        />
      ))}
    </div>
  );
};

export default GroupList;
