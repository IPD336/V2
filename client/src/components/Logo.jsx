import { useTheme } from '../context/ThemeContext';

export function LogoMark({ size = 32, style = {} }) {
  const { theme } = useTheme();
  const src = theme === 'light' ? '/logo_white.webp' : '/logo_dark.webp';
  return (
    <img src={src} alt="" width={size} height={size} style={{ objectFit: 'cover', borderRadius: 6, ...style }} />
  );
}

export default function Logo({ showText = true, size = 32 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      {showText && (
        <span style={{
          fontFamily: 'PT Serif, serif',
          fontSize: size >= 40 ? 24 : size >= 32 ? 20 : 16,
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
