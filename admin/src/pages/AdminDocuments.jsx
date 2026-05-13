import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { differenceInDays, parseISO, format } from 'date-fns';
import { useData } from '../context/DataContext';
import styles from './AdminDocuments.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ExpiryBadge({ expiryDate }) {
  if (!expiryDate) return <span className={`${styles.badge} ${styles.badgeNone}`}>No Expiry</span>;
  const days = differenceInDays(parseISO(expiryDate), new Date());
  if (days < 0) return <span className={`${styles.badge} ${styles.badgeExp}`}>Expired {Math.abs(days)}d ago</span>;
  if (days <= 30) return <span className={`${styles.badge} ${styles.badgeWarn}`}>{days}d left</span>;
  return <span className={`${styles.badge} ${styles.badgeOk}`}>{days}d left</span>;
}

export default function AdminDocuments() {
  const { documents, fetchDocuments, deleteDocument, loading } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmId, setConfirmId] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => { fetchDocuments(); }, []);

  const filtered = documents.filter(doc => {
    const matchSearch =
      doc.documentType?.toLowerCase().includes(search.toLowerCase()) ||
      doc.driverName?.toLowerCase().includes(search.toLowerCase()) ||
      doc.documentNumber?.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (filterStatus === 'all') return true;
    if (!doc.expiryDate) return filterStatus === 'valid';
    const days = differenceInDays(parseISO(doc.expiryDate), new Date());
    if (filterStatus === 'expired') return days < 0;
    if (filterStatus === 'expiring') return days >= 0 && days <= 30;
    if (filterStatus === 'valid') return days > 30;
    return true;
  });

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      toast.success('Document deleted');
      setConfirmId(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Documents</h1>
          <p>{documents.length} document(s) in the system</p>
        </div>
        <button className={styles.addBtn} onClick={() => navigate('/admin/documents/add')}>
          + Add Document
        </button>
      </div>

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <span>🔍</span>
          <input
            placeholder="Search by document, driver, or number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}>✕</button>}
        </div>
        <div className={styles.statusFilters}>
          {['all', 'valid', 'expiring', 'expired'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filterStatus === f ? styles.active : ''}`}
              onClick={() => setFilterStatus(f)}
            >
              {f === 'all' ? 'All' : f === 'valid' ? '✅ Valid' : f === 'expiring' ? '⚠️ Expiring' : '🚫 Expired'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading documents...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <div>📄</div>
          <p>{documents.length === 0 ? 'No documents yet.' : 'No documents match your filters.'}</p>
          {documents.length === 0 && (
            <button onClick={() => navigate('/admin/documents/add')}>Add First Document →</button>
          )}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Document</th>
                <th>Driver</th>
                <th>Number</th>
                <th>Issued</th>
                <th>Expires</th>
                <th>Payment Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div className={styles.docTypeCell}>
                      {doc.documentPhoto && (
                        <img
                          src={`${API_BASE}${doc.documentPhoto}`}
                          alt="doc"
                          className={styles.docThumb}
                          onClick={() => setSelectedPhoto(`${API_BASE}${doc.documentPhoto}`)}
                        />
                      )}
                      <div>
                        <strong>{doc.documentType}</strong>
                        <ExpiryBadge expiryDate={doc.expiryDate} />
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.driverName}>{doc.driverName}</span></td>
                  <td><code>{doc.documentNumber}</code></td>
                  <td>{doc.issueDate ? format(parseISO(doc.issueDate), 'dd MMM yyyy') : '—'}</td>
                  <td>{doc.expiryDate ? format(parseISO(doc.expiryDate), 'dd MMM yyyy') : '—'}</td>
                  <td><code className={styles.payCode}>{doc.paymentCode}</code></td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => setConfirmId(doc.id)} title="Delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div className={styles.photoOverlay} onClick={() => setSelectedPhoto(null)}>
          <div className={styles.photoModal}>
            <button className={styles.closeBtn} onClick={() => setSelectedPhoto(null)}>✕</button>
            <img src={selectedPhoto} alt="document" />
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div>⚠️</div>
            <h3>Delete Document?</h3>
            <p>This will permanently remove the document from the system.</p>
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
