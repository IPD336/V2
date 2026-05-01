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
  const [selected, setSelected] = useState(null); // { id, type, name, otherUser? }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSkill, setCompletedSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Frontend');
  // Track which rooms have unread messages (Set of room IDs)
  const [unreadRooms, setUnreadRooms] = useState(new Set());
  // Mobile tab: 'chat' | 'goals'
  const [mobileTab, setMobileTab] = useState('chat');
  const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile', 'AI/ML', 'Programming Languages'];

  // Load active swaps and teams
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

  // GLOBAL socket listener — always on, handles unread dots for ALL rooms
  useEffect(() => {
    if (!socket) return;
    const handleGlobalMessage = (msg) => {
      setUnreadRooms(prev => {
        // Only add unread dot if it's NOT the currently open room
        if (selected && String(msg.room) === String(selected.id)) return prev;
        return new Set([...prev, String(msg.room)]);
      });
    };
    socket.on('new_message', handleGlobalMessage);
    return () => socket.off('new_message', handleGlobalMessage);
  }, [socket, selected]);

  // Room-specific socket listener — joins/leaves room and handles in-room updates
  useEffect(() => {
    if (!socket || !selected) return;

    console.log('Joining room:', selected.id);
    socket.emit('join_room', selected.id);

    const handleNewMessage = (msg) => {
      if (String(msg.room) === String(selected.id)) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleGoalUpdated = (goals) => {
      if (selected.type === 'swap') {
        setActiveSwaps(prev => prev.map(s => String(s._id) === String(selected.id) ? { ...s, goals } : s));
      } else {
        setActiveTeams(prev => prev.map(t => String(t._id) === String(selected.id) ? { ...t, goals } : t));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('goal_updated', handleGoalUpdated);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('goal_updated', handleGoalUpdated);
    };
  }, [socket, selected]);

  // Load message history when selection changes
  useEffect(() => {
    if (selected) {
      api.get(`/messages/${selected.id}`).then(res => setMessages(res.data)).catch(() => { });
    }
  }, [selected]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selected) return;

    socket.emit('send_message', {
      room: selected.id,
      content: newMessage.trim(),
      type: 'text'
    });
    setNewMessage('');
  };

  const handleComplete = async () => {
    if (!selected || selected.type !== 'swap') return;
    try {
      await api.put(`/swaps/${selected.id}/complete`);
      showToast('Completion request sent! 🏆');
      
      // Refresh list to show pending state
      const res = await api.get('/swaps');
      setActiveSwaps(res.data.active);
    } catch (err) {
      showToast('Failed to request completion', 'error');
    }
  };

  const handleConfirmComplete = async () => {
    try {
      await api.put(`/swaps/${selected.id}/confirm-complete`);
      showToast('Swap confirmed as completed! 🎉');
      
      const swap = activeSwaps.find(s => String(s._id) === String(selected.id));
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
      await api.put(`/swaps/${selected.id}/decline-complete`);
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
      showToast(`${completedSkill} added to your offered skills! 🚀`);
      setShowCompletionModal(false);
    } catch (err) {
      showToast('Failed to add skill', 'error');
    }
  };

  const handleAddGoal = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() && socket && selected) {
      socket.emit('add_goal', {
        room: selected.id,
        type: selected.type,
        text: e.target.value.trim()
      });
      e.target.value = '';
    }
  };

  const handleToggleGoal = (goalId) => {
    if (socket && selected) {
      socket.emit('toggle_goal', {
        room: selected.id,
        type: selected.type,
        goalId
      });
    }
  };

  const handleSelect = (item, type) => {
    // Clear unread dot when opening a room
    setUnreadRooms(prev => {
      const next = new Set(prev);
      next.delete(String(item._id));
      return next;
    });
    if (type === 'swap') {
      const otherUser = item.sender._id === user._id ? item.receiver : item.sender;
      setSelected({
        id: item._id,
        type: 'swap',
        name: `Swap with ${otherUser.name}`,
        detail: `${item.skillOffered} ⇄ ${item.skillWanted}`,
        otherUser
      });
    } else {
      setSelected({
        id: item._id,
        type: 'team',
        name: item.name,
        detail: item.purpose
      });
    }
  };

  const currentGoals = (selected && selected.id)
    ? (selected.type === 'swap'
      ? activeSwaps.find(s => String(s._id) === String(selected.id))?.goals || []
      : activeTeams.find(t => String(t._id) === String(selected.id))?.goals || [])
    : [];

  if (loading) return <div className="spinner" />;

  return (
    <div className="workspace-page" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      paddingTop: 68, // Match Navbar height
      background: 'var(--cream)'
    }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar (Left) */}
        <div className="workspace-sidebar" style={{
          width: 320,
          background: 'var(--card-bg)',
          borderRight: '1px solid var(--border)',
          display: (selected && window.innerWidth <= 900) ? 'none' : 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 20, margin: 0, color: 'var(--ink)' }}>Workspaces</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>Your active collaborations</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
            {activeSwaps.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, color: 'var(--muted)', padding: '0 12px 8px' }}>Active Swaps</div>
                  {activeSwaps.map(s => (
                    <div
                      key={s._id}
                      className={`workspace-item ${selected?.id === s._id ? 'active' : ''}`}
                      onClick={() => handleSelect(s, 'swap')}
                      style={{
                        padding: '12px',
                        borderRadius: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: 4,
                        background: selected?.id === s._id ? 'var(--accent-light)' : 'transparent',
                        border: selected?.id === s._id ? '1px solid var(--border)' : '1px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>
                          {s.sender._id === user._id ? s.receiver.name : s.sender.name}
                        </div>
                        {unreadRooms.has(String(s._id)) && <div className="workspace-unread-dot" />}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.skillOffered} ⇄ {s.skillWanted}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeTeams.length > 0 && (
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, color: 'var(--muted)', padding: '0 12px 8px' }}>Teams</div>
                {activeTeams.map(t => (
                    <div
                      key={t._id}
                      className={`workspace-item ${selected?.id === t._id ? 'active' : ''}`}
                      onClick={() => handleSelect(t, 'team')}
                      style={{
                        padding: '12px',
                        borderRadius: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: 4,
                        background: selected?.id === t._id ? 'var(--accent-light)' : 'transparent',
                        border: selected?.id === t._id ? '1px solid var(--border)' : '1px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{t.name}</div>
                        {unreadRooms.has(String(t._id)) && <div className="workspace-unread-dot" />}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.members.filter(m => m.status === 'accepted').length} members
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeSwaps.length === 0 && activeTeams.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🌱</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>No active workspaces</div>
                <p style={{ fontSize: 12, marginTop: 8 }}>Accept a swap or join a team to start collaborating!</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content (Chat) */}
        <div style={{ 
          flex: 1, 
          display: (selected || window.innerWidth > 900) ? 'flex' : 'none', 
          flexDirection: 'column', 
          background: 'var(--cream)', 
          minWidth: 0 
        }}>
          {selected ? (
            <>
              {/* Header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', gap: 8 }}>
                <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="btn-ghost hide-desktop" style={{ padding: '6px 10px', flexShrink: 0 }} onClick={() => setSelected(null)}>←</button>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.detail}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {/* Mobile chat/goals toggle */}
                  <div className="hide-desktop" style={{ display: 'flex', background: 'var(--cream)', borderRadius: 8, padding: 2, gap: 2 }}>
                    <button
                      onClick={() => setMobileTab('chat')}
                      style={{ padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'PT Sans, sans-serif', background: mobileTab === 'chat' ? 'var(--accent)' : 'transparent', color: mobileTab === 'chat' ? 'white' : 'var(--muted)' }}
                    >Chat</button>
                    <button
                      onClick={() => setMobileTab('goals')}
                      style={{ padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'PT Sans, sans-serif', background: mobileTab === 'goals' ? 'var(--accent)' : 'transparent', color: mobileTab === 'goals' ? 'white' : 'var(--muted)' }}
                    >🎯 Goals</button>
                  </div>
                  {selected.type === 'swap' && (() => {
                    const s = activeSwaps.find(sw => String(sw._id) === String(selected.id));
                    if (!s) return null;
                    if (s.status === 'pending_completion') {
                      const isRequester = s.completedBy.includes(user._id);
                      return isRequester ? (
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', background: 'var(--gold-light)', padding: '4px 8px', borderRadius: 6 }}>Waiting...</div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-modal-primary" style={{ fontSize: 11, width: 'auto', padding: '5px 10px', marginTop: 0 }} onClick={handleConfirmComplete}>Confirm</button>
                          <button className="btn-decline" style={{ fontSize: 11, padding: '5px 10px' }} onClick={handleDeclineComplete}>Not Yet</button>
                        </div>
                      );
                    }
                    return (
                      <button className="btn-modal-primary" style={{ fontSize: 12, width: 'auto', padding: '6px 12px', marginTop: 0, flexShrink: 0 }} onClick={handleComplete}>✓ Complete</button>
                    );
                  })()}
                </div>
              </div>

              {/* Chat Area — hidden on mobile when goals tab active */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, ...(mobileTab === 'goals' ? { display: 'none' } : {}) }} className={mobileTab === 'goals' ? 'hide-desktop' : ''}>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                    <p>Start the conversation! Every great skill begins with a "Hello".</p>
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isMe = m.sender._id === user._id;
                    return (
                      <div key={m._id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', gap: 12, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: m.sender.avatarUrl ? `url(${m.sender.avatarUrl}) center/cover` : m.sender.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                          {!m.sender.avatarUrl && m.sender.name[0]}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          {!isMe && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, marginLeft: 4 }}>{m.sender.name}</div>}
                          <div style={{
                            padding: '10px 16px',
                            borderRadius: 16,
                            borderBottomRightRadius: isMe ? 4 : 16,
                            borderBottomLeftRadius: isMe ? 16 : 4,
                            background: isMe ? 'var(--accent)' : 'var(--card-bg)',
                            border: isMe ? 'none' : '1px solid var(--border)',
                            color: isMe ? 'white' : 'var(--ink)',
                            fontSize: 14,
                            lineHeight: 1.5,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            wordBreak: 'break-word'
                          }}>
                            {m.content}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--card-bg)' }}>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12 }}>
                  <input
                    className="form-input"
                    placeholder="Type a message…"
                    style={{ borderRadius: 24, paddingLeft: 20, background: 'var(--cream)' }}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="btn-accent" style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    ✈
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'var(--cream)' }}>
              <div style={{ width: 120, height: 120, background: 'var(--card-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 24, boxShadow: 'var(--shadow)' }}>
                🚀
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Select a Workspace</h3>
              <p style={{ maxWidth: 320, textAlign: 'center' }}>Choose a swap or team from the sidebar to start sharing skills and collaborating!</p>
            </div>
          )}
        </div>

        {/* Right Panel (Goals) — desktop only */}
        {selected && (
          <div style={{ width: 320, borderLeft: '1px solid var(--border)', background: 'var(--card-bg)', padding: 24, display: 'flex', flexDirection: 'column', flexShrink: 0 }} className="hide-mobile">
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 16 }}>🎯 Collaborative Goals</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {currentGoals.map(goal => (
                  <div
                    key={goal._id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontSize: 13,
                      color: goal.completed ? 'var(--muted)' : 'var(--ink)',
                      textDecoration: goal.completed ? 'line-through' : 'none',
                      cursor: 'pointer',
                      padding: '4px 0'
                    }}
                    onClick={() => handleToggleGoal(goal._id)}
                  >
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: goal.completed ? 'none' : '1.5px solid var(--border)',
                      background: goal.completed ? 'var(--sage)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 10,
                      flexShrink: 0,
                      marginTop: 1
                    }}>
                      {goal.completed && '✓'}
                    </div>
                    <span style={{ wordBreak: 'break-word' }}>{goal.text}</span>
                  </div>
                ))}
              </div>
              <input
                className="form-input"
                placeholder="+ Add a goal..."
                onKeyDown={handleAddGoal}
                style={{ fontSize: 12, padding: '8px 12px', background: 'var(--cream)', borderRadius: 8 }}
              />
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>Press Enter to add. Synchronized in real-time!</p>
            </div>
          </div>
        )}

        {/* Mobile Goals Panel — shown when Goals tab active */}
        {selected && mobileTab === 'goals' && (
          <div className="hide-desktop" style={{ position: 'absolute', top: 68, left: 0, right: 0, bottom: 0, background: 'var(--card-bg)', overflowY: 'auto', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
            {/* Goals header with back button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)', position: 'sticky', top: 0, zIndex: 1 }}>
              <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setMobileTab('chat')}>← Chat</button>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>🎯 Goals</h4>
            </div>
            <div style={{ padding: 20, flex: 1 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {currentGoals.map(goal => (
                <div
                  key={goal._id}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: goal.completed ? 'var(--muted)' : 'var(--ink)', textDecoration: goal.completed ? 'line-through' : 'none', cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--border)' }}
                  onClick={() => handleToggleGoal(goal._id)}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: goal.completed ? 'none' : '1.5px solid var(--border)', background: goal.completed ? 'var(--sage)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, flexShrink: 0 }}>
                    {goal.completed && '✓'}
                  </div>
                  <span style={{ wordBreak: 'break-word' }}>{goal.text}</span>
                </div>
              ))}
              {currentGoals.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No goals yet. Add one below!</div>}
            </div>
            <input
              className="form-input"
              placeholder="+ Add a goal and press Enter..."
              onKeyDown={handleAddGoal}
              style={{ fontSize: 13, padding: '10px 14px', background: 'var(--cream)', borderRadius: 8 }}
            />
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Synchronized in real-time with your partner!</p>
            </div>{/* close inner padding div */}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="modal-overlay active">
          <div className="modal-content" style={{ maxWidth: 450, textAlign: 'center', padding: 40, background: 'var(--card-bg)', borderRadius: 20, boxShadow: 'var(--shadow-lg)', position: 'relative' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--ink)' }}>Congratulations!</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 32 }}>
              You've successfully completed your swap and learned <strong>{completedSkill}</strong>.
              Would you like to add it to your offered skills so you can mentor others?
            </p>

            <div style={{ textAlign: 'left', marginBottom: 32 }}>
              <label className="form-label">Select Category for {completedSkill}</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ background: 'var(--cream)' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-modal-primary" style={{ marginTop: 0 }} onClick={handleAddSkill}>Yes, add it! 🚀</button>
              <button className="btn-ghost" onClick={() => setShowCompletionModal(false)}>Not now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
