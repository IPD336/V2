import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../api/axios';

const SOCKET_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const typingRef = useRef({}); // room -> timeout

  // Derived helper
  const isUserOnline = useCallback((userId) => onlineUsers.has(userId?.toString()), [onlineUsers]);

  useEffect(() => {
    if (user) {
      api.get('/notifications').then(res => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.notifications.filter(n => !n.read).length);
      }).catch(() => showToast('Failed to load notifications', 'error'));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (socket) socket.disconnect();
      return;
    }

    const token = localStorage.getItem('ss_token');
    if (!token) return;

    const newSocket = io(SOCKET_BASE, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time server');
    });

    // Presence
    newSocket.on('online_users', (ids) => {
      setOnlineUsers(new Set(ids));
    });

    newSocket.on('user_online', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('user_offline', (userId) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    // Notifications
    newSocket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);

      if (notif.type === 'swap_request') showToast('New Swap Request!');
      else if (notif.type === 'team_invite') showToast('New Team Invite!');
      else if (notif.type === 'badge_earned') showToast('You earned a new badge!');
      else showToast('New notification!');
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user]);

  // Typing emission helpers
  const emitTyping = useCallback((roomId) => {
    if (!socket) return;
    socket.emit('typing', roomId);
  }, [socket]);

  const emitStopTyping = useCallback((roomId) => {
    if (!socket) return;
    socket.emit('stop_typing', roomId);
  }, [socket]);

  const emitTypingDebounced = useCallback((roomId) => {
    if (!socket) return;
    socket.emit('typing', roomId);
    if (typingRef.current[roomId]) clearTimeout(typingRef.current[roomId]);
    typingRef.current[roomId] = setTimeout(() => {
      socket.emit('stop_typing', roomId);
      delete typingRef.current[roomId];
    }, 2000);
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      const n = notifications.find(notif => notif._id === id);
      if (n && !n.read) {
        await api.put(`/notifications/${id}/read`);
        setNotifications(prev => prev.map(notif => notif._id === id ? { ...notif, read: true } : notif));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      showToast('Failed to mark notification as read', 'error');
    }
  };

  const markTypeAsRead = async (type) => {
    try {
      const unreadOfType = notifications.filter(n => n.type === type && !n.read);
      if (unreadOfType.length === 0) return;
      for (const n of unreadOfType) {
        await api.put(`/notifications/${n._id}/read`);
      }
      setNotifications(prev => prev.map(n => n.type === type ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - unreadOfType.length));
    } catch (err) {
      showToast('Failed to update notifications', 'error');
    }
  };

  const dismissNotification = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      showToast('Failed to dismiss notification', 'error');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const ctx = useMemo(() => ({ socket, notifications, unreadCount, onlineUsers, isUserOnline, markAsRead, markAllAsRead, markTypeAsRead, dismissNotification, emitTyping, emitStopTyping, emitTypingDebounced }), [socket, notifications, unreadCount, onlineUsers, isUserOnline, markAsRead, markAllAsRead, markTypeAsRead, dismissNotification, emitTyping, emitStopTyping, emitTypingDebounced]);

  return (
    <SocketContext.Provider value={ctx}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
