
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import styles from './AdminLogin.module.css';

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.email || !form.password) return toast.error('Please enter email and password');
        setLoading(true);
        try {
            const u = await login(form.email, form.password);
            toast.success(`Welcome Admin, ${u.name.split(' ')[0]}!`);
            navigate('/admin');
        } catch (err) {
            toast.error(err.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.left}>
                <div className={styles.leftContent}>
                    <div className={styles.logo}>
                        <span></span>
                        <div>
                            <div className={styles.logoMain}>Rwanda DriveDoc</div>
                            <div className={styles.logoSub}>Admin Panel</div>
                        </div>
                    </div>
                    <h2>Administrator<br /><span>Access Portal</span></h2>
                    <p>Secure access for administrators. Manage drivers, documents, and system operations.</p>
                    <div className={styles.features}>
                        <div className={styles.feature}><span>✓</span> Manage all drivers</div>
                        <div className={styles.feature}><span>✓</span> Upload documents</div>
                        <div className={styles.feature}><span>✓</span> Track compliance</div>
                    </div>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.formBox}>
                    <div className={styles.formHeader}>
                        <h1>Admin Sign In</h1>
                        <p>Enter your administrator credentials</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="admin@rwandadrive.rw"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Password</label>
                            <div className={styles.passWrap}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className={styles.passToggle}
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    {showPass ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className={styles.info}>
                        <p className={styles.infoText}>For admin account access, please contact system administrator.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}