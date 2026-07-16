import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { initials } from '../utils';
import Logo from './Logo';
import { BellIcon } from './Logo';
import { WorkspaceIcon, TeamsIcon, TrophyIcon, ProfileIcon, LogoutIcon, SwapIcon, HandshakeIcon, CalendarIcon, MedalIcon, SearchIcon, CommandIcon, PaletteIcon } from './Icons';
import ThemeToggleButton from './ThemeToggleButton';

const moreLinks = [
  { to: '/calendar', label: 'Calendar', icon: 'calendar' },
  { to: '/workspaces', label: 'Workspaces', icon: 'workspace' },
  { to: '/teams', label: 'Teams', icon: 'teams' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
  { to: '/badges', label: 'Medal', icon: 'medal' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification } = useSocket() || { notifications: [], unreadCount: 0, markAsRead: () => {}, markAllAsRead: () => {} };
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
    const notifHandler = () => setNotifOpen(p => !p);
    window.addEventListener('opencode:toggle-notifications', notifHandler);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('opencode:toggle-notifications', notifHandler);
    };
  }, []);

  const handleNotifClick = (n) => {
    dismissNotification(n._id);
    setNotifOpen(false);
    setMobileMenuOpen(false);
    if (n.type === 'swap_request') navigate('/swaps');
    else if (n.type === 'team_invite') navigate('/teams');
    else navigate('/profile');
  };

  return (
    <>
      <nav>
        <div className="nav-gradient-line" />
        <NavLink to={user ? '/dashboard' : '/'} className="logo" onClick={closeMobileMenu}>
          <Logo size={60} />
        </NavLink>

        <div className="nav-actions">
          <ThemeToggleButton />

          {user ? (
            <>
              <button
                className="nav-search-btn hide-mobile"
                onClick={() => window.dispatchEvent(new CustomEvent('opencode:toggle-palette'))}
                aria-label="Open command palette"
                title="Search pages & commands"
              >
                <SearchIcon size={14} />
                <span className="nav-search-text">Search…</span>
              </button>

              <button
                className="nav-icon-btn hide-mobile"
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  window.dispatchEvent(new CustomEvent('opencode:toggle-shortcuts', {
                    detail: { x: rect.left, y: rect.bottom, width: rect.width },
                  }));
                }}
                aria-label="Keyboard shortcuts"
                title="Show keyboard shortcuts"
              >
                <CommandIcon size={16} />
              </button>

              <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
                {user?.role === 'admin' ? (
                  <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu} style={{ color: 'var(--accent)' }}>Admin Dashboard</NavLink>
                ) : (
                  <>
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Dashboard</NavLink>
                    <NavLink to="/browse" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Browse</NavLink>
                    <NavLink to="/swaps" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Swaps</NavLink>
                    {moreLinks.map((l) => (
                      <NavLink key={l.to} to={l.to} className={({ isActive }) => `hide-desktop ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>{l.label}</NavLink>
                    ))}
                    <NavLink to="/profile" className={({ isActive }) => `hide-desktop ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>Profile</NavLink>
                    <button className="mobile-only-flex nav-mobile-notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                      Notifications {unreadCount > 0 && <span className="nav-notif-badge-sm">{unreadCount} new</span>}
                    </button>
                    <button className="mobile-only-flex nav-mobile-logout-btn" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                )}
              </div>

              <div ref={moreRef} className="hide-mobile nav-dropdown-wrap">
                <button
                  onClick={() => { setMoreOpen(!moreOpen); setAvatarOpen(false); setNotifOpen(false); }}
                  className="nav-more-btn"
                  aria-label="More navigation"
                  aria-expanded={moreOpen}
                >
                  More <span className="nav-chevron">▾</span>
                </button>
                {moreOpen && (
                  <div className="nav-dropdown">
                    {moreLinks.map((l) => (
                      <NavLink
                        key={l.to}
                        to={l.to}
                        onClick={() => setMoreOpen(false)}
                        className="nav-dropdown-item"
                      >
                        <span className="nav-dropdown-icon">
                          {l.icon === 'calendar' ? <CalendarIcon size={16} /> : l.icon === 'workspace' ? <WorkspaceIcon size={16} /> : l.icon === 'teams' ? <TeamsIcon size={16} /> : l.icon === 'medal' ? <MedalIcon size={16} /> : l.icon === 'palette' ? <PaletteIcon size={16} /> : <TrophyIcon size={16} />}
                        </span>
                        {l.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              <div className="nav-dropdown-wrap">
                <button
                  className="nav-icon-btn nav-bell-btn"
                  onClick={() => { setNotifOpen(!notifOpen); setMoreOpen(false); setAvatarOpen(false); }}
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                  <BellIcon count={unreadCount} style={{ position: 'static', width: 20, height: 20 }} />
                  {unreadCount > 0 && (
                    <div className="nav-notif-dot">{unreadCount}</div>
                  )}
                </button>
                {notifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <span className="notif-header-title">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="notif-mark-read-btn" aria-label="Mark all notifications as read">Mark Read</button>
                      )}
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">No notifications yet.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} onClick={() => handleNotifClick(n)} className={`notif-item ${n.read ? '' : 'notif-unread'}`}>
                            <div className="notif-item-icon">
                              {n.type === 'swap_request' ? <SwapIcon size={18} /> : n.type === 'team_invite' ? <HandshakeIcon size={18} /> : <TrophyIcon size={18} />}
                            </div>
                            <div>
                              <div className="notif-item-text">{n.message}</div>
                              <div className="notif-item-date">{new Date(n.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div ref={avatarRef} className="nav-dropdown-wrap">
                <button
                  onClick={() => { setAvatarOpen(!avatarOpen); setMoreOpen(false); setNotifOpen(false); }}
                  className="nav-avatar-btn"
                  aria-label="User menu"
                  aria-expanded={avatarOpen}
                >
                  <div className="nav-avatar" style={{ background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : user.avatarColor }}>
                    {!user.avatarUrl && initials(user.name)}
                  </div>
                </button>
                {avatarOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-user">
                      <div className="nav-dropdown-user-name">{user.name}</div>
                      <div className="nav-dropdown-user-email">{user.email}</div>
                    </div>
                    <NavLink to="/profile" onClick={() => setAvatarOpen(false)} className="nav-dropdown-item nav-dropdown-item-border">
                      <span className="nav-dropdown-icon"><ProfileIcon size={16} /></span>
                      Profile
                    </NavLink>
                    <NavLink to="/workspaces" onClick={() => setAvatarOpen(false)} className="nav-dropdown-item hide-desktop">
                      <span className="nav-dropdown-icon"><WorkspaceIcon size={16} /></span>
                      Workspaces
                    </NavLink>
                    <NavLink to="/teams" onClick={() => setAvatarOpen(false)} className="nav-dropdown-item hide-desktop">
                      <span className="nav-dropdown-icon"><TeamsIcon size={16} /></span>
                      Teams
                    </NavLink>
                    <NavLink to="/leaderboard" onClick={() => setAvatarOpen(false)} className="nav-dropdown-item hide-desktop">
                      <span className="nav-dropdown-icon"><TrophyIcon size={16} /></span>
                      Leaderboard
                    </NavLink>
                    <NavLink to="/badges" onClick={() => setAvatarOpen(false)} className="nav-dropdown-item hide-desktop">
                      <span className="nav-dropdown-icon"><MedalIcon size={16} /></span>
                      Badges
                    </NavLink>
                    <button onClick={handleLogout} className="nav-dropdown-item nav-dropdown-logout">
                      <span className="nav-dropdown-icon"><LogoutIcon size={16} /></span>
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
                <NavLink to="/login" onClick={closeMobileMenu} className="hide-desktop">Sign In</NavLink>
                <NavLink to="/register" onClick={closeMobileMenu} className="hide-desktop">Get Started</NavLink>
              </div>
              <NavLink to="/login" onClick={closeMobileMenu} className="hide-mobile">
                <button className="btn-cosmos btn-cosmos-ghost nav-signin-btn">Sign In</button>
              </NavLink>
              <NavLink to="/register" onClick={closeMobileMenu} className="hide-mobile">
                <button className="btn-cosmos btn-cosmos-primary nav-getstarted-btn">Get Started</button>
              </NavLink>
            </>
          )}

          {!user && (
            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>

      <div className={`nav-backdrop ${mobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu} aria-hidden="true" />
    </>
  );
}
