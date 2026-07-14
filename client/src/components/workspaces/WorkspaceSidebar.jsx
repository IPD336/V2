export default function WorkspaceSidebar({ sidebarTab, setSidebarTab, activeSwaps, activeTeams, activeDMs, selected, handleSelect, unreadRooms, isUserOnline, user }) {
  const tabs = [
    { id: 'swaps', label: 'Swaps', hasUnread: activeSwaps.some(s => unreadRooms.has(String(s._id))) },
    { id: 'teams', label: 'Teams', hasUnread: activeTeams.some(t => unreadRooms.has(String(t._id))) },
    { id: 'dms', label: 'DMs', hasUnread: Array.from(unreadRooms).some(r => r.startsWith('DM_')) },
  ];

  return (
    <div className={`workspace-sidebar${selected ? ' workspace-sidebar--selected' : ''}`} style={{
      width: 320, background: 'var(--card-bg)',
      borderRight: '1px solid var(--border)',
      flexDirection: 'column', flexShrink: 0,
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 20, margin: 0, color: 'var(--ink)' }}>Workspaces</h2>
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>Your active collaborations</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', gap: 4, padding: '12px', borderBottom: '1px solid var(--border)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSidebarTab(tab.id)}
              className={`btn-ghost ${sidebarTab === tab.id ? 'active' : ''}`}
              style={{ position: 'relative', flex: 1, padding: '6px', fontSize: 11, background: sidebarTab === tab.id ? 'var(--accent-light)' : 'transparent', color: sidebarTab === tab.id ? 'var(--accent)' : 'var(--muted)' }}
            >
              {tab.label}
              {tab.hasUnread && <span style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {sidebarTab === 'swaps' && (
            <div>
              {activeSwaps.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No active swaps.</div>
              ) : activeSwaps.map(s => (
                <div
                  key={s._id}
                  className={`workspace-item ${selected?.id === s._id ? 'active' : ''}`}
                  onClick={() => handleSelect(s, 'swap')}
                  style={{ padding: '12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 4, background: selected?.id === s._id ? 'var(--accent-light)' : 'transparent', border: selected?.id === s._id ? '1px solid var(--border)' : '1px solid transparent' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {s.sender._id === user._id ? s.receiver.name : s.sender.name}
                      {isUserOnline(s.sender._id === user._id ? s.receiver._id : s.sender._id) && <span className="presence-dot" />}
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

          {sidebarTab === 'teams' && (
            <div>
              {activeTeams.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No active teams.</div>
              ) : activeTeams.map(t => (
                <div
                  key={t._id}
                  className={`workspace-item ${selected?.id === t._id ? 'active' : ''}`}
                  onClick={() => handleSelect(t, 'team')}
                  style={{ padding: '12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 4, background: selected?.id === t._id ? 'var(--accent-light)' : 'transparent', border: selected?.id === t._id ? '1px solid var(--border)' : '1px solid transparent' }}
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

          {sidebarTab === 'dms' && (
            <div>
              {activeDMs.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No direct messages. Follow someone!</div>
              ) : activeDMs.map(m => {
                const roomId = `DM_${[user._id, m._id].sort().join('_')}`;
                return (
                  <div
                    key={roomId}
                    className={`workspace-item ${selected?.id === roomId ? 'active' : ''}`}
                    onClick={() => handleSelect({ _id: roomId, name: m.name, otherUser: m }, 'dm')}
                    style={{ padding: '12px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', marginBottom: 4, background: selected?.id === roomId ? 'var(--accent-light)' : 'transparent', border: selected?.id === roomId ? '1px solid var(--border)' : '1px solid transparent' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {m.name}
                        {isUserOnline(m._id) && <span className="presence-dot" />}
                      </div>
                      {unreadRooms.has(roomId) && <div className="workspace-unread-dot" />}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Direct Message
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
