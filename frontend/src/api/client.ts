import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific status codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.error('Access denied - user does not have permission', error.response?.data);
    } else if (error.response?.status === 404) {
      // Not found
      console.error('Resource not found', error.response?.data);
    } else if (error.response?.status === 500) {
      // Server error
      console.error('Server error', error.response?.data);
    }
    
    // Always reject the error for the calling code to handle
    return Promise.reject(error);
  }
);

export default apiClient;
