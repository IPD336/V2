import { useNavigate } from 'react-router-dom';
import Reveal from '../components/Reveal';
import AnimatedCounter from '../components/AnimatedCounter';
import FAQAccordion from '../components/FAQAccordion';
import SkillConstellationDiagram from '../components/SkillConstellationDiagram';
import SkillJourneyTimeline from '../components/SkillJourneyTimeline';
import TextRoll from '../components/TextRoll';
import FeatureSection from '../components/FeatureSection';
import Footer from '../components/Footer';
import { SparklesIcon } from '../components/Icons';
import TestimonialDeck from '../components/TestimonialDeck';
import '../styles/landing.css';
import '../styles/hero-visual.css';
import '../styles/testimonials-faq.css';

const SOCIAL_AVATARS = [
  { initials: 'AK', color: 'var(--accent)' },
  { initials: 'PR', color: 'var(--sage)' },
  { initials: 'SM', color: 'var(--indigo)' },
  { initials: 'NJ', color: 'var(--gold)', textColor: 'var(--ink)' },
  { initials: 'KP', color: '#7A5FA8' },
];

function MatchMockup() {
  return (
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
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{item.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.skills}</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'PT Serif, serif', color: item.match >= 90 ? 'var(--sage)' : 'var(--accent)' }}>
            {item.match}%
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatMockup() {
  return (
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
        <div key={i} style={{ display: 'flex', justifyContent: msg.isYou ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
          <div style={{ maxWidth: '75%', background: msg.isYou ? 'var(--accent)' : 'var(--border)', color: msg.isYou ? 'white' : 'var(--ink)', borderRadius: msg.isYou ? '12px 12px 2px 12px' : '12px 12px 12px 2px', padding: '10px 14px', fontSize: 12, lineHeight: 1.5 }}>
            <div>{msg.msg}</div>
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: msg.isYou ? 'right' : 'left' }}>{msg.time}</div>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ flex: 1, height: 34, borderRadius: 6, background: 'var(--cream)', border: '1px solid var(--border)' }} />
        <div style={{ width: 34, height: 34, borderRadius: 6, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'white' }}>→</div>
      </div>
    </div>
  );
}

function LeaderboardMockup() {
  return (
    <div className="mockup-card" style={{ padding: '24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Leaderboard — Diamond Tier</div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '3px 10px', borderRadius: 4, background: 'rgba(var(--indigo-rgb),0.1)', color: 'var(--indigo)', textTransform: 'uppercase' }}>Top 10%</div>
      </div>
      {[
        { rank: 1, name: 'Priya Mehta', points: 2840, badge: '✦', color: 'var(--accent)' },
        { rank: 2, name: 'Rahul Sharma', points: 2710, badge: '✦', color: 'var(--sage)' },
        { rank: 3, name: 'You', points: 2580, badge: '✦', color: 'var(--indigo)', highlight: true },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, marginBottom: 8, background: item.highlight ? 'rgba(var(--accent-rgb),0.06)' : 'transparent', border: item.highlight ? '1px solid rgba(var(--accent-rgb),0.15)' : '1px solid transparent' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: item.highlight ? 'var(--accent)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: item.highlight ? 'white' : 'var(--muted)', flexShrink: 0 }}>
            {item.rank}
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0 }}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
              {item.name}{item.highlight ? ' (you)' : ''}
            </div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)' }}>
            {item.badge} {item.points.toLocaleString()}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
        <span>Next tier: Legend at 3,000 pts</span>
        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>420 pts to go</span>
      </div>
    </div>
  );
}

function AIMockup() {
  return (
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
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page-fade-in">

      {/* ──────────────── HERO ──────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden', minHeight: '100vh',
        padding: '160px 24px 100px', display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `
            radial-gradient(ellipse 70% 60% at 30% 30%, rgba(var(--accent-rgb),0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 60%, rgba(var(--sage-rgb),0.04) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 50% 80%, rgba(var(--indigo-rgb),0.03) 0%, transparent 50%),
            var(--cream)
          `,
        }} />
        <div className="orb-glow" style={{
          width: 400, height: 400, top: '10%', left: '15%',
          background: 'rgba(var(--accent-rgb),0.10)',
        }} />


        <div style={{
          position: 'relative', zIndex: 1, width: '100%',
          display: 'flex', flexDirection: 'column', gap: 40,
          maxWidth: 1280, margin: '0 auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 640 }}>
            <Reveal delay={0}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'var(--card-bg)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '7px 16px', fontSize: 11,
                fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                color: 'var(--muted)', width: 'fit-content',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)' }} />
                <TextRoll center>Free Skill Exchange Platform</TextRoll>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <h1 style={{
                fontFamily: 'PT Serif, serif',
                fontSize: 'clamp(42px, 5.5vw, 84px)',
                fontWeight: 600, lineHeight: 1.02, letterSpacing: -2,
                color: 'var(--ink)', margin: 0,
              }}>
                Trade What<br />
                You <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}><TextRoll center>Know.</TextRoll></span><br />
                Learn What<br />
                You <span style={{ display: 'inline-block', borderBottom: '3px solid var(--ink)', paddingBottom: 2 }}><TextRoll center>Don't.</TextRoll></span>
              </h1>
            </Reveal>

            <Reveal delay={240}>
              <p style={{
                fontFamily: 'PT Sans, sans-serif', fontSize: 15,
                lineHeight: 1.75, color: 'var(--muted)',
                maxWidth: 480, fontWeight: 400, margin: 0,
              }}>
                Connect with people who have the skills you need, and share what you know best — no money, no subscriptions, just a genuine exchange of knowledge and expertise.
              </p>
            </Reveal>

            <Reveal delay={360}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <button className="btn-cosmos btn-cosmos-primary" onClick={() => navigate('/register')}>
                  <TextRoll center>Start Swapping</TextRoll>
                  <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
                </button>
                <a href="#features" style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textDecoration: 'none', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TextRoll center>Explore features ↓</TextRoll>
                </a>
              </div>
            </Reveal>

            <Reveal delay={480}>
              <div className="social-proof-row">
                <div className="social-proof-avatars">
                  {SOCIAL_AVATARS.map((a, i) => (
                    <div key={i} className="social-proof-avatar" style={{ background: a.color, color: a.textColor || 'white', zIndex: SOCIAL_AVATARS.length - i }}>
                      {a.initials}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--ink)', fontWeight: 700 }}><AnimatedCounter value="4,200+" /></strong> professionals swapping skills<br />
                  across 38 cities worldwide
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="hero-visual-cards" style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', width: 520, height: 560, zIndex: 1 }}>
          <SkillConstellationDiagram />
        </div>
      </section>

      {/* ──────────────── STATS BAR ──────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 75%, black) 100%)',
        padding: '48px 24px', position: 'relative', overflow: 'hidden',
      }}>

        <div className="metrics-row" style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto' }}>
          {[
            { num: '4,200+', label: 'Active Members' },
            { num: '2,800+', label: 'Swaps Completed' },
            { num: '38', label: 'Cities Worldwide' },
            { num: '94%', label: 'Satisfaction Rate' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 100} style={{ width: '100%' }}>
              <div className="metric-item">
                <div className="metric-value" style={{ color: 'white' }}><AnimatedCounter value={s.num} /></div>
                <div className="metric-label" style={{ color: 'rgba(255,255,255,0.8)' }}><TextRoll center>{s.label}</TextRoll></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────────────── FEATURES ──────────────── */}
      <section id="features" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(180deg, var(--cream) 0%, rgba(var(--accent-rgb),0.02) 50%, var(--cream) 100%)' }} />

        <FeatureSection
          title="Smart Matching"
          description="Our algorithm doesn't just look at keywords — it analyzes complementary skill gaps, experience levels, and availability to find your ideal swap partner."
          items={['Cross-skill compatibility scoring', 'Experience-level alignment', 'Availability & timezone matching', 'Instant match percentage']}
        >
          <MatchMockup />
        </FeatureSection>

        <FeatureSection
          title="Workspaces & Scheduling"
          description="Every swap gets its own dedicated workspace with live chat and shared goals, integrated directly with a custom monthly calendar to schedule, reschedule, and track your sessions."
          items={['Live messaging & collaboration workspace', 'Interactive month-view swap calendar', 'Collaborative goal & milestone tracking', 'Session duration & format configurations']}
          reverse
        >
          <ChatMockup />
        </FeatureSection>

        <FeatureSection
          title="Gamified"
          description="Earn badges, climb from Bronze to Diamond, and compete on the global leaderboard. Every swap you complete builds your reputation."
          items={['6 tiers: Bronze → Silver → Gold → Platinum → Diamond → Legend', 'Skill-specific badges for expertise areas', 'Monthly leaderboard with city & global rankings', 'Reputation score based on reviews & completions']}
        >
          <LeaderboardMockup />
        </FeatureSection>

        <FeatureSection
          title="AI-Powered"
          description="Supercharge your exchanges with Gemini AI. Instantly draft personalized swap proposal messages, scan your GitHub repositories to suggest verified technical skills, and view summarized reviews of other members."
          items={['AI-assisted proposal draft generator', 'GitHub repository skill scanning', 'AI-generated user review summaries', 'Smart explanation of matches']}
          reverse
        >
          <AIMockup />
        </FeatureSection>
      </section>

      {/* ──────────────── HOW IT WORKS ──────────────── */}
      <section id="how" style={{
        background: 'var(--section-dark)', padding: '100px 24px',
        position: 'relative', overflow: 'clip',
      }}>
        <div className="orb-glow" style={{ width: 500, height: 500, bottom: '-20%', right: '-10%', background: 'rgba(var(--accent-rgb),0.08)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 50% 80% at 80% 50%, rgba(var(--accent-rgb),0.12) 0%, transparent 60%)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div className="how-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 64, gap: 40 }}>
              <div>
                <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--section-text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--section-text-muted)' }} />
                  <TextRoll center>Process</TextRoll>
                </div>
                <h2 style={{ fontFamily: 'PT Serif, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5, margin: 0, color: 'var(--section-text)' }}>
                  How <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}><TextRoll center>SkillSwap</TextRoll></em><br /><TextRoll center>Actually Works</TextRoll>
                </h2>
              </div>
              <div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--section-text-muted)', maxWidth: 380, fontWeight: 400, margin: '0 0 20px' }}>
                  No money. No subscriptions. Just genuine knowledge exchange between people who want to grow together.
                </p>
                <button className="btn-cosmos btn-cosmos-primary" onClick={() => navigate('/register')}>
                  <TextRoll center>Create Profile</TextRoll>
                  <span style={{ fontSize: 14, lineHeight: 1 }}>→</span>
                </button>
              </div>
            </div>
          </Reveal>
          <SkillJourneyTimeline />
        </div>
      </section>

      {/* ──────────────── TESTIMONIALS ──────────────── */}
      <section id="testimonials" style={{
        padding: '100px 24px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, var(--cream) 0%, rgba(var(--indigo-rgb),0.02) 50%, var(--cream) 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--muted)' }} />
                <TextRoll center>Testimonials</TextRoll>
                <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--muted)' }} />
              </div>
              <h2 style={{ fontFamily: 'PT Serif, serif', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 600, letterSpacing: -1.2, margin: 0, color: 'var(--ink)' }}>
                <TextRoll center>Loved by the</TextRoll> <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}><TextRoll center>community</TextRoll></em>
              </h2>
            </div>
          </Reveal>          <Reveal delay={100}>
            <TestimonialDeck />
          </Reveal>
        </div>
      </section>

      {/* ──────────────── METRICS ──────────────── */}
      <section style={{ padding: '80px 24px', textAlign: 'center', position: 'relative' }}>
        <Reveal>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="metrics-row">
              <div className="metric-item">
                <div className="metric-value" style={{ color: 'var(--ink)' }}><AnimatedCounter value="4,200+" /></div>
                <div className="metric-label" style={{ color: 'var(--muted)' }}><TextRoll center>Active Members</TextRoll></div>
              </div>
              <div className="metric-item">
                <div className="metric-value" style={{ color: 'var(--ink)' }}><AnimatedCounter value="2,800+" /></div>
                <div className="metric-label" style={{ color: 'var(--muted)' }}><TextRoll center>Swaps Completed</TextRoll></div>
              </div>
              <div className="metric-item" style={{ borderRight: 'none' }}>
                <div className="metric-value" style={{ color: 'var(--ink)' }}><AnimatedCounter value="94%" /></div>
                <div className="metric-label" style={{ color: 'var(--muted)' }}><TextRoll center>Satisfaction Rate</TextRoll></div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ──────────────── FINAL CTA ──────────────── */}
      <section className="cta-section" style={{ background: 'var(--section-dark)' }}>
        <div className="orb-glow" style={{ width: 600, height: 600, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(var(--accent-rgb),0.10)' }} />

        <Reveal>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'PT Serif, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5, margin: '0 0 20px', color: 'var(--section-text)' }}>
              <TextRoll center>Ready to start</TextRoll> <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}><TextRoll center>swapping</TextRoll></em>?
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--section-text-muted)', maxWidth: 440, margin: '0 auto 36px' }}>
              Join thousands of professionals trading skills and growing together. Your next learning opportunity is one swap away.
            </p>
            <button className="btn-cosmos btn-cosmos-primary" onClick={() => navigate('/register')} style={{ padding: '16px 44px', fontSize: 12 }}>
              <TextRoll center>Create Free Account</TextRoll>
              <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
            </button>
          </div>
        </Reveal>
      </section>

      {/* ──────────────── FAQ ──────────────── */}
      <section id="faq" style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden', background: 'var(--section-dark)' }}>
        <div className="orb-glow" style={{ width: 400, height: 400, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(var(--accent-rgb),0.08)' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--section-text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--section-text-muted)' }} />
                <TextRoll center>FAQ</TextRoll>
                <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--section-text-muted)' }} />
              </div>
              <h2 style={{ fontFamily: 'PT Serif, serif', fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 600, letterSpacing: -1.2, margin: 0, color: 'var(--section-text)' }}>
                <TextRoll center>Got</TextRoll> <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}><TextRoll center>questions?</TextRoll></em>
              </h2>
            </div>
          </Reveal>
          <Reveal>
            <FAQAccordion />
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
