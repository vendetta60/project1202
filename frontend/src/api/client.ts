import axios from 'axios';
import { getToken, getRefreshToken, setToken, removeToken } from '../utils/auth';
import { refreshToken as refreshTokenApi } from './auth';

// Dev-də həmişə eyni origin (Vite proxy backend-ə yönləndirir, indi 8002 portunda)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api/v1' : 'http://localhost:8002/api/v1');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
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
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 503) {
      // Texniki təmir rejimi: bütün istifadəçiləri sistemdən çıxar və
      // xüsusi səhifəyə yönləndir
      removeToken();
      window.location.href = '/maintenance';
      return Promise.reject(error);
    }

    if (status === 401) {
      const isAuthEndpoint =
        typeof originalRequest?.url === 'string' &&
        (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh'));

      const refresh = getRefreshToken();

      if (!isAuthEndpoint && refresh && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const data = await refreshTokenApi(refresh);
          setToken(data.access_token, data.refresh_token);

          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

          return apiClient(originalRequest);
        } catch (refreshError) {
          removeToken();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // If no refresh token or refresh failed/auth endpoint, force logout
      removeToken();
      window.location.href = '/login';
    } else if (status === 403) {
      console.error('Access denied - user does not have permission', error.response?.data);
    } else if (status === 404) {
      console.error('Resource not found', error.response?.data);
    } else if (status === 500) {
      console.error('Server error', error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
