import { useState, useEffect } from 'react';
import '../styles/skill-orbit.css';

const RINGS = [
  { r: 90, speed: 40, label: 'Offering', color: 'var(--accent)', nodes: ['React', 'Python', 'Go', 'Rust'] },
  { r: 155, speed: 60, label: 'Learning', color: 'var(--sage)', nodes: ['Docker', 'TypeScript', 'ML', 'AWS'] },
  { r: 220, speed: 90, label: 'Matched', color: 'var(--indigo)', nodes: ['Figma', 'SQL', 'K8s', 'Kotlin'] },
];

const CX = 250, CY = 250;
const ARC_PAIRS = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [8, 9], [9, 10], [10, 11], [11, 8],
];

function nodePos(ringIdx, nodeIdx) {
  const ring = RINGS[ringIdx];
  const angle = (360 / ring.nodes.length) * nodeIdx - 90;
  const rad = (angle * Math.PI) / 180;
  return {
    x: CX + ring.r * Math.cos(rad),
    y: CY + ring.r * Math.sin(rad),
    angle,
  };
}

function swapArc(from, to) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - 30;
  return `M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`;
}

const colorMap = {
  React: '#61DAFB',
  Python: '#3776AB',
  Go: '#00ADD8',
  Rust: '#DEA584',
  Docker: '#2496ED',
  TypeScript: '#3178C6',
  ML: '#FF6F00',
  AWS: '#FF9900',
  Figma: '#F24E1E',
  SQL: '#336791',
  K8s: '#326CE5',
  Kotlin: '#7F52FF',
};

const NODE_POSITIONS = RINGS.map((ring, ri) =>
  ring.nodes.map((_, ni) => nodePos(ri, ni))
);

const shortName = (name) => name.slice(0, 4);

function Hub() {
  return (
    <g>
      <circle cx={CX} cy={CY} r={28} fill="var(--accent)" opacity={0.1} />
      <circle cx={CX} cy={CY} r={20} fill="var(--accent)" />
      <text
        x={CX} y={CY + 1}
        textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize={13} fontWeight={800} fontFamily="PT Sans, sans-serif"
        letterSpacing="1"
      >SS</text>

      {[0, 1, 2].map((i) => (
        <g
          key={i}
          className="orbit-pulse-ring-g"
          style={{ animationDelay: `${i * 1.2}s` }}
        >
          <circle cx={CX} cy={CY} r={35} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
        </g>
      ))}
    </g>
  );
}

function SwapArcs({ pair }) {
  const [from, to] = pair;
  const p1 = NODE_POSITIONS[Math.floor(from / 4)][from % 4];
  const p2 = NODE_POSITIONS[Math.floor(to / 4)][to % 4];
  const d = swapArc(p1, p2);

  return (
    <path
      d={d}
      fill="none"
      stroke="var(--accent)"
      strokeWidth={2}
      opacity={0.5}
      strokeLinecap="round"
      className="orbit-swap-arc"
    />
  );
}

export default function SkillOrbitDiagram() {
  const [activePair, setActivePair] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePair((p) => (p + 1) % ARC_PAIRS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 500 500" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* --- Dashed rings --- */}
        {RINGS.map((ring, ri) => (
          <g key={ri} className={`orbit-ring-group orbit-ring-group-${ri}`}>
            <circle
              cx={CX} cy={CY} r={ring.r}
              fill="none"
              stroke={ring.color}
              strokeWidth={1}
              strokeDasharray="6 8"
              opacity={0.25}
            />
            {/* Nodes on this ring */}
            {ring.nodes.map((name, ni) => {
              const pos = NODE_POSITIONS[ri][ni];
              const c = colorMap[name] || ring.color;
              return (
                <g key={name} className="orbit-node-group" transform={`translate(${pos.x},${pos.y})`}>
                  <title>{name}</title>
                  <circle cx={0} cy={0} r={16} fill={c} opacity={0.15} className="orbit-node-glow" />
                  <circle cx={0} cy={0} r={11} fill={c} stroke="white" strokeWidth={2} />
                  <text
                    x={0} y={1}
                    textAnchor="middle" dominantBaseline="central"
                    fill="white" fontSize={8} fontWeight={700}
                    fontFamily="PT Mono, monospace"
                  >{shortName(name)}</text>
                </g>
              );
            })}
          </g>
        ))}

        {/* --- Swap arcs --- */}
        <SwapArcs pair={ARC_PAIRS[activePair]} />

        {/* --- Centre hub --- */}
        <Hub />
      </svg>

      {/* --- Stat chips --- */}
      <div style={{
        position: 'absolute', top: '8%', left: '4%',
        background: 'var(--card-bg)', backdropFilter: 'blur(12px)',
        willChange: 'transform',
        border: '1px solid var(--border)', borderRadius: 10,
        padding: '8px 14px', fontSize: 11, fontWeight: 600,
        color: 'var(--ink)', whiteSpace: 'nowrap',
        boxShadow: 'var(--shadow)',
      }}>
        <span style={{ marginRight: 6 }}>📡</span>
        1,240 matches today
      </div>

      <div style={{
        position: 'absolute', bottom: '8%', right: '4%',
        background: 'var(--card-bg)', backdropFilter: 'blur(12px)',
        willChange: 'transform',
        border: '1px solid var(--border)', borderRadius: 10,
        padding: '8px 14px', fontSize: 11, fontWeight: 600,
        color: 'var(--ink)', whiteSpace: 'nowrap',
        boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color: 'var(--accent)', fontWeight: 800 }}>✓</span>
        New swap — Rahul ↔ Sara
      </div>

      {/* --- Ring labels (inline legend) --- */}
      {RINGS.map((ring, ri) => (
        <div
          key={ri}
          style={{
            position: 'absolute',
            top: `${34 + ri * 18}%`,
            right: '6%',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 9, fontWeight: 600, color: 'var(--muted)',
            fontFamily: 'PT Mono, monospace', letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: ring.color, opacity: 0.5 }} />
          {ring.label}
        </div>
      ))}
    </div>
  );
}
