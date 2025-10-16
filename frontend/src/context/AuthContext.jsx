import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, token_type } = response.data;
      
      // Store token
      localStorage.setItem('access_token', access_token);
      
      // Get user info
      const userResponse = await api.get('/auth/me');
      const userData = userResponse.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, data: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Register function
  const register = async (endpoint, userData) => {
    try {
      const response = await api.post(endpoint, userData);
      const { access_token, user_id, email } = response.data;
      
      // Store token
      localStorage.setItem('access_token', access_token);
      
      // Get full user info
      const userResponse = await api.get('/auth/me');
      const fullUserData = userResponse.data;
      
      localStorage.setItem('user', JSON.stringify(fullUserData));
      setUser(fullUserData);
      
      return { success: true, data: fullUserData };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const userResponse = await api.get('/auth/me');
      const userData = userResponse.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, data: userData };
    } catch (error) {
      console.error('Refresh user error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to refresh user data' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
