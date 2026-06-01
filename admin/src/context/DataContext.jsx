
import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../utils/apiClient';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { token } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const getId = item => item?.id || item?._id;
  const normalize = item => ({ ...item, id: getId(item) });

  // ===== DRIVERS =====

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/drivers', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch drivers');
      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(normalize) : [normalize(data)];
      setDrivers(normalized);
      return normalized;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const addDriver = useCallback(async (formData) => {
    const res = await apiFetch('/drivers', {
      method: 'POST',
      headers: authHeaders(),
      body: formData  // FormData — apiClient won't set Content-Type so multipart works
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add driver');
    const normalized = normalize(data);
    setDrivers(prev => [...prev, normalized]);
    return normalized;
  }, [authHeaders]);

  const updateDriver = useCallback(async (id, formData) => {
    const res = await apiFetch(`/drivers/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update driver');
    const normalized = normalize(data);
    setDrivers(prev => prev.map(d => getId(d) === id ? normalized : d));
    return normalized;
  }, [authHeaders]);

  const deleteDriver = useCallback(async (id) => {
    const res = await apiFetch(`/drivers/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.message || 'Failed to delete driver');
    }
    setDrivers(prev => prev.filter(d => getId(d) !== id));
  }, [authHeaders]);

  // ===== DOCUMENTS =====

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/documents', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      const normalized = Array.isArray(data) ? data.map(normalize) : [normalize(data)];
      setDocuments(normalized);
      return normalized;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const fetchDriverDocuments = useCallback(async (driverId) => {
    const res = await apiFetch(`/documents/driver/${driverId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch driver documents');
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalize) : [normalize(data)];
  }, [authHeaders]);

  const addDocument = useCallback(async (formData) => {
    const res = await apiFetch('/documents', {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add document');
    const normalized = normalize(data);
    setDocuments(prev => [...prev, normalized]);
    return normalized;
  }, [authHeaders]);

  const deleteDocument = useCallback(async (id) => {
    const res = await apiFetch(`/documents/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.message || 'Failed to delete document');
    }
    setDocuments(prev => prev.filter(d => getId(d) !== id));
  }, [authHeaders]);

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
