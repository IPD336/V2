import { useState } from 'react';
import { MoonIcon, SunIcon, SearchIcon, CommandIcon } from '../components/Icons';
import { BellIcon } from '../components/Logo';
import Logo from '../components/Logo';
import './NavbarPreview.css';

const styles = [
  { id: 'classic-warm', name: '1. Classic Warm', desc: 'The default SkillSwap nav. Cream bg, ember underline.' },
  { id: 'glass-float', name: '2. Glass Float', desc: 'Floating frosted capsule with backdrop blur.' },
  { id: 'ink-bar', name: '3. Ink Bar', desc: 'Dark ink background, cream text. Bold contrast.' },
  { id: 'warm-glow', name: '4. Warm Glow', desc: 'Soft warm shadow halo around the bar.' },
  { id: 'split-tone', name: '5. Split Tone', desc: 'Dark logo half, cream link half. Two-zone.' },
  { id: 'pill-nav', name: '6. Pill Nav', desc: 'Each link is a rounded pill button.' },
  { id: 'minimal-line', name: '7. Minimal Line', desc: 'Hairline accent border, transparent bg.' },
  { id: 'brutalist', name: '8. Brutalist', desc: 'Raw 2px borders, PT Mono. Anti-design.' },
  { id: 'serif-editorial', name: '9. Serif Editorial', desc: 'Large PT Serif type. Magazine editorial.' },
  { id: 'card-strip', name: '10. Card Strip', desc: 'Links as floating warm cards in a row.' },
  { id: 'dual-row', name: '11. Dual Row', desc: 'Thin utility strip + thick main nav.' },
  { id: 'dense-strip', name: '12. Dense Strip', desc: '44px ultra-compact. Max density.' },
  { id: 'micro-bar', name: '13. Micro Bar', desc: '40px terminal-status-bar density.' },
  { id: 'accent-top', name: '14. Accent Top', desc: '2px ember accent line at the very top.' },
  { id: 'swiss-grid', name: '15. Swiss Grid', desc: 'Geometric grid-aligned links.' },
  { id: 'hero-center', name: '16. Hero Center', desc: 'Logo huge centered, links small below.' },
  { id: 'soft-shadow', name: '17. Soft Shadow', desc: 'Rounded, soft box-shadow, friendly feel.' },
  { id: 'bottom-tabs', name: '18. Bottom Tabs', desc: 'App-style bottom tab bar with icons.' },
  { id: 'overlay-trigger', name: '19. Overlay Trigger', desc: 'Logo + hamburger only. Nav hidden.' },
  { id: 'centered-pills', name: '20. Centered Pills', desc: 'Logo top, warm pill links centered.' },
];

const links = [
  { label: 'Dashboard', active: false },
  { label: 'Browse', active: true },
  { label: 'Swaps', active: false },
];
const moreLinks = ['Calendar', 'Workspaces', 'Teams'];
const allLinks = [...links, ...moreLinks.map(l => ({ label: l, active: false }))];

const tabIcons = {
  Dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Browse: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Swaps: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>,
  Calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Workspaces: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
};

export default function NavbarPreview() {
  const [selected, setSelected] = useState('glass-float');
  const [dark, setDark] = useState(false);
  const isBottom = selected === 'bottom-tabs';
  const isOverlay = selected === 'overlay-trigger';

  return (
    <div className={`np-page ${dark ? 'np-dark' : ''}`}>
      {/* ── BOTTOM TABS (special layout) ── */}
      {isBottom && (
        <div className="np-bottom-bar">
          {allLinks.slice(0, 5).map(l => (
            <a key={l.label} href="#" onClick={e => e.preventDefault()} className={`np-bottom-tab ${l.active ? 'active' : ''}`}>
              {tabIcons[l.label]}
              <span>{l.label}</span>
            </a>
          ))}
        </div>
      )}

      {/* ── ALL HORIZONTAL / FLOATING NAVS ── */}
      <div className={`np-live-bar ${['glass-float','warm-glow','soft-shadow'].includes(selected) ? 'np-floating-wrapper' : ''}`}>
        <nav className={`np-nav np-${selected}`}>
          <div className="np-nav-inner">
            {isOverlay ? (
              <>
                <a className="np-logo" href="#" onClick={e => e.preventDefault()}>
                  <Logo size={40} />
                </a>
                <div className="np-overlay-links">
                  {allLinks.map(l => (
                    <a key={l.label} href="#" onClick={e => e.preventDefault()} className={`np-link ${l.active ? 'active' : ''}`}>{l.label}</a>
                  ))}
                </div>
                <button className="np-icon-btn np-hamburger" aria-label="Menu">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
              </>
            ) : (
              <>
                <a className="np-logo" href="#" onClick={e => e.preventDefault()}>
                  {selected === 'split-tone' ? <Logo size={40} showText={false} /> : <Logo size={40} />}
                </a>
                {selected === 'split-tone' && <div className="np-split-divider" />}
                {selected === 'hero-center' ? (
                  <div className="np-hero-links">
                    {links.map(l => (
                      <a key={l.label} href="#" onClick={e => e.preventDefault()} className={`np-link ${l.active ? 'active' : ''}`}>{l.label}</a>
                    ))}
                    <span className="np-more-label">More ▾</span>
                  </div>
                ) : (
                  <div className="np-nav-center">
                    {links.map(l => (
                      <a key={l.label} href="#" onClick={e => e.preventDefault()} className={`np-link ${l.active ? 'active' : ''}`}>{l.label}</a>
                    ))}
                    <span className="np-more-label">More ▾</span>
                    {moreLinks.map(l => (
                      <a key={l} href="#" onClick={e => e.preventDefault()} className="np-link np-link-more">{l}</a>
                    ))}
                  </div>
                )}
                <div className="np-nav-right">
                  <button className="np-icon-btn" aria-label="Search"><SearchIcon size={14} /></button>
                  <button className="np-icon-btn" aria-label="Shortcuts"><CommandIcon size={14} /></button>
                  <button className="np-icon-btn" onClick={() => setDark(!dark)} aria-label="Theme">
                    {dark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
                  </button>
                  <button className="np-icon-btn np-bell" aria-label="Notifications">
                    <BellIcon size={16} style={{ position: 'static', width: 18, height: 18 }} />
                    <span className="np-notif-dot">3</span>
                  </button>
                  <div className="np-avatar"><span>JD</span></div>
                </div>
              </>
            )}
          </div>
          {/* Dual Row: second row of links */}
          {selected === 'dual-row' && (
            <div className="np-nav-second-row">
              {moreLinks.map(l => (
                <a key={l} href="#" onClick={e => e.preventDefault()} className="np-link np-second-link">{l}</a>
              ))}
            </div>
          )}
        </nav>
      </div>

      {/* ── CONTENT ── */}
      <div className={`np-content ${isBottom ? 'np-content-bottom' : ''}`}>
        <div className="np-header">
          <h1 className="np-title">Navbar Style Picker</h1>
          <p className="np-subtitle">Click a style — the nav updates live. Toggle dark/light with the theme icon.</p>
          <div className="np-selected-badge">
            Active: <strong>{styles.find(s => s.id === selected)?.name}</strong>
            <span className="np-mode-badge">{dark ? 'Dark' : 'Light'}</span>
          </div>
        </div>
        <div className="np-grid">
          {styles.map(s => (
            <div
              key={s.id}
              className={`np-card ${selected === s.id ? 'np-selected' : ''}`}
              onClick={() => setSelected(s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelected(s.id); }}
            >
              <div className="np-card-header">
                <span className="np-card-name">{s.name}</span>
                {selected === s.id && <span className="np-card-check">✓</span>}
              </div>
              <p className="np-card-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
