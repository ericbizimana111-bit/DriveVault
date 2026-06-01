import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { apiFetch } from '../utils/apiClient';
import styles from './AdminMessages.module.css';

const formatTime = value => {
  if (!value) return '';
  return format(new Date(value), 'dd MMM yyyy, HH:mm');
};

export default function AdminMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find(item => item.conversationId === selectedId),
    [conversations, selectedId]
  );

  const fetchConversations = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoadingConversations(true);
    try {
      const res = await apiFetch('/messages/conversations');
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.message || 'Failed to fetch conversations');
      const list = Array.isArray(data) ? data : [];
      setConversations(list);
      setSelectedId(current => current || list[0]?.conversationId || null);
    } catch (error) {
      if (!silent) toast.error(error.message || 'Failed to load conversations');
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId, { silent = false } = {}) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    if (!silent) setLoadingMessages(true);
    try {
      const res = await apiFetch(`/messages/conversations/${encodeURIComponent(conversationId)}`);
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.message || 'Failed to fetch conversation');
      setMessages(Array.isArray(data) ? data : []);
      fetchConversations({ silent: true });
    } catch (error) {
      if (!silent) toast.error(error.message || 'Failed to load conversation');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
    const timer = setInterval(() => fetchConversations({ silent: true }), 8000);
    return () => clearInterval(timer);
  }, [fetchConversations]);

  useEffect(() => {
    fetchMessages(selectedId);
    if (!selectedId) return undefined;
    const timer = setInterval(() => fetchMessages(selectedId, { silent: true }), 5000);
    return () => clearInterval(timer);
  }, [selectedId, fetchMessages]);

  const submitReply = async event => {
    event.preventDefault();
    if (!selectedId || !reply.trim()) {
      toast.error('Reply text is required');
      return;
    }

    setSending(true);
    try {
      const res = await apiFetch(`/messages/conversations/${encodeURIComponent(selectedId)}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: reply })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to send reply');
      setReply('');
      await fetchMessages(selectedId, { silent: true });
      toast.success('Reply sent');
    } catch (error) {
      toast.error(error.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Messages</h1>
          <p>{conversations.length} active conversation(s)</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => fetchConversations()}>
          Refresh
        </button>
      </div>

      <div className={styles.chatShell}>
        <aside className={styles.conversationList}>
          {loadingConversations ? (
            <div className={styles.stateText}>Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className={styles.stateText}>No driver messages yet.</div>
          ) : conversations.map(conversation => (
            <button
              type="button"
              key={conversation.conversationId}
              className={`${styles.conversationItem} ${selectedId === conversation.conversationId ? styles.active : ''}`}
              onClick={() => setSelectedId(conversation.conversationId)}
            >
              <div className={styles.conversationTop}>
                <strong>{conversation.participantName || 'Driver'}</strong>
                {conversation.unreadCount > 0 && <span>{conversation.unreadCount}</span>}
              </div>
              <p>{conversation.lastMessage}</p>
              <small>{formatTime(conversation.lastMessageAt)}</small>
            </button>
          ))}
        </aside>

        <section className={styles.chatPanel}>
          {!selectedId ? (
            <div className={styles.emptyChat}>Select a conversation to reply.</div>
          ) : (
            <>
              <div className={styles.chatHeader}>
                <div>
                  <h2>{selectedConversation?.participantName || 'Driver'}</h2>
                  <p>{selectedConversation?.participantEmail || selectedConversation?.subject || 'Support conversation'}</p>
                </div>
                {selectedConversation?.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{selectedConversation.unreadCount} unread</span>
                )}
              </div>

              <div className={styles.messages}>
                {loadingMessages ? (
                  <div className={styles.stateText}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className={styles.stateText}>No messages in this conversation.</div>
                ) : messages.map(message => {
                  const mine = message.senderRole === 'admin';
                  return (
                    <div
                      key={message.id || message._id}
                      className={`${styles.messageRow} ${mine ? styles.mine : styles.theirs}`}
                    >
                      <div className={styles.bubble}>
                        <div className={styles.meta}>
                          <strong>{mine ? 'Admin' : message.senderName || 'Driver'}</strong>
                          <span>{formatTime(message.createdAt)}</span>
                        </div>
                        <p>{message.content || message.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form className={styles.replyBox} onSubmit={submitReply}>
                <textarea
                  value={reply}
                  onChange={event => setReply(event.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                />
                <button type="submit" disabled={sending || !reply.trim()}>
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
