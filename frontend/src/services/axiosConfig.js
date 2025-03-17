import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Return standardized error format
    const errorResponse = error.response?.data || { success: false, message: 'An error occurred' };
    return Promise.reject({
      success: false,
      message: errorResponse.message || 'An error occurred',
      stack: errorResponse.stack
    });
  }
);

export default instance; 