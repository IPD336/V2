import { NavLink } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { HomeIcon, SearchIcon, SwapIcon, WorkspaceIcon, TeamsIcon, ProfileIcon, TrophyIcon, CalendarIcon } from './Icons';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: HomeIcon },
  { to: '/browse', label: 'Browse', icon: SearchIcon },
  { to: '/swaps', label: 'Swaps', icon: SwapIcon },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
];

export default function MobileBottomNav() {
  const { unreadCount } = useSocket() || { unreadCount: 0 };

  return (
    <div className="mobile-bottom-nav" role="navigation" aria-label="Main navigation">
      <div className="mobile-bottom-nav-inner">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => `mobile-bottom-tab${isActive ? ' active' : ''}`}
          >
            <span className="mobile-bottom-icon">
              <t.icon size={20} />
              {t.to === '/swaps' && unreadCount > 0 && (
                <span className="mobile-bottom-badge">{unreadCount}</span>
              )}
            </span>
            <span className="mobile-bottom-label">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
