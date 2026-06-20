import { useNavigate } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { PinIcon, CheckIcon, SparklesIcon, CalendarIcon } from '../components/Icons';


const TESTIMONIALS = [
  { name: 'Rahul Sharma', role: 'Frontend Developer', initials: 'RS', color: 'var(--accent)', text: 'SkillSwap helped me learn Go in two weeks while teaching React to someone building their first app. Best learning experience I\'ve had.' },
  { name: 'Ananya Patel', role: 'Data Scientist', initials: 'AP', color: 'var(--sage)', text: 'I was stuck on my ML project for months. Found a mentor here who traded 4 sessions for my Python expertise. Unbelievably valuable.' },
  { name: 'Karan Mehta', role: 'Product Designer', initials: 'KM', color: 'var(--indigo)', text: 'The team mode is incredible. We formed a group of 4 — designer, frontend, backend, DevOps — and built a real product together.' },
];

const SOCIAL_AVATARS = [
  { initials: 'AK', color: 'var(--accent)' },
  { initials: 'PR', color: 'var(--sage)' },
  { initials: 'SM', color: 'var(--indigo)' },
  { initials: 'NJ', color: 'var(--gold)' },
  { initials: 'KP', color: '#7A5FA8' },
];

export default function Landing() {
  const navigate = useNavigate();

  const stagger = (i, base = 0) => i * 120 + base;

  return (
    <div className="page-fade-in">

      {/* ──────────────── HERO ──────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden', minHeight: '100vh',
        padding: '160px 24px 100px', display: 'flex', alignItems: 'center',
      }}>
        {/* Mesh gradient background */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `
            radial-gradient(ellipse 70% 60% at 30% 30%, rgba(var(--accent-rgb),0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 60%, rgba(var(--sage-rgb),0.04) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 50% 80%, rgba(var(--indigo-rgb),0.03) 0%, transparent 50%),
            var(--cream)
          `,
        }} />
        {/* Orb glow behind heading */}
        <div className="orb-glow" style={{
          width: 400, height: 400, top: '10%', left: '15%',
          background: 'rgba(var(--accent-rgb),0.10)',
        }} />
        {/* Dot grid overlay */}
        <svg className="dot-grid-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="dot-grid-hero" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="var(--border)" opacity="0.35" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid-hero)" mask="url(#dot-grid-mask)" />
          <mask id="dot-grid-mask">
            <rect width="100%" height="100%" fill="white" />
            <ellipse cx="50%" cy="40%" rx="45%" ry="50%" fill="black" />
          </mask>
        </svg>
        {/* Decorative large logo watermark */}
        <svg width="300" height="300" viewBox="0 0 32 32" fill="none" style={{
          position: 'absolute', right: '8%', top: '15%', zIndex: 0,
          opacity: 0.06, pointerEvents: 'none',
        }} aria-hidden="true">
          <circle cx="16" cy="16" r="14" stroke="var(--accent)" strokeWidth="1.6" />
          <path d="M9 14 C9 8, 23 8, 23 14" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
          <path d="M23 14 L18 11 M23 14 L18 17" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M23 18 C23 24, 9 24, 9 18" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
          <path d="M9 18 L14 21 M9 18 L14 15" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>

        <div style={{
          position: 'relative', zIndex: 1, width: '100%',
          display: 'flex', flexDirection: 'column', gap: 40,
          maxWidth: 1280, margin: '0 auto',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 32,
            maxWidth: 640,
          }}>
            {/* Tag badge */}
            <Reveal delay={0}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'var(--card-bg)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '7px 16px', fontSize: 11,
                fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                color: 'var(--muted)', width: 'fit-content',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)' }} />
                Free Skill Exchange Platform
              </div>
            </Reveal>

            {/* Heading */}
            <Reveal delay={120}>
              <h1 style={{
                fontFamily: 'PT Serif, serif',
                fontSize: 'clamp(42px, 5.5vw, 84px)',
                fontWeight: 600, lineHeight: 1.02, letterSpacing: -2,
                color: 'var(--ink)', margin: 0,
              }}>
                Trade What<br />
                You <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Know.</span><br />
                Learn What<br />
                You <span style={{ display: 'inline-block', borderBottom: '3px solid var(--ink)', paddingBottom: 2 }}>Don't.</span>
              </h1>
            </Reveal>

            {/* Subtext */}
            <Reveal delay={240}>
              <p style={{
                fontFamily: 'PT Sans, sans-serif', fontSize: 15,
                lineHeight: 1.75, color: 'var(--muted)',
                maxWidth: 480, fontWeight: 400, margin: 0,
              }}>
                Connect with people who have the skills you need, and share what you know best — no money, no subscriptions, just a genuine exchange of knowledge and expertise.
              </p>
            </Reveal>

            {/* CTA buttons */}
            <Reveal delay={360}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <button
                  className="btn-cosmos btn-cosmos-primary"
                  onClick={() => navigate('/register')}
                >
                  Start Swapping
                  <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
                </button>
                <a
                  href="#features"
                  style={{
                    fontSize: 12, fontWeight: 700, color: 'var(--muted)',
                    textDecoration: 'none', letterSpacing: 0.5,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  Explore features ↓
                </a>
              </div>
            </Reveal>

            {/* Social proof */}
            <Reveal delay={480}>
              <div className="social-proof-row">
                <div className="social-proof-avatars">
                  {SOCIAL_AVATARS.map((a, i) => (
                    <div
                      key={i}
                      className="social-proof-avatar"
                      style={{ background: a.color, zIndex: SOCIAL_AVATARS.length - i }}
                    >
                      {a.initials}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>4,200+</strong> professionals swapping skills<br />
                  across 38 cities worldwide
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Hero right-side cards */}
        <div style={{
          position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)',
          width: 340, zIndex: 1, display: 'none',
        }}
          className="hero-visual-cards"
        >
          {/* Profile card */}
          <Reveal delay={200}>
            <div style={{
              background: 'var(--card-bg)', borderRadius: 20,
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden', marginBottom: 20,
            }}>
              <div style={{ height: 72, background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, white) 100%)' }} />
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'var(--accent)', border: '3px solid var(--card-bg)',
                  marginTop: -28, marginBottom: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 18, color: 'white',
                }}>PM</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, color: 'var(--ink)' }}>Priya Mehta</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}><PinIcon size={12} />Mumbai, India</div>
                <div className="skill-section-label">Offering</div>
                <div className="tag-row">
                  <span className="tag tag-r">React</span>
                  <span className="tag tag-r">Node.js</span>
                </div>
                <div className="skill-section-label">Wants to Learn</div>
                <div className="tag-row">
                  <span className="tag tag-g">Docker</span>
                  <span className="tag tag-g">Kubernetes</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Top Matches card */}
          <Reveal delay={320}>
            <div style={{
              background: 'var(--card-bg)', borderRadius: 14,
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '16px 18px', marginBottom: 20,
            }}>
              <div className="skill-section-label" style={{ marginBottom: 10 }}>Top Matches</div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: '1px solid var(--border)',
                fontSize: 12, color: 'var(--ink)',
              }}>
                <span style={{ fontWeight: 600 }}>Rahul — Python</span>
                <span style={{ fontWeight: 800, color: 'var(--accent)' }}>96%</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 0', fontSize: 12, color: 'var(--ink)',
              }}>
                <span style={{ fontWeight: 600 }}>Sara — TypeScript</span>
                <span style={{ fontWeight: 800, color: 'var(--accent)' }}>88%</span>
              </div>
            </div>
          </Reveal>

          {/* Swap completed card */}
          <Reveal delay={440}>
            <div style={{
              background: 'var(--card-bg)', borderRadius: 14,
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '16px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--sage)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0,
                }}>SA</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={14} style={{ color: 'var(--accent)' }} />Swap Completed</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Sara → Python · You → Go</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                <span style={{ color: 'var(--gold)', fontSize: 11 }}>★★★★★</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>4.9 / 5</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ──────────────── STATS BAR ──────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 75%, black) 100%)',
        padding: '48px 24px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Dot grid overlay */}
        <svg className="dot-grid-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="dot-grid-stats" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="white" opacity="0.12" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid-stats)" />
        </svg>

        <div className="metrics-row" style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          {[
            { num: '4,200+', label: 'Active Members' },
            { num: '2,800+', label: 'Swaps Completed' },
            { num: '38', label: 'Cities Worldwide' },
            { num: '94%', label: 'Satisfaction Rate' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 100} style={{ width: '100%' }}>
              <div className="metric-item">
                <div className="metric-value" style={{ color: 'white' }}>{s.num}</div>
                <div className="metric-label" style={{ color: 'rgba(255,255,255,0.8)' }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────────────── FEATURES: SPLIT LAYOUT ──────────────── */}
      <section id="features" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 0,
          background: 'linear-gradient(180deg, var(--cream) 0%, rgba(var(--accent-rgb),0.02) 50%, var(--cream) 100%)',
        }} />

        {/* Feature 1: Smart Matching */}
        <div className="section-spacing" style={{ position: 'relative', zIndex: 1 }}>
          <div className="split-section" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal className="split-content" delay={0}>
              <div>
                <div style={{
                  fontFamily: 'PT Mono, monospace', fontSize: 10,
                  letterSpacing: 2.5, textTransform: 'uppercase',
                  color: 'var(--muted)', marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--muted)' }} />
                  Feature
                </div>
                <h2 style={{
                  fontFamily: 'PT Serif, serif',
                  fontSize: 'clamp(28px, 3.5vw, 44px)',
                  fontWeight: 600, lineHeight: 1.08, letterSpacing: -1.2,
                  margin: '0 0 20px', color: 'var(--ink)',
                }}>
                  <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Smart Matching</em> that actually works
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--muted)', margin: '0 0 28px' }}>
                  Our algorithm doesn't just look at keywords — it analyzes complementary skill gaps, experience levels, and availability to find your ideal swap partner.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {['Cross-skill compatibility scoring', 'Experience-level alignment', 'Availability & timezone matching', 'Instant match percentage'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--ink)' }}>
                      <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal className="split-visual" delay={150}>
              <div className="mockup-card" style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Match Results</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Sorted by compatibility</div>
                </div>
                {[
                  { name: 'Rahul Sharma', skills: 'Python · Django', match: 96, color: 'var(--sage)' },
                  { name: 'Sara Chen', skills: 'TypeScript · React', match: 88, color: 'var(--indigo)' },
                  { name: 'Alex Kim', skills: 'Go · Docker', match: 82, color: 'var(--gold)' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: item.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0,
                    }}>
                      {item.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.skills}</div>
                    </div>
                    <div style={{
                      fontSize: 20, fontWeight: 700, fontFamily: 'PT Serif, serif',
                      color: item.match >= 90 ? 'var(--sage)' : 'var(--accent)',
                    }}>
                      {item.match}%
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* Feature 2: Workspaces & Scheduling */}
        <div className="section-spacing" style={{ position: 'relative', zIndex: 1 }}>
          <div className="split-section reverse" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal className="split-content" delay={0}>
              <div>
                <div style={{
                  fontFamily: 'PT Mono, monospace', fontSize: 10,
                  letterSpacing: 2.5, textTransform: 'uppercase',
                  color: 'var(--muted)', marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--muted)' }} />
                  Feature
                </div>
                <h2 style={{
                  fontFamily: 'PT Serif, serif',
                  fontSize: 'clamp(28px, 3.5vw, 44px)',
                  fontWeight: 600, lineHeight: 1.08, letterSpacing: -1.2,
                  margin: '0 0 20px', color: 'var(--ink)',
                }}>
                  <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Workspaces & Scheduling</em>
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--muted)', margin: '0 0 28px' }}>
                  Every swap gets its own dedicated workspace with live chat and shared goals, integrated directly with a custom monthly calendar to schedule, reschedule, and track your sessions.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {['Live messaging & collaboration workspace', 'Interactive month-view swap calendar', 'Collaborative goal & milestone tracking', 'Session duration & format configurations'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--ink)' }}>
                      <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal className="split-visual" delay={150}>
              <div className="mockup-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', flex: 1 }}>Python ↔ Go Swap</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>2 of 4 sessions</div>
                </div>
                {[
                  { name: 'You', msg: 'Got the Go concurrency pattern working! Want to review?', time: '10:32', isYou: true },
                  { name: 'Alex', msg: 'Nice! Let me finish the Django API route first', time: '10:34', isYou: false },
                  { name: 'You', msg: 'Sure. I pushed the goroutine example to our repo', time: '10:36', isYou: true },
                ].map((msg, i) => (
                  <div key={i} style={{
                     display: 'flex', justifyContent: msg.isYou ? 'flex-end' : 'flex-start',
                     marginBottom: 12,
                  }}>
                    <div style={{
                      maxWidth: '75%',
                      background: msg.isYou ? 'var(--accent)' : 'var(--border)',
                      color: msg.isYou ? 'white' : 'var(--ink)',
                      borderRadius: msg.isYou ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      padding: '10px 14px', fontSize: 12, lineHeight: 1.5,
                    }}>
                      <div>{msg.msg}</div>
                      <div style={{
                        fontSize: 10, opacity: 0.6, marginTop: 4,
                        textAlign: msg.isYou ? 'right' : 'left',
                      }}>
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border)',
                }}>
                  <div style={{
                    flex: 1, height: 34, borderRadius: 6,
                    background: 'var(--cream)', border: '1px solid var(--border)',
                  }} />
                  <div style={{
                    width: 34, height: 34, borderRadius: 6,
                    background: 'var(--accent)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: 'white',
                  }}>→</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>


        {/* Feature 3: Gamified Rankings */}
        <div className="section-spacing" style={{ position: 'relative', zIndex: 1 }}>
          <div className="split-section" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal className="split-content" delay={0}>
              <div>
                <div style={{
                  fontFamily: 'PT Mono, monospace', fontSize: 10,
                  letterSpacing: 2.5, textTransform: 'uppercase',
                  color: 'var(--muted)', marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--muted)' }} />
                  Feature
                </div>
                <h2 style={{
                  fontFamily: 'PT Serif, serif',
                  fontSize: 'clamp(28px, 3.5vw, 44px)',
                  fontWeight: 600, lineHeight: 1.08, letterSpacing: -1.2,
                  margin: '0 0 20px', color: 'var(--ink)',
                }}>
                  <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Gamified</em> Rankings
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--muted)', margin: '0 0 28px' }}>
                  Earn badges, climb from Bronze to Diamond, and compete on the global leaderboard. Every swap you complete builds your reputation.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {['6 tiers: Bronze → Silver → Gold → Platinum → Diamond → Legend', 'Skill-specific badges for expertise areas', 'Monthly leaderboard with city & global rankings', 'Reputation score based on reviews & completions'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--ink)' }}>
                      <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal className="split-visual" delay={150}>
              <div className="mockup-card" style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Leaderboard — Diamond Tier</div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 1,
                    padding: '3px 10px', borderRadius: 4,
                    background: 'rgba(var(--indigo-rgb),0.1)', color: 'var(--indigo)',
                    textTransform: 'uppercase',
                  }}>Top 10%</div>
                </div>
                {[
                  { rank: 1, name: 'Priya Mehta', points: 2840, badge: '✦', color: 'var(--accent)' },
                  { rank: 2, name: 'Rahul Sharma', points: 2710, badge: '✦', color: 'var(--sage)' },
                  { rank: 3, name: 'You', points: 2580, badge: '✦', color: 'var(--indigo)', highlight: true },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 8,
                    marginBottom: 8,
                    background: item.highlight ? 'rgba(var(--accent-rgb),0.06)' : 'transparent',
                    border: item.highlight ? '1px solid rgba(var(--accent-rgb),0.15)' : '1px solid transparent',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: item.highlight ? 'var(--accent)' : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: item.highlight ? 'white' : 'var(--muted)',
                      flexShrink: 0,
                    }}>
                      {item.rank}
                    </div>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: item.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0,
                    }}>
                      {item.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                        {item.name}{item.highlight ? ' (you)' : ''}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: 'var(--gold)',
                    }}>
                      {item.badge} {item.points.toLocaleString()}
                    </div>
                  </div>
                ))}
                <div style={{
                  marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)',
                }}>
                  <span>Next tier: Legend at 3,000 pts</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent)' }}>420 pts to go</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Feature 4: AI-Powered Assistance */}
        <div className="section-spacing" style={{ position: 'relative', zIndex: 1 }}>
          <div className="split-section reverse" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal className="split-content" delay={0}>
              <div>
                <div style={{
                  fontFamily: 'PT Mono, monospace', fontSize: 10,
                  letterSpacing: 2.5, textTransform: 'uppercase',
                  color: 'var(--muted)', marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--muted)' }} />
                  Feature
                </div>
                <h2 style={{
                  fontFamily: 'PT Serif, serif',
                  fontSize: 'clamp(28px, 3.5vw, 44px)',
                  fontWeight: 600, lineHeight: 1.08, letterSpacing: -1.2,
                  margin: '0 0 20px', color: 'var(--ink)',
                }}>
                  <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>AI-Powered</em> Assistance
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--muted)', margin: '0 0 28px' }}>
                  Supercharge your exchanges with Gemini AI. Instantly draft personalized swap proposal messages, scan your GitHub repositories to suggest verified technical skills, and view summarized reviews of other members.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {['AI-assisted proposal draft generator', 'GitHub repository skill scanning', 'AI-generated user review summaries', 'Smart explanation of matches'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--ink)' }}>
                      <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal className="split-visual" delay={150}>
              <div className="mockup-card" style={{ padding: '24px 20px', background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                  <SparklesIcon size={18} style={{ color: 'var(--accent)' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>AI Proposal Draft</div>
                </div>
                
                <div style={{ background: 'var(--warm)', border: '1px solid var(--border)', borderRadius: 10, padding: 14, fontSize: 12, color: 'var(--ink)', lineHeight: 1.5, marginBottom: 16 }}>
                  "Hi Aarav, I would love to share my React skills with you in exchange for your Python backend knowledge. Let me know if you would like to collaborate on a session!"
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn-cosmos btn-cosmos-ghost" style={{ padding: '6px 12px', fontSize: 10 }} disabled>Re-generate</button>
                  <button className="btn-cosmos btn-cosmos-primary" style={{ padding: '6px 12px', fontSize: 10 }} disabled>Use Draft</button>
                </div>
                
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    GitHub Link Connected
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--sage-light)', color: 'var(--sage)', fontWeight: 700, border: '1px solid var(--sage)' }}>
                    ✨ Inferred 4 Skills
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>


      {/* ──────────────── HOW IT WORKS ──────────────── */}
      <section id="how" style={{
        background: 'var(--section-dark)', padding: '100px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Orb glow */}
        <div className="orb-glow" style={{
          width: 500, height: 500, bottom: '-20%', right: '-10%',
          background: 'rgba(var(--accent-rgb),0.08)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 50% 80% at 80% 50%, rgba(var(--accent-rgb),0.12) 0%, transparent 60%)',
        }} />
        {/* Dot grid */}
        <svg className="dot-grid-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="dot-grid-how" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="white" opacity="0.06" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid-how)" />
        </svg>

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div className="how-header" style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              marginBottom: 64, gap: 40,
            }}>
              <div>
                <div style={{
                  fontFamily: 'PT Mono, monospace', fontSize: 10,
                  letterSpacing: 2.5, textTransform: 'uppercase',
                  color: 'var(--section-text-muted)', marginBottom: 14,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--section-text-muted)' }} />
                  Process
                </div>
                <h2 style={{
                  fontFamily: 'PT Serif, serif',
                  fontSize: 'clamp(32px, 4vw, 52px)',
                  fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5,
                  margin: 0, color: 'var(--section-text)',
                }}>
                  How <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>SkillSwap</em><br />Actually Works
                </h2>
              </div>
              <div>
                <p style={{
                  fontSize: 14, lineHeight: 1.7, color: 'var(--section-text-muted)',
                  maxWidth: 380, fontWeight: 400, margin: '0 0 20px',
                }}>
                  No money. No subscriptions. Just genuine knowledge exchange between people who want to grow together.
                </p>
                <button
                  className="btn-cosmos btn-cosmos-primary"
                  onClick={() => navigate('/register')}
                >
                  Create Profile
                  <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
                </button>
              </div>
            </div>
          </Reveal>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}>
            {[
              { num: '01', icon: '✦', title: 'Build Your Profile',
                desc: 'Add your name, photo, location, and bio. List skills you offer, skills you want, and your availability.' },
              { num: '02', icon: '⌕', title: 'Search & Browse',
                desc: 'Filter by skill category or search by keyword. Our smart matching algorithm surfaces your highest-compatibility partners first.' },
              { num: '03', icon: '⇄', title: 'Send a Swap Request',
                desc: 'Choose what you\'re offering, what you want, write a personal message, and propose a schedule.' },
              { num: '04', icon: '★', title: 'Learn & Leave Feedback',
                desc: 'Complete your sessions. Rate your partner, describe what you learned, and help the community grow.' },
            ].map((s, i) => (
              <Reveal key={s.num} delay={i * 100}>
                <div style={{
                  background: 'var(--section-card)', border: '1px solid var(--section-card-border)',
                  borderRadius: 16, padding: '28px 24px',
                  position: 'relative',
                }}>
                  <div style={{
                    fontFamily: 'PT Serif, serif', fontSize: 56, fontWeight: 700,
                    color: 'var(--section-text)', opacity: 0.08, lineHeight: 1,
                    marginBottom: 16,
                  }}>
                    {s.num}
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--accent)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, marginBottom: 14,
                  }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--section-text)', marginBottom: 8 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--section-text-muted)', lineHeight: 1.6 }}>
                    {s.desc}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIALS ──────────────── */}
      <section style={{
        padding: '100px 24px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, var(--cream) 0%, rgba(var(--indigo-rgb),0.02) 50%, var(--cream) 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{
                fontFamily: 'PT Mono, monospace', fontSize: 10,
                letterSpacing: 2.5, textTransform: 'uppercase',
                color: 'var(--muted)', marginBottom: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}>
                <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--muted)' }} />
                Testimonials
                <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--muted)' }} />
              </div>
              <h2 style={{
                fontFamily: 'PT Serif, serif',
                fontSize: 'clamp(28px, 3.5vw, 44px)',
                fontWeight: 600, letterSpacing: -1.2, margin: 0,
                color: 'var(--ink)',
              }}>
                Loved by the <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>community</em>
              </h2>
            </div>
          </Reveal>

          <div className="testimonial-grid">
            {/* Big left card */}
            <Reveal delay={0} className="testimonial-card" style={{
              background: 'var(--card-bg)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '36px 32px',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}>
              <div style={{
                fontSize: 15, lineHeight: 1.8, color: 'var(--ink)', fontStyle: 'italic',
                flex: 1,
              }}>
                "{TESTIMONIALS[0].text}"
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: TESTIMONIALS[0].color, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: 'white',
                }}>
                  {TESTIMONIALS[0].initials}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
                    {TESTIMONIALS[0].name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {TESTIMONIALS[0].role}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right column — 2 stacked cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {TESTIMONIALS.slice(1).map((t, i) => (
                <Reveal key={i} delay={(i + 1) * 100} className="testimonial-card" style={{
                  background: 'var(--card-bg)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '28px 24px',
                  display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                  <div style={{
                    fontSize: 13, lineHeight: 1.7, color: 'var(--ink)', fontStyle: 'italic',
                  }}>
                    "{t.text}"
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: t.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: 'white',
                    }}>
                      {t.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {t.role}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── METRICS ──────────────── */}
      <section style={{
        padding: '80px 24px', textAlign: 'center', position: 'relative',
      }}>
        <Reveal>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="metrics-row">
              <div className="metric-item">
                <div className="metric-value" style={{ color: 'var(--ink)' }}>4,200+</div>
                <div className="metric-label" style={{ color: 'var(--muted)' }}>Active Members</div>
              </div>
              <div className="metric-item">
                <div className="metric-value" style={{ color: 'var(--ink)' }}>2,800+</div>
                <div className="metric-label" style={{ color: 'var(--muted)' }}>Swaps Completed</div>
              </div>
              <div className="metric-item" style={{ borderRight: 'none' }}>
                <div className="metric-value" style={{ color: 'var(--ink)' }}>94%</div>
                <div className="metric-label" style={{ color: 'var(--muted)' }}>Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ──────────────── FINAL CTA ──────────────── */}
      <section className="cta-section" style={{ background: 'var(--section-dark)' }}>
        <div className="orb-glow" style={{
          width: 600, height: 600, top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(var(--accent-rgb),0.10)',
        }} />
        <svg className="dot-grid-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="dot-grid-cta" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="white" opacity="0.05" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dot-grid-cta)" />
        </svg>

        <Reveal>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'PT Serif, serif',
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5,
              margin: '0 0 20px', color: 'var(--section-text)',
            }}>
              Ready to start <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>swapping</em>?
            </h2>
            <p style={{
              fontSize: 14, lineHeight: 1.7, color: 'var(--section-text-muted)',
              maxWidth: 440, margin: '0 auto 36px',
            }}>
              Join thousands of professionals trading skills and growing together. Your next learning opportunity is one swap away.
            </p>
            <button
              className="btn-cosmos btn-cosmos-primary"
              onClick={() => navigate('/register')}
              style={{ padding: '16px 44px', fontSize: 12 }}
            >
              Create Free Account
              <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
            </button>
          </div>
        </Reveal>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
    </div>
  );
}
