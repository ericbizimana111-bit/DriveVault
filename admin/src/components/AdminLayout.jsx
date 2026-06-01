import { useCallback, useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Car,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  Files,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ShieldCheck,
  UserPlus,
  UsersRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/apiClient';
import styles from './AdminLayout.module.css';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/drivers', icon: UsersRound, label: 'Drivers' },
  { to: '/admin/documents', icon: Files, label: 'Documents' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Communication' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications', badge: true }
];

export default function AdminLayout() {
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
    navigate('/admin/login');
  };

  return (
    <div className={styles.wrapper}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <Car className={styles.logoIcon} size={22} />
            {!collapsed && (
              <div>
                <div className={styles.logoMain}>Rwanda DriveDoc</div>
                <div className={styles.logoSub}>Admin Panel</div>
              </div>
            )}
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
            <div>
              <p className={styles.profileName}>{user?.name}</p>
              <p className={styles.profileRole}>Administrator</p>
            </div>
          </div>
        )}

        <nav className={styles.nav}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.iconWrap}>
                  <Icon className={styles.navIcon} size={18} />
                  {item.badge && unreadCount > 0 && <span className={styles.navBadge}>{unreadCount}</span>}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarBottom}>
          {!collapsed && (
            <div className={styles.quickLinks}>
              <NavLink to="/admin/drivers/add" className={styles.quickBtn}>
                <UserPlus size={15} />
                <span>Add Driver</span>
              </NavLink>
              <NavLink to="/admin/documents/add" className={styles.quickBtn}>
                <FilePlus size={15} />
                <span>Add Document</span>
              </NavLink>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className={styles.content}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.adminTag}>
              <ShieldCheck size={14} />
              <span>Admin</span>
            </span>
            <span className={styles.topbarTitle}>Rwanda DriveDoc Management System</span>
          </div>
          <div className={styles.topbarRight}>
            <button className={styles.topbarBtn} onClick={() => navigate('/admin/messages')}>
              <MessageSquare size={16} />
              <span>Chat</span>
            </button>
            <button className={styles.topbarBtn} onClick={() => navigate('/admin/notifications')}>
              <Bell size={16} />
              <span>Notifications</span>
              {unreadCount > 0 && <span className={styles.topbarBadge}>{unreadCount}</span>}
            </button>
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
