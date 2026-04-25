import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav>
      <NavLink to={user ? '/browse' : '/'} className="logo">
        <div className="logo-mark">S²</div>
        SkillSwap
      </NavLink>

      {user ? (
        <>
          <div className="nav-links">
            {user?.role === 'admin' ? (
              <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} style={{ color: 'var(--accent)' }}>Admin Dashboard</NavLink>
            ) : (
              <>
                <NavLink to="/browse" className={({ isActive }) => isActive ? 'active' : ''}>Browse</NavLink>
                <NavLink to="/swaps" className={({ isActive }) => isActive ? 'active' : ''}>My Swaps</NavLink>
                <NavLink to="/teams" className={({ isActive }) => isActive ? 'active' : ''}>Teams</NavLink>
                <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'active' : ''}>Leaderboard</NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>
              </>
            )}
          </div>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              className="nav-avatar"
              style={{ background: user.avatarColor, cursor: 'default' }}
              title={user.name}
            >
              {initials(user.name)}
            </div>
            <button className="btn-ghost" onClick={handleLogout} title="Logout" style={{ padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Logout</span>
              <span style={{ fontSize: 16 }}>↪</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="nav-links">
            <NavLink to="/">Home</NavLink>
            <a href="/#how">How It Works</a>
          </div>
          <div className="nav-actions">
            <NavLink to="/login"><button className="btn-ghost">Sign In</button></NavLink>
            <NavLink to="/register"><button className="btn-accent">Get Started</button></NavLink>
          </div>
        </>
      )}
    </nav>
  );
}
