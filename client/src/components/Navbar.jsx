import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead } = useSocket() || { notifications: [], unreadCount: 0, markAsRead: () => {} };
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMobileMenuOpen(false); };
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => { setMobileMenuOpen(false); setNotifOpen(false); };

  const handleNotifClick = (n) => {
    markAsRead(n._id);
    setNotifOpen(false);
    if (n.type === 'swap_request') navigate('/swaps');
    else if (n.type === 'team_invite') navigate('/teams');
    else navigate('/profile');
  };

  return (
    <>
      <nav>
        <NavLink to={user ? '/browse' : '/'} className="logo" onClick={closeMobileMenu}>
          <div className="logo-mark">S²</div>
          SkillSwap
        </NavLink>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className="theme-toggle" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <>
              <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
                {user?.role === 'admin' ? (
                  <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu} style={{ color: 'var(--accent)' }}>Admin Dashboard</NavLink>
                ) : (
                  <>
                    <NavLink to="/browse" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Browse</NavLink>
                    <NavLink to="/swaps" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>My Swaps</NavLink>
                    <NavLink to="/teams" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Teams</NavLink>
                    <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Leaderboard</NavLink>
                    <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMobileMenu}>Profile</NavLink>
                  </>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <button 
                  className="btn-ghost" 
                  style={{ fontSize: 20, padding: '4px 8px', position: 'relative' }} 
                  onClick={() => setNotifOpen(!notifOpen)}
                >
                  🔔
                  {unreadCount > 0 && (
                    <div style={{ position: 'absolute', top: 2, right: 2, background: 'red', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {unreadCount}
                    </div>
                  )}
                </button>
                {notifOpen && (
                  <div className="dropdown" style={{ position: 'absolute', top: 50, right: -10, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, width: 320, maxWidth: 'calc(100vw - 40px)', zIndex: 9999, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--ink)' }}>Notifications</div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No notifications yet.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n._id} onClick={() => handleNotifClick(n)} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: n.read ? 'transparent' : 'var(--gold-light)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ fontSize: 18 }}>{n.type === 'swap_request' ? '🔄' : n.type === 'team_invite' ? '🤝' : '🏆'}</div>
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
              <div className="nav-avatar" style={{ background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : user.avatarColor, cursor: 'default' }} title={user.name}>
                {!user.avatarUrl && initials(user.name)}
              </div>
              <button className="btn-ghost" onClick={handleLogout} title="Logout" style={{ padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="hide-mobile">Logout</span>
                <span style={{ fontSize: 16 }}>↪</span>
              </button>
            </>
          ) : (
            <>
              <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
                <NavLink to="/" onClick={closeMobileMenu}>Home</NavLink>
                <a href="/#how" onClick={closeMobileMenu}>How It Works</a>
              </div>
              <NavLink to="/login" onClick={closeMobileMenu}><button className="btn-ghost">Sign In</button></NavLink>
              <NavLink to="/register" onClick={closeMobileMenu}><button className="btn-accent hide-mobile">Get Started</button></NavLink>
            </>
          )}

          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Backdrop — closes mobile menu on tap, blocks page interaction */}
      <div
        className={`nav-backdrop ${mobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />
    </>
  );
}
