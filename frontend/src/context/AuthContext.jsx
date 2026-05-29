import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, getApiUrl } from '../utils/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rwd_token'));
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(null);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed', error);
    }
    localStorage.removeItem('rwd_token');
    setToken(null);
    setUser(null);
    setPendingVerification(null);
  }, []);





  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiFetch('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [token, logout]);









  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [API, token, logout]);










  const login = useCallback(async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.message || 'Login failed');
      if (data.requiresEmailVerification) {
        error.code = 'VERIFICATION_REQUIRED';
        error.payload = data;
      }
      throw error;
    }

    localStorage.setItem('rwd_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await apiFetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    setPendingVerification({ email: data.email, userId: data.userId });
    return data;
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    const res = await apiFetch('/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OTP verification failed');

    localStorage.setItem('rwd_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setPendingVerification(null);
    return data.user;
  }, []);

  const resendOtp = useCallback(async (email) => {
    const res = await apiFetch('/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to resend OTP');
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      pendingVerification,
      login,
      register,
      verifyOtp,
      resendOtp,
      logout,
      fetchMe,
      API: getApiUrl()
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);