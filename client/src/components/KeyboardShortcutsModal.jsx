import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const isMac = navigator.platform.includes('Mac');
const mod = isMac ? '⌘' : 'Ctrl';

const sections = [
  {
    label: 'Navigation',
    items: [
      { desc: 'Dashboard', keys: ['D'] },
      { desc: 'Browse', keys: ['B'] },
      { desc: 'Swaps', keys: ['S'] },
      { desc: 'Profile', keys: ['P'] },
      { desc: 'Teams', keys: ['T'] },
      { desc: 'Calendar', keys: ['C'] },
      { desc: 'Workspaces', keys: ['W'] },
      { desc: 'Leaderboard', keys: ['L'] },
      { desc: 'Badges', keys: ['A'] },
    ],
  },
  {
    label: 'Actions',
    items: [
      { desc: 'Command palette', keys: [mod, 'K'] },
      { desc: 'New swap request', keys: ['N'] },
      { desc: 'Close / Back', keys: ['Esc'] },
      { desc: 'Shortcuts help', keys: ['?'] },
    ],
  },
  {
    label: 'Search',
    items: [
      { desc: 'Open search', keys: [mod, 'K'] },
      { desc: 'Focus search', keys: ['/'] },
    ],
  },
  {
    label: 'Composing',
    items: [
      { desc: 'New swap request', keys: ['N'] },
    ],
  },
];

const pageMap = {
  d: '/dashboard', b: '/browse', s: '/swaps', p: '/profile',
  t: '/teams', c: '/calendar', w: '/workspaces', l: '/leaderboard', a: '/badges',
};

function ShortcutsContent() {
  return (
    <div className="shortcuts-grid">
      {sections.map(section => (
        <div key={section.label}>
          <h4 className="shortcuts-section-label">{section.label}</h4>
          <div className="shortcuts-section-rows">
            {section.items.map(item => (
              <div key={item.desc} className="shortcuts-row">
                <span className="shortcuts-desc">{item.desc}</span>
                <span className="shortcuts-key-wrap">
                  {item.keys.map((key, i) => (
                    <span key={i} className="shortcuts-key-group">
                      {i > 0 && <span className="shortcuts-key-plus">+</span>}
                      <kbd className="shortcuts-key">{key}</kbd>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handler = (e) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (document.activeElement === document.body || e.target === document.body) {
          setAnchor(null);
          setOpen(p => !p);
        }
        return;
      }
      if (e.key === 'Escape') { setOpen(false); return; }

      if (!user) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      const key = e.key.toLowerCase();
      if (pageMap[key]) {
        e.preventDefault();
        navigate(pageMap[key]);
      }
      if (key === 'n') {
        e.preventDefault();
        navigate('/swaps');
      }
    };
    const toggleHandler = (e) => {
      setAnchor(e.detail ? { x: e.detail.x, y: e.detail.y, width: e.detail.width } : null);
      setOpen(p => !p);
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('opencode:toggle-shortcuts', toggleHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('opencode:toggle-shortcuts', toggleHandler);
    };
  }, [navigate, user]);

  useEffect(() => {
    if (!open || !anchor || !modalRef.current) return;
    const modal = modalRef.current;
    const rect = modal.getBoundingClientRect();
    const maxY = window.innerHeight - rect.height - 8;
    const top = Math.min(anchor.y, maxY);
    modal.style.position = 'fixed';
    modal.style.top = `${Math.max(8, top)}px`;
    modal.style.left = `${anchor.x}px`;
    modal.style.margin = '0';
  }, [open, anchor]);

  if (!open) return null;

  return (
    <div className={anchor ? 'shortcuts-overlay' : 'shortcuts-modal-overlay'} onClick={() => setOpen(false)}>
      <div ref={modalRef} className="shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-modal-header">
          <span className="shortcuts-modal-title">Keyboard shortcuts</span>
          <button className="shortcuts-modal-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
        <div className="shortcuts-modal-body">
          <ShortcutsContent />
        </div>
      </div>
    </div>
  );
}
