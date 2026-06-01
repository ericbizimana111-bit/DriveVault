import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { MessageSquare, RefreshCw, Send } from 'lucide-react';
import { apiFetch } from '../utils/apiClient';
import styles from './DriverMessages.module.css';

const formatTime = value => {
  if (!value) return '';
  return format(new Date(value), 'dd MMM yyyy, HH:mm');
};

export default function DriverMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
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
      if (!silent) toast.error(error.message || 'Failed to load messages');
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

  const sendMessage = async event => {
    event.preventDefault();
    if (!text.trim()) {
      toast.error('Message text is required');
      return;
    }

    setSending(true);
    try {
      const endpoint = selectedId
        ? `/messages/conversations/${encodeURIComponent(selectedId)}/messages`
        : '/messages/conversations';
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ content: text, subject: 'Driver communication' })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to send message');

      const conversationId = data.conversationId || selectedId;
      setText('');
      setSelectedId(conversationId);
      await fetchConversations({ silent: true });
      if (conversationId) await fetchMessages(conversationId, { silent: true });
      toast.success('Message sent');
    } catch (error) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1><MessageSquare size={24} /> <span>Communication</span></h1>
          <p>Send and receive messages with the administrators.</p>
        </div>
        <button className={styles.refreshBtn} onClick={() => fetchConversations()}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className={styles.chatShell}>
        <aside className={styles.conversationList}>
          {loadingConversations ? (
            <div className={styles.stateText}>Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <button
              type="button"
              className={`${styles.conversationItem} ${styles.active}`}
              onClick={() => setSelectedId(null)}
            >
              <div className={styles.conversationTop}>
                <strong>Administrators</strong>
              </div>
              <p>Start a new message</p>
            </button>
          ) : conversations.map(conversation => (
            <button
              type="button"
              key={conversation.conversationId}
              className={`${styles.conversationItem} ${selectedId === conversation.conversationId ? styles.active : ''}`}
              onClick={() => setSelectedId(conversation.conversationId)}
            >
              <div className={styles.conversationTop}>
                <strong>{conversation.participantName || 'Administrators'}</strong>
                {conversation.unreadCount > 0 && <span>{conversation.unreadCount}</span>}
              </div>
              <p>{conversation.lastMessage}</p>
              <small>{formatTime(conversation.lastMessageAt)}</small>
            </button>
          ))}
        </aside>

        <section className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div>
              <h2>{selectedConversation?.participantName || 'Administrators'}</h2>
              <p>{selectedConversation?.subject || 'Driver communication'}</p>
            </div>
            {selectedConversation?.unreadCount > 0 && (
              <span className={styles.unreadBadge}>{selectedConversation.unreadCount} unread</span>
            )}
          </div>

          <div className={styles.messages}>
            {loadingMessages ? (
              <div className={styles.stateText}>Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className={styles.emptyChat}>Write a message below to start the conversation.</div>
            ) : messages.map(message => {
              const mine = message.senderRole === 'user';
              return (
                <div
                  key={message.id || message._id}
                  className={`${styles.messageRow} ${mine ? styles.mine : styles.theirs}`}
                >
                  <div className={styles.bubble}>
                    <div className={styles.meta}>
                      <strong>{mine ? 'You' : message.senderName || 'Admin'}</strong>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                    <p>{message.content || message.message}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form className={styles.replyBox} onSubmit={sendMessage}>
            <textarea
              value={text}
              onChange={event => setText(event.target.value)}
              placeholder="Type your message..."
              rows={3}
            />
            <button type="submit" disabled={sending || !text.trim()}>
              <Send size={16} />
              <span>{sending ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
