import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import styles from './AdminAddDriver.module.css';

const LICENSE_CATEGORIES = ['A', 'A1', 'B', 'B1', 'B2', 'C', 'D'];
const getId = item => item?.id || item?._id;

export default function AdminEditDriver() {
    const { id } = useParams();
    const { drivers, fetchDrivers, updateDriver } = useData();
    const { API_BASE } = useAuth();
    const navigate = useNavigate();
    const photoRef = useRef();

    const [form, setForm] = useState({
        name: '', email: '', phone: '', nationalId: '',
        licenseCategory: 'B', dateOfBirth: '', address: ''
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadDriver = async () => {
            setLoading(true);
            try {
                const fetched = await fetchDrivers();
                const driver = fetched.find(d => getId(d) === id);
                if (driver) {
                    setForm({
                        name: driver.name || '', email: driver.email || '',
                        phone: driver.phone || '', nationalId: driver.nationalId || '',
                        licenseCategory: driver.licenseCategory || 'B',
                        dateOfBirth: driver.dateOfBirth || '', address: driver.address || ''
                    });
                    if (driver.photo) setPhotoPreview(`${API_BASE}${driver.photo}`);
                }
            } catch (e) {
                console.error('Failed to load driver:', e);
            } finally {
                setLoading(false);
            }
        };
        loadDriver();
    }, [id, API_BASE, fetchDrivers]);

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePhoto = e => {
        const file = e.target.files[0];
        if (!file) return;
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.name || !form.email) return toast.error('Name and email are required');
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (photo) formData.append('photo', photo);
            await updateDriver(id, formData);
            toast.success('Driver updated successfully!');
            navigate('/admin/drivers');
        } catch (err) {
            toast.error(err.message || 'Failed to update driver');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={styles.page}><div className={styles.loading}>Loading driver...</div></div>;

    const driver = drivers.find(d => getId(d) === id);
    if (!driver) return <div className={styles.page}><div className={styles.empty}>Driver not found</div></div>;

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <button className={styles.backBtn} onClick={() => navigate('/admin/drivers')}>Back</button>
                    <h1>Edit Driver</h1>
                    <p>Update driver information and license details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                <div className={styles.leftCol}>
                    <div className={styles.photoCard}>
                        <h3>Driver Photo</h3>
                        <div className={styles.photoWrap} onClick={() => photoRef.current.click()}>
                            {photoPreview
                                ? <img src={photoPreview} alt="preview" className={styles.photoPreview} />
                                : <div className={styles.photoPlaceholder}><p>Click to upload photo</p></div>
                            }
                        </div>
                        <input type="file" accept="image/*" ref={photoRef} onChange={handlePhoto} style={{ display: 'none' }} />
                        <button type="button" className={styles.photoBtn} onClick={() => photoRef.current.click()}>
                            {photoPreview ? 'Change Photo' : 'Upload Photo'}
                        </button>
                    </div>
                </div>

                <div className={styles.formFields}>
                    <div className={styles.section}>
                        <h3>Basic Information</h3>
                        <div className={styles.field}>
                            <label>Full Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} placeholder="Driver full name" required />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label>Email Address *</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="driver@example.com" required />
                            </div>
                            <div className={styles.field}>
                                <label>Phone Number</label>
                                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+250..." />
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3>License Details</h3>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label>National ID</label>
                                <input name="nationalId" value={form.nationalId} onChange={handleChange} placeholder="e.g., 12345678901" />
                            </div>
                            <div className={styles.field}>
                                <label>License Category</label>
                                <select name="licenseCategory" value={form.licenseCategory} onChange={handleChange}>
                                    {LICENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label>Date of Birth</label>
                            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                        </div>
                        <div className={styles.field}>
                            <label>Address</label>
                            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Street address, city, district" rows="3" />
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" className={styles.cancelBtn} onClick={() => navigate('/admin/drivers')}>Cancel</button>
                        <button type="submit" className={styles.submitBtn} disabled={submitting}>
                            {submitting ? 'Updating...' : 'Update Driver'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
