import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../utils/apiClient';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { API } = useAuth();

  const [drivers, setDrivers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===================== DRIVERS =====================

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/drivers`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch drivers');
      }

      const data = await res.json();
      setDrivers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API]);

  const addDriver = useCallback(async (formData) => {
    const res = await apiFetch(`${API}/drivers`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to add driver');
    }

    setDrivers(prev => [...prev, data]);
    return data;
  }, [API]);

  const updateDriver = useCallback(async (id, formData) => {
    const res = await apiFetch(`${API}/drivers/${id}`, {
      method: 'PUT',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to update driver');
    }

    setDrivers(prev => prev.map(d => (d.id === id ? data : d)));
    return data;
  }, [API]);

  const deleteDriver = useCallback(async (id) => {
    const res = await apiFetch(`${API}/drivers/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete driver');
    }

    setDrivers(prev => prev.filter(d => d.id !== id));
  }, [API]);

  // ===================== DOCUMENTS =====================

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/documents`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch documents');
      }

      const data = await res.json();
      setDocuments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API]);

  const fetchDriverDocuments = useCallback(async (driverId) => {
    const res = await apiFetch(`${API}/documents/driver/${driverId}`);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch driver documents');
    }

    return res.json();
  }, [API]);

  const addDocument = useCallback(async (formData) => {
    const res = await apiFetch(`${API}/documents`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to add document');
    }

    setDocuments(prev => [...prev, data]);
    return data;
  }, [API]);

  const deleteDocument = useCallback(async (id) => {
    const res = await apiFetch(`${API}/documents/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Failed to delete document');
    }

    setDocuments(prev => prev.filter(d => d.id !== id));
  }, [API]);

  return (
    <DataContext.Provider
      value={{
        drivers,
        documents,
        loading,
        fetchDrivers,
        addDriver,
        updateDriver,
        deleteDriver,
        fetchDocuments,
        fetchDriverDocuments,
        addDocument,
        deleteDocument
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);