import axiosClient from './axiosClient.js';

const bankApi = {
  async getAccounts() {
    const response = await axiosClient.get('/bank/accounts');
    return response.data;
  },

  async linkAccount(payload) {
    const response = await axiosClient.post('/bank/accounts/link', payload);
    return response.data;
  },

  async syncAccount(accountId) {
    const response = await axiosClient.post(`/bank/accounts/${accountId}/sync`);
    return response.data;
  },

  async getAccountGoals(accountId) {
    const response = await axiosClient.get(`/bank/accounts/${accountId}/goals`);
    return response.data.goals;
  },

  async createGoal(accountId, payload) {
    const response = await axiosClient.post(
      `/bank/accounts/${accountId}/goals`,
      payload
    );
    return response.data.goal;
  },

  async updateGoal(accountId, goalId, payload) {
    const response = await axiosClient.put(
      `/bank/accounts/${accountId}/goals/${goalId}`,
      payload
    );
    return response.data.goal;
  },

  async deleteGoal(accountId, goalId) {
    const response = await axiosClient.delete(
      `/bank/accounts/${accountId}/goals/${goalId}`
    );
    return response.data;
  },

  async getRecipients() {
    const response = await axiosClient.get('/bank/accounts/recipients');
    return response.data.recipients;
  }
};

export default bankApi;

