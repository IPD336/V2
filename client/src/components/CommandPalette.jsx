import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SearchIcon, HomeIcon, SwapIcon, WorkspaceIcon, TeamsIcon, TrophyIcon, MedalIcon, ProfileIcon, CalendarIcon, HandshakeIcon, MailIcon, StarIcon, LogoutIcon } from './Icons';

const iconMap = {
  home: HomeIcon, swap: SwapIcon, workspace: WorkspaceIcon, teams: TeamsIcon,
  trophy: TrophyIcon, medal: MedalIcon, profile: ProfileIcon, calendar: CalendarIcon,
  handshake: HandshakeIcon, mail: MailIcon, star: StarIcon, logout: LogoutIcon, search: SearchIcon,
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const pages = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'home' },
    { id: 'browse', label: 'Browse', path: '/browse', icon: 'search' },
    { id: 'swaps', label: 'Swaps', path: '/swaps', icon: 'swap' },
    { id: 'profile', label: 'Profile', path: '/profile', icon: 'profile' },
    { id: 'badges', label: 'Badges', path: '/badges', icon: 'medal' },
    { id: 'workspaces', label: 'Workspaces', path: '/workspaces', icon: 'workspace' },
    { id: 'teams', label: 'Teams', path: '/teams', icon: 'teams' },
    { id: 'leaderboard', label: 'Leaderboard', path: '/leaderboard', icon: 'trophy' },
    { id: 'calendar', label: 'Calendar', path: '/calendar', icon: 'calendar' },
  ];

  const actions = [
    { id: 'add-skill', label: 'Add a Skill', action: () => navigate('/profile'), icon: 'star' },
    { id: 'saved', label: 'Saved Profiles', action: () => navigate('/profile'), icon: 'handshake' },
    { id: 'logout', label: 'Log Out', action: () => { logout(); setOpen(false); }, icon: 'logout' },
  ];

  const allItems = [
    ...pages.map(p => ({ ...p, type: 'page' })),
    ...actions.map(a => ({ ...a, type: 'action' })),
  ];

  const filtered = query.trim()
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  useEffect(() => {
    if (!resultsRef.current) return;
    const active = resultsRef.current.querySelector('.cmd-palette-item.active');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(p => !p);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const execute = useCallback((item) => {
    setOpen(false);
    if (item.type === 'page') navigate(item.path);
    else item.action();
  }, [navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIdx]) execute(filtered[activeIdx]);
    }
  };

  if (!open) return null;

  const grouped = [];
  let currentType = null;
  filtered.forEach(item => {
    if (item.type !== currentType) {
      currentType = item.type;
      grouped.push({ type: item.type, label: item.type === 'page' ? 'Pages' : 'Actions', items: [] });
    }
    grouped[grouped.length - 1].items.push(item);
  });

  let globalIdx = -1;

  return (
    <div className="cmd-palette-overlay" onClick={() => setOpen(false)}>
      <div className="cmd-palette" onClick={e => e.stopPropagation()}>
        <div className="cmd-palette-input-wrap">
          <SearchIcon size={18} />
          <input
            ref={inputRef}
            className="cmd-palette-input"
            placeholder="Type a command or page…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="cmd-palette-hint">ESC</span>
        </div>
        <div className="cmd-palette-results" ref={resultsRef}>
          {grouped.length === 0 ? (
            <div className="cmd-palette-empty">No results for "{query}"</div>
          ) : (
            grouped.map(group => (
              <div key={group.type}>
                <div className="cmd-palette-group-label">{group.label}</div>
                {group.items.map(item => {
                  globalIdx++;
                  const Icon = iconMap[item.icon] || SearchIcon;
                  return (
                    <div
                      key={item.id}
                      className={`cmd-palette-item ${globalIdx === activeIdx ? 'active' : ''}`}
                      onClick={() => execute(item)}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                      {item.type === 'page' && <span className="cmd-palette-shortcut">{item.path}</span>}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
