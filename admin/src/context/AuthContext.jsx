
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, getApiUrl, getApiBase } from '../utils/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rwd_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout request failed', e);
    }
    localStorage.removeItem('rwd_token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await apiFetch('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Only allow admins to stay logged in on the admin panel
          if (data.role !== 'admin') { logout(); return; }
          setUser(data);
        } else {
          logout();
        }
      } catch (e) {
        console.error('Failed to fetch user:', e);
        logout();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [token, logout]);

  const fetchMe = useCallback(async () => {
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
    } catch (e) {
      console.error('Failed to fetch user:', e);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const login = useCallback(async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
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
    if (data.user?.role !== 'admin') {
      throw new Error('Only administrators can access this panel');
    }
    localStorage.setItem('rwd_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, loading, fetchMe,
      API: getApiUrl(),
      API_BASE: getApiBase()
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
