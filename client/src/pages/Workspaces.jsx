import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import Confetti from '../components/Confetti';
import WorkspaceSidebar from '../components/workspaces/WorkspaceSidebar';
import ChatArea from '../components/workspaces/ChatArea';
import GoalsPanel from '../components/workspaces/GoalsPanel';
import CompletionModal from '../components/workspaces/CompletionModal';

export default function Workspaces() {
  const { user } = useAuth();
  const { socket, isUserOnline, emitTypingDebounced } = useSocket();
  const { showToast } = useToast();
  const [activeSwaps, setActiveSwaps] = useState([]);
  const [activeTeams, setActiveTeams] = useState([]);
  const [activeDMs, setActiveDMs] = useState([]);
  const [sidebarTab, setSidebarTab] = useState('swaps');
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedSkill, setCompletedSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Frontend');
  const [unreadRooms, setUnreadRooms] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [mobileTab, setMobileTab] = useState('chat');
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [swapRes, teamRes, dmRes] = await Promise.all([
          api.get('/swaps'),
          api.get('/teams?mine=true'),
          api.get('/users/mutual-follows').catch(() => ({ data: { mutuals: [] } }))
        ]);
        setActiveSwaps(swapRes.data.active);
        setActiveTeams(teamRes.data.teams.filter(t => t.status === 'open' || t.status === 'closed'));
        setActiveDMs(dmRes.data.mutuals || []);

        const params = new URLSearchParams(location.search);
        const dmId = params.get('dm');
        if (dmId) {
          setSidebarTab('dms');
          let partner = (dmRes.data.mutuals || []).find(m => m._id === dmId);
          if (!partner) {
            try {
              const uRes = await api.get(`/users/${dmId}`);
              partner = uRes.data;
              setActiveDMs(prev => {
                if (prev.some(u => u._id === dmId)) return prev;
                return [...prev, partner];
              });
            } catch (err) {
              if (import.meta.env.DEV) console.error('Failed to load direct message partner info:', err);
            }
          }
          if (partner) {
            const roomId = `DM_${[user._id, partner._id].sort().join('_')}`;
            setSelected({ id: roomId, type: 'dm', name: partner.name, detail: 'Direct Message', otherUser: partner });
          }
        } else {
          setSelected(null);
        }
        setLoading(false);
      } catch (err) {
        showToast('Failed to load workspaces', 'error');
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search, user]);

  useEffect(() => {
    if (!socket) return;
    const handleGlobalMessage = (msg) => {
      if (msg.room.startsWith('DM_')) {
        const senderId = msg.sender._id;
        if (senderId !== user?._id) {
          setActiveDMs(prev => {
            if (prev.some(u => u._id === senderId)) return prev;
            return [...prev, msg.sender];
          });
        }
      }
      setUnreadRooms(prev => {
        if (selected && String(msg.room) === String(selected.id)) return prev;
        return new Set([...prev, String(msg.room)]);
      });
    };
    socket.on('new_message', handleGlobalMessage);
    return () => socket.off('new_message', handleGlobalMessage);
  }, [socket, selected, user]);

  useEffect(() => {
    if (!socket || !selected) return;
    socket.emit('join_room', selected.id);

    const handleNewMessage = (msg) => {
      if (String(msg.room) === String(selected.id)) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setTypingUsers(prev => { const next = { ...prev }; delete next[msg.sender._id]; return next; });
      }
    };
    const handleGoalUpdated = (goals) => {
      if (selected.type === 'swap') {
        setActiveSwaps(prev => prev.map(s => String(s._id) === String(selected.rawId || selected.id) ? { ...s, goals } : s));
      } else {
        setActiveTeams(prev => prev.map(t => String(t._id) === String(selected.rawId || selected.id) ? { ...t, goals } : t));
      }
    };
    const handleTyping = ({ userId, room }) => {
      if (String(room) === String(selected.id) && userId !== user._id) {
        const partner = selected.otherUser;
        const name = partner?._id === userId || partner?._id?.toString() === userId ? partner.name : 'Someone';
        setTypingUsers(prev => ({ ...prev, [userId]: name }));
      }
    };
    const handleStopTyping = ({ userId, room }) => {
      if (String(room) === String(selected.id)) {
        setTypingUsers(prev => { const next = { ...prev }; delete next[userId]; return next; });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('goal_updated', handleGoalUpdated);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('goal_updated', handleGoalUpdated);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      setTypingUsers({});
    };
  }, [socket, selected]);

  useEffect(() => {
    if (selected) {
      api.get(`/messages/${selected.id}`).then(res => setMessages(res.data.messages)).catch(() => showToast('Failed to load messages', 'error'));
    }
  }, [selected]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selected) return;
    socket.emit('send_message', { room: selected.id, content: newMessage.trim(), type: 'text' });
    setNewMessage('');
  };

  const handleComplete = async () => {
    if (!selected || selected.type !== 'swap') return;
    try {
      await api.put(`/swaps/${selected.rawId || selected.id}/complete`);
      showToast('Completion request sent!');
      const res = await api.get('/swaps');
      setActiveSwaps(res.data.active);
    } catch (err) {
      showToast('Failed to request completion', 'error');
    }
  };

  const handleConfirmComplete = async () => {
    try {
      await api.put(`/swaps/${selected.rawId || selected.id}/confirm-complete`);
      showToast('Swap confirmed as completed!');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      const swap = activeSwaps.find(s => String(s._id) === String(selected.rawId || selected.id));
      if (!swap) return;
      const learnedSkill = (swap.sender._id || swap.sender) === user._id ? swap.skillWanted : swap.skillOffered;
      setCompletedSkill(learnedSkill);
      setShowCompletionModal(true);
      const res = await api.get('/swaps');
      setActiveSwaps(res.data.active);
    } catch (err) {
      showToast('Failed to confirm completion', 'error');
    }
  };

  const handleDeclineComplete = async () => {
    try {
      await api.put(`/swaps/${selected.rawId || selected.id}/decline-complete`);
      showToast('Completion request declined');
      const res = await api.get('/swaps');
      setActiveSwaps(res.data.active);
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleAddSkill = async () => {
    try {
      const updatedSkills = [...(user.skillsOffered || []), { name: completedSkill, category: selectedCategory }];
      await api.put(`/users/${user._id}`, { skillsOffered: updatedSkills });
      showToast(`${completedSkill} added to your offered skills!`);
      setShowCompletionModal(false);
    } catch (err) {
      showToast('Failed to add skill', 'error');
    }
  };

  const handleAddGoal = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() && socket && selected) {
      socket.emit('add_goal', { room: selected.id, type: selected.type, text: e.target.value.trim() });
      e.target.value = '';
    }
  };

  const handleToggleGoal = (goalId) => {
    if (socket && selected) {
      socket.emit('toggle_goal', { room: selected.id, type: selected.type, goalId });
    }
  };

  const handleSelect = (item, type) => {
    if (type === 'swap') {
      const roomId = `swap_${item._id}`;
      setUnreadRooms(prev => { const next = new Set(prev); next.delete(roomId); next.delete(String(item._id)); return next; });
      const otherUser = item.sender._id === user._id ? item.receiver : item.sender;
      setSelected({ id: roomId, rawId: item._id, type: 'swap', name: `Swap with ${otherUser.name}`, detail: `${item.skillOffered} ⇄ ${item.skillWanted}`, otherUser });
    } else if (type === 'team') {
      const roomId = `team_${item._id}`;
      setUnreadRooms(prev => { const next = new Set(prev); next.delete(roomId); next.delete(String(item._id)); return next; });
      setSelected({ id: roomId, rawId: item._id, type: 'team', name: item.name, detail: item.purpose });
    } else if (type === 'dm') {
      setUnreadRooms(prev => { const next = new Set(prev); next.delete(String(item._id)); return next; });
      setSelected({ id: item._id, type: 'dm', name: item.name, detail: 'Direct Message', otherUser: item.otherUser });
    }
  };

  const currentGoals = (selected && selected.id)
    ? (selected.type === 'swap'
      ? activeSwaps.find(s => String(s._id) === String(selected.rawId || selected.id))?.goals || []
      : activeTeams.find(t => String(t._id) === String(selected.rawId || selected.id))?.goals || [])
    : [];

  if (loading) return (
    <div className="page bg-gradient-subtle page-fade-in" style={{ height: '100vh', display: 'flex', gap: 32, padding: '100px 40px' }}>
      <div style={{ width: 260, flexShrink: 0 }}>
        <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 8, marginBottom: 20 }} />
        {[1,2,3].map((n) => <div key={n} className="skeleton" style={{ width: '100%', height: 52, borderRadius: 8, marginBottom: 8 }} />)}
      </div>
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '60%', height: 32, borderRadius: 8, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '100%', height: 120, borderRadius: 16 }} />
      </div>
    </div>
  );

  return (
    <div className="workspace-page page bg-gradient-subtle" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 68 }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <WorkspaceSidebar
          sidebarTab={sidebarTab} setSidebarTab={setSidebarTab}
          activeSwaps={activeSwaps} activeTeams={activeTeams} activeDMs={activeDMs}
          selected={selected} handleSelect={handleSelect}
          unreadRooms={unreadRooms} isUserOnline={isUserOnline} user={user}
        />
        <ChatArea
          messages={messages} user={user} selected={selected} activeSwaps={activeSwaps}
          newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage}
          emitTypingDebounced={emitTypingDebounced} typingUsers={typingUsers}
          mobileTab={mobileTab} setMobileTab={setMobileTab}
          handleComplete={handleComplete} handleConfirmComplete={handleConfirmComplete}
          handleDeclineComplete={handleDeclineComplete} isUserOnline={isUserOnline}
        />
        {selected && (
          <GoalsPanel
            currentGoals={currentGoals} handleToggleGoal={handleToggleGoal}
            handleAddGoal={handleAddGoal} mobileTab={mobileTab} setMobileTab={setMobileTab}
          />
        )}
      </div>

      {showCompletionModal && (
        <CompletionModal
          completedSkill={completedSkill} selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory} handleAddSkill={handleAddSkill}
          setShowCompletionModal={setShowCompletionModal}
        />
      )}
      <Confetti active={showConfetti} />
    </div>
  );
}
