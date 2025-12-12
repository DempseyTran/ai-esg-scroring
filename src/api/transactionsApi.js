import axiosClient from './axiosClient.js';

const transactionsApi = {
  async list(params = {}) {
    const response = await axiosClient.get('/transactions', { params });
    return response.data.transactions;
  },

  async summary(params = {}) {
    const response = await axiosClient.get('/transactions/summary', { params });
    return response.data.summary;
  },

  async breakdown(params = {}) {
    const response = await axiosClient.get('/transactions/breakdown', {
      params
    });
    return response.data.breakdown;
  },

  async transfer(payload) {
    const response = await axiosClient.post('/transactions/transfer', payload);
    return response.data;
  }
};

export default transactionsApi;

