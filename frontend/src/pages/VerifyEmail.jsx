import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import styles from './Signup.module.css';

export default function VerifyEmail() {
    const { pendingVerification, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState(pendingVerification?.email || '');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (!email && pendingVerification?.email) {
            setEmail(pendingVerification.email);
        }
    }, [pendingVerification, email]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!email || !otp.trim()) return toast.error('Please enter your email and OTP code');

        setLoading(true);
        try {
            await verifyOtp(email, otp.trim());
            toast.success('Your email is verified. Redirecting to your dashboard.');
            navigate('/driver-dashboard');
        } catch (err) {
            toast.error(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return toast.error('Please enter your email first');
        setResendLoading(true);
        try {
            await resendOtp(email);
            toast.success('A new OTP has been sent to your email.');
        } catch (err) {
            toast.error(err.message || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.left}>
                <div className={styles.leftContent}>
                    <div className={styles.logo} onClick={() => navigate('/')}>
                        <span></span>
                        <div>
                            <div className={styles.logoMain}>Rwanda DriveDoc</div>
                            <div className={styles.logoSub}>Driver Document Portal</div>
                        </div>
                    </div>
                    <h2>Verify Your Email<br /><span>Secure Your Driver Profile</span></h2>
                    <p>Enter the one-time code sent to your email. This code expires in 5 minutes and protects your account.</p>
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.formBox}>
                    <div className={styles.formHeader}>
                        <h1>Email Verification</h1>
                        <p>Complete verification before accessing your dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.field}>
                            <label>Email Address</label>
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

                        <div className={styles.field}>
                            <label>Verification Code</label>
                            <input
                                type="text"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP code"
                                autoComplete="one-time-code"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>

                        <button type="button" className={styles.backBtn} onClick={handleResend} disabled={resendLoading}>
                            {resendLoading ? 'Resending...' : 'Resend Code'}
                        </button>
                    </form>

                    <div className={styles.note}>
                        <p>If you do not receive the email, check your spam folder or request a new code.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
