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

// Response interceptor to format errors and handle global status redirects
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 403) {
      if (window.location.pathname !== '/403') {
        window.location.href = '/403';
      }
    } else if (error.response?.status === 429) {
      if (window.location.pathname !== '/quota-exceeded') {
        window.location.href = '/quota-exceeded';
      }
    }

    const errorPayload = error.response?.data || {
      success: false,
      message: 'Network error or server unreachable',
      errorCode: 'NETWORK_ERROR'
    };
    return Promise.reject(errorPayload);
  }
);

export default apiClient;
