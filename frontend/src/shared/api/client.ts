import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Detect expired token
    if (error.response?.status === 401) {
      // Optional: dispatch event or clear token if on protected route
      console.warn('Session expired or unauthorized request.');
    }
    return Promise.reject(error);
  }
);

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.error?.message) {
      return data.error.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
}
