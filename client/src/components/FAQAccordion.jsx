import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

const FAQ_DATA = [
  {
    id: 1,
    q: 'How does the skill swap process work?',
    a: 'After creating your profile and listing skills you offer and want to learn, our matching algorithm suggests compatible partners. You send a swap proposal describing what you\'ll teach and what you want to learn. Once accepted, you coordinate sessions through the built-in calendar and workspace.',
  },
  {
    id: 2,
    q: 'Is SkillSwap really free?',
    a: 'Yes — there are no fees, subscriptions, or hidden charges. SkillSwap is built around genuine knowledge exchange. The only currency is the skills you share.',
  },
  {
    id: 3,
    q: 'How does the matching algorithm work?',
    a: 'The algorithm analyzes complementary skill gaps — it finds people who offer what you want to learn AND want to learn what you offer. It also factors in experience level, availability, timezone, and review scores to surface the best matches first.',
  },
  {
    id: 4,
    q: 'What if I don\'t have a skill to offer?',
    a: 'Everyone has something to teach — whether it\'s coding, design, marketing, a language, or even soft skills like public speaking. If you\'re just starting out, you can offer to teach beginner-level concepts in exchange for more advanced guidance.',
  },
  {
    id: 5,
    q: 'How much time do I need to commit?',
    a: 'You\'re in control. Swaps can be structured as single sessions or multi-week programs. Most members start with 4 sessions of 1 hour each, scheduled at whatever pace works for both parties.',
  },
];

export default function FAQAccordion() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [openId, setOpenId] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSent, setIsSent] = useState(false);

  const handleSubmitContact = (e) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setIsContactOpen(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 2500);
  };

  return (
    <div
      className="faq-split-container"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 60,
        width: '100%',
        textAlign: 'left',
      }}
    >
      {/* ── LEFT COLUMN: Text Info + CTA Card ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Sparkle Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          border: '1px solid var(--section-divider)',
          borderRadius: 20,
          padding: '6px 14px',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--section-text)',
          textTransform: 'uppercase',
          fontFamily: 'PT Mono, monospace',
          width: 'fit-content',
        }}>
          <span>✳</span>
          <span>FAQ</span>
        </div>

        {/* Big Heading */}
        <h2 style={{
          fontFamily: 'PT Serif, serif',
          fontSize: 'clamp(32px, 4vw, 44px)',
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: -1.2,
          color: 'var(--section-text)',
          margin: 0,
        }}>
          Have more questions?
        </h2>

        {/* Description Text */}
        <p style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--section-text-muted)',
          margin: '0 0 20px 0',
          maxWidth: 460,
        }}>
          Our platform is designed to make swapping skills simple, secure, and collaborative. With intuitive matchmaking and workspaces, you can grow your craft effortlessly.
        </p>

        {/* Can't Find Answers CTA Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--section-divider)',
          borderRadius: 24,
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxWidth: 460,
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}>
          <h3 style={{
            fontFamily: 'PT Sans, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--section-text)',
            margin: 0,
          }}>
            Can't find answers?
          </h3>
          <p style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--section-text-muted)',
            margin: 0,
          }}>
            We're here to help you out whenever you need! Get in touch with our dedicated support team for personalized assistance anytime.
          </p>
          <button
            onClick={() => setIsContactOpen(true)}
            style={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 30,
              padding: '12px 26px',
              fontSize: 12,
              fontWeight: 700,
              color: 'white',
              cursor: 'pointer',
              width: 'fit-content',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Contact us ↗
          </button>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Accordion List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignSelf: 'start' }}>
        {FAQ_DATA.map((faq) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--section-divider)',
                borderRadius: 16,
                padding: '24px 28px',
                cursor: 'pointer',
                transition: 'background 0.3s ease, border-color 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: isOpen ? 16 : 0,
              }}
            >
              {/* Question Trigger Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <span style={{
                  fontFamily: 'PT Sans, sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--section-text)',
                }}>
                  {faq.q}
                </span>
                
                {/* Arrow Icon Button */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: isOpen ? 'white' : 'rgba(255, 255, 255, 0.08)',
                    color: isOpen ? '#111111' : 'var(--section-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    transition: 'transform 0.3s ease, background 0.3s ease, color 0.3s ease',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                >
                  ↓
                </div>
              </div>

              {/* Slide-open Answer Text */}
              <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: 'var(--section-text-muted)',
                  borderTop: '1px dashed var(--section-divider)',
                  paddingTop: 14,
                  marginTop: -4,
                }}>
                  {faq.a}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* ── CSS Stylesheet ── */}
      <style>{`
        @media (min-width: 768px) {
          .faq-split-container {
            grid-template-columns: 1fr 1.15fr !important;
            gap: 60px !important;
          }
        }
      `}</style>

      {/* ── Contact Support Overlay Modal ── */}
      <AnimatePresence>
        {isContactOpen && (
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
            onClick={() => setIsContactOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              style={{
                width: '100%',
                maxWidth: 480,
                background: 'var(--card-bg)',
                border: '1.5px solid var(--border)',
                borderRadius: 24,
                padding: '32px 36px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                color: 'var(--ink)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{
                  fontFamily: 'PT Serif, serif',
                  fontSize: 22,
                  fontWeight: 600,
                  margin: 0,
                  color: 'var(--ink)',
                }}>
                  Get in touch
                </h3>
                <button
                  onClick={() => setIsContactOpen(false)}
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

              <AnimatePresence mode="wait">
                {isSent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      textAlign: 'center',
                      padding: '40px 0',
                      color: 'var(--sage)',
                      fontWeight: 700,
                      fontSize: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 44 }}>✓</span>
                    <span>Message sent successfully! We will get back to you shortly.</span>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmitContact}
                    style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)' }}>Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1.5px solid var(--border)',
                          borderRadius: 10,
                          padding: '10px 14px',
                          fontSize: 13,
                          color: 'var(--ink)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)' }}>Email</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1.5px solid var(--border)',
                          borderRadius: 10,
                          padding: '10px 14px',
                          fontSize: 13,
                          color: 'var(--ink)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)' }}>Message</label>
                      <textarea
                        required
                        rows="4"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1.5px solid var(--border)',
                          borderRadius: 10,
                          padding: '10px 14px',
                          fontSize: 13,
                          color: 'var(--ink)',
                          outline: 'none',
                          resize: 'none',
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      style={{
                        background: 'var(--accent)',
                        border: 'none',
                        borderRadius: 10,
                        padding: '12px 24px',
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'white',
                        cursor: 'pointer',
                        marginTop: 10,
                      }}
                    >
                      Send Message
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
