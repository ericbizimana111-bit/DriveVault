import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { AlertTriangle, Bell, CheckCheck, FileCheck, MessageSquare } from 'lucide-react';
import { apiFetch } from '../utils/apiClient';
import styles from './Notifications.module.css';

const formatTime = value => {
  if (!value) return '';
  return format(new Date(value), 'dd MMM yyyy, HH:mm');
};

const iconForNotification = type => {
  if (type === 'message' || type === 'admin_reply') return MessageSquare;
  if (type === 'document_verified') return FileCheck;
  if (type === 'document_expiry') return AlertTriangle;
  return Bell;
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiFetch('/notifications');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      if (!silent) toast.error(error.message || 'Failed to load notifications');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(() => fetchNotifications({ silent: true }), 10000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      const res = await apiFetch('/notifications/read-all', { method: 'PATCH', body: JSON.stringify({}) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to mark notifications read');
      await fetchNotifications({ silent: true });
    } catch (error) {
      toast.error(error.message || 'Failed to update notifications');
    }
  };

  const openNotification = async notification => {
    if (!notification.isRead) {
      await apiFetch(`/notifications/${notification._id || notification.id}/read`, { method: 'PATCH' }).catch(() => null);
    }
    if (notification.relatedType === 'message') {
      navigate('/messages');
      return;
    }
    if (notification.actionUrl && !notification.actionUrl.startsWith('/admin')) {
      navigate(notification.actionUrl);
    }
    fetchNotifications({ silent: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>
            <Bell size={24} />
            <span>Notification Center</span>
            {unreadCount > 0 && <span className={styles.headerBadge}>{unreadCount}</span>}
          </h1>
          <p>{unreadCount} unread notification(s)</p>
        </div>
        <button className={styles.readBtn} onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck size={16} />
          Mark All Read
        </button>
      </div>

      {loading ? (
        <div className={styles.state}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className={styles.state}>No notifications yet.</div>
      ) : (
        <div className={styles.list}>
          {notifications.map(notification => {
            const Icon = iconForNotification(notification.type);
            return (
              <button
                type="button"
                key={notification._id || notification.id}
                className={`${styles.item} ${notification.isRead ? '' : styles.unread}`}
                onClick={() => openNotification(notification)}
              >
                <span className={styles.itemIcon}>
                  <Icon size={20} />
                </span>
                <div className={styles.itemBody}>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                </div>
                <small>{formatTime(notification.createdAt)}</small>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
