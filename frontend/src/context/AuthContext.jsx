import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/axiosConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await apiClient.get('/api/users/me');
          setCurrentUser(res.data.data.user);
        } catch (err) {
          console.error('Failed to load user', err);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register a new user
  const signup = async (username, email, password) => {
    try {
      setError('');
      const res = await apiClient.post('/api/auth/signup', { username, email, password });
      
      const { token, data } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(data.user);
      
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up');
      throw err;
    }
  };

  // Log in a user
  const login = async (email, password) => {
    try {
      setError('');
      const res = await apiClient.post('/api/auth/login', { email, password });
      
      const { token, data } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(data.user);
      
      return data.user;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
      throw err;
    }
  };

  // Log out a user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};