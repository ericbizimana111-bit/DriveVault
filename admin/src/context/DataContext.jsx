import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { token, API } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const getId = item => item?.id || item?._id;

  // ===== DRIVERS =====
  const normalize = (item) => ({ ...item, id: getId(item) });

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/drivers`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch drivers');
      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(normalize) : normalize(data);
      setDrivers(normalized);
      return normalized;
    } catch (e) { console.error(e); return []; }
    finally { setLoading(false); }
  }, [API, authHeaders]);

  const addDriver = useCallback(async (formData) => {
    const res = await fetch(`${API}/drivers`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    const normalized = normalize(data);
    setDrivers(prev => [...prev, normalized]);
    return normalized;
  }, [API, authHeaders]);

  const updateDriver = useCallback(async (id, formData) => {
    const res = await fetch(`${API}/drivers/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    const normalized = normalize(data);
    setDrivers(prev => prev.map(d => getId(d) === id ? normalized : d));
    return normalized;
  }, [API, authHeaders]);

  const deleteDriver = useCallback(async (id) => {
    const res = await fetch(`${API}/drivers/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    setDrivers(prev => prev.filter(d => d.id !== id));
  }, [API, authHeaders]);

  // ===== DOCUMENTS =====
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/documents`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(normalize) : normalize(data);
      setDocuments(normalized);
      return normalized;
    } catch (e) { console.error(e); return []; }
    finally { setLoading(false); }
  }, [API, authHeaders]);

  const fetchDriverDocuments = useCallback(async (driverId) => {
    const res = await fetch(`${API}/documents/driver/${driverId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch driver documents');
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalize) : normalize(data);
  }, [API, authHeaders]);

  const addDocument = useCallback(async (formData) => {
    const res = await fetch(`${API}/documents`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    const normalized = normalize(data);
    setDocuments(prev => [...prev, normalized]);
    return normalized;
  }, [API, authHeaders]);

  const deleteDocument = useCallback(async (id) => {
    const res = await fetch(`${API}/documents/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, [API, authHeaders]);

  return (
    <DataContext.Provider value={{
      drivers, documents, loading,
      fetchDrivers, addDriver, updateDriver, deleteDriver,
      fetchDocuments, fetchDriverDocuments, addDocument, deleteDocument
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
