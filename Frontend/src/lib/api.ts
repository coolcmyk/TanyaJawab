import axios from 'axios';

// Create a single axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

// Export the same instance as axiosInstance for compatibility
export const axiosInstance = api;

// Set up an interceptor to add the token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log("Interceptor menambahkan token:", token); // Debugging
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("Token tidak ditemukan di interceptor"); // Debugging
  }
  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      // Redirect to login without causing loops
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);