import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { differenceInDays, parseISO } from 'date-fns';
import styles from './DriverDashboard.module.css';

function ExpiryBadge({ expiryDate }) {
  if (!expiryDate) return <span className={styles.badgeNone}>No Expiry</span>;
  const days = differenceInDays(parseISO(expiryDate), new Date());
  if (days < 0) return <span className={styles.badgeExpired}>Expired</span>;
  if (days <= 30) return <span className={styles.badgeWarning}>{days}d left</span>;
  return <span className={styles.badgeOk}>{days}d left</span>;
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const { fetchDriverDocuments } = useData();
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDriverDocuments(user.id).then(d => { setDocs(d); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [user]);

  const expired = docs.filter(d => d.expiryDate && differenceInDays(parseISO(d.expiryDate), new Date()) < 0);
  const expiringSoon = docs.filter(d => d.expiryDate && differenceInDays(parseISO(d.expiryDate), new Date()) >= 0 && differenceInDays(parseISO(d.expiryDate), new Date()) <= 30);
  const valid = docs.filter(d => !d.expiryDate || differenceInDays(parseISO(d.expiryDate), new Date()) > 30);

  return (
    <div className={styles.page}>
      {/* Welcome */}
      <div className={styles.welcome}>
        <div className={styles.welcomeText}>
          <h1>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's your driving document overview. Keep all documents valid to stay road-legal in Rwanda.</p>
        </div>
        <button className={styles.docsBtn} onClick={() => navigate('/my-documents')}>View All Documents →</button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📄</div>
          <div className={styles.statNum}>{docs.length}</div>
          <div className={styles.statLabel}>Total Documents</div>
        </div>
        <div className={`${styles.statCard} ${styles.statGreen}`}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statNum}>{valid.length}</div>
          <div className={styles.statLabel}>Valid Documents</div>
        </div>
        <div className={`${styles.statCard} ${styles.statOrange}`}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statNum}>{expiringSoon.length}</div>
          <div className={styles.statLabel}>Expiring Soon</div>
        </div>
        <div className={`${styles.statCard} ${styles.statRed}`}>
          <div className={styles.statIcon}>🚫</div>
          <div className={styles.statNum}>{expired.length}</div>
          <div className={styles.statLabel}>Expired</div>
        </div>
      </div>

      {/* Alerts */}
      {expired.length > 0 && (
        <div className={styles.alert}>
          <strong>⚠️ Action Required:</strong> You have {expired.length} expired document(s). Use your payment code to renew immediately.
        </div>
      )}
      {expiringSoon.length > 0 && expired.length === 0 && (
        <div className={styles.alertWarning}>
          <strong>🕐 Reminder:</strong> {expiringSoon.length} document(s) expire within 30 days. Plan your renewal now.
        </div>
      )}

      {/* Recent Documents */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Documents</h2>
          <button onClick={() => navigate('/my-documents')}>See All</button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading documents...</div>
        ) : docs.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <p>No documents yet. Your administrator will add your documents after your license is issued.</p>
          </div>
        ) : (
          <div className={styles.docsGrid}>
            {docs.slice(0, 4).map(doc => (
              <div className={styles.docCard} key={doc.id}>
                <div className={styles.docHeader}>
                  <span className={styles.docType}>{doc.documentType}</span>
                  <ExpiryBadge expiryDate={doc.expiryDate} />
                </div>
                <div className={styles.docNum}>#{doc.documentNumber}</div>
                <div className={styles.docMeta}>
                  <span>Issued: {doc.issueDate || 'N/A'}</span>
                  <span>By: {doc.issuedBy}</span>
                </div>
                <div className={styles.paymentCode}>
                  <span>Payment Code</span>
                  <code>{doc.paymentCode}</code>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* License Info */}
      {user && (
        <div className={styles.section}>
          <h2>My License Profile</h2>
          <div className={styles.profileCard}>
            <div className={styles.profileLeft}>
              <div className={styles.avatar}>
                {user.photo
                  ? <img src={`http://localhost:5000${user.photo}`} alt="profile" />
                  : <span>{user.name?.charAt(0)?.toUpperCase()}</span>
                }
              </div>
            </div>
            <div className={styles.profileRight}>
              <div className={styles.profileRow}><span>Full Name</span><strong>{user.name}</strong></div>
              <div className={styles.profileRow}><span>National ID</span><strong>{user.nationalId || 'N/A'}</strong></div>
              <div className={styles.profileRow}><span>License Category</span><strong className={styles.catBadge}>{user.licenseCategory || 'B'}</strong></div>
              <div className={styles.profileRow}><span>Phone</span><strong>{user.phone || 'N/A'}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
