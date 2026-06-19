/* ── Current: Circular Swap ──
   Two opposing curved arrows within a circle — skill exchange */
export function LogoMark({ size = 32, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={style} aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="var(--accent)" fillOpacity="0.08" stroke="var(--accent)" strokeWidth="1.8" />
      <path d="M6 14 C6 4, 26 4, 26 14" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M26 14 L21 11 M26 14 L21 17" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M26 18 C26 28, 6 28, 6 18" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M6 18 L11 15 M6 18 L11 21" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function Logo({ showText = true, size = 32 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <LogoMark size={size} />
      {showText && (
        <span style={{
          fontFamily: 'PT Serif, serif',
          fontSize: size >= 32 ? 22 : 18,
          fontWeight: 700,
          letterSpacing: -0.5,
          color: 'inherit',
        }}>
          SkillSwap
        </span>
      )}
    </span>
  );
}

export function BellIcon({ count = 0, style = {} }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', ...style }} aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -6,
          background: 'red', color: 'white',
          borderRadius: '50%', width: 16, height: 16,
          fontSize: 9, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}>
          {count}
        </span>
      )}
    </span>
  );
}
