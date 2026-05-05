import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useData } from '../context/DataContext';
import styles from './AdminAddDriver.module.css';

const LICENSE_CATEGORIES = ['A', 'A1', 'B', 'B1', 'B2', 'C', 'D', 'E', 'F'];

export default function AdminAddDriver() {
  const { addDriver } = useData();
  const navigate = useNavigate();
  const photoRef = useRef();

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    nationalId: '', licenseCategory: 'B',
    dateOfBirth: '', address: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.error('Name, email and password are required');
    }
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (photo) formData.append('photo', photo);
      await addDriver(formData);
      toast.success(`Driver "${form.name}" added successfully`);
      navigate('/admin/drivers');
    } catch (err) {
      toast.error(err.message || 'Failed to add driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/admin/drivers')}>← Back</button>
          <h1>Add New Driver</h1>
          <p>Register a new driver and create their account in the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        {/* Left: Photo */}
        <div className={styles.photoSection}>
          <div className={styles.photoCard}>
            <div className={styles.photoWrap} onClick={() => photoRef.current.click()}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" className={styles.photoPreview} />
                : (
                  <div className={styles.photoPlaceholder}>
                    <span>📷</span>
                    <p>Click to upload driver photo</p>
                    <small>JPG, PNG up to 5MB</small>
                  </div>
                )
              }
            </div>
            <input
              type="file"
              accept="image/*"
              ref={photoRef}
              onChange={handlePhoto}
              style={{ display: 'none' }}
            />
            <button type="button" className={styles.photoBtn} onClick={() => photoRef.current.click()}>
              {photoPreview ? '📷 Change Photo' : '📷 Upload Photo'}
            </button>
            {photoPreview && (
              <button type="button" className={styles.removePhotoBtn} onClick={() => { setPhoto(null); setPhotoPreview(null); }}>
                Remove Photo
              </button>
            )}
          </div>

          <div className={styles.infoBox}>
            <h4>👤 Account Note</h4>
            <p>Once added, the driver will use their email and password to log in. Only admins can create or delete accounts.</p>
          </div>
        </div>

        {/* Right: Form */}
        <div className={styles.formFields}>
          <div className={styles.section}>
            <h3>Personal Information</h3>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Jean Pierre Habimana" required />
              </div>
              <div className={styles.field}>
                <label>National ID</label>
                <input name="nationalId" value={form.nationalId} onChange={handleChange} placeholder="1198780012345678" />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+250 7XX XXX XXX" />
              </div>
              <div className={styles.field}>
                <label>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
              </div>
            </div>
            <div className={styles.field}>
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="e.g. KG 15 Ave, Kigali" />
            </div>
          </div>

          <div className={styles.section}>
            <h3>License Information</h3>
            <div className={styles.field}>
              <label>License Category *</label>
              <select name="licenseCategory" value={form.licenseCategory} onChange={handleChange}>
                {LICENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <small className={styles.hint}>B = Standard vehicle (default). A = Motorcycle. C = Heavy goods. D = Bus.</small>
            </div>
          </div>

          <div className={styles.section}>
            <h3>Login Credentials</h3>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Email Address *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="driver@example.com" required />
              </div>
              <div className={styles.field}>
                <label>Password *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required minLength={6} />
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/admin/drivers')}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Adding Driver...' : '✓ Add Driver'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
