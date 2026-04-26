import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../api/axios';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load initial notifications from DB
    if (user) {
      api.get('/notifications').then(res => {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      }).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (socket) socket.disconnect();
      return;
    }

    const token = localStorage.getItem('ss_token');
    if (!token) return;

    // Connect to Socket.io server
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (apiUrl.endsWith('/api')) apiUrl = apiUrl.replace(/\/api$/, '');
    
    const newSocket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'] // Try websocket first
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time server');
    });

    newSocket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Play a sound or show toast based on type
      if (notif.type === 'swap_request') showToast('New Swap Request! 🔄');
      else if (notif.type === 'team_invite') showToast('New Team Invite! 🤝');
      else if (notif.type === 'badge_earned') showToast('You earned a new badge! 🏆');
      else showToast('New notification!');
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const n = notifications.find(notif => notif._id === id);
      if (n && !n.read) {
        await api.put(`/notifications/${id}/read`);
        setNotifications(prev => prev.map(notif => notif._id === id ? { ...notif, read: true } : notif));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markTypeAsRead = async (type) => {
    try {
      const unreadOfType = notifications.filter(n => n.type === type && !n.read);
      if (unreadOfType.length === 0) return;

      // For simplicity, we'll just mark them locally and call a bulk read if we had one,
      // but here we can just loop or wait for a better API.
      // Let's just do it locally for now to clear the UI immediately.
      for (const n of unreadOfType) {
        await api.put(`/notifications/${n._id}/read`);
      }
      setNotifications(prev => prev.map(n => n.type === type ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - unreadOfType.length));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead, markTypeAsRead }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
