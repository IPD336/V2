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
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token }
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
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
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
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
