import { useState, useEffect } from 'react';

const GIF_URL = '/splash.gif';

const DISPLAY_MS  = 3000;   // how long the splash stays fully visible
const FADE_OUT_MS = 600;    // CSS transition duration

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('visible'); // 'visible' | 'fading' | 'gone'

  useEffect(() => {
    // Start fade-out after DISPLAY_MS
    const fadeTimer = setTimeout(() => setPhase('fading'), DISPLAY_MS);
    // Fully unmount after fade completes
    const doneTimer = setTimeout(() => {
      setPhase('gone');
      onDone();
    }, DISPLAY_MS + FADE_OUT_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  // Allow clicking to skip
  const skip = () => {
    setPhase('fading');
    setTimeout(() => {
      setPhase('gone');
      onDone();
    }, FADE_OUT_MS);
  };

  if (phase === 'gone') return null;

  return (
    <div
      onClick={skip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ink)',
        cursor: 'pointer',
        opacity: phase === 'fading' ? 0 : 1,
        transition: `opacity ${FADE_OUT_MS}ms cubic-bezier(0.4,0,0.2,1)`,
      }}
      aria-label="Intro splash — click to skip"
    >
      {/* Subtle warm radial glow behind the GIF */}
      <div style={{
        position: 'absolute',
        width: 520,
        height: 520,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,75,49,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* The GIF */}
      <img
        src={GIF_URL}
        alt="SkillSwap intro animation"
        style={{
          width: 'min(380px, 80vw)',
          height: 'auto',
          borderRadius: 16,
          position: 'relative',
          zIndex: 1,
          // Subtle scale-in on mount
          animation: 'splash-scale-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      />

      {/* Branding below the GIF */}
      <div style={{
        marginTop: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
        zIndex: 1,
        animation: 'splash-fade-up 0.6s 0.2s ease both',
      }}>
        <div style={{
          fontFamily: 'PT Serif, serif',
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--card-bg)',
          letterSpacing: -0.5,
        }}>
          Skill<span style={{ color: 'var(--accent)' }}>Swap</span>
        </div>
        <div style={{
          fontFamily: 'PT Sans, sans-serif',
          fontSize: 12,
          color: 'var(--muted)',
          letterSpacing: 3,
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          Trade · Learn · Grow
        </div>
      </div>

      {/* Skip hint */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        fontFamily: 'PT Sans, sans-serif',
        fontSize: 11,
        color: 'var(--muted)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        animation: 'splash-fade-up 0.6s 0.8s ease both',
      }}>
        Click anywhere to skip
      </div>
    </div>
  );
}
