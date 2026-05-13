import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './PublicLayout.module.css';


export default function PublicLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const hideLayout =
    location.pathname === '/login' ||
    location.pathname === '/signup';

  return (
    <div className={styles.wrapper}>

      {/* HEADER */}
      {!hideLayout && (
        <header className={styles.header}>
          <div className={styles.headerInner}>

            {/* LOGO */}
            <div className={styles.logo} onClick={() => navigate('/')}>
              <div className={styles.logoIcon}>🚗</div>
              <div className={styles.logoText}>
                <span className={styles.logoMain}>Rwanda</span>
                <span className={styles.logoSub}>DriveDoc</span>
              </div>
            </div>

            {/* NAV */}
            <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
              <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
              <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
              <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
            </nav>

            {/* AUTH BUTTONS */}
            <div className={styles.actions}>

              {!user ? (
                <>
                  <button
                    className={styles.loginBtn}
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>


                  <button
                    className={styles.logoutBtn}
                    onClick={handleLogout}
                    
                  >
                    Logout
                  </button>
                </>
              )}

            </div>

            {/* MOBILE MENU */}
            <button
              className={styles.burger}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
              <span />
            </button>

          </div>
        </header>
      )}

      {/* MAIN */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* FOOTER */}
      {!hideLayout && (
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div
              className={styles.footerLogo}
              onClick={() => navigate('/')}
            >
              🚗 Rwanda DriveDoc
            </div>

            <p>
              A service powered by Rwanda National Police & Transport Authority
            </p>

            <p className={styles.footerCopy}>
              © {new Date().getFullYear()} Rwanda DriveDoc
            </p>
          </div>
        </footer>
      )}

    </div>
  );
}