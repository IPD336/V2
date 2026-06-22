import { useState, useEffect, useRef } from 'react';

/* ─── Data ─────────────────────────────────────────────────────────────── */

const SKILLS = [
  // top cluster – frontend
  { id: 'react',  label: 'React',      abbr: 'Re', x: 240, y: 82,  cat: 'frontend' },
  { id: 'vue',    label: 'Vue',         abbr: 'Vu', x: 142, y: 138, cat: 'frontend' },
  { id: 'ts',     label: 'TypeScript',  abbr: 'TS', x: 338, y: 138, cat: 'frontend' },
  // mid cluster – left = backend, right = design/data
  { id: 'python', label: 'Python',      abbr: 'Py', x: 68,  y: 238, cat: 'backend'  },
  { id: 'node',   label: 'Node.js',     abbr: 'No', x: 168, y: 232, cat: 'backend'  },
  { id: 'figma',  label: 'Figma',       abbr: 'Fi', x: 312, y: 232, cat: 'design'   },
  { id: 'sql',    label: 'SQL',         abbr: 'Sq', x: 412, y: 238, cat: 'data'     },
  // bottom cluster – devops
  { id: 'go',     label: 'Go',          abbr: 'Go', x: 142, y: 334, cat: 'devops'  },
  { id: 'docker', label: 'Docker',      abbr: 'Dk', x: 240, y: 390, cat: 'devops'  },
  { id: 'k8s',    label: 'K8s',         abbr: 'K8', x: 338, y: 334, cat: 'devops'  },
];

// lines between related skills
const EDGES = [
  ['react', 'node'], ['react', 'ts'], ['react', 'vue'],
  ['vue',   'figma'], ['vue', 'node'],
  ['ts',    'figma'], ['ts', 'sql'],
  ['node',  'python'], ['node', 'go'],
  ['python','docker'], ['python', 'go'],
  ['figma', 'sql'], ['figma', 'k8s'],
  ['go',    'docker'],  ['docker', 'k8s'],
];

// Active swap ticker
const SWAPS = [
  { from: 'react',  to: 'go',     chip: 'Rahul ↔ Sara  ·  React for Go'         },
  { from: 'python', to: 'ts',     chip: 'Priya ↔ Alex  ·  Python for TypeScript' },
  { from: 'figma',  to: 'docker', chip: 'Meera ↔ Dev   ·  Figma for Docker'      },
  { from: 'node',   to: 'k8s',    chip: 'Arjun ↔ Liu   ·  Node.js for K8s'       },
];

const CAT_COLOR = {
  frontend: 'var(--accent)',
  backend:  'var(--sage)',
  devops:   'var(--indigo)',
  design:   'var(--gold)',
  data:     'var(--gold)',
};

// CSS hex values matching the CSS variables (for SVG filters which can't use var())
const CAT_HEX_LIGHT = {
  frontend: '#C84B31',
  backend:  '#3A6351',
  devops:   '#3B4F8C',
  design:   '#B8902A',
  data:     '#B8902A',
};

const byId = (id) => SKILLS.find(s => s.id === id);

/* ─── Helper: mid-point bezier control (slight arc) ────────────────────── */
function arcPath(a, b, lift = -38) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 + lift;
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function SkillConstellationDiagram() {
  const [swapIdx,    setSwapIdx]    = useState(0);
  const [prevSwapIdx,setPrevSwapIdx]= useState(null);
  const [chipVisible,setChipVisible]= useState(true);
  const [tickerLine, setTickerLine] = useState(0);   // 0 = matches chip, 1 = swap chip
  const timerRef = useRef(null);

  // Cycle active swap every 3.5 s, briefly hide chip during transition
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setChipVisible(false);
      setTimeout(() => {
        setPrevSwapIdx(swapIdx);
        setSwapIdx(i => (i + 1) % SWAPS.length);
        setChipVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [swapIdx]);

  // Ticker alternates between the two stat chips
  useEffect(() => {
    const t = setInterval(() => setTickerLine(l => (l + 1) % 2), 4200);
    return () => clearInterval(t);
  }, []);

  const swap    = SWAPS[swapIdx];
  const fromSk  = byId(swap.from);
  const toSk    = byId(swap.to);
  const swapPath = arcPath(fromSk, toSk);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', userSelect: 'none' }}>

      {/* ── Top stat chip ─────────────────────────────────────────────── */}
      <div
        className="const-chip const-chip--top"
        style={{ opacity: tickerLine === 0 ? 1 : 0 }}
      >
        <span className="const-chip__dot" style={{ background: 'var(--sage)' }} />
        <span>1,240 matches today</span>
      </div>

      {/* ── SVG Constellation ─────────────────────────────────────────── */}
      <svg
        viewBox="0 0 480 480"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
        aria-hidden="true"
      >
        <defs>
          {/* Subtle radial fade for the whole diagram */}
          <radialGradient id="diagFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="var(--cream)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--cream)" stopOpacity="0.55" />
          </radialGradient>

          {/* Glow filters per category */}
          {Object.entries(CAT_HEX_LIGHT).map(([cat, hex]) => (
            <filter key={cat} id={`glow-${cat}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}

          {/* Gradient for active arc — dynamic coordinates only */}
          <linearGradient id="arcGrad"
            gradientUnits="userSpaceOnUse"
            x1={fromSk.x} y1={fromSk.y} x2={toSk.x} y2={toSk.y}
          >
            <stop offset="0%"   stopColor={CAT_HEX_LIGHT[fromSk.cat]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={CAT_HEX_LIGHT[toSk.cat]}   stopOpacity="0.9" />
          </linearGradient>

          {/* Clip to keep rendering tidy */}
          <clipPath id="diagClip">
            <circle cx="240" cy="236" r="230" />
          </clipPath>
        </defs>


        {/* ── Three ghost rings (editorial / cartographic feel) ─────────── */}
        {[72, 138, 210].map((r, i) => (
          <circle
            key={r}
            cx="240" cy="236" r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={0.7}
            strokeDasharray={i === 1 ? '3 5' : '1 7'}
            opacity={0.55}
          />
        ))}

        {/* ── Static connection lines ───────────────────────────────────── */}
        {EDGES.map(([a, b]) => {
          const s1 = byId(a), s2 = byId(b);
          const isActive =
            (a === swap.from && b === swap.to) ||
            (b === swap.from && a === swap.to);
          return (
            <line
              key={`${a}-${b}`}
              x1={s1.x} y1={s1.y} x2={s2.x} y2={s2.y}
              stroke={isActive ? CAT_HEX_LIGHT[s1.cat] : 'var(--border)'}
              strokeWidth={isActive ? 1.2 : 0.7}
              strokeDasharray={isActive ? '4 3' : '2 5'}
              opacity={isActive ? 0.7 : 0.45}
              style={{ transition: 'all 0.5s ease' }}
            />
          );
        })}

        {/* ── Active swap bezier arc ────────────────────────────────────── */}
        <path
          key={`arc-${swapIdx}`}
          d={swapPath}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth={1.6}
          strokeLinecap="round"
          className="swap-arc"
        />

        {/* ── Particle traveling the active arc ────────────────────────── */}
        <g key={`particle-${swapIdx}`}>
          <circle r={4.5} fill={CAT_HEX_LIGHT[fromSk.cat]} className="swap-particle">
            <animateMotion
              path={swapPath}
              dur="2.2s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.4 0 0.6 1"
            />
          </circle>
        </g>

        {/* ── Category label ring (tiny text around perimeter) ─────────── */}
        {[
          { label: 'FRONTEND', angle: -90 },
          { label: 'BACKEND',  angle:  170 },
          { label: 'DEVOPS',   angle:   90 },
          { label: 'DESIGN',   angle:   -8 },
        ].map(({ label, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const r   = 218;
          const x   = 240 + r * Math.cos(rad);
          const y   = 236 + r * Math.sin(rad);
          return (
            <text
              key={label}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={7}
              fontFamily="'PT Mono', monospace"
              fontWeight={700}
              letterSpacing={2}
              fill="var(--muted)"
              opacity={0.8}
            >
              {label}
            </text>
          );
        })}

        {/* ── Skill nodes ──────────────────────────────────────────────── */}
        {SKILLS.map(skill => {
          const color     = CAT_COLOR[skill.cat];
          const hexColor  = CAT_HEX_LIGHT[skill.cat];
          const isActive  = skill.id === swap.from || skill.id === swap.to;
          const radius    = isActive ? 21 : 17;
          return (
            <g key={skill.id} style={{ transition: 'all 0.5s ease' }}>
              {/* Outer glow ring when active */}
              {isActive && (
                <>
                  <circle
                    cx={skill.x} cy={skill.y} r={30}
                    fill="none"
                    stroke={hexColor}
                    strokeWidth={1}
                    opacity={0}
                    className="node-pulse-ring"
                  />
                  <circle
                    cx={skill.x} cy={skill.y} r={26}
                    fill="none"
                    stroke={hexColor}
                    strokeWidth={0.6}
                    opacity={0}
                    className="node-pulse-ring node-pulse-ring--delay"
                  />
                </>
              )}

              {/* Node body */}
              <circle
                cx={skill.x} cy={skill.y} r={radius}
                fill={color}
                opacity={isActive ? 1 : 0.72}
                filter={isActive ? `url(#glow-${skill.cat})` : undefined}
                style={{ transition: 'r 0.4s ease, opacity 0.4s ease' }}
              />

              {/* Subtle inner highlight */}
              <circle
                cx={skill.x - radius * 0.22}
                cy={skill.y - radius * 0.22}
                r={radius * 0.42}
                fill="white"
                opacity={0.14}
              />

              {/* Abbreviation text */}
              <text
                x={skill.x} y={skill.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isActive ? 10.5 : 9.5}
                fontWeight={600}
                fontFamily="'PT Mono', monospace"
                fill="white"
                fillOpacity={0.82}
                letterSpacing={0.6}
                style={{ transition: 'font-size 0.4s ease' }}
              >
                {skill.abbr}
              </text>

              {/* Skill name label below node */}
              <text
                x={skill.x} y={skill.y + radius + 13}
                textAnchor="middle"
                fontSize={8.5}
                fontFamily="'PT Sans', sans-serif"
                fontWeight={isActive ? 600 : 400}
                fill="var(--ink)"
                opacity={isActive ? 0.85 : 0.65}
                letterSpacing={0.8}
              >
                {skill.label.toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* ── Centre hub ───────────────────────────────────────────────── */}
        <circle cx="240" cy="236" r="12" fill="var(--ink)" opacity={0.08} />
        <circle cx="240" cy="236" r="6"  fill="var(--ink)" opacity={0.18} />
        <circle cx="240" cy="236" r="2.5" fill="var(--accent)" opacity={0.6} />

        {/* Radial fade overlay – softens outer edge */}
        <circle cx="240" cy="236" r="230" fill="url(#diagFade)" />
      </svg>

      {/* ── Bottom swap chip ──────────────────────────────────────────── */}
      <div
        className="const-chip const-chip--bottom"
        style={{ opacity: chipVisible ? 1 : 0 }}
      >
        <span
          className="const-chip__dot const-chip__dot--blink"
          style={{ background: 'var(--accent)' }}
        />
        <span style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: "'PT Mono', monospace", letterSpacing: 0.3 }}>
          {swap.chip}
        </span>
      </div>
    </div>
  );
}
