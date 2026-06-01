import { useCallback, useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/apiClient';
import styles from './DriverLayout.module.css';

export default function DriverLayout() {
  const { user, logout, API_BASE } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch('/notifications');
      const data = await res.json().catch(() => ({}));
      if (res.ok) setUnreadCount(data.unreadCount || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(timer);
  }, [fetchUnreadCount]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.wrapper}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            {!collapsed && <span className={styles.logoText}>Rwanda DriveDoc</span>}
          </div>
          <button className={styles.toggle} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {!collapsed && (
          <div className={styles.profile}>
            <div className={styles.avatar}>
              {user?.photo
                ? <img src={`${API_BASE}${user.photo}`} alt="avatar" />
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
            <LayoutDashboard className={styles.navIcon} size={18} />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/my-documents" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <FileText className={styles.navIcon} size={18} />
            {!collapsed && <span>My Documents</span>}
          </NavLink>
          <NavLink to="/messages" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <MessageSquare className={styles.navIcon} size={18} />
            {!collapsed && <span>Communication</span>}
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <span className={styles.iconWrap}>
              <Bell className={styles.navIcon} size={18} />
              {unreadCount > 0 && <span className={styles.navBadge}>{unreadCount}</span>}
            </span>
            {!collapsed && <span>Notifications</span>}
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <UserRound className={styles.navIcon} size={18} />
            {!collapsed && <span>My Profile</span>}
          </NavLink>
        </nav>

        <div className={styles.sidebarBottom}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <h2 className={styles.pageTitle}>Driver Portal</h2>
          <div className={styles.topbarRight}>
            <button className={styles.topbarBtn} onClick={() => navigate('/messages')}>
              <MessageSquare size={16} />
              <span>Chat</span>
            </button>
            <button className={styles.topbarBtn} onClick={() => navigate('/notifications')}>
              <Bell size={16} />
              <span>Notifications</span>
              {unreadCount > 0 && <span className={styles.topbarBadge}>{unreadCount}</span>}
            </button>
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
