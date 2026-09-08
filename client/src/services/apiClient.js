import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response?.data || {
      success: false,
      message: 'Network error or server unreachable',
      errorCode: 'NETWORK_ERROR'
    };
    return Promise.reject(errorPayload);
  }
);

export default apiClient;
