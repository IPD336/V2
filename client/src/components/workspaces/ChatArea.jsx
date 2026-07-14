import { useRef, useEffect } from 'react';
import { SendIcon } from '../Icons';

export default function ChatArea({ messages, user, selected, activeSwaps, newMessage, setNewMessage, sendMessage, emitTypingDebounced, typingUsers, mobileTab, setMobileTab, handleComplete, handleConfirmComplete, handleDeclineComplete, isUserOnline }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`workspace-chat-area${selected ? ' workspace-chat-area--selected' : ''}`} style={{ flex: 1, flexDirection: 'column', background: 'var(--cream)', minWidth: 0 }}>
      {selected ? (
        <>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', gap: 8 }}>
            <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn-ghost hide-desktop" style={{ padding: '6px 10px', flexShrink: 0 }} onClick={() => {}}>←</button>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {selected.name}
                  {selected.otherUser && isUserOnline(selected.otherUser._id) && <span className="presence-dot" />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.detail}</div>
                {selected.type === 'swap' && (() => {
                  const s = activeSwaps.find(sw => String(sw._id) === String(selected.rawId || selected.id));
                  if (!s) return null;
                  return (
                    <div style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                      {s.schedule && <span>📅 {s.schedule}</span>}
                      {s.format && <span>🎥 {s.format}</span>}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div className="hide-desktop" style={{ display: 'flex', background: 'var(--cream)', borderRadius: 8, padding: 2, gap: 2 }}>
                <button onClick={() => setMobileTab('chat')} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'PT Sans, sans-serif', background: mobileTab === 'chat' ? 'var(--accent)' : 'transparent', color: mobileTab === 'chat' ? 'white' : 'var(--muted)' }}>Chat</button>
                <button onClick={() => setMobileTab('goals')} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'PT Sans, sans-serif', background: mobileTab === 'goals' ? 'var(--accent)' : 'transparent', color: mobileTab === 'goals' ? 'white' : 'var(--muted)' }}>🎯 Goals</button>
              </div>
              {selected.type === 'swap' && (() => {
                const s = activeSwaps.find(sw => String(sw._id) === String(selected.rawId || selected.id));
                if (!s) return null;
                if (s.status === 'pending_completion') {
                  const isRequester = s.completedBy.includes(user._id);
                  return isRequester ? (
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', background: 'var(--gold-light)', padding: '4px 8px', borderRadius: 6 }}>Waiting...</div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-cosmos-primary" style={{ fontSize: 11, width: 'auto', padding: '5px 10px', marginTop: 0 }} onClick={handleConfirmComplete}>Confirm</button>
                      <button className="btn-cosmos-ghost" style={{ fontSize: 11, padding: '5px 10px' }} onClick={handleDeclineComplete}>Not Yet</button>
                    </div>
                  );
                }
                return <button className="btn-cosmos-primary" style={{ fontSize: 12, width: 'auto', padding: '6px 12px', marginTop: 0, flexShrink: 0 }} onClick={handleComplete}>✓ Complete</button>;
              })()}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, ...(mobileTab === 'goals' ? { display: 'none' } : {}) }} className={mobileTab === 'goals' ? 'hide-desktop' : ''}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                <p>Start the conversation! Every great skill begins with a "Hello".</p>
              </div>
            ) : messages.map(m => {
              const isMe = m.sender._id === user._id;
              return (
                <div key={m._id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', gap: 12, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: m.sender.avatarUrl ? `url(${m.sender.avatarUrl}) center/cover` : m.sender.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                    {!m.sender.avatarUrl && m.sender.name[0]}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    {!isMe && <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4, marginLeft: 4 }}>{m.sender.name}</div>}
                    <div style={{ padding: '10px 16px', borderRadius: 16, borderBottomRightRadius: isMe ? 4 : 16, borderBottomLeftRadius: isMe ? 16 : 4, background: isMe ? 'var(--accent)' : 'var(--card-bg)', border: isMe ? 'none' : '1px solid var(--border)', color: isMe ? 'white' : 'var(--ink)', fontSize: 14, lineHeight: 1.5, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', wordBreak: 'break-word' }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            {Object.keys(typingUsers).length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', padding: '0 4px', marginTop: -8 }}>
                {Object.values(typingUsers).join(', ')} typing{Object.keys(typingUsers).length > 1 ? '' : 's'}…
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--card-bg)' }}>
            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12 }}>
              <input className="form-input" placeholder="Type a message…" style={{ borderRadius: 24, paddingLeft: 20, background: 'var(--cream)' }} value={newMessage} onChange={(e) => { setNewMessage(e.target.value); if (selected) emitTypingDebounced(selected.id); }} />
              <button type="submit" style={{ width: 44, height: 44, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', transition: 'all .2s' }}>
                <SendIcon size={18} />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'var(--cream)' }}>
          <div style={{ width: 120, height: 120, background: 'var(--card-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: 'var(--shadow)' }}>
            <span style={{ fontSize: 48 }}>🚀</span>
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Select a Workspace</h3>
          <p style={{ maxWidth: 320, textAlign: 'center' }}>Choose a swap or team from the sidebar to start sharing skills and collaborating!</p>
        </div>
      )}
    </div>
  );
}
