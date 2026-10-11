import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mediccare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired local credentials if unauthorized
      localStorage.removeItem('mediccare_token');
      localStorage.removeItem('mediccare_user');
    }
    return Promise.reject(error);
  }
);

export default api;
