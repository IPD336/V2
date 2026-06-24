import { useEffect, useRef, useState } from 'react';

/* ─── Tier definitions ──────────────────────────────────────────────────── */

const TIERS = [
  { name: 'Bronze',   threshold: 0,   color: '#CD7F32', glow: '#CD7F3266', emoji: '🥉' },
  { name: 'Silver',   threshold: 25,  color: '#A8A9AD', glow: '#A8A9AD66', emoji: '🥈' },
  { name: 'Gold',     threshold: 50,  color: '#B8902A', glow: '#c9a04066', emoji: '🥇' },
  { name: 'Platinum', threshold: 72,  color: '#8097D4', glow: '#8097d466', emoji: '💎' },
  { name: 'Diamond',  threshold: 90,  color: '#85e3ff', glow: '#85e3ff55', emoji: '✦'  },
];

// The demo fills to this percentage
const TARGET_PERCENT = 87;

/* ─── SVG helpers ────────────────────────────────────────────────────────── */

const CX = 200;     // viewBox centre x
const CY = 210;     // viewBox centre y (slightly lower for label room)
const R  = 150;     // ring radius
const STROKE = 22;  // ring thickness

// Start at 12 o'clock (−90°) and sweep clockwise 270° total (not full circle — leaves a gap at bottom)
const ARC_START_DEG = -225;
const ARC_SWEEP_DEG = 270;

function degToRad(d) { return (d * Math.PI) / 180; }

function polarToXY(angleDeg, r = R) {
  const a = degToRad(angleDeg);
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

// Returns SVG arc path for a sweep of `sweepDeg` degrees starting at ARC_START_DEG
function arcPath(sweepDeg) {
  if (sweepDeg <= 0) return '';
  const clamp = Math.min(sweepDeg, ARC_SWEEP_DEG);
  const startAngle = ARC_START_DEG;
  const endAngle   = startAngle + clamp;
  const s = polarToXY(startAngle);
  const e = polarToXY(endAngle);
  const largeArc = clamp > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

// Convert a percentage (0-100) to a sweep degree within the arc
function pctToDeg(pct) { return (pct / 100) * ARC_SWEEP_DEG; }

// Circumference-equivalent path length for a dash trick
const ARC_LENGTH = 2 * Math.PI * R * (ARC_SWEEP_DEG / 360);

/* ─── Particle system ────────────────────────────────────────────────────── */

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function spawnParticles(angleDeg, color) {
  const { x, y } = polarToXY(angleDeg);
  return Array.from({ length: 14 }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    x, y,
    vx: randomBetween(-3.5, 3.5),
    vy: randomBetween(-4, 1),
    life: 1,
    size: randomBetween(2, 5),
    color,
  }));
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function TierLabel({ tier, isActive, isNext, isCurrent }) {
  const angleDeg = ARC_START_DEG + pctToDeg(tier.threshold);
  const labelR = R + 38;
  const { x, y } = polarToXY(angleDeg, labelR);

  return (
    <g style={{ transition: 'opacity 0.5s ease' }}>
      {/* tick mark on ring */}
      {(() => {
        const inner = polarToXY(angleDeg, R - STROKE / 2 - 2);
        const outer = polarToXY(angleDeg, R + STROKE / 2 + 2);
        return (
          <line
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke={isActive ? tier.color : 'rgba(255,255,255,0.2)'}
            strokeWidth={isActive ? 2 : 1}
            style={{ transition: 'stroke 0.4s ease' }}
          />
        );
      })()}

      {/* label bubble */}
      <foreignObject
        x={x - 36} y={y - 18}
        width={72} height={36}
        style={{ overflow: 'visible' }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '3px 9px',
            borderRadius: 20,
            background: isActive ? `${tier.color}22` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isActive ? `${tier.color}88` : 'rgba(255,255,255,0.12)'}`,
            fontSize: 9,
            fontWeight: 700,
            fontFamily: "'PT Mono', monospace",
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            color: isActive ? tier.color : 'rgba(255,255,255,0.3)',
            whiteSpace: 'nowrap',
            transition: 'all 0.4s ease',
            ...(isCurrent ? { boxShadow: `0 0 10px ${tier.glow}` } : {}),
          }}
        >
          <span style={{ fontSize: 11 }}>{tier.emoji}</span>
          {tier.name}
        </div>
      </foreignObject>
    </g>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export default function TierProgressRing() {
  const [displayPct, setDisplayPct] = useState(0);
  const [particles, setParticles]   = useState([]);
  const [burstDone, setBurstDone]   = useState(new Set());
  const rafRef      = useRef(null);
  const sectionRef  = useRef(null);
  const startTime   = useRef(null);
  const hasStarted  = useRef(false);   // ref — never causes re-renders
  const DURATION    = 2400;

  // Determine which tier is "current" based on displayPct
  const activeTiers = TIERS.filter(t => t.threshold <= displayPct);
  const currentTier = activeTiers[activeTiers.length - 1] ?? TIERS[0];

  // Gradient stops — interpolate between tier colours along the arc
  const gradientId = 'tierArcGrad';

  /* Particle animation loop — keyed on particle count, not a boolean expression */
  const particleCount = particles.length;
  useEffect(() => {
    if (particleCount === 0) return;
    let animId;
    const tick = () => {
      setParticles(prev => {
        const next = prev
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy + 0.15, vy: p.vy + 0.18, life: p.life - 0.025 }))
          .filter(p => p.life > 0);
        return next;
      });
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [particleCount]);

  /* IntersectionObserver + sweep — all in one stable effect, no useCallback needed */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const runSweep = () => {
      if (hasStarted.current) return;
      hasStarted.current = true;
      startTime.current = performance.now();

      const frame = (now) => {
        const elapsed = now - startTime.current;
        const t = Math.min(elapsed / DURATION, 1);
        const pct = easeOut(t) * TARGET_PERCENT;
        setDisplayPct(pct);

        // Particle bursts at tier crossings
        TIERS.forEach(tier => {
          if (tier.threshold > 0 && pct >= tier.threshold) {
            setBurstDone(prev => {
              if (!prev.has(tier.name)) {
                const angleDeg = ARC_START_DEG + pctToDeg(tier.threshold);
                setParticles(p => [...p, ...spawnParticles(angleDeg, tier.color)]);
                return new Set([...prev, tier.name]);
              }
              return prev;
            });
          }
        });

        if (t < 1) {
          rafRef.current = requestAnimationFrame(frame);
        }
      };

      rafRef.current = requestAnimationFrame(frame);
    };

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) runSweep(); },
      { threshold: 0.25 }
    );
    obs.observe(el);

    // Cleanup only disconnects the observer — does NOT cancel the RAF
    // so the animation continues even after the element leaves/re-enters view
    return () => obs.disconnect();
  }, []); // empty deps — runs once on mount, stable forever

  const sweepDeg = pctToDeg(displayPct);
  const trackPath = arcPath(ARC_SWEEP_DEG);
  const fillPath  = arcPath(sweepDeg);

  // Tip of the arc — glowing dot
  const tipAngle = ARC_START_DEG + sweepDeg;
  const tip = sweepDeg > 0 ? polarToXY(tipAngle) : null;

  // Score display
  const displayScore = Math.round(displayPct * 10); // out of 1000

  return (
    <div ref={sectionRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>

      {/* SVG ring */}
      <svg
        viewBox="0 0 400 380"
        width="440"
        height="420"
        style={{ overflow: 'visible', maxWidth: '100%' }}
        aria-label="Tier progress ring"
      >
        <defs>
          {/* Gradient that sweeps along the arc colours */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#CD7F32" />
            <stop offset="28%"  stopColor="#A8A9AD" />
            <stop offset="54%"  stopColor="#c9a040" />
            <stop offset="78%"  stopColor="#8097D4" />
            <stop offset="100%" stopColor="#85e3ff" />
          </linearGradient>

          {/* Glow filter for tip dot */}
          <filter id="tipGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft glow for filled arc */}
          <filter id="arcGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Track (ghost) ── */}
        <path
          d={trackPath}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />

        {/* ── Filled arc (glow layer, slightly wider) ── */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE + 6}
            strokeLinecap="round"
            opacity={0.35}
            filter="url(#arcGlow)"
          />
        )}

        {/* ── Filled arc (crisp top layer) ── */}
        {fillPath && (
          <path
            d={fillPath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        )}

        {/* ── Glowing tip dot ── */}
        {tip && sweepDeg > 2 && (
          <circle
            cx={tip.x} cy={tip.y} r={10}
            fill={currentTier.color}
            filter="url(#tipGlow)"
          >
            <animate attributeName="r" values="9;12;9" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.6;1" dur="1.6s" repeatCount="indefinite" />
          </circle>
        )}

        {/* ── Tier labels around the arc ── */}
        {TIERS.map((tier, i) => (
          <TierLabel
            key={tier.name}
            tier={tier}
            isActive={displayPct >= tier.threshold}
            isCurrent={tier.name === currentTier.name}
          />
        ))}

        {/* ── Particles ── */}
        {particles.map(p => (
          <circle
            key={p.id}
            cx={p.x} cy={p.y}
            r={p.size * p.life}
            fill={p.color}
            opacity={p.life * 0.9}
          />
        ))}

        {/* ── Centre content ── */}
        <g>
          {/* Tier emoji */}
          <text
            x={CX} y={CY - 42}
            textAnchor="middle"
            fontSize={38}
            style={{ filter: `drop-shadow(0 0 12px ${currentTier.glow})`, transition: 'all 0.4s ease' }}
          >
            {currentTier.emoji}
          </text>

          {/* Score */}
          <text
            x={CX} y={CY + 8}
            textAnchor="middle"
            fontSize={52}
            fontWeight={700}
            fontFamily="'PT Serif', serif"
            fill={currentTier.color}
            style={{ transition: 'fill 0.4s ease' }}
          >
            {displayScore}
          </text>

          {/* /1000 label */}
          <text
            x={CX} y={CY + 28}
            textAnchor="middle"
            fontSize={11}
            fontFamily="'PT Mono', monospace"
            fill="rgba(255,255,255,0.35)"
            letterSpacing={1.5}
          >
            / 1000 XP
          </text>

          {/* Current tier name */}
          <text
            x={CX} y={CY + 56}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fontFamily="'PT Mono', monospace"
            fill={currentTier.color}
            letterSpacing={2}
            textDecoration="none"
            style={{ textTransform: 'uppercase', transition: 'fill 0.4s ease' }}
          >
            {currentTier.name}
          </text>
        </g>
      </svg>

      {/* ── Next tier progress bar hint ── */}
      <div style={{
        marginTop: -12,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        {(() => {
          const nextIdx = TIERS.findIndex(t => t.threshold > displayPct);
          if (nextIdx === -1) return (
            <div style={{
              fontSize: 11, fontFamily: "'PT Mono', monospace",
              letterSpacing: 1.2, color: '#85e3ff', textTransform: 'uppercase',
              padding: '6px 18px', border: '1px solid #85e3ff44',
              borderRadius: 20, background: '#85e3ff11',
            }}>
              ✦ Max Rank Achieved
            </div>
          );
          const next = TIERS[nextIdx];
          const prev = TIERS[nextIdx - 1];
          const segPct = Math.round(
            ((displayPct - prev.threshold) / (next.threshold - prev.threshold)) * 100
          );
          return (
            <>
              <div style={{
                fontSize: 10, fontFamily: "'PT Mono', monospace",
                letterSpacing: 1.2, color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
              }}>
                {segPct}% to {next.emoji} {next.name}
              </div>
              <div style={{
                width: 180, height: 3,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 4, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${segPct}%`,
                  background: `linear-gradient(90deg, ${currentTier.color}, ${next.color})`,
                  borderRadius: 4,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
