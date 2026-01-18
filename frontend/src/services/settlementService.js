import api from './api';

export const settlementService = {
  getGroupBalances: async (groupId) => {
    const response = await api.get(`/settlements/group/${groupId}/balances`);
    return response.data;
  },

  getOptimalSettlements: async (groupId) => {
    const response = await api.get(`/settlements/group/${groupId}/optimal`);
    return response.data;
  },

  getGroupSettlements: async (groupId) => {
    const response = await api.get(`/settlements/group/${groupId}`);
    return response.data;
  },

  createSettlement: async (groupId, settlementData) => {
    const response = await api.post(`/settlements/group/${groupId}`, settlementData);
    return response.data;
  },

  confirmSettlement: async (settlementId) => {
    const response = await api.put(`/settlements/${settlementId}/confirm`);
    return response.data;
  },

  cancelSettlement: async (settlementId) => {
    const response = await api.put(`/settlements/${settlementId}/cancel`);
    return response.data;
  },

  getSettlementById: async (settlementId) => {
    const response = await api.get(`/settlements/${settlementId}`);
    return response.data;
  },
};
