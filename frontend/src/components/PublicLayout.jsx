import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './PublicLayout.module.css';

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo} onClick={() => navigate('/')}>
            <div className={styles.logoIcon}>🚗</div>
            <div className={styles.logoText}>
              <span className={styles.logoMain}>Rwanda</span>
              <span className={styles.logoSub}>DriveDoc</span>
            </div>
          </div>

          <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
            <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? styles.active : ''} onClick={() => setMenuOpen(false)}>Contact</NavLink>
          </nav>

          <div className={styles.actions}>
            {user ? (
              <>
                <button className={styles.dashBtn} onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}>
                  {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                </button>
                <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <button className={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
            )}
          </div>

          <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <div className={styles.logoIcon}>🚗</div>
            <span>Rwanda DriveDoc</span>
          </div>
          <p>A service powered by Rwanda National Police & Transport Authority</p>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} Rwanda DriveDoc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
