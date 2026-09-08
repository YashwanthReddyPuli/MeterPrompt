import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mp_token') || '');
  const [currency, setCurrency] = useState('USD'); // Always USD
  const [serverStatus, setServerStatus] = useState('checking');
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  const checkHealth = async () => {
    try {
      const res = await apiClient.get('/health');
      if (res.success) setServerStatus('connected');
      else setServerStatus('error');
    } catch (err) {
      setServerStatus('offline');
    }
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    try {
      const res = await apiClient.get('/plans');
      if (res.success) setPlans(res.data);
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchSubscription = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get('/subscriptions/me');
      if (res.success) setSubscription(res.data);
    } catch (err) {
      console.error('Failed to fetch subscription', err);
    }
  };

  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get('/auth/me');
      if (res.success) {
        setUser(res.data);
        localStorage.setItem('mp_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchPlans();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (token) {
      fetchSubscription();
      fetchUserProfile();
    } else {
      setSubscription(null);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await apiClient.post('/auth/login', { email, password });
      if (data.success) {
        setUser(data.data);
        setToken(data.data.token);
        localStorage.setItem('mp_user', JSON.stringify(data.data));
        localStorage.setItem('mp_token', data.data.token);
        showNotification('success', 'Welcome back!');
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const data = await apiClient.post('/auth/register', { name, email, password, role });
      if (data.success) {
        setUser(data.data);
        setToken(data.data.token);
        localStorage.setItem('mp_user', JSON.stringify(data.data));
        localStorage.setItem('mp_token', data.data.token);
        showNotification('success', 'Account created successfully!');
        return { success: true, apiKey: data.data.apiKey };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setSubscription(null);
    localStorage.removeItem('mp_user');
    localStorage.removeItem('mp_token');
    showNotification('success', 'Signed out successfully.');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      currency,
      setCurrency,
      serverStatus,
      subscription,
      setSubscription,
      plans,
      plansLoading,
      fetchPlans,
      fetchSubscription,
      fetchUserProfile,
      login,
      register,
      logout,
      notification,
      showNotification
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
