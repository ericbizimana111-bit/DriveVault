import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './DriverLayout.module.css';

export default function DriverLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={styles.wrapper}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🚗</span>
            {!collapsed && <span className={styles.logoText}>Rwanda DriveDoc</span>}
          </div>
          <button className={styles.toggle} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {!collapsed && (
          <div className={styles.profile}>
            <div className={styles.avatar}>
              {user?.photo
                ? <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.photo}`} alt="avatar" />
                : <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
              }
            </div>
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user?.name}</p>
              <p className={styles.profileRole}>Driver</p>
            </div>
          </div>
        )}

        <nav className={styles.nav}>
          <NavLink to="/driver-dashboard" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <span className={styles.navIcon}>📊</span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/my-documents" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <span className={styles.navIcon}>📄</span>
            {!collapsed && <span>My Documents</span>}
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <span className={styles.navIcon}>👤</span>
            {!collapsed && <span>My Profile</span>}
          </NavLink>
        </nav>

        <div className={styles.sidebarBottom}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <h2 className={styles.pageTitle}>Driver Portal</h2>
          <div className={styles.topbarRight}>
            <span className={styles.greeting}>Welcome, {user?.name?.split(' ')[0]}</span>
          </div>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
