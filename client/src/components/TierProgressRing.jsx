import { useEffect, useRef, useState } from 'react';

// Configuration for Tiers
const TIERS = [
  { name: 'Bronze',   val: 0.00, color: '#CD7F32', glow: '#ffb366', badge: '🤎' },
  { name: 'Silver',   val: 0.25, color: '#A0AAB2', glow: '#e1e5e8', badge: '🥈' },
  { name: 'Gold',     val: 0.50, color: '#FFD700', glow: '#ffe680', badge: '👑' },
  { name: 'Platinum', val: 0.75, color: '#7E99B8', glow: '#b3ccff', badge: '💎' },
  { name: 'Diamond',  val: 1.00, color: '#00E5FF', glow: '#80f5ff', badge: '🏆' },
];

// SVG geometry configuration
const CX = 120;
const CY = 120;
const R = 76;
const ARC_LEN = 2 * Math.PI * R * 0.75; // 270 degrees arc length (~358px)

// Helper to convert progress (0 to 1) to angle (in radians)
// Arc starts at 135 degrees (bottom-left) and sweeps clockwise to 45 degrees (bottom-right)
const progressToAngle = (p) => {
  const startAngle = (135 * Math.PI) / 180;
  const sweepAngle = (270 * Math.PI) / 180;
  return startAngle + p * sweepAngle;
};

// Get (x, y) coordinates on the ring at a given progress
const getRingCoords = (p, radius = R) => {
  const angle = progressToAngle(p);
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
  };
};

export default function TierProgressRing({ currentXp = 450, totalXp = 1250, currentLeague = 'Gold' }) {
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState([]);
  const [hoveredTier, setHoveredTier] = useState(null);
  
  const progressRef = useRef(0);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // Calculate target progress based on league and XP within league
  // Mapping current league + XP to a scale of 0 to 1
  const targetProgress = () => {
    const leagueIdx = TIERS.findIndex(t => t.name.toLowerCase() === currentLeague.toLowerCase());
    if (leagueIdx === -1) return 0.12; // default fallback

    const baseVal = TIERS[leagueIdx].val;
    const nextVal = leagueIdx < TIERS.length - 1 ? TIERS[leagueIdx + 1].val : 1.0;
    
    // Calculate percentage progress to next tier
    // In our system, let's assume each tier requires a certain level of progress
    // Let's use a nice fake ratio for visual delight if the exact xp range is not available
    const ratio = totalXp > 0 ? Math.min(0.95, currentXp / totalXp) : 0.4;
    return baseVal + (nextVal - baseVal) * ratio;
  };

  const targetVal = targetProgress();

  // Trigger particle burst at a specific coordinate
  const triggerBurst = (x, y, color) => {
    const newParticles = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      newParticles.push({
        id: Math.random() + '-' + i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.6, // slight upward bias
        color,
        size: 2 + Math.random() * 4,
        alpha: 1,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  };

  // Main animation loop
  useEffect(() => {
    // Reset animation and particles when target changes
    progressRef.current = 0;
    setProgress(0);
    particlesRef.current = [];
    setParticles([]);

    // Keep track of which tier thresholds we have crossed during the sweep
    const crossedThresholds = new Set();

    const animate = () => {
      // 1. Increment progress
      if (progressRef.current < targetVal) {
        // Smooth deceleration curve
        const remaining = targetVal - progressRef.current;
        const step = Math.max(0.003, remaining * 0.05);
        progressRef.current = Math.min(targetVal, progressRef.current + step);
        setProgress(progressRef.current);

        // 2. Check for tier transitions crossed to trigger bursts
        TIERS.forEach((tier) => {
          if (
            tier.val > 0 && 
            tier.val <= progressRef.current && 
            !crossedThresholds.has(tier.name)
          ) {
            crossedThresholds.add(tier.name);
            const coords = getRingCoords(tier.val);
            triggerBurst(coords.x, coords.y, tier.color);
          }
        });
      }

      // 3. Update active particles
      if (particlesRef.current.length > 0) {
        particlesRef.current = particlesRef.current
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.04, // slight gravity
            alpha: p.alpha - p.decay,
            life: p.life - p.decay,
          }))
          .filter((p) => p.life > 0 && p.alpha > 0);
        
        setParticles([...particlesRef.current]);
      }

      // Continue loop if not finished sweeping OR if particles are still animating
      if (progressRef.current < targetVal || particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetVal, currentLeague]);

  // Find user's active tier object
  const activeTierIdx = TIERS.findIndex(t => t.name.toLowerCase() === currentLeague.toLowerCase());
  const activeTier = activeTierIdx !== -1 ? TIERS[activeTierIdx] : TIERS[0];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '16px 8px',
      background: 'transparent',
      width: '100%',
      maxWidth: 280,
      margin: '0 auto',
    }}>
      
      {/* SVG Container */}
      <div style={{ position: 'relative', width: 240, height: 230 }}>
        <svg
          width="240"
          height="240"
          viewBox="0 0 240 240"
          style={{ overflow: 'visible', zIndex: 2, position: 'relative' }}
        >
          <defs>
            {/* Glow Filter for Active Elements */}
            <filter id="tierGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Sweep gradient following the arc color scheme */}
            <linearGradient id="ringGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CD7F32" />
              <stop offset="30%" stopColor="#A0AAB2" />
              <stop offset="60%" stopColor="#FFD700" />
              <stop offset="85%" stopColor="#7E99B8" />
              <stop offset="100%" stopColor="#00E5FF" />
            </linearGradient>
          </defs>

          {/* Background Ring Track */}
          <path
            d="M 66.3 173.7 A 76 76 0 1 1 173.7 173.7"
            fill="none"
            stroke="var(--border)"
            strokeWidth="7"
            strokeLinecap="round"
            style={{ opacity: 0.3 }}
          />

          {/* Animated Progress Arc */}
          <path
            d="M 66.3 173.7 A 76 76 0 1 1 173.7 173.7"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={ARC_LEN}
            strokeDashoffset={ARC_LEN - (progress * ARC_LEN)}
            style={{
              filter: `drop-shadow(0 0 4px ${activeTier.glow}80)`,
              transition: 'stroke-dashoffset 0.05s linear',
            }}
          />

          {/* Tier Marker Nodes along the Ring */}
          {TIERS.map((tier, i) => {
            const coords = getRingCoords(tier.val);
            const isReached = progress >= tier.val;
            const isCurrent = currentLeague.toLowerCase() === tier.name.toLowerCase();
            const isHovered = hoveredTier === tier.name;

            return (
              <g 
                key={tier.name}
                onMouseEnter={() => setHoveredTier(tier.name)}
                onMouseLeave={() => setHoveredTier(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer pulsing ring for current active tier node */}
                {isCurrent && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="12"
                    fill="none"
                    stroke={tier.color}
                    strokeWidth="1.5"
                    style={{
                      animation: 'node-pulse-ring 2s infinite',
                      filter: 'url(#tierGlow)',
                      transformOrigin: `${coords.x}px ${coords.y}px`,
                    }}
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isCurrent ? '7' : isHovered ? '6.5' : '5'}
                  fill={isReached ? tier.color : 'var(--card-bg)'}
                  stroke={isReached ? tier.color : 'var(--border)'}
                  strokeWidth="2"
                  style={{
                    transition: 'all 0.3s ease',
                    filter: isCurrent || isHovered ? 'url(#tierGlow)' : 'none',
                  }}
                />
              </g>
            );
          })}

          {/* Tier Text Labels around the Ring */}
          {TIERS.map((tier) => {
            const labelCoords = getRingCoords(tier.val, 100); // place label further out (radius 100)
            const isReached = progress >= tier.val;
            const isCurrent = currentLeague.toLowerCase() === tier.name.toLowerCase();
            const isHovered = hoveredTier === tier.name;

            // Determine text alignment based on position
            let textAnchor = 'middle';
            let dy = '0.35em';
            if (tier.val === 0.00) { textAnchor = 'end'; dy = '0.6em'; } // bottom-left
            else if (tier.val === 0.25) { textAnchor = 'end'; }          // middle-left
            else if (tier.val === 0.50) { textAnchor = 'middle'; dy = '-0.6em'; } // top-center
            else if (tier.val === 0.75) { textAnchor = 'start'; }        // middle-right
            else if (tier.val === 1.00) { textAnchor = 'start'; dy = '0.6em'; } // bottom-right

            return (
              <text
                key={tier.name + '-label'}
                x={labelCoords.x}
                y={labelCoords.y}
                dy={dy}
                textAnchor={textAnchor}
                fontSize={isCurrent || isHovered ? '11px' : '9px'}
                fontWeight={isCurrent || isHovered ? '800' : '600'}
                fill={isCurrent || isHovered ? 'var(--ink)' : 'var(--muted)'}
                style={{
                  transition: 'all 0.3s ease',
                  fontFamily: "'PT Mono', monospace",
                  letterSpacing: '0.2px',
                  userSelect: 'none',
                }}
                onMouseEnter={() => setHoveredTier(tier.name)}
                onMouseLeave={() => setHoveredTier(null)}
              >
                {tier.name}
              </text>
            );
          })}

          {/* Particle SVG Elements */}
          {particles.map((p) => (
            <circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill={p.color}
              opacity={p.alpha}
              style={{ pointerEvents: 'none' }}
            />
          ))}
        </svg>

        {/* Center Text Panel (Glassmorphic Container in the Middle) */}
        <div style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 0 12px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1,
        }}>
          {/* Badge Icon */}
          <span style={{
            fontSize: 28,
            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))',
            transform: 'scale(1)',
            transition: 'transform 0.3s ease',
            animation: 'float-slow 3s ease-in-out infinite',
          }}>
            {activeTier.badge}
          </span>

          {/* League Name */}
          <span style={{
            fontSize: 14,
            fontWeight: 800,
            color: 'var(--ink)',
            marginTop: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: 'center',
            lineHeight: 1.1,
          }}>
            {currentLeague}
          </span>

          {/* Progress / Next Tier Indicator */}
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            color: 'var(--accent)',
            marginTop: 3,
            fontFamily: "'PT Mono', monospace",
          }}>
            {currentXp} / {totalXp} XP
          </span>
        </div>
      </div>

      {/* Interactive Tooltip / Information under the ring */}
      <div style={{
        minHeight: 38,
        marginTop: 10,
        textAlign: 'center',
        padding: '6px 12px',
        borderRadius: 8,
        background: 'rgba(var(--accent-rgb), 0.04)',
        border: '1px solid var(--border)',
        width: '100%',
        maxWidth: 220,
        transition: 'all 0.3s ease',
      }}>
        {hoveredTier ? (
          <div style={{ transition: 'opacity 0.2s' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase' }}>
              {hoveredTier} Tier:
            </span>{' '}
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>
              {hoveredTier === 'Bronze' && 'Entry-level league. Swap 1 skill to unlock Silver.'}
              {hoveredTier === 'Silver' && 'Earn 250 XP. Unlocks priority matching.'}
              {hoveredTier === 'Gold' && 'Earn 500 XP. Unlocks custom badges.'}
              {hoveredTier === 'Platinum' && 'Earn 750 XP. Unlocks team creation.'}
              {hoveredTier === 'Diamond' && 'Max rank! Elite tier, ultimate status.'}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 10, color: 'var(--muted)', transition: 'opacity 0.2s' }}>
            Next Tier: <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
              {activeTierIdx < TIERS.length - 1 ? TIERS[activeTierIdx + 1].name : 'Max Level'}
            </span>
            <div style={{ fontSize: 9, marginTop: 2, color: 'var(--accent)' }}>
              {activeTierIdx < TIERS.length - 1 
                ? `Need ${totalXp - currentXp} more XP to promote` 
                : 'You are at the pinnacle of Skill Swapping!'}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
