import axios, { type AxiosInstance, AxiosError } from 'axios';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api');

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error)
);

export default apiClient;
