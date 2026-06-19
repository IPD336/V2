import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { initials } from '../utils';
import Logo from './Logo';
import { BellIcon } from './Logo';
import { MoonIcon, SunIcon, WorkspaceIcon, TeamsIcon, TrophyIcon, ProfileIcon, LogoutIcon, SwapIcon, HandshakeIcon } from './Icons';

const moreLinks = [
  { to: '/workspaces', label: 'Workspaces', icon: 'workspace' },
  { to: '/teams', label: 'Teams', icon: 'teams' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket() || { notifications: [], unreadCount: 0, markAsRead: () => {}, markAllAsRead: () => {} };
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const moreRef = useRef(null);
  const avatarRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/'); setMobileMenuOpen(false); };
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => { setMobileMenuOpen(false); setNotifOpen(false); setMoreOpen(false); setAvatarOpen(false); };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { setNotifOpen(false); setMoreOpen(false); setAvatarOpen(false); setMobileMenuOpen(false); }
    };
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => { document.removeEventListener('keydown', handleKey); document.removeEventListener('mousedown', handleClick); };
  }, []);

  const handleNotifClick = (n) => {
    markAsRead(n._id);
    setNotifOpen(false);
    setMobileMenuOpen(false);
    if (n.type === 'swap_request') navigate('/swaps');
    else if (n.type === 'team_invite') navigate('/teams');
    else navigate('/profile');
  };

  const dropdownCommon = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    background: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    boxShadow: 'var(--shadow-lg)',
    minWidth: 180,
    zIndex: 100,
    overflow: 'hidden',
  };

  const dropdownItem = {
    padding: '10px 16px',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--ink)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'background 0.15s',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
    textDecoration: 'none',
  };

  return (
    <>
      <nav>
        <div className="nav-gradient-line" />
        <NavLink to={user ? '/dashboard' : '/'} className="logo" onClick={closeMobileMenu}>
          <Logo size={32} />
        </NavLink>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Compact theme toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 8px', fontSize: 16, lineHeight: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}
          >
            {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
          </button>

          {user ? (
            <>
              {/* Desktop nav links */}
              <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
                {user?.role === 'admin' ? (
                  <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu} style={{ color: 'var(--accent)' }}>Admin Dashboard</NavLink>
                ) : (
                  <>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Dashboard</NavLink>
                    <NavLink to="/browse" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Browse</NavLink>
                    <NavLink to="/swaps" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Swaps</NavLink>
                    {/* More links shown inline on mobile, hidden on desktop */}
                    {moreLinks.map((l) => (
                      <NavLink key={l.to} to={l.to} className={({ isActive }) => `hide-desktop ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>{l.label}</NavLink>
                    ))}
                    <NavLink to="/profile" className={({ isActive }) => `hide-desktop ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>Profile</NavLink>
                    <button className="mobile-only-flex btn-cosmos" onClick={() => setNotifOpen(!notifOpen)} style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', padding: '14px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center', gap: 8, color: 'var(--ink)' }}>
                      Notifications {unreadCount > 0 && <span style={{ background: 'red', color: 'white', borderRadius: 10, padding: '2px 8px', fontSize: 11 }}>{unreadCount} new</span>}
                    </button>
                    <button className="mobile-only-flex" onClick={() => { handleLogout(); }} style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', padding: '14px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer', color: 'var(--accent)' }}>
                      Logout
                    </button>
                  </>
                )}
              </div>

              {/* "More" dropdown trigger — desktop only */}
              <div ref={moreRef} style={{ position: 'relative' }} className="hide-mobile">
                <button
                  onClick={() => { setMoreOpen(!moreOpen); setAvatarOpen(false); setNotifOpen(false); }}
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, opacity: 0.8 }}
                  aria-label="More navigation"
                  aria-expanded={moreOpen}
                >
                  More
                  <span style={{ fontSize: 8 }}>▾</span>
                </button>
                {moreOpen && (
                  <div style={dropdownCommon}>
                    {moreLinks.map((l) => (
                      <NavLink
                        key={l.to}
                        to={l.to}
                        onClick={() => setMoreOpen(false)}
                        style={{ ...dropdownItem, textDecoration: 'none' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-light)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: 16, display: 'flex', color: 'var(--ink)' }}>
                          {l.icon === 'workspace' ? <WorkspaceIcon size={16} /> : l.icon === 'teams' ? <TeamsIcon size={16} /> : <TrophyIcon size={16} />}
                        </span>
                        {l.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification bell */}
              <div style={{ position: 'relative' }}>
                <button
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', fontSize: 18, lineHeight: 1, cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--ink)' }}
                  onClick={() => { setNotifOpen(!notifOpen); setMoreOpen(false); setAvatarOpen(false); }}
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                  <BellIcon count={unreadCount} style={{ position: 'static', width: 20, height: 20 }} />
                  {unreadCount > 0 && (
                    <div style={{ position: 'absolute', top: -2, right: -2, background: 'red', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {unreadCount}
                    </div>
                  )}
                </button>
                {notifOpen && (
                  <div className="notif-dropdown">
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: 0.5, textTransform: 'uppercase' }}
                          aria-label="Mark all notifications as read"
                        >Mark Read</button>
                      )}
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No notifications yet.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} onClick={() => handleNotifClick(n)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: n.read ? 'transparent' : 'var(--gold-light)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ fontSize: 18, display: 'flex', color: 'var(--muted)' }}>{n.type === 'swap_request' ? <SwapIcon size={18} /> : n.type === 'team_invite' ? <HandshakeIcon size={18} /> : <TrophyIcon size={18} />}</div>
                            <div>
                              <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.4 }}>{n.message}</div>
                              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar dropdown — desktop only */}
              <div ref={avatarRef} style={{ position: 'relative' }} className="hide-mobile">
                <button
                  onClick={() => { setAvatarOpen(!avatarOpen); setMoreOpen(false); setNotifOpen(false); }}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  aria-label="User menu"
                  aria-expanded={avatarOpen}
                >
                  <div className="nav-avatar" style={{ background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : user.avatarColor }}>
                    {!user.avatarUrl && initials(user.name)}
                  </div>
                </button>
                {avatarOpen && (
                  <div style={dropdownCommon}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user.email}</div>
                    </div>
                    <NavLink
                      to="/profile"
                      onClick={() => setAvatarOpen(false)}
                      style={{ ...dropdownItem, textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ display: 'flex', color: 'var(--ink)' }}><ProfileIcon size={16} /></span>
                      Profile
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      style={{ ...dropdownItem, borderBottom: 'none', color: 'var(--accent)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span style={{ display: 'flex' }}><LogoutIcon size={16} /></span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
                <NavLink to="/" onClick={closeMobileMenu}>Home</NavLink>
                <a href="/#how" onClick={closeMobileMenu}>How It Works</a>
              </div>
              <NavLink to="/login" onClick={closeMobileMenu}><button className="btn-cosmos btn-cosmos-ghost" style={{ padding: '8px 20px', fontSize: 11, border: '1.5px solid var(--border)', borderRadius: 6 }}>Sign In</button></NavLink>
              <NavLink to="/register" onClick={closeMobileMenu}><button className="btn-cosmos btn-cosmos-primary" style={{ padding: '8px 20px', fontSize: 11 }}>Get Started</button></NavLink>
            </>
          )}

          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        className={`nav-backdrop ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />
    </>
  );
}
