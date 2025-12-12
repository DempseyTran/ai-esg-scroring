import axiosClient from './axiosClient.js';

const goalsApi = {
  async list() {
    const response = await axiosClient.get('/goals');
    return response.data.goals;
  },

  async alerts() {
    const response = await axiosClient.get('/goals/alerts');
    return response.data.alerts;
  }
};

export default goalsApi;

