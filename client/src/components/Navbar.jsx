import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { initials } from '../utils';
import Logo from './Logo';
import { BellIcon } from './Logo';
import { MoonIcon, SunIcon, WorkspaceIcon, TeamsIcon, TrophyIcon, ProfileIcon, LogoutIcon, SwapIcon, HandshakeIcon, CalendarIcon } from './Icons';

const moreLinks = [
  { to: '/calendar', label: 'Calendar', icon: 'calendar' },
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

  return (
    <>
      <nav>
        <div className="nav-gradient-line" />
        <NavLink to={user ? '/dashboard' : '/'} className="logo" onClick={closeMobileMenu}>
          <Logo size={32} />
        </NavLink>

        <div className="nav-actions">
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="nav-icon-btn"
          >
            {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
          </button>

          {user ? (
            <>
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
                          {l.icon === 'calendar' ? <CalendarIcon size={16} /> : l.icon === 'workspace' ? <WorkspaceIcon size={16} /> : l.icon === 'teams' ? <TeamsIcon size={16} /> : <TrophyIcon size={16} />}
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
              </div>
              <NavLink to="/login" onClick={closeMobileMenu}>
                <button className="btn-cosmos btn-cosmos-ghost nav-signin-btn">Sign In</button>
              </NavLink>
              <NavLink to="/register" onClick={closeMobileMenu}>
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
