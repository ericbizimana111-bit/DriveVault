import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import styles from './AdminAddDocument.module.css';

const DOC_TYPES = [
  'Driving License', 'Vehicle Registration (Carte Jaune)', 'Vehicle Insurance',
  'Motor Vehicle Inspection Certificate', 'National ID',
  'International Driving Permit', 'Rental Agreement'
];

const getId = item => item?.id || item?._id;
const makePaymentCode = () => `RWD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export default function AdminAddDocument() {
  const { drivers, fetchDrivers, addDocument } = useData();
  const { API_BASE } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const photoRef = useRef();

  const prefillDriverId = searchParams.get('driverId') || '';
  const prefillDriverName = searchParams.get('driverName') || '';

  const [form, setForm] = useState(() => ({
    driverId: prefillDriverId,
    documentType: 'Driving License',
    documentNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    issuedBy: 'Rwanda National Police',
    paymentCode: makePaymentCode()
  }));
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const regenerateCode = () => setForm(prev => ({
    ...prev, paymentCode: `RWD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.driverId) return toast.error('Please select a driver');
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (photo) formData.append('documentPhoto', photo);
      await addDocument(formData);
      toast.success('Document added successfully!');
      navigate('/admin/documents');
    } catch (err) {
      toast.error(err.message || 'Failed to add document');
    } finally {
      setLoading(false);
    }
  };

  const selectedDriver = drivers.find(d => getId(d) === form.driverId);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/admin/documents')}>Back</button>
          <h1>Add Document</h1>
          <p>Attach a document to a registered driver's profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        <div className={styles.leftCol}>
          <div className={styles.photoCard}>
            <h3>Document Photo</h3>
            <div className={styles.photoWrap} onClick={() => photoRef.current.click()}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" className={styles.photoPreview} />
                : <div className={styles.photoPlaceholder}><p>Click to upload document image</p></div>
              }
            </div>
            <input type="file" accept="image/*" ref={photoRef} onChange={handlePhoto} style={{ display: 'none' }} />
            <button type="button" className={styles.photoBtn} onClick={() => photoRef.current.click()}>
              {photoPreview ? 'Change Photo' : 'Upload Document Photo'}
            </button>
            {photoPreview && (
              <button type="button" className={styles.removeBtn} onClick={() => { setPhoto(null); setPhotoPreview(null); }}>Remove</button>
            )}
          </div>

          {(selectedDriver || prefillDriverName) && (
            <div className={styles.driverPreview}>
              <div className={styles.driverPreviewAvatar}>
                {selectedDriver?.photo
                  ? <img src={`${API_BASE}${selectedDriver.photo}`} alt={selectedDriver?.name} />
                  : <span>{(selectedDriver?.name || prefillDriverName)?.charAt(0)?.toUpperCase()}</span>
                }
              </div>
              <div>
                <strong>{selectedDriver?.name || prefillDriverName}</strong>
                {selectedDriver?.email && <span>{selectedDriver.email}</span>}
                {selectedDriver && <span className={styles.catTag}>{selectedDriver.licenseCategory || 'B'}</span>}
              </div>
            </div>
          )}
        </div>

        <div className={styles.formFields}>
          <div className={styles.section}>
            <h3>Select Driver *</h3>
            {prefillDriverId ? (
              <div className={styles.prefillNote}>
                Driver: <strong>{prefillDriverName}</strong>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, driverId: '' }))}>Change</button>
              </div>
            ) : (
              <div className={styles.field}>
                <label>Driver</label>
                <select name="driverId" value={form.driverId} onChange={handleChange} required>
                  <option value="">— Select a driver —</option>
                  {drivers.map(d => (
                    <option key={getId(d)} value={getId(d)}>{d.name} ({d.email})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h3>Document Details</h3>
            <div className={styles.field}>
              <label>Document Type *</label>
              <select name="documentType" value={form.documentType} onChange={handleChange} required>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Document Number</label>
                <input name="documentNumber" value={form.documentNumber} onChange={handleChange} placeholder="Auto-generated if empty" />
              </div>
              <div className={styles.field}>
                <label>Issued By</label>
                <input name="issuedBy" value={form.issuedBy} onChange={handleChange} placeholder="Rwanda National Police" />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Issue Date *</label>
                <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <label>Expiry Date</label>
                <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
                <small className={styles.hint}>Leave blank for documents with no expiry</small>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Payment Code</h3>
            <div className={styles.field}>
              <label>Payment Code for Renewal</label>
              <div className={styles.codeRow}>
                <input name="paymentCode" value={form.paymentCode} onChange={handleChange} className={styles.codeInput} placeholder="RWD-XXXXXX" />
                <button type="button" className={styles.regenBtn} onClick={regenerateCode}>Generate</button>
              </div>
              <small className={styles.hint}>Used by the driver to pay for document renewal at authorized payment points.</small>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/admin/documents')}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Adding Document...' : 'Add Document'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}