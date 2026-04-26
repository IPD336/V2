import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMobileMenuOpen(false); };
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

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
