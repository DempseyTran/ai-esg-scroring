import axiosClient from './axiosClient.js';

const authApi = {
  async register(payload) {
    const response = await axiosClient.post('/auth/register', payload);
    return response.data;
  },

  async login(payload) {
    const response = await axiosClient.post('/auth/login', payload);
    return response.data;
  },

  async getProfile() {
    const response = await axiosClient.get('/auth/me');
    return response.data.user;
  }
};

export default authApi;

