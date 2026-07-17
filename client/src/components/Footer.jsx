import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LogoMark } from './Logo';
import { TwitterIcon, LinkedInIcon, GitHubIcon, FacebookIcon, InstagramIcon } from './Icons';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [modalType, setModalType] = useState(null); // 'privacy' | 'terms' | null

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000); // reset notice after 5s
  };

  const handleScrollTo = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If we are not on the landing page, navigate home then scroll
      navigate(`/#${elementId}`);
    }
  };

  return (
    <footer style={{
      position: 'relative',
      zIndex: 101,
      background: 'var(--section-dark-secondary)',
      padding: '80px 24px 40px',
      borderTop: '1px solid var(--section-divider)',
      color: 'var(--section-text-muted)',
      fontFamily: 'PT Sans, sans-serif',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        
        {/* ── Main Footer Grid ── */}
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 40,
          marginBottom: 60,
        }}>
          
          {/* Column 1: Brand details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <LogoMark size={32} style={{ borderRadius: 8 }} />
              <span style={{
                fontFamily: 'PT Serif, serif',
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: -0.5,
                color: 'var(--section-text)',
              }}>
                SkillSwap
              </span>
            </div>
            <p style={{
              fontSize: 13,
              lineHeight: 1.6,
              margin: '8px 0 0 0',
              maxWidth: 240,
            }}>
              Trade your expertise. Elevate your craft. Matches developers, designers, and creators for direct 1-on-1 knowledge exchange.
            </p>
          </div>

          {/* Column 2: Landing Page Scrolls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: 'var(--section-text)',
              margin: 0,
            }}>
              Product
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span onClick={() => handleScrollTo('features')} className="footer-link">Features</span>
              <span onClick={() => handleScrollTo('how')} className="footer-link">How it Works</span>
              <span onClick={() => handleScrollTo('testimonials')} className="footer-link">Loved by Community</span>
              <span onClick={() => handleScrollTo('faq')} className="footer-link">FAQs</span>
            </div>
          </div>

          {/* Column 3: SPA Routing links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: 'var(--section-text)',
              margin: 0,
            }}>
              Explore
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/browse" className="footer-link">Find Matches</Link>
              <Link to="/teams" className="footer-link">Active Teams</Link>
              <Link to="/leaderboard" className="footer-link">Leaderboard</Link>
              <Link to="/badges" className="footer-link">Badges & Ranks</Link>
            </div>
          </div>

          {/* Column 4: Newsletter Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h4 style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: 'var(--section-text)',
              margin: 0,
            }}>
              Newsletter
            </h4>
            <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              Get weekly learning resources, swap matches, and success stories directly in your inbox.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8, marginTop: 4, position: 'relative' }}>
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--section-divider)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  fontSize: 13,
                  color: 'var(--section-text)',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--section-divider)'}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.target.style.opacity = 0.9}
                onMouseLeave={(e) => e.target.style.opacity = 1}
              >
                Join
              </button>
            </form>
            <AnimatePresence>
              {subscribed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--sage)',
                    marginTop: 4,
                  }}
                >
                  ✓ Subscribed! Welcome to the loop.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{
          borderTop: '1px dashed var(--section-divider)',
          marginBottom: 32,
        }} />

        {/* ── Bottom Row: Copyright + Links + Socials ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
        }}>
          {/* Copyright & Legal links */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px 24px', fontSize: 13 }}>
            <span>&copy; {new Date().getFullYear()} SkillSwap. All rights reserved.</span>
            <span onClick={() => setModalType('privacy')} className="footer-link" style={{ textDecoration: 'underline' }}>Privacy Policy</span>
            <span onClick={() => setModalType('terms')} className="footer-link" style={{ textDecoration: 'underline' }}>Terms of Service</span>
          </div>

          {/* Socials */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { icon: TwitterIcon, label: 'Twitter', href: 'https://twitter.com' },
              { icon: LinkedInIcon, label: 'LinkedIn', href: 'https://linkedin.com' },
              { icon: GitHubIcon, label: 'GitHub', href: 'https://github.com/IPD336/V2' },
              { icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com' },
              { icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com' }
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="footer-social-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--section-text-muted)',
                  border: '1px solid var(--section-divider)',
                  textDecoration: 'none',
                  transition: 'background .2s, color .2s, border-color .2s',
                }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── CSS Stylesheet ── */}
      <style>{`
        .footer-link {
          color: var(--section-text-muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s ease;
          width: fit-content;
        }
        .footer-link:hover {
          color: var(--section-text) !important;
        }
        .footer-social-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: var(--section-text) !important;
          border-color: var(--accent) !important;
        }
      `}</style>

      {/* ── Privacy Policy / Terms of Service Modal Overlay ── */}
      <AnimatePresence>
        {modalType && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setModalType(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                width: '100%',
                maxWidth: 600,
                maxHeight: '80vh',
                background: 'var(--card-bg)',
                border: '1.5px solid var(--border)',
                borderRadius: 24,
                padding: '32px 36px',
                boxShadow: 'var(--shadow-lg)',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                color: 'var(--ink)',
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card core
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{
                  fontFamily: 'PT Serif, serif',
                  fontSize: 22,
                  fontWeight: 600,
                  margin: 0,
                  color: 'var(--ink)',
                }}>
                  {modalType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
                <button
                  onClick={() => setModalType(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 24,
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Mock Policy Contents */}
              <div style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: 'var(--muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                paddingRight: 10,
              }}>
                {modalType === 'privacy' ? (
                  <>
                    <p style={{ margin: 0 }}><strong>Effective Date: July 17, 2026</strong></p>
                    <p style={{ margin: 0 }}>At SkillSwap, your privacy is a primary priority. We only collect the minimal personal information required to match you with compatible swap partners and support collaborative workspaces.</p>
                    <h5 style={{ margin: '8px 0 0 0', fontWeight: 700, color: 'var(--ink)' }}>1. Information Collection</h5>
                    <p style={{ margin: 0 }}>We collect your name, email, profile photo, bio, skills, and optional GitHub repositories if you decide to scan them for technical badge verification.</p>
                    <h5 style={{ margin: '8px 0 0 0', fontWeight: 700, color: 'var(--ink)' }}>2. How We Use Data</h5>
                    <p style={{ margin: 0 }}>Your data is strictly used to compile match compatibility profiles, configure workspace chats, coordinate swap schedules on your calendar, and rank badges on the global leaderboard.</p>
                    <h5 style={{ margin: '8px 0 0 0', fontWeight: 700, color: 'var(--ink)' }}>3. Data Sharing</h5>
                    <p style={{ margin: 0 }}>We do not sell, trade, or share your personal data with third-party tracking services. Your information is only visible to authenticated members whom you approve to swap with.</p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: 0 }}><strong>Effective Date: July 17, 2026</strong></p>
                    <p style={{ margin: 0 }}>Welcome to SkillSwap. By creating a profile or initiating exchanges, you agree to comply with our community standard terms.</p>
                    <h5 style={{ margin: '8px 0 0 0', fontWeight: 700, color: 'var(--ink)' }}>1. Peer-to-Peer Trading</h5>
                    <p style={{ margin: 0 }}>SkillSwap is a completely cash-free, peer-to-peer barter network. Subscriptions, financial fees, or commercial transactions are strictly prohibited in the workspaces.</p>
                    <h5 style={{ margin: '8px 0 0 0', fontWeight: 700, color: 'var(--ink)' }}>2. Community Conduct</h5>
                    <p style={{ margin: 0 }}>Every member must respect session times, maintain honest ratings, write constructive reviews, and collaborate in good faith. Harassment or toxic behavior will lead to an immediate ban.</p>
                    <h5 style={{ margin: '8px 0 0 0', fontWeight: 700, color: 'var(--ink)' }}>3. Intellectual Property</h5>
                    <p style={{ margin: 0 }}>You retain all ownership rights to any code, designs, or educational contents you share or write during 1-on-1 matches. SkillSwap holds no claim over swap materials.</p>
                  </>
                )}
              </div>

              {/* Close footer button */}
              <button
                onClick={() => setModalType(null)}
                style={{
                  marginTop: 8,
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 24px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'white',
                  cursor: 'pointer',
                  alignSelf: 'flex-end',
                }}
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
