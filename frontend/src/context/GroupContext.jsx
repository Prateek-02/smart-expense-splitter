import { createContext, useContext, useState } from 'react';
import { groupService } from '../services/groupService';

const GroupContext = createContext(null);

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await groupService.getMyGroups();
      if (response.success) {
        setGroups(response.data.groups);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    try {
      setError(null);
      const response = await groupService.createGroup(groupData);
      if (response.success) {
        setGroups([...groups, response.data.group]);
        return { success: true, group: response.data.group };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create group';
      setError(message);
      return { success: false, message };
    }
  };

  const updateGroup = async (groupId, groupData) => {
    try {
      setError(null);
      const response = await groupService.updateGroup(groupId, groupData);
      if (response.success) {
        setGroups(groups.map((g) => (g._id === groupId ? response.data.group : g)));
        return { success: true, group: response.data.group };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update group';
      setError(message);
      return { success: false, message };
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      setError(null);
      const response = await groupService.deleteGroup(groupId);
      if (response.success) {
        setGroups(groups.filter((g) => g._id !== groupId));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete group';
      setError(message);
      return { success: false, message };
    }
  };

  const value = {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};
