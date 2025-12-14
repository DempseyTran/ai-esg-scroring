import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ai-esg-scroring-be-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pfob_token');
  console.log('Axios request interceptor - Token exists:', !!token, 'URL:', config.url);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No token found in localStorage for request:', config.url);
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pfob_token');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

