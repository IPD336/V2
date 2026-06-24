import { useEffect, useRef, useState } from 'react';

/* ─── Data ──────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    num: '01', icon: '✦',
    title: 'Build Your Profile',
    desc: 'List the skills you offer and the ones you want to learn. Add your bio, location, and availability. Done in under 5 minutes.',
    color: 'var(--accent)', hex: '#C84B31',
    badge: 'Under 5 min',
    side: 'left',
  },
  {
    num: '02', icon: '⌕',
    title: 'Search & Browse',
    desc: 'Filter by category or search by keyword. The algorithm ranks partners by complementary skill gaps, experience levels, and timezone — not just keywords.',
    color: 'var(--sage)', hex: '#3A6351',
    badge: 'AI-powered',
    side: 'right',
  },
  {
    num: '03', icon: '⇄',
    title: 'Send a Swap Request',
    desc: 'Pick what you\'re offering and what you want, write a personal message, and propose a schedule — all in one flow.',
    color: 'var(--indigo)', hex: '#3B4F8C',
    badge: 'Instant notify',
    side: 'left',
  },
  {
    num: '04', icon: '★',
    title: 'Learn & Leave Feedback',
    desc: 'Complete your sessions. Rate your partner, describe what you gained. Every review builds community trust and your reputation.',
    color: 'var(--gold)', hex: '#B8902A',
    badge: 'Builds rep',
    side: 'right',
  },
];

// Fixed row height (desktop). All geometry derives from this.
const ROW_H = 260;

// Y-center of each node within the absolute SVG overlay
const nodeY = (i) => ROW_H * i + ROW_H / 2;

/* ─── Sub-component: Step content card ─────────────────────────────────── */

function StepCard({ step, isActive, isCurrent, align }) {
  return (
    <div style={{ maxWidth: 360, width: '100%', textAlign: align }}>

      {/* Large faded step number */}
      <div style={{
        fontFamily: 'PT Serif, serif',
        fontSize: 80,
        fontWeight: 700,
        lineHeight: 1,
        marginBottom: -28,
        color: step.color,
        opacity: isActive ? 0.13 : 0.05,
        transition: 'opacity 0.6s ease',
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        {step.num}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'PT Serif, serif',
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: -0.4,
        lineHeight: 1.2,
        marginBottom: 10,
        color: isActive ? 'var(--section-text)' : 'var(--section-text-muted)',
        transition: 'color 0.6s ease',
      }}>
        {step.title}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13,
        lineHeight: 1.75,
        color: 'var(--section-text-muted)',
        marginBottom: 16,
        opacity: isActive ? 0.85 : 0.4,
        transition: 'opacity 0.6s ease',
      }}>
        {step.desc}
      </div>

      {/* Badge pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '5px 13px',
        borderRadius: 24,
        background: isActive ? `${step.hex}1a` : 'transparent',
        border: `1px solid ${isActive ? `${step.hex}55` : 'var(--section-card-border)'}`,
        fontSize: 9.5,
        fontWeight: 700,
        fontFamily: "'PT Mono', monospace",
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: isActive ? step.color : 'var(--section-text-muted)',
        transition: 'all 0.6s ease',
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: isActive ? step.color : 'var(--section-text-muted)',
          flexShrink: 0,
          transition: 'background 0.6s ease',
          ...(isCurrent ? { animation: 'blink-dot 1.2s ease-in-out infinite' } : {}),
        }} />
        {step.badge}
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */

export default function SkillJourneyTimeline() {
  const [activeStep, setActiveStep] = useState(-1);
  const stepRefs  = useRef([]);
  const wrapRef   = useRef(null);

  // Observe each step row; light it up when it reaches ~40% visible
  useEffect(() => {
    const observers = stepRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveStep(prev => Math.max(prev, i));
          }
        },
        { threshold: 0.38, rootMargin: '0px 0px -8% 0px' },
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  // SVG line geometry
  const firstY       = nodeY(0);
  const lastY        = nodeY(STEPS.length - 1);
  const totalLen     = lastY - firstY;
  const drawnLen     = Math.max(activeStep, 0) * ROW_H;
  const dashOffset   = totalLen - drawnLen;
  const svgH         = ROW_H * STEPS.length;

  return (
    <div ref={wrapRef} style={{ position: 'relative', maxWidth: 1060, margin: '0 auto' }}>

      {/* ── Absolute SVG line ─────────────────────────────────────────── */}
      <svg
        width="80"
        height={svgH}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id="jrLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#C84B31" />
            <stop offset="33%"  stopColor="#3A6351" />
            <stop offset="66%"  stopColor="#3B4F8C" />
            <stop offset="100%" stopColor="#B8902A" />
          </linearGradient>
          {/* Glow filter for current node */}
          <filter id="nodeGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ghost track — always visible at low opacity */}
        <line
          x1="40" y1={firstY}
          x2="40" y2={lastY}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={2}
        />

        {/* Animated gradient foreground line */}
        <line
          x1="40" y1={firstY}
          x2="40" y2={lastY}
          stroke="url(#jrLineGrad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={totalLen}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 0.85s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Node circles */}
        {STEPS.map((step, i) => {
          const isActive  = i <= activeStep;
          const isCurrent = i === activeStep;
          const cy        = nodeY(i);

          return (
            <g key={step.num}>
              {/* Outer pulse ring — only on current active node */}
              {isCurrent && (
                <circle
                  cx={40} cy={cy} r={22}
                  fill="none"
                  stroke={step.hex}
                  strokeWidth={1}
                  opacity={0}
                  style={{ animation: 'node-pulse 2s ease-out infinite' }}
                />
              )}

              {/* Node outer ring */}
              <circle
                cx={40} cy={cy} r={16}
                fill={isActive ? step.hex : 'transparent'}
                stroke={isActive ? step.hex : 'rgba(255,255,255,0.2)'}
                strokeWidth={1.5}
                filter={isCurrent ? 'url(#nodeGlow)' : undefined}
                style={{ transition: 'fill 0.5s ease, stroke 0.5s ease' }}
              />

              {/* Node icon */}
              <text
                x={40} y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isActive ? 13 : 11}
                fill={isActive ? 'white' : 'rgba(255,255,255,0.35)'}
                fontFamily="'PT Sans', sans-serif"
                style={{ transition: 'all 0.5s ease' }}
              >
                {step.icon}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── Step rows ─────────────────────────────────────────────────── */}
      {STEPS.map((step, i) => {
        const isActive  = i <= activeStep;
        const isCurrent = i === activeStep;
        const isLeft    = step.side === 'left';

        return (
          <div
            key={step.num}
            ref={el => { stepRefs.current[i] = el; }}
            className="journey-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 1fr',
              alignItems: 'center',
              height: ROW_H,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Left column */}
            <div
              className="journey-left"
              style={{
                gridColumn: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: 48,
                opacity: isLeft ? (isActive ? 1 : 0.22) : 0,
                transform: isLeft
                  ? (isActive ? 'translateX(0)' : 'translateX(-22px)')
                  : 'translateX(0)',
                transition: 'opacity 0.65s ease, transform 0.65s ease',
                visibility: isLeft ? 'visible' : 'hidden',
                pointerEvents: isLeft ? 'auto' : 'none',
              }}
            >
              {isLeft && (
                <StepCard
                  step={step}
                  isActive={isActive}
                  isCurrent={isCurrent}
                  align="right"
                />
              )}
            </div>

            {/* Center spacer (SVG is absolutely positioned here) */}
            <div style={{ gridColumn: 2 }} />

            {/* Right column */}
            <div
              className="journey-right"
              style={{
                gridColumn: 3,
                display: 'flex',
                justifyContent: 'flex-start',
                paddingLeft: 48,
                opacity: !isLeft ? (isActive ? 1 : 0.22) : 0,
                transform: !isLeft
                  ? (isActive ? 'translateX(0)' : 'translateX(22px)')
                  : 'translateX(0)',
                transition: 'opacity 0.65s ease, transform 0.65s ease',
                visibility: !isLeft ? 'visible' : 'hidden',
                pointerEvents: !isLeft ? 'auto' : 'none',
              }}
            >
              {!isLeft && (
                <StepCard
                  step={step}
                  isActive={isActive}
                  isCurrent={isCurrent}
                  align="left"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
