
import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import styles from './DriverProfile.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LICENSE_INFO = {
  A: { label: 'Motorcycle', vehicles: 'L1, L2, L3, L4, L5, L6', color: '#e67e22' },
  A1: { label: '3-Wheeler / 4-Wheeler (≤350kg)', vehicles: 'L1, L2, L3, L4, L5, L6', color: '#e67e22' },
  B: { label: 'Standard Passenger Vehicle', vehicles: 'M1, M2, N1 — up to 8 seats, ≤3,500kg', color: '#2d5c42' },
  B1: { label: 'Passenger Bus (8+ seats)', vehicles: 'M1, M2 — 8+ seats, ≤5,000kg', color: '#2980b9' },
  B2: { label: 'Light Goods Vehicle', vehicles: 'N1 — goods vehicle ≤3,500kg', color: '#8e44ad' },
  C: { label: 'Heavy Goods Vehicle', vehicles: 'N2, N3 — medium to large trucks', color: '#c0392b' },
  D: { label: 'Large Passenger Bus', vehicles: 'M3 — large coaches and buses', color: '#16a085' },
};

export default function DriverProfile() {
  const { user, token, API } = useAuth();
  const cat = user?.licenseCategory || 'B';
  const licenseInfo = LICENSE_INFO[cat] || LICENSE_INFO['B'];
  const photoRef = useRef();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    const file = photoRef.current?.files[0];
    if (!file) {
      toast.error('Please select a photo');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(`${API}/drivers/${user.id}/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      toast.success('Profile photo updated successfully');
      setPhotoPreview(null);
      if (photoRef.current) photoRef.current.value = '';
      // Refresh user context
      try { await fetchMe(); } catch (e) { /* ignore */ }
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Profile</h1>
        <p>Your personal details and license information as registered by the administrator</p>
      </div>

      <div className={styles.grid}>
        {/* Profile Card with Photo Upload */}
        <div className={styles.card}>
          <div className={styles.profileTop}>
            <div className={styles.avatar}>
              {photoPreview ? (
                <img src={photoPreview} alt="preview" />
              ) : user?.photo ? (
                <img src={`${API_BASE}${user.photo}`} alt="profile" />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <div className={styles.profileName}>{user?.name}</div>
            <div className={styles.profileRole}>Licensed Driver</div>
          </div>
          <div className={styles.divider} />
          <div className={styles.photoUploadSection}>
            <label className={styles.uploadLabel}>Upload Profile Photo</label>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />
            <button
              className={styles.selectPhotoBtn}
              onClick={() => photoRef.current?.click()}
            >
              📷 Select Photo
            </button>
            {photoPreview && (
              <button
                className={styles.uploadPhotoBtn}
                onClick={handlePhotoUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : '✓ Upload Photo'}
              </button>
            )}
          </div>
          <div className={styles.divider} />
          <div className={styles.details}>
            <div className={styles.detail}><span>Email</span><strong>{user?.email}</strong></div>
            <div className={styles.detail}><span>Phone</span><strong>{user?.phone || 'Not provided'}</strong></div>
            <div className={styles.detail}><span>National ID</span><strong>{user?.nationalId || 'Not provided'}</strong></div>
            <div className={styles.detail}><span>Date of Birth</span><strong>{user?.dateOfBirth || 'Not provided'}</strong></div>
            <div className={styles.detail}><span>Address</span><strong>{user?.address || 'Not provided'}</strong></div>
            <div className={styles.detail}><span>Registered</span><strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</strong></div>
          </div>
          <div className={styles.infoNote}>
            To update other information, contact your nearest Rwanda National Police office.
          </div>
        </div>

        {/* License Category Card */}
        <div>
          <div className={styles.licCard} style={{ borderTop: `4px solid ${licenseInfo.color}` }}>
            <div className={styles.licHeader}>
              <div>
                <div className={styles.licLabel}>License Category</div>
                <div className={styles.licCode} style={{ color: licenseInfo.color }}>{cat}</div>
              </div>
              <div className={styles.licIcon}>🪪</div>
            </div>
            <div className={styles.licName}>{licenseInfo.label}</div>
            <div className={styles.licVehicles}>
              <span>Authorised Vehicles</span>
              <p>{licenseInfo.vehicles}</p>
            </div>
          </div>

          {/* All License Types Reference */}
          <div className={styles.card} style={{ marginTop: 16 }}>
            <h3 className={styles.cardTitle}>Rwanda License Categories</h3>
            <div className={styles.licList}>
              {Object.entries(LICENSE_INFO).map(([code, info]) => (
                <div className={`${styles.licItem} ${code === cat ? styles.licItemActive : ''}`} key={code}>
                  <div className={styles.licItemCode} style={{ background: info.color }}>{code}</div>
                  <div className={styles.licItemInfo}>
                    <strong>{info.label}</strong>
                    <span>{info.vehicles}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Road Rules Reminder */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>🇷🇼 Rwanda Road Rules Reminder</h3>
        <div className={styles.rulesGrid}>
          <div className={styles.rule}><span>🚦</span><p>Speed: 40km/h in towns, 60–80km/h on highways</p></div>
          <div className={styles.rule}><span>🍺</span><p>Blood alcohol limit: 0.08%</p></div>
          <div className={styles.rule}><span>📱</span><p>No phone use without hands-free</p></div>
          <div className={styles.rule}><span>🪑</span><p>Seatbelts mandatory for all</p></div>
          <div className={styles.rule}><span>🚗</span><p>Drive on the right side of the road</p></div>
          <div className={styles.rule}><span>🚷</span><p>No overtaking on the left</p></div>
        </div>
      </div>
    </div>
  );
}
