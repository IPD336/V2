import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ReactLenis } from 'lenis/react';
import '../styles/splash-timeline.css';

const STEPS = [
  {
    num: '01',
    title: 'Build Your Profile',
    desc: 'List the skills you offer and the ones you want to learn. Add your bio, location, and availability in under 5 minutes.',
    color: 'var(--accent)',
    badge: 'Under 5 min',
    mockup: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', color: 'white', fontWeight: 800, fontSize: 13, justifyContent: 'center' }}>JD</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>John Doe</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Product Designer</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 20, background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)', border: '1px solid rgba(var(--accent-rgb), 0.2)', fontWeight: 600 }}>Offers: UI Design</span>
          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 20, background: 'rgba(var(--sage-rgb), 0.1)', color: 'var(--sage)', border: '1px solid rgba(var(--sage-rgb), 0.2)', fontWeight: 600 }}>Wants: Python</span>
        </div>
      </div>
    ),
  },
  {
    num: '02',
    title: 'Search & Browse',
    desc: 'Filter by category or search by keyword. The smart algorithm matches you based on complementary skill gaps, experience, and timezone.',
    color: 'var(--sage)',
    badge: 'AI-powered',
    mockup: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
        <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Search "Python"...</span>
          <span>🔍</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 800 }}>RS</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>Rahul Sharma</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sage)' }}>96% Match</span>
        </div>
      </div>
    ),
  },
  {
    num: '03',
    title: 'Send a Swap Request',
    desc: 'Propose a swap! Select what you want to learn, what you want to offer in return, and write an AI-assisted personal invite.',
    color: 'var(--indigo)',
    badge: 'Instant Notify',
    mockup: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
        <div style={{ background: 'rgba(var(--indigo-rgb), 0.05)', border: '1.5px dashed var(--indigo)', borderRadius: 10, padding: 12, fontSize: 11, color: 'var(--ink)', lineHeight: 1.4 }}>
          "Hey Rahul, I\'d love to teach you React in exchange for some Python backend help!"
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button style={{ padding: '6px 12px', fontSize: 10, borderRadius: 6, border: '1px solid var(--border)', background: 'white', color: 'var(--muted)', fontWeight: 600, cursor: 'default' }}>Preview</button>
          <button style={{ padding: '6px 12px', fontSize: 10, borderRadius: 6, border: 'none', background: 'var(--indigo)', color: 'white', fontWeight: 600, cursor: 'default' }}>Send Invite</button>
        </div>
      </div>
    ),
  },
  {
    num: '04',
    title: 'Learn & Leave Feedback',
    desc: 'Conduct your learning sessions via your shared workspaces. Rate your partner, build your reputation, and level up.',
    color: 'var(--gold)',
    badge: 'Build Reputation',
    mockup: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
        <div style={{ display: 'flex', gap: 4, color: 'var(--gold)', fontSize: 14 }}>
          ★★★★★ <span style={{ color: 'var(--ink)', fontSize: 11, fontWeight: 700, marginLeft: 4 }}>5.0 Rating</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
          "Exceptional sessions! Highly recommended for backend development."
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'var(--gold)', fontWeight: 700 }}>
          <span>🏆 +50 XP Earned</span>
          <span style={{ color: 'var(--sage)' }}>⚡ Level 3 reached</span>
        </div>
      </div>
    ),
  },
];

const StickyCard = ({ i, step, progress, range, targetScale, isLast }) => {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <motion.div
      style={{
        scale,
        opacity: 1,
        position: 'sticky',
        // Stack offset (52px header spacing)
        top: 100 + i * 52,
        zIndex: i + 1,
        // Small margin-bottom ensures cards are closer together (matching the example eye/waves image)
        marginBottom: isLast ? '0px' : '120px',
        transformOrigin: 'top center',
        background: 'var(--section-dark-secondary)',
        border: '1.5px solid var(--section-card-border)',
        borderRadius: 24,
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: 620,
        minHeight: 280,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
      }}
    >
      {/* Left Side: Text Details */}
      <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{
              fontFamily: "'PT Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              color: step.color,
              letterSpacing: 1.5,
            }}>
              STEP {step.num}
            </span>
            <span style={{
              fontSize: 9.5,
              fontWeight: 700,
              fontFamily: "'PT Mono', monospace",
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '4px 10px',
              color: 'var(--section-text-muted)',
            }}>
              {step.badge}
            </span>
          </div>
          <h3 style={{
            fontFamily: 'PT Serif, serif',
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--section-text)',
            margin: '0 0 12px',
            letterSpacing: -0.5,
          }}>
            {step.title}
          </h3>
          <p style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: 'var(--section-text-muted)',
            margin: 0,
            opacity: 0.85,
          }}>
            {step.desc}
          </p>
        </div>
      </div>

      {/* Right Side: Mockup Visualizer */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderLeft: '1px solid var(--section-card-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(circle at center, ${step.color}15 0%, transparent 70%)`,
        }} />
        <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
          {step.mockup}
        </div>
      </div>
    </motion.div>
  );
};

export default function SkillJourneyTimeline() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <ReactLenis root>
      <div
        ref={container}
        style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Small padding bottom matches the compact margin to let the last card stack cleanly
          // without creating any large empty gaps.
          paddingBottom: '160px',
        }}
      >
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1;

          // Subtle scaling depth
          const targetScale = 1 - (STEPS.length - i - 1) * 0.03;

          const start = (i + 1) * 0.25 - 0.05;
          const end = start + 0.10;
          const range = [start, end];

          return (
            <StickyCard
              key={step.num}
              i={i}
              step={step}
              progress={scrollYProgress}
              range={isLast ? [0.9, 1.0] : range}
              targetScale={targetScale}
              isLast={isLast}
            />
          );
        })}
      </div>
    </ReactLenis>
  );
}
