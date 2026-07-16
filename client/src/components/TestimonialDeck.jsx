import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

const ALL_PEOPLE = [
  {
    id: 1,
    name: 'Rahul Sharma',
    role: 'Frontend Developer',
    initials: 'RS',
    color: 'var(--accent)',
    skills: ['React', 'Go'],
    text: "SkillSwap helped me learn Go in two weeks while teaching React to someone building their first app. The absolute best learning experience I've had.",
  },
  {
    id: 2,
    name: 'Ananya Patel',
    role: 'Data Scientist',
    initials: 'AP',
    color: 'var(--sage)',
    skills: ['Python', 'Machine Learning'],
    text: 'I was stuck on my ML project for months. Found a mentor here who traded Python coaching for ML tips. Unbelievably valuable.',
  },
  {
    id: 3,
    name: 'Karan Mehta',
    role: 'Product Designer',
    initials: 'KM',
    color: 'var(--indigo)',
    skills: ['Figma', 'React'],
    text: 'The team mode is incredible. We formed a group of 4 — designer, frontend, backend, DevOps — and built a real product together in 3 weeks.',
  },
  {
    id: 4,
    name: 'Sara Chen',
    role: 'Full Stack Engineer',
    initials: 'SC',
    color: 'var(--gold)',
    skills: ['TypeScript', 'Docker'],
    text: 'I needed to deploy my app to AWS. Traded my TypeScript knowledge with a DevOps engineer who set up Docker containers for me in a weekend.',
  },
  {
    id: 5,
    name: 'Aarav Goel',
    role: 'DevOps Specialist',
    initials: 'AG',
    color: '#7A5FA8',
    skills: ['Kubernetes', 'Node.js'],
    text: 'Met a Node.js wizard who helped me clean up my microservices API. In return, I taught him how to set up Kubernetes clusters.',
  },
  {
    id: 6,
    name: 'Priya Sen',
    role: 'UI Copywriter',
    initials: 'PS',
    color: 'var(--accent)',
    skills: ['Copywriting', 'SEO'],
    text: 'Traded my copy editing skills for some SEO tutoring. My blog traffic grew by 80% after putting what I learned into practice.',
  },
  {
    id: 7,
    name: 'Vikram Malhotra',
    role: 'Backend Architect',
    initials: 'VM',
    color: 'var(--sage)',
    skills: ['Java', 'Rust'],
    text: 'Taught Rust systems programming to a senior Java developer. In return, he helped me re-architect our spring boot database connectors.',
  },
  {
    id: 8,
    name: 'Neha Gupta',
    role: 'Product PM',
    initials: 'NG',
    color: 'var(--indigo)',
    skills: ['Agile', 'Analytics'],
    text: 'I wanted to level up on user analytics and PM tools. Traded my PM coaching roadmaps for 5 PM analytics sessions. Truly awesome PM trade.',
  }
];

// Design lanes: 4 horizontal corridors, 2 vertical corridors
const LANES = [
  { type: 'h', dir: 1,  y: 22, startX: -15, endX: 115, vx: 0.08, vy: 0 },   // Lane 0: Left to Right
  { type: 'h', dir: -1, y: 42, startX: 115, endX: -15, vx: -0.08, vy: 0 },  // Lane 1: Right to Left
  { type: 'h', dir: 1,  y: 62, startX: -15, endX: 115, vx: 0.08, vy: 0 },   // Lane 2: Left to Right
  { type: 'h', dir: -1, y: 82, startX: 115, endX: -15, vx: -0.08, vy: 0 },  // Lane 3: Right to Left
  { type: 'v', dir: 1,  x: 30, startY: -15, endY: 115, vx: 0, vy: 0.06 },   // Lane 4: Top to Bottom
  { type: 'v', dir: -1, x: 70, startY: 115, endY: -15, vx: 0, vy: -0.06 },  // Lane 5: Bottom to Top
];

// Spread them across lanes initially
const INITIAL_PEOPLE = ALL_PEOPLE.slice(0, 6).map((person, index) => {
  const lane = LANES[index];
  const initialOffset = [0.2, 0.8, 0.4, 0.6, 0.3, 0.7][index]; // starting offset inside lane
  
  const x = lane.type === 'h' ? lane.startX + (lane.endX - lane.startX) * initialOffset : lane.x;
  const y = lane.type === 'v' ? lane.startY + (lane.endY - lane.startY) * initialOffset : lane.y;

  return {
    ...person,
    slotId: index,
    poolId: person.id,
    x,
    y,
    vx: lane.vx,
    vy: lane.vy,
  };
});

export default function TestimonialDeck() {
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  const [hoveredId, setHoveredId] = useState(null);
  const [hoveredCoords, setHoveredCoords] = useState(null); // Captures coordinates at exact millisecond of hover
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Refs for direct DOM animation updates (Bypasses React rendering cycles entirely)
  const avatarRefs = useRef([]);
  const hoveredIdRef = useRef(hoveredId);
  const physicsData = useRef(
    INITIAL_PEOPLE.map((p) => ({
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
    }))
  );

  // Sync hovered ID to ref so that requestAnimationFrame always gets the latest hovered slot
  useEffect(() => {
    hoveredIdRef.current = hoveredId;
  }, [hoveredId]);

  // One-shot animation loop (has no dependencies, so it never tears down or restarts)
  useEffect(() => {
    let animationFrameId;

    const updatePhysics = () => {
      let stateUpdateSlotIdx = -1;
      let nextPoolPerson = null;
      let resetCoords = {};

      physicsData.current.forEach((physics, idx) => {
        // Freeze this avatar if it is currently hovered
        if (hoveredIdRef.current === idx) return;

        let nextX = physics.x + physics.vx;
        let nextY = physics.y + physics.vy;

        // Check if avatar went out of bounds
        const lane = LANES[idx];
        let isOffScreen = false;
        if (lane.type === 'h') {
          isOffScreen = lane.dir === 1 ? nextX > 115 : nextX < -15;
        } else {
          isOffScreen = lane.dir === 1 ? nextY > 115 : nextY < -15;
        }

        if (isOffScreen && stateUpdateSlotIdx === -1) {
          // Identify currently active pool IDs to avoid duplicate characters
          let currentPoolIds = [];
          setPeople((prev) => {
            currentPoolIds = prev.filter((_, pIdx) => pIdx !== idx).map((p) => p.poolId);
            return prev;
          });

          // Fetch new unused person
          const unusedPool = ALL_PEOPLE.filter((p) => !currentPoolIds.includes(p.id));
          nextPoolPerson = unusedPool.length > 0
            ? unusedPool[Math.floor(Math.random() * unusedPool.length)]
            : ALL_PEOPLE[Math.floor(Math.random() * ALL_PEOPLE.length)];

          // Reset positioning in the lane, adding a slight offset to keep the paths natural
          if (lane.type === 'h') {
            resetCoords = {
              x: lane.startX,
              y: lane.y - 4 + Math.random() * 8, // slight offset range
              vx: lane.vx,
              vy: lane.vy
            };
          } else {
            resetCoords = {
              x: lane.x - 4 + Math.random() * 8, // slight offset range
              y: lane.startY,
              vx: lane.vx,
              vy: lane.vy
            };
          }

          stateUpdateSlotIdx = idx;
        } else {
          // Update physics values directly
          physics.x = nextX;
          physics.y = nextY;

          // Push position changes directly to the DOM for hardware-accelerated 120fps motion
          const el = avatarRefs.current[idx];
          if (el) {
            el.style.left = `${nextX}%`;
            el.style.top = `${nextY}%`;
          }
        }
      });

      // If an avatar walked off-screen, perform a state update for character content details
      if (stateUpdateSlotIdx !== -1 && nextPoolPerson) {
        const idx = stateUpdateSlotIdx;
        
        // Reset coordinate values directly in physicsData to prevent delay offsets
        physicsData.current[idx].x = resetCoords.x;
        physicsData.current[idx].y = resetCoords.y;
        physicsData.current[idx].vx = resetCoords.vx;
        physicsData.current[idx].vy = resetCoords.vy;

        // Instantly force style positions for the spawning avatar
        const el = avatarRefs.current[idx];
        if (el) {
          el.style.left = `${resetCoords.x}%`;
          el.style.top = `${resetCoords.y}%`;
        }

        setPeople((prev) => {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            poolId: nextPoolPerson.id,
            name: nextPoolPerson.name,
            role: nextPoolPerson.role,
            initials: nextPoolPerson.initials,
            color: nextPoolPerson.color,
            skills: nextPoolPerson.skills,
            text: nextPoolPerson.text,
            x: resetCoords.x,
            y: resetCoords.y,
            vx: resetCoords.vx,
            vy: resetCoords.vy,
          };
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleMouseEnter = (slotId) => {
    // Capture the exact real-time coordinates of this avatar from physicsData
    const coords = physicsData.current[slotId];
    if (coords) {
      setHoveredCoords({ x: coords.x, y: coords.y });
    }
    setHoveredId(slotId);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setHoveredCoords(null);
  };

  const hoveredPerson = people.find((p) => p.slotId === hoveredId);

  // Position calculation for tooltip card to prevent clipping near container edges
  const getTooltipStyles = (person, coords) => {
    if (!person || !coords) return {};

    const styles = {
      position: 'absolute',
      zIndex: 99,
      width: '90%',
      maxWidth: 360,
      background: 'var(--card-bg)',
      border: '1.5px solid var(--border)',
      borderRadius: 20,
      padding: '24px 28px',
      boxShadow: 'var(--shadow-lg)',
      pointerEvents: 'none',
    };

    // Calculate vertical containment based on physical position in container
    if (coords.y > 55) {
      styles.bottom = `${105 - coords.y}%`;
      styles.top = 'auto';
    } else {
      styles.top = `${coords.y + 8}%`;
      styles.bottom = 'auto';
    }

    // Calculate horizontal containment relative to container edges
    if (coords.x < 30) {
      styles.left = '16px';
      styles.right = 'auto';
      styles.transform = 'none';
    } else if (coords.x > 70) {
      styles.right = '16px';
      styles.left = 'auto';
      styles.transform = 'none';
    } else {
      styles.left = `${coords.x}%`;
      styles.right = 'auto';
      styles.transform = 'translateX(-50%)';
    }

    return styles;
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 960,
        height: 500,
        margin: '0 auto',
        background: isDark ? 'rgba(38, 33, 28, 0.4)' : 'rgba(248, 244, 238, 0.4)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Subtle ambient grid pattern in background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(var(--accent-rgb), 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(var(--sage-rgb), 0.03) 0%, transparent 50%)
          `,
          opacity: 0.8,
          pointerEvents: 'none',
        }}
      />

      {/* Floating testominial avatars */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {people.map((person, idx) => {
          const isHovered = person.slotId === hoveredId;

          return (
            <div
              key={person.slotId} // Fixed key per slot ID allows reusing DOM nodes seamlessly
              ref={(el) => (avatarRefs.current[idx] = el)}
              onMouseEnter={() => handleMouseEnter(person.slotId)}
              onMouseLeave={handleMouseLeave}
              style={{
                position: 'absolute',
                left: `${person.x}%`,
                top: `${person.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: isHovered ? 100 : 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                willChange: 'left, top', // Hardware acceleration optimization
              }}
            >
              {/* Interactive circular avatar */}
              <div
                style={{
                  position: 'relative',
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: person.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  color: 'white',
                  border: isDark ? '3px solid #26211c' : '3px solid #ffffff',
                  boxShadow: isHovered 
                    ? `0 10px 25px ${person.color}40`
                    : '0 4px 12px rgba(0,0,0,0.12)',
                  transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  animation: isHovered ? 'none' : 'float-bob 3s infinite ease-in-out',
                  animationDelay: `${person.slotId * 0.4}s`,
                }}
              >
                {person.initials}

                {/* Pulsing ring on idle avatars */}
                {!isHovered && (
                  <span
                    style={{
                      position: 'absolute',
                      inset: -3,
                      borderRadius: '50%',
                      border: `1.5px solid ${person.color}`,
                      opacity: 0.4,
                      animation: 'avatar-pulse 2s infinite ease-out',
                      animationDelay: `${person.slotId * 0.5}s`,
                    }}
                  />
                )}
              </div>

              {/* Name Tag */}
              <div
                style={{
                  marginTop: 8,
                  background: isDark ? 'rgba(38, 33, 28, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid var(--border)',
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  opacity: 0.9,
                }}
              >
                {person.name.split(' ')[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Tooltip Card overlay on hover - Contained inside bounds */}
      <AnimatePresence>
        {hoveredId !== null && hoveredPerson && hoveredCoords && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            style={getTooltipStyles(hoveredPerson, hoveredCoords)}
          >
            {/* SVG Quote Mark */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                color: hoveredPerson.color,
                opacity: 0.15,
                position: 'absolute',
                top: 16,
                right: 20,
              }}
            >
              <path
                d="M11.189 18H5C5 13.9 6.822 11 9.878 9v2.2C8.367 12 7.55 13.2 7.422 15h3.767v3zm7.811 0h-6.189c0-4.1 1.822-7 4.878-9v2.2c-1.511.8-2.328 2-2.456 3.8h3.767v3z"
                fill="currentColor"
              />
            </svg>

            {/* Testimonial Quote */}
            <p
              style={{
                fontFamily: 'PT Serif, serif',
                fontSize: 14,
                lineHeight: 1.6,
                color: 'var(--ink)',
                fontStyle: 'italic',
                margin: '0 0 16px 0',
              }}
            >
              "{hoveredPerson.text}"
            </p>

            {/* Member Profile Footer & Skill swap tag */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border)',
                paddingTop: 14,
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'PT Sans, sans-serif' }}>
                  {hoveredPerson.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'PT Sans, sans-serif' }}>
                  {hoveredPerson.role}
                </div>
              </div>

              {/* Skills Pill badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'var(--cream)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '4px 10px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  fontFamily: 'PT Mono, monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{hoveredPerson.skills[0]}</span>
                <span style={{ color: 'var(--accent)' }}>↔</span>
                <span>{hoveredPerson.skills[1]}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tiny instructions tag at bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 16,
          fontFamily: 'PT Sans, sans-serif',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.5,
          color: 'var(--muted)',
          zIndex: 5,
        }}
      >
        Hover over any member to read their swap review
      </div>

      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes float-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes avatar-pulse {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
