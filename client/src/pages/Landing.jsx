import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--cream)' }}>
      {/* HERO */}
      <section className="hero-section">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse 60% 50% at 80% 40%, rgba(200,75,49,0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 20% 70%, rgba(58,99,81,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
        
        <div className="hero-text-wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sage)' }} />
            Free Skill Exchange Platform
          </div>
          <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 'clamp(42px, 5.5vw, 84px)', fontWeight: 600, lineHeight: 1.02, letterSpacing: -2, marginBottom: 28, color: 'var(--ink)' }}>
            Trade What<br />
            You <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Know.</span><br />
            Learn What<br />
            You <span style={{ display: 'inline-block', borderBottom: '3px solid var(--ink)', paddingBottom: 2 }}>Don't.</span>
          </h1>
          <p style={{ fontFamily: 'PT Sans, sans-serif', fontSize: 15, lineHeight: 1.75, color: 'var(--muted)', maxWidth: 440, marginBottom: 40, fontWeight: 400 }}>
            Connect with people who have the skills you need, and share what you know best — no money, no subscriptions, just a genuine exchange of knowledge and expertise.
          </p>
          <div className="hero-cta" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 52 }}>
            <button className="btn-ink" onClick={() => navigate('/register')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '15px 34px', fontSize: 14 }}>
              Start Swapping <span>→</span>
            </button>
            <a href="#how" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', textDecoration: 'none', letterSpacing: 0.2, display: 'flex', alignItems: 'center', gap: 6 }}>
              How it works ↓
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex' }}>
              {['#C84B31','#3A6351','#3B4F8C','#B8902A','#7A5FA8'].map((c,i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', marginLeft: i===0?0:-8, background: c }}>
                  {['AK','PR','SM','NJ','KP'][i]}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.5, textAlign: 'left' }}>
              <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>4,200+</strong> professionals swapping skills<br />
              across 38 cities worldwide
            </div>
          </div>
        </div>

        <div className="hero-visual">
          {/* Main Card Graphic */}
          <div style={{ position: 'absolute', background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', width: 300, top: 80, left: 30 }}>
            <div style={{ height: 72, background: 'linear-gradient(135deg, #C84B31 0%, #e07a5f 100%)' }} />
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: '#C84B31', border: '3px solid var(--card-bg)', marginTop: -28, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white' }}>PM</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, color: 'var(--ink)' }}>Priya Mehta</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>📍 Mumbai, India</div>
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
          
          {/* Side Card 1 */}
          <div style={{ position: 'absolute', background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '16px 18px', width: 220, top: 30, right: -10 }}>
            <div className="skill-section-label" style={{ marginBottom: 10 }}>Top Matches</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--ink)' }}>
              <span style={{ fontWeight: 600 }}>Rahul — Python</span>
              <span style={{ fontWeight: 800, color: 'var(--accent)' }}>96%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', fontSize: 12, color: 'var(--ink)' }}>
              <span style={{ fontWeight: 600 }}>Sara — TypeScript</span>
              <span style={{ fontWeight: 800, color: 'var(--accent)' }}>88%</span>
            </div>
          </div>
          
          {/* Side Card 2 */}
          <div style={{ position: 'absolute', background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '16px 18px', width: 220, bottom: 40, right: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>SA</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2, color: 'var(--ink)' }}>Swap Completed 🎉</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Sara → Python · You → Go</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <span style={{ color: '#B8902A', fontSize: 11 }}>★★★★★</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)' }}>4.9 / 5</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: 'var(--section-dark)', padding: '100px 56px', position: 'relative', overflow: 'hidden' }} className="container">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 80% at 80% 50%, rgba(200,75,49,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
        
        <div className="how-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 64, gap: 40, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--section-text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-block', width: 20, height: 1, background: 'var(--section-text-muted)' }} />
              Process
            </div>
            <div style={{ fontFamily: 'PT Serif, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 16, color: 'var(--section-text)' }}>
              How <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>SkillSwap</em><br />Actually Works
            </div>
          </div>
          <div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--section-text-muted)', maxWidth: 380, fontWeight: 400 }}>
              No money. No subscriptions. Just genuine knowledge exchange between people who want to grow together.
            </p>
            <button className="btn-accent" style={{ marginTop: 20 }} onClick={() => navigate('/register')}>Create Profile →</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, position: 'relative', zIndex: 1 }}>
          {[
            { num: '01', icon: '👤', title: 'Build Your Profile', desc: 'Add your name, photo, location, and bio. List skills you offer, skills you want, and your availability.' },
            { num: '02', icon: '🔍', title: 'Search & Browse', desc: 'Filter by skill category or search by keyword. Our smart matching algorithm surfaces your highest-compatibility partners first.' },
            { num: '03', icon: '🤝', title: 'Send a Swap Request', desc: 'Choose what you\'re offering, what you want, write a personal message, and propose a schedule.' },
            { num: '04', icon: '⭐', title: 'Learn & Leave Feedback', desc: 'Complete your sessions. Rate your partner, describe what you learned, and help the community grow.' }
          ].map(s => (
            <div key={s.num} style={{ background: 'var(--section-card)', border: '1px solid var(--section-card-border)', borderRadius: 16, padding: '28px 24px' }}>
              <div style={{ fontFamily: 'PT Serif, serif', fontSize: 56, fontWeight: 700, color: 'var(--section-text)', opacity: 0.12, lineHeight: 1, marginBottom: 16 }}>{s.num}</div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--section-text)', marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--section-text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--section-dark-secondary)', padding: '48px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, borderTop: '1px solid var(--section-divider)' }}>
        <div style={{ fontFamily: 'PT Serif, serif', fontSize: 24, fontWeight: 700, letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--section-text)' }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white', fontWeight: 700, fontFamily: 'PT Sans, sans-serif' }}>S²</div>
          SkillSwap
        </div>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          <a href="#" style={{ color: 'var(--section-text-muted)', textDecoration: 'none', fontSize: 12, fontWeight: 600, transition: 'color .2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--section-text)'}
            onMouseLeave={e => e.target.style.color = 'var(--section-text-muted)'}>About</a>
          <a href="#" style={{ color: 'var(--section-text-muted)', textDecoration: 'none', fontSize: 12, fontWeight: 600, transition: 'color .2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--section-text)'}
            onMouseLeave={e => e.target.style.color = 'var(--section-text-muted)'}>Privacy Policy</a>
        </div>
        <div style={{ color: 'var(--section-text-muted)', fontSize: 12 }}>© 2026 SkillSwap. All rights reserved.</div>
      </footer>
    </div>
  );
}
