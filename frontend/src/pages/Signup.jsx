import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; //shwo success or error messages 
import { useAuth } from '../context/AuthContext';
import styles from './Signup.module.css';

export default function Signup() {
    const { register, user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        nationalId: '',
        password: '',
        confirm: '',
    });

    React.useEffect(() => {
        if (user) navigate(user.role === 'admin' ? '/admin' : '/driver-dashboard');
    }, [user]);

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const validateStep1 = () => {
        if (!form.name.trim()) return toast.error('Full name is required') || false;
        if (!form.email.trim()) return toast.error('Email is required') || false;
        if (!form.phone.trim()) return toast.error('Phone number is required') || false;
        return true;
    };

    const validateStep2 = () => {
        if (!form.nationalId.trim()) return toast.error('National ID is required') || false;
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters') || false;
        if (form.password !== form.confirm) return toast.error('Passwords do not match') || false;
        return true;
    };

    const handleNext = e => {
        e.preventDefault();
        if (validateStep1()) setStep(2);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateStep2()) return;
        setLoading(true);
        try {
            const u = await register(form);
            toast.success(`Welcome, ${u.name.split(' ')[0]}! Your account is pending verification.`);
            navigate('/driver-dashboard');
        } catch (err) {
            toast.error(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* ── Left panel ── */}
            <div className={styles.left}>
                <div className={styles.leftContent}>
                    <div className={styles.logo}>
                        <span></span>
                        <div>
                            <div className={styles.logoMain}>Rwanda DriveDoc</div>
                            <div className={styles.logoSub}>Driver Document Portal</div>
                        </div>
                    </div>

                    <h2>Join the Digital<br /><span>Road-Legal Network</span></h2>
                    <p>Create your driver profile and get instant access to your complete document portfolio — licences, permits, and expiry countdowns — all verified by RNP.</p>

                    <div className={styles.steps}>
                        <div className={`${styles.stepItem} ${step >= 1 ? styles.active : ''}`}>
                            <div className={styles.stepDot}>1</div>
                            <div>
                                <div className={styles.stepTitle}>Personal Info</div>
                                <div className={styles.stepDesc}>Name, email & phone</div>
                            </div>
                        </div>
                        <div className={styles.stepLine} />
                        <div className={`${styles.stepItem} ${step >= 2 ? styles.active : ''}`}>
                            <div className={styles.stepDot}>2</div>
                            <div>
                                <div className={styles.stepTitle}>Identity & Security</div>
                                <div className={styles.stepDesc}>National ID & password</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right panel ── */}
            <div className={styles.right}>
                <div className={styles.formBox}>
                    <div className={styles.formHeader}>
                        <div className={styles.stepBadge}>Step {step} of 2</div>
                        <h1>{step === 1 ? 'Create Account' : 'Verify Identity'}</h1>
                        <p>{step === 1 ? 'Start with your personal details' : 'Secure your account with a strong password'}</p>
                    </div>

                    {/* ── Step 1 ── */}
                    {step === 1 && (
                        <form onSubmit={handleNext} className={styles.form}>
                            <div className={styles.field}>
                                <label>Full Name</label>
                                <div className={styles.inputWrap}>

                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Bizimana Eric"
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Email Address</label>
                                <div className={styles.inputWrap}>

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="ericbizimana111@gmail.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Phone Number</label>
                                <div className={styles.inputWrap}>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="+250 7XX XXX XXX"
                                        autoComplete="tel"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className={styles.submitBtn}>
                                Continue →
                            </button>
                        </form>
                    )}

                    {/* ── Step 2 ── */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <label>National ID Number</label>
                                <div className={styles.inputWrap}>
                                    <span className={styles.icon}></span>
                                    <input
                                        type="text"
                                        name="nationalId"
                                        value={form.nationalId}
                                        onChange={handleChange}
                                        placeholder="1 XXXX X XXXXXXX X XX"
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.field}>
                                <label>Password</label>
                                <div className={styles.passWrap}>
                                    <span className={styles.icon}></span>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Min. 6 characters"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button type="button" className={styles.passToggle} onClick={() => setShowPass(!showPass)}>
                                        {showPass ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {form.password && (<StrengthBar password={form.password} />)}

                            </div>

                            <div className={styles.field}>
                                <label>Confirm Password</label>
                                <div className={styles.passWrap}>

                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        name="confirm"
                                        value={form.confirm}
                                        onChange={handleChange}
                                        placeholder="Re-enter password"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button type="button" className={styles.passToggle} onClick={() => setShowConfirm(!showConfirm)}>
                                        {showConfirm ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.btnRow}>
                                <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
                                    Back
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className={styles.note}>
                        <p>Your account will be reviewed and activated by an RNP administrator before you can access your documents.</p>
                    </div>

                    <div className={styles.loginLink}>
                        Already have an account?{' '}
                        <button type="button" className={styles.linkBtn} onClick={() => navigate('/login')}>
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Password strength indicator ── */
function StrengthBar({ password }) {
    const checks = [
        password.length >= 6,
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];
    const score = checks.filter(Boolean).length;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#e74c3c', '#e8a020', '#3498db', '#27ae60'];

    return (
        <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i <= score ? colors[score] : 'var(--border)',
                        transition: 'background 0.3s',
                    }} />
                ))}
            </div>
            {score > 0 && (
                <span style={{ fontSize: '0.75rem', color: colors[score], marginTop: 3, display: 'block' }}>
                    {labels[score]}
                </span>
            )}
        </div>
    );
}