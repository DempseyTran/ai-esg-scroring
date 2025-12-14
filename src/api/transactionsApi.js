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
    // esgScore là optional, chỉ gửi nếu có
    const { esgScore, ...restPayload } = payload;
    const requestPayload = esgScore !== undefined
      ? { ...restPayload, esgScore }
      : restPayload;
    const response = await axiosClient.post('/transactions/transfer', requestPayload);
    return response.data;
  },

  async scoreESG(payload) {
    const response = await axiosClient.post('/transactions/esg_scoring', payload);
    return response.data;
  },

  async convertESGPoints(payload) {
    const response = await axiosClient.post('/transactions/convert-esg-points', payload);
    return response.data;
  }
};

export default transactionsApi;

