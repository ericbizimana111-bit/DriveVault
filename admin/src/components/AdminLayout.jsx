import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AdminLayout.module.css';

const navItems = [
  { to: '/admin', icon: '', label: 'Dashboard', end: true },
  { to: '/admin/drivers', icon: '', label: 'Drivers' },
  { to: '/admin/documents', icon: '', label: 'Documents' },
];]

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className={styles.wrapper}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}></span>
            {!collapsed && (
              <div>
                <div className={styles.logoMain}>Rwanda DriveDoc</div>
                <div className={styles.logoSub}>Admin Panel</div>
              </div>
            )}
          </div>
          <button className={styles.toggle} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '>' : '<'}
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
            <div>
              <p className={styles.profileName}>{user?.name}</p>
              <p className={styles.profileRole}>Administrator</p>
            </div>
          </div>
        )}

        <nav className={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          {!collapsed && (
            <div className={styles.quickLinks}>
              <NavLink to="/admin/drivers/add" className={styles.quickBtn}>+ Add Driver</NavLink>
              <NavLink to="/admin/documents/add" className={styles.quickBtn}>+ Add Document</NavLink>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span></span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.adminTag}>Admin</span>
            <span className={styles.topbarTitle}>Rwanda DriveDoc Management System</span>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.topbarUser}>User {user?.name}</span>
          </div>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
