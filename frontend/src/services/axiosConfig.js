import axios from 'axios';

const instance = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json'
  }
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
  (response) => {
    // Transform the response data to match our frontend structure
    if (response.data.success) {
      return {
        ...response,
        data: response.data.data,
        metadata: {
          count: response.data.count,
          success: response.data.success
        }
      };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Handle forbidden access
      window.location.href = '/';
    }
    
    // Return standardized error format
    const errorResponse = error.response?.data || { success: false, message: 'An error occurred' };
    return Promise.reject({
      success: false,
      message: errorResponse.message || 'An error occurred',
      stack: process.env.NODE_ENV === 'development' ? errorResponse.stack : undefined
    });
  }
);

export default instance; 