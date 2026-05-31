import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Car, Mail, KeyRound, RefreshCw } from 'lucide-react';
import styles from './Signup.module.css';

export default function VerifyEmail() {
    const { pendingVerification, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState(pendingVerification?.email || '');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (!email && pendingVerification?.email) {
            setEmail(pendingVerification.email);
        }
    }, [pendingVerification, email]);

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email || !otp.trim()) return toast.error('Please enter your email and verification code');
        if (otp.trim().length < 4) return toast.error('Please enter a valid verification code');

        setLoading(true);
        try {
            await verifyOtp(email, otp.trim());
            toast.success('Email verified! Redirecting to your dashboard…');
            navigate('/driver-dashboard');
        } catch (err) {
            toast.error(err.message || 'Verification failed. Please check your code and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return toast.error('Please enter your email address first');
        if (cooldown > 0) return;
        setResendLoading(true);
        try {
            await resendOtp(email);
            toast.success('A new verification code has been sent to your email.');
            setCooldown(60);
        } catch (err) {
            toast.error(err.message || 'Failed to resend code. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* ── Left panel ── */}
            <div className={styles.left}>
                <div className={styles.leftContent}>
                    <div className={styles.logo} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <Car size={28} className={styles.logoIcon} />
                        <div>
                            <div className={styles.logoMain}>Rwanda DriveDoc</div>
                            <div className={styles.logoSub}>Driver Document Portal</div>
                        </div>
                    </div>

                    <h2>Almost There —<br /><span>Verify Your Email</span></h2>
                    <p>
                        We sent a one-time code to your email address. Enter it on the right to activate your driver profile and gain access to your document dashboard.
                    </p>

                    <div className={styles.verifyIllustration}>
                        <div className={styles.verifyIconRing}>
                            <Mail size={32} strokeWidth={1.5} />
                        </div>
                        <div className={styles.verifySteps}>
                            <div className={styles.verifyStep}>
                                <div className={styles.verifyStepDot}>✓</div>
                                <span>Account created</span>
                            </div>
                            <div className={styles.verifyStepLine} />
                            <div className={`${styles.verifyStep} ${styles.verifyStepActive}`}>
                                <div className={`${styles.verifyStepDot} ${styles.verifyStepDotActive}`}>2</div>
                                <span>Email verification</span>
                            </div>
                            <div className={styles.verifyStepLine} />
                            <div className={styles.verifyStep}>
                                <div className={styles.verifyStepDot}>3</div>
                                <span>Admin activation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right panel ── */}
            <div className={styles.right}>
                <div className={styles.formBox}>
                    <div className={styles.formHeader}>
                        <div className={styles.stepBadge}>Step 3 of 3</div>
                        <h1>Check Your Inbox</h1>
                        <p>
                            Enter the 6-digit code we sent to{' '}
                            {email ? <strong style={{ color: 'var(--primary)' }}>{email}</strong> : 'your email address'}.
                            {' '}The code expires in <strong>5 minutes</strong>.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {/* Email — shown only if not pre-filled */}
                        {!pendingVerification?.email && (
                            <div className={styles.field}>
                                <label>Email Address</label>
                                <div className={styles.inputWrap}>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.field}>
                            <label>Verification Code</label>
                            <div className={styles.otpWrap}>
                                <KeyRound size={15} className={styles.otpIcon} />
                                <input
                                    className={styles.otpInput}
                                    type="text"
                                    name="otp"
                                    value={otp}
                                    onChange={(e) => {
                                        // Only allow digits/alphanumeric, max 8 chars
                                        const val = e.target.value.replace(/\s/g, '').slice(0, 8);
                                        setOtp(val);
                                    }}
                                    placeholder="e.g. 482916"
                                    autoComplete="one-time-code"
                                    inputMode="numeric"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? (
                                <span className={styles.btnLoading}>
                                    <span className={styles.spinner} /> Verifying…
                                </span>
                            ) : (
                                'Verify & Continue →'
                            )}
                        </button>
                    </form>

                    {/* Resend row — outside the form */}
                    <div className={styles.resendRow}>
                        <span>Didn't receive the code?</span>
                        <button
                            type="button"
                            className={styles.resendBtn}
                            onClick={handleResend}
                            disabled={resendLoading || cooldown > 0}
                        >
                            {resendLoading ? (
                                <>
                                    <RefreshCw size={13} className={styles.spinIcon} /> Sending…
                                </>
                            ) : cooldown > 0 ? (
                                `Resend in ${cooldown}s`
                            ) : (
                                <>
                                    <RefreshCw size={13} /> Resend Code
                                </>
                            )}
                        </button>
                    </div>

                    <div className={styles.note}>
                        <p>
                            Can't find the email? Check your <strong>spam or junk folder</strong>. After verifying,
                            your account will be reviewed by an RNP administrator before full access is granted.
                        </p>
                    </div>

                    <div className={styles.loginLink}>
                        Wrong account?{' '}
                        <button type="button" className={styles.linkBtn} onClick={() => navigate('/login')}>
                            Sign In instead
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}