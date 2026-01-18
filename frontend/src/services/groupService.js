import api from './api';

export const groupService = {
  createGroup: async (groupData) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  },

  getMyGroups: async () => {
    const response = await api.get('/groups/my-groups');
    return response.data;
  },

  getGroupById: async (groupId) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  updateGroup: async (groupId, groupData) => {
    const response = await api.put(`/groups/${groupId}`, groupData);
    return response.data;
  },

  deleteGroup: async (groupId) => {
    const response = await api.delete(`/groups/${groupId}`);
    return response.data;
  },

  addMember: async (groupId, email) => {
    const response = await api.post(`/groups/${groupId}/members`, { email });
    return response.data;
  },

  removeMember: async (groupId, memberId) => {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data;
  },

  updateMemberRole: async (groupId, memberId, role) => {
    const response = await api.put(`/groups/${groupId}/members/${memberId}/role`, { role });
    return response.data;
  },
};
