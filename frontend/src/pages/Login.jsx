import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';


export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/driver-dashboard');
  }, [user]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please enter email and password');
    setLoading(true);
    try {
      const u = await login(form.email, form.password);

      toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);

      if (u.role === 'admin') {
        navigate('/admin');
      } else if (u.role === 'user') {
        navigate('/driver-dashboard');
      } else {
        navigate('/');
      }


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
          <div className={styles.logo} onClick={() => navigate('/')}>
            <span></span>
            <div>
              <div className={styles.logoMain}>Rwanda DriveDoc</div>
              <div className={styles.logoSub}>Driver Document Portal</div>
            </div>
          </div>
          <h2>Your Driving Documents,<br /><span>Secure & Digital</span></h2>
          <p>Access your complete driving document portfolio. Check expiry dates, view payment codes, and stay road-legal in Rwanda.</p>
          <div className={styles.features}>
            <div className={styles.feature}><span>✓</span> All documents in one place</div>
            <div className={styles.feature}><span>✓</span> Real-time expiry countdowns</div>
            <div className={styles.feature}><span>✓</span> Secure, admin-verified access</div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.formBox}>
          <div className={styles.formHeader}>
            <h1>Sign In</h1>
            <p>Enter your credentials provided by the administrator</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.passWrap}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button type="button" className={styles.passToggle} onClick={() => setShowPass(!showPass)}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading} >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className={styles.note}>
            <p>Accounts are created by Rwanda National Police administrators only. If you don't have an account, contact your nearest RNP office.</p>
          </div>
          <p className={styles.signup}>Dont have an account? <span onClick={() => navigate('/signup')}>Sign Up </span></p>

        </div>
      </div>
    </div>
  );
}
