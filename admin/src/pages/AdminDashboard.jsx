import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { differenceInDays, parseISO } from 'date-fns';
import styles from './AdminDashboard.module.css';

const API_BASE = 'http://localhost:5000';

export default function AdminDashboard() {
  const { drivers, documents, fetchDrivers, fetchDocuments, loading } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDrivers();
    fetchDocuments();
  }, []);

  const expired = documents.filter(d => d.expiryDate && differenceInDays(parseISO(d.expiryDate), new Date()) < 0);
  const expiringSoon = documents.filter(d => d.expiryDate && differenceInDays(parseISO(d.expiryDate), new Date()) >= 0 && differenceInDays(parseISO(d.expiryDate), new Date()) <= 30);

  const stats = [
    { label: 'Total Drivers', value: drivers.length, icon: '👥', color: 'var(--primary)', action: () => navigate('/admin/drivers') },
    { label: 'Total Documents', value: documents.length, icon: '📄', color: '#2980b9', action: () => navigate('/admin/documents') },
    { label: 'Expiring Soon', value: expiringSoon.length, icon: '⚠️', color: 'var(--warning)', action: () => navigate('/admin/documents') },
    { label: 'Expired', value: expired.length, icon: '🚫', color: 'var(--danger)', action: () => navigate('/admin/documents') },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Overview of all drivers and documents in the Rwanda DriveDoc system</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={() => navigate('/admin/drivers/add')}>+ Add Driver</button>
          <button className={styles.btnPrimary} onClick={() => navigate('/admin/documents/add')}>+ Add Document</button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map((s, i) => (
          <div className={styles.statCard} key={i} onClick={s.action} style={{ borderTop: `3px solid ${s.color}` }}>
            <div className={styles.statTop}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statNum} style={{ color: s.color }}>{s.value}</span>
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {expired.length > 0 && (
        <div className={styles.alertDanger}>
          🚫 <strong>{expired.length} expired document(s)</strong> require immediate attention.
          <button onClick={() => navigate('/admin/documents')}>View →</button>
        </div>
      )}
      {expiringSoon.length > 0 && (
        <div className={styles.alertWarning}>
          ⚠️ <strong>{expiringSoon.length} document(s)</strong> expire within 30 days.
          <button onClick={() => navigate('/admin/documents')}>View →</button>
        </div>
      )}

      <div className={styles.mainGrid}>
        {/* Recent Drivers */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Recent Drivers</h2>
            <button onClick={() => navigate('/admin/drivers')}>View All</button>
          </div>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : drivers.length === 0 ? (
            <div className={styles.empty}>No drivers yet. <span onClick={() => navigate('/admin/drivers/add')}>Add one →</span></div>
          ) : (
            <div className={styles.driverList}>
              {drivers.slice(0, 6).map(d => (
                <div className={styles.driverRow} key={d.id}>
                  <div className={styles.driverAvatar}>
                    {d.photo
                      ? <img src={`${API_BASE}${d.photo}`} alt={d.name} />
                      : <span>{d.name?.charAt(0)?.toUpperCase()}</span>
                    }
                  </div>
                  <div className={styles.driverInfo}>
                    <strong>{d.name}</strong>
                    <span>{d.email}</span>
                  </div>
                  <div className={styles.driverCat}>{d.licenseCategory || 'B'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Documents */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Recent Documents</h2>
            <button onClick={() => navigate('/admin/documents')}>View All</button>
          </div>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : documents.length === 0 ? (
            <div className={styles.empty}>No documents yet. <span onClick={() => navigate('/admin/documents/add')}>Add one →</span></div>
          ) : (
            <div className={styles.docList}>
              {documents.slice(0, 6).map(d => {
                const days = d.expiryDate ? differenceInDays(parseISO(d.expiryDate), new Date()) : null;
                let badgeCls = styles.badgeOk;
                let badgeTxt = 'Valid';
                if (days !== null) {
                  if (days < 0) { badgeCls = styles.badgeExp; badgeTxt = 'Expired'; }
                  else if (days <= 30) { badgeCls = styles.badgeWarn; badgeTxt = `${days}d`; }
                  else badgeTxt = `${days}d`;
                }
                return (
                  <div className={styles.docRow} key={d.id}>
                    <div className={styles.docRowInfo}>
                      <strong>{d.documentType}</strong>
                      <span>{d.driverName}</span>
                    </div>
                    <span className={`${styles.badge} ${badgeCls}`}>{badgeTxt}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
