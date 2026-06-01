import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FilePlus, MessageSquare, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import styles from './AdminDrivers.module.css';

const getId = item => item?.id || item?._id;

export default function AdminDrivers() {
  const { drivers, fetchDrivers, deleteDriver, loading } = useData();
  const { API_BASE } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const filtered = drivers.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.nationalId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async id => {
    try {
      await deleteDriver(id);
      toast.success('Driver deleted successfully');
      setConfirmId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete driver');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Drivers</h1>
          <p>{drivers.length} registered driver(s) in the system</p>
        </div>
        <button className={styles.addBtn} onClick={() => navigate('/admin/drivers/add')}>
          <Plus size={17} />
          <span>Add New Driver</span>
        </button>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by name, email or National ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => setSearch('')} aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading drivers...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>{search ? 'No drivers match your search.' : 'No drivers registered yet.'}</p>
          {!search && <button onClick={() => navigate('/admin/drivers/add')}>Add First Driver</button>}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Driver</th>
                <th>National ID</th>
                <th>Phone</th>
                <th>License</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(driver => (
                <tr key={driver.id}>
                  <td>
                    <div className={styles.driverCell}>
                      <div className={styles.avatar}>
                        {driver.photo
                          ? <img src={`${API_BASE}${driver.photo}`} alt={driver.name} />
                          : <span>{driver.name?.charAt(0)?.toUpperCase()}</span>
                        }
                      </div>
                      <div>
                        <strong>{driver.name}</strong>
                        <span>{driver.email}</span>
                      </div>
                    </div>
                  </td>
                  <td><code>{driver.nationalId || '-'}</code></td>
                  <td>{driver.phone || '-'}</td>
                  <td><span className={styles.catBadge}>{driver.licenseCategory || 'B'}</span></td>
                  <td>{driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => navigate(`/admin/drivers/${getId(driver)}/edit`)}>
                        <Pencil size={14} />
                        <span>Edit</span>
                      </button>
                      <button className={styles.messageBtn} onClick={() => navigate(`/admin/messages?driverId=${getId(driver)}&driverName=${encodeURIComponent(driver.name || 'Driver')}`)}>
                        <MessageSquare size={14} />
                        <span>Chat</span>
                      </button>
                      <button className={styles.docBtn} onClick={() => navigate(`/admin/documents/add?driverId=${getId(driver)}&driverName=${encodeURIComponent(driver.name)}`)}>
                        <FilePlus size={14} />
                        <span>Doc</span>
                      </button>
                      <button className={styles.deleteBtn} onClick={() => setConfirmId(getId(driver))}>
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Delete Driver?</h3>
            <p>This will permanently delete the driver and all their documents. This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmId(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(confirmId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
