import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { apiFetch } from '../utils/apiClient';
import styles from './AdminDocuments.module.css';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [reply, setReply] = useState('');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/messages');
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.message || 'Failed to fetch messages');
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const submitReply = async (id) => {
    if (!reply.trim()) {
      toast.error('Reply text is required');
      return;
    }

    try {
      const res = await apiFetch(`/messages/${id}/reply`, {
        method: 'PUT',
        body: JSON.stringify({ reply })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to send reply');
      toast.success('Reply saved and notification sent');
      setReplyingId(null);
      setReply('');
      fetchMessages();
    } catch (error) {
      toast.error(error.message || 'Failed to send reply');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Support Messages</h1>
          <p>{messages.length} message(s) from drivers and visitors</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className={styles.empty}>
          <p>No support messages yet.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sender</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th>Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(message => (
                <tr key={message.id || message._id}>
                  <td>
                    <strong>{message.name || 'Guest'}</strong>
                    <br />
                    <span>{message.email}</span>
                  </td>
                  <td>{message.subject}</td>
                  <td>{message.message}</td>
                  <td>{message.status}</td>
                  <td>{message.createdAt ? format(new Date(message.createdAt), 'dd MMM yyyy') : '-'}</td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => {
                        setReplyingId(message.id || message._id);
                        setReply(message.adminReply || '');
                      }}
                    >
                      Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {replyingId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Reply to Message</h3>
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={6}
              style={{ width: '100%', resize: 'vertical' }}
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setReplyingId(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => submitReply(replyingId)}>Send Reply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
