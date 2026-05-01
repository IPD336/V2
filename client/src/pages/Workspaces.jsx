import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

export default function Workspaces() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();
  const [activeSwaps, setActiveSwaps] = useState([]);
  const [activeTeams, setActiveTeams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSkill, setCompletedSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Frontend');
  const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile', 'AI/ML', 'Programming Languages'];
  
  // REAL-TIME NOTIFICATIONS
  const [unreadRooms, setUnreadRooms] = useState(new Set());
  const [showGoalsMobile, setShowGoalsMobile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [swapRes, teamRes] = await Promise.all([
          api.get('/swaps'),
          api.get('/teams?mine=true')
        ]);
        setActiveSwaps(swapRes.data.active);
        setActiveTeams(teamRes.data.filter(t => t.status === 'open' || t.status === 'closed'));
        setLoading(false);
      } catch (err) {
        showToast('Failed to load workspaces', 'error');
        setLoading(false);
      }
    };
    fetchData();
    setSelected(null);
  }, []);

  useEffect(() => {
    if (!socket) return;

    if (selected) {
      console.log('Joining room:', selected.id);
      socket.emit('join_room', selected.id);
    }

    const handleNewMessage = (msg) => {
      if (selected && String(msg.room) === String(selected.id)) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      } else {
        // ADD RED DOT
        setUnreadRooms(prev => new Set([...prev, String(msg.room)]));
      }
    };

    const handleGoalUpdated = (goals) => {
      if (selected && String(goals.room) === String(selected.id)) {
        // Logic handled by activeSwaps/Teams update in parent if needed, 
        // but here we just update the local state if it matches selected
      }
      // Refresh data to show goal changes
      api.get('/swaps').then(res => setActiveSwaps(res.data.active));
      api.get('/teams?mine=true').then(res => setActiveTeams(res.data.filter(t => t.status === 'open' || t.status === 'closed')));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('goal_updated', handleGoalUpdated);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('goal_updated', handleGoalUpdated);
    };
  }, [socket, selected]);

  useEffect(() => {
    if (selected) {
      api.get(`/messages/${selected.id}`).then(res => setMessages(res.data)).catch(() => { });
    }
  }, [selected]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selected) return;
    socket.emit('send_message', { room: selected.id, content: newMessage.trim(), type: 'text' });
    setNewMessage('');
  };

  const handleComplete = async () => {
    if (!selected || selected.type !== 'swap') return;
    try {
      await api.put(`/swaps/${selected.id}/complete`);
      showToast('Completion request sent! 🏆');
      const res = await api.get('/swaps');
      setActiveSwaps(res.data.active);
    } catch (err) { showToast('Failed to request completion', 'error'); }
  };

  const handleConfirmComplete = async () => {
    try {
      await api.put(`/swaps/${selected.id}/confirm-complete`);
      showToast('Swap confirmed! 🎉');
      const swap = activeSwaps.find(s => String(s._id) === String(selected.id));
      if (swap) {
        setCompletedSkill((swap.sender._id || swap.sender) === user._id ? swap.skillWanted : swap.skillOffered);
        setShowCompletionModal(true);
      }
      const res = await api.get('/swaps');
      setActiveSwaps(res.data.active);
    } catch (err) { showToast('Failed to confirm', 'error'); }
  };

  const handleDeclineComplete = async () => {
    try {
      await api.put(`/swaps/${selected.id}/decline-complete`);
      showToast('Completion declined');
      const res = await api.get('/swaps');
      setActiveSwaps(res.data.active);
    } catch (err) { showToast('Action failed', 'error'); }
  };

  const handleAddSkill = async () => {
    try {
      const updatedSkills = [...(user.skillsOffered || []), { name: completedSkill, category: selectedCategory }];
      await api.put(`/users/${user._id}`, { skillsOffered: updatedSkills });
      showToast(`${completedSkill} added! 🚀`);
      setShowCompletionModal(false);
    } catch (err) { showToast('Failed to add skill', 'error'); }
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
    // CLEAR RED DOT
    setUnreadRooms(prev => {
      const next = new Set(prev);
      next.delete(String(item._id));
      return next;
    });

    if (type === 'swap') {
      const otherUser = item.sender._id === user._id ? item.receiver : item.sender;
      setSelected({ id: item._id, type: 'swap', name: `Swap with ${otherUser.name}`, detail: `${item.skillOffered} ⇄ ${item.skillWanted}`, otherUser });
    } else {
      setSelected({ id: item._id, type: 'team', name: item.name, detail: item.purpose });
    }
    setShowGoalsMobile(false);
  };

  const currentGoals = (selected && selected.id)
    ? (selected.type === 'swap'
      ? activeSwaps.find(s => String(s._id) === String(selected.id))?.goals || []
      : activeTeams.find(t => String(t._id) === String(selected.id))?.goals || [])
    : [];

  if (loading) return <div className="spinner" />;

  const isMobile = window.innerWidth <= 900;

  return (
    <div className="workspace-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 68, background: 'var(--cream)' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div className="workspace-sidebar" style={{
          width: isMobile ? '100%' : 320,
          background: 'var(--card-bg)',
          borderRight: '1px solid var(--border)',
          display: (selected && isMobile) ? 'none' : 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 20, margin: 0, color: 'var(--ink)' }}>Workspaces</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>Your active collaborations</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, color: 'var(--muted)', padding: '0 12px 8px', marginTop: 12 }}>Active Swaps</div>
            {activeSwaps.map(s => (
              <div key={s._id} onClick={() => handleSelect(s, 'swap')} className={`workspace-item ${selected?.id === s._id ? 'active' : ''}`} style={{
                padding: '12px', borderRadius: 12, cursor: 'pointer', marginBottom: 4,
                background: selected?.id === s._id ? 'var(--accent-light)' : 'transparent',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{s.sender._id === user._id ? s.receiver.name : s.sender.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.skillOffered} ⇄ {s.skillWanted}</div>
                </div>
                {unreadRooms.has(String(s._id)) && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4d4d', boxShadow: '0 0 10px rgba(255,77,77,0.5)' }} />}
              </div>
            ))}

            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, color: 'var(--muted)', padding: '0 12px 8px', marginTop: 24 }}>Teams</div>
            {activeTeams.map(t => (
              <div key={t._id} onClick={() => handleSelect(t, 'team')} className={`workspace-item ${selected?.id === t._id ? 'active' : ''}`} style={{
                padding: '12px', borderRadius: 12, cursor: 'pointer', marginBottom: 4,
                background: selected?.id === t._id ? 'var(--accent-light)' : 'transparent',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.members.filter(m => m.status === 'accepted').length} members</div>
                </div>
                {unreadRooms.has(String(t._id)) && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4d4d', boxShadow: '0 0 10px rgba(255,77,77,0.5)' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div style={{ 
          flex: 1, 
          display: (selected || !isMobile) ? 'flex' : 'none', 
          flexDirection: 'column', 
          background: 'var(--cream)', 
          minWidth: 0 
        }}>
          {selected ? (
            <>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  {isMobile && <button className="btn-accent" style={{ padding: '4px 10px', fontSize: 14, borderRadius: 8 }} onClick={() => setSelected(null)}>←</button>}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.detail}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {isMobile && <button className="btn-outline-sm" style={{ padding: '8px', borderRadius: 8, width: 38, height: 38, justifyContent: 'center' }} onClick={() => setShowGoalsMobile(!showGoalsMobile)}>🎯</button>}
                  {selected.type === 'swap' && (() => {
                    const s = activeSwaps.find(sw => String(sw._id) === String(selected.id));
                    if (s?.status === 'pending_completion') {
                      return s.completedBy.includes(user._id) 
                        ? <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', background: 'var(--gold-light)', padding: '6px 12px', borderRadius: 8 }}>Waiting...</div>
                        : <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-accept" style={{ fontSize: 11, padding: '6px 12px' }} onClick={handleConfirmComplete}>Confirm</button>
                            <button className="btn-decline" style={{ fontSize: 11, padding: '6px 12px' }} onClick={handleDeclineComplete}>Wait</button>
                          </div>;
                    }
                    return <button className="btn-modal-primary" style={{ fontSize: 12, width: 'auto', padding: '8px 16px', marginTop: 0 }} onClick={handleComplete}>Complete</button>;
                  })()}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {messages.map((m) => {
                  const isMe = m.sender._id === user._id;
                  return (
                    <div key={m._id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', gap: 10, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: m.sender.avatarUrl ? `url(${m.sender.avatarUrl}) center/cover` : m.sender.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
                        {!m.sender.avatarUrl && m.sender.name[0]}
                      </div>
                      <div>
                        <div style={{ padding: '10px 14px', borderRadius: 14, background: isMe ? 'var(--accent)' : 'var(--card-bg)', color: isMe ? 'white' : 'var(--ink)', fontSize: 14, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{m.content}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'var(--card-bg)' }}>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10 }}>
                  <input className="form-input" placeholder="Message..." style={{ borderRadius: 20, background: 'var(--cream)' }} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  <button type="submit" className="btn-accent" style={{ width: 40, height: 40, borderRadius: '50%', padding: 0 }}>✈</button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
              <h3>Select a Workspace</h3>
            </div>
          )}
        </div>

        {/* Goals Panel */}
        {selected && (
          <div style={{ 
            width: isMobile ? '100%' : 300, 
            borderLeft: isMobile ? 'none' : '1px solid var(--border)', 
            background: 'var(--card-bg)', 
            padding: 24, 
            display: (showGoalsMobile || !isMobile) ? 'flex' : 'none', 
            flexDirection: 'column',
            position: isMobile ? 'fixed' : 'relative',
            inset: isMobile ? '68px 0 0 0' : 'auto',
            zIndex: 100
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', margin: 0 }}>🎯 Goals</h4>
              {isMobile && <button style={{ background: 'none', border: 'none', fontSize: 18 }} onClick={() => setShowGoalsMobile(false)}>✕</button>}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentGoals.map(g => (
                <div key={g._id} onClick={() => handleToggleGoal(g._id)} style={{ display: 'flex', gap: 10, fontSize: 13, cursor: 'pointer', color: g.completed ? 'var(--muted)' : 'var(--ink)', textDecoration: g.completed ? 'line-through' : 'none' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: '1.5px solid var(--border)', background: g.completed ? 'var(--sage)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, flexShrink: 0 }}>{g.completed && '✓'}</div>
                  {g.text}
                </div>
              ))}
              <input className="form-input" placeholder="+ Add goal..." onKeyDown={handleAddGoal} style={{ fontSize: 12, padding: '8px', background: 'var(--cream)' }} />
            </div>
          </div>
        )}
      </div>

      {showCompletionModal && (
        <div className="modal-overlay active">
          <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3>Congratulations!</h3>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>You learned <strong>{completedSkill}</strong>!</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-modal-primary" style={{ marginTop: 0 }} onClick={handleAddSkill}>Add to Profile</button>
              <button className="btn-decline" style={{ fontSize: 13 }} onClick={() => setShowCompletionModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
