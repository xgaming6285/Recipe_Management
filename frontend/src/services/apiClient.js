import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Only transform successful API responses with data property
    if (response.data && typeof response.data === 'object' && response.data.success !== undefined) {
      return {
        ...response,
        data: response.data.data || [],
        metadata: {
          count: response.data.count || 0,
          success: response.data.success
        }
      };
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject({
      success: false,
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default apiClient;