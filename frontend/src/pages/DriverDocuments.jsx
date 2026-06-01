import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { differenceInDays, parseISO, format } from 'date-fns';
import styles from './DriverDocuments.module.css';

function safeParse(date) {
  try {
    return date ? parseISO(date) : null;
  } catch {
    return null;
  }
}

function CountdownTimer({ expiryDate }) {
  const parsed = safeParse(expiryDate);

  if (!parsed) {
    return <div className={styles.noExpiry}>No expiry date</div>;
  }

  const days = differenceInDays(parsed, new Date());

  if (days < 0) {
    return (
      <div className={styles.expired}>
        <span className={styles.expiredLabel}>EXPIRED</span>
        <span className={styles.expiredDays}>{Math.abs(days)} days ago</span>
      </div>
    );
  }

  const color =
    days <= 30
      ? 'var(--danger)'
      : days <= 90
        ? 'var(--warning)'
        : 'var(--success)';

  return (
    <div className={styles.countdown}>
      <div className={styles.countdownNum} style={{ color }}>
        {days}
      </div>
      <div className={styles.countdownLabel}>days remaining</div>
    </div>
  );
}

export default function DriverDocuments() {
  const { user, API_BASE } = useAuth();
  const { fetchDriverDocuments } = useData();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchDriverDocuments(user.id);
        if (mounted) setDocs(data || []);
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [user?.id, fetchDriverDocuments]);

  const filtered = docs.filter((doc) => {
    if (filter === 'all') return true;

    const expiry = safeParse(doc.expiryDate);
    if (!expiry) return filter === 'valid';

    const days = differenceInDays(expiry, new Date());

    if (filter === 'expired') return days < 0;
    if (filter === 'expiring') return days >= 0 && days <= 30;
    if (filter === 'valid') return days > 30;

    return true;
  });

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return '';
    return photoPath.startsWith('http') ? photoPath : `${API_BASE}${photoPath}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>My Documents</h1>
          <p>All your driving and vehicle documents in one place</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {['all', 'valid', 'expiring', 'expired'].map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.active : ''
              }`}
            onClick={() => setFilter(f)}
          >
            {f === 'all'
              ? 'All'
              : f === 'valid'
                ? 'Valid'
                : f === 'expiring'
                  ? 'Expiring Soon'
                  : 'Expired'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading your documents...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>
            {docs.length === 0
              ? 'No documents yet. Contact your administrator.'
              : 'No documents match this filter.'}
          </p>
        </div>
      ) : (
        <div className={styles.docsGrid}>
          {filtered.map((doc) => (
            <div
              className={styles.docCard}
              key={doc.id}
              onClick={() => setSelected(doc)}
            >
              {doc.documentPhoto && (
                <div className={styles.docPhotoWrap}>
                  <img
                    src={getPhotoUrl(doc.documentPhoto)}
                    alt="document"
                    className={styles.docPhoto}
                  />
                </div>
              )}

              <div className={styles.docBody}>
                <div className={styles.docTop}>
                  <div className={styles.docTypeWrap}>
                    <span className={styles.docIcon}></span>
                    <span className={styles.docType}>
                      {doc.documentType}
                    </span>
                  </div>

                  <CountdownTimer expiryDate={doc.expiryDate} />
                </div>

                <div className={styles.docDetails}>
                  <div className={styles.detailRow}>
                    <span>Document No.</span>
                    <code>{doc.documentNumber}</code>
                  </div>

                  <div className={styles.detailRow}>
                    <span>Issued By</span>
                    <strong>{doc.issuedBy}</strong>
                  </div>

                  <div className={styles.detailRow}>
                    <span>Issue Date</span>
                    <strong>
                      {doc.issueDate
                        ? format(parseISO(doc.issueDate), 'dd MMM yyyy')
                        : 'N/A'}
                    </strong>
                  </div>

                  {doc.expiryDate && (
                    <div className={styles.detailRow}>
                      <span>Expires</span>
                      <strong>
                        {format(parseISO(doc.expiryDate), 'dd MMM yyyy')}
                      </strong>
                    </div>
                  )}
                </div>

                <div className={styles.paymentBox}>
                  <div className={styles.paymentLabel}>
                    Payment Code for Renewal
                  </div>
                  <div className={styles.paymentCode}>
                    {doc.paymentCode}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelected(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setSelected(null)}
            >
              ×
            </button>

            <h2>{selected.documentType}</h2>

            {selected.documentPhoto && (
              <img
                src={getPhotoUrl(selected.documentPhoto)}
                alt="document"
                className={styles.modalPhoto}
              />
            )}

            <div className={styles.modalDetails}>
              <div className={styles.detailRow}>
                <span>Document Number</span>
                <code>{selected.documentNumber}</code>
              </div>

              <div className={styles.detailRow}>
                <span>Issued By</span>
                <strong>{selected.issuedBy}</strong>
              </div>

              <div className={styles.detailRow}>
                <span>Issue Date</span>
                <strong>{selected.issueDate}</strong>
              </div>

              <div className={styles.detailRow}>
                <span>Expiry Date</span>
                <strong>
                  {selected.expiryDate || 'No expiry'}
                </strong>
              </div>

              <div className={styles.detailRow}>
                <span>Status</span>
                <strong>{selected.status}</strong>
              </div>
            </div>

            <div className={styles.paymentBox}>
              <div className={styles.paymentLabel}>
                Payment Code
              </div>
              <div className={styles.paymentCode}>
                {selected.paymentCode}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
