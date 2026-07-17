import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

const FAQ_DATA = [
  {
    id: 1,
    q: 'How does the skill swap process work?',
    a: 'After creating your profile and listing skills you offer and want to learn, our matching algorithm suggests compatible partners. You send a swap proposal describing what you\'ll teach and what you want to learn. Once accepted, you coordinate sessions through the built-in calendar and workspace.',
    category: 'General',
  },
  {
    id: 2,
    q: 'Is SkillSwap really free?',
    a: 'Yes — there are no fees, subscriptions, or hidden charges. SkillSwap is built around genuine knowledge exchange. The only currency is the skills you share.',
    category: 'General',
  },
  {
    id: 3,
    q: 'How does the matching algorithm work?',
    a: 'The algorithm analyzes complementary skill gaps — it finds people who offer what you want to learn AND want to learn what you offer. It also factors in experience level, availability, timezone, and review scores to surface the best matches first.',
    category: 'Swaps',
  },
  {
    id: 4,
    q: 'What if I don\'t have a skill to offer?',
    a: 'Everyone has something to teach — whether it\'s coding, design, marketing, a language, or even soft skills like public speaking. If you\'re just starting out, you can offer to teach beginner-level concepts in exchange for more advanced guidance.',
    category: 'General',
  },
  {
    id: 5,
    q: 'How much time do I need to commit?',
    a: 'You\'re in control. Swaps can be structured as single sessions or multi-week programs. Most members start with 4 sessions of 1 hour each, scheduled at whatever pace works for both parties.',
    category: 'Swaps',
  },
  {
    id: 6,
    q: 'Can I swap skills with a team?',
    a: 'Yes — the Teams feature lets you form groups of 4+ members with complementary skills. Each team gets shared workspaces, collaborative goals, and the ability to split teaching responsibilities.',
    category: 'Teams',
  },
];

const CATEGORIES = ['All', 'General', 'Swaps', 'Teams'];

export default function FAQAccordion() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [openId, setOpenId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter FAQs based on search input and active category tab
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((faq) => {
      const matchesSearch =
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'All' || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
      
      {/* ── Search Bar & Category Filter Tabs ── */}
      <div
        className="faq-controls-row"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--section-divider)',
          paddingBottom: 24,
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenId(null);
                }}
                style={{
                  background: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--section-divider)'}`,
                  color: isActive ? 'white' : 'var(--section-text-muted)',
                  borderRadius: 20,
                  padding: '6px 18px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.target.style.color = 'var(--section-text)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.target.style.color = 'var(--section-text-muted)';
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Live Filter Search Input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
          <span style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 14,
            color: 'var(--section-text-muted)',
            pointerEvents: 'none',
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpenId(null);
            }}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1.5px solid var(--section-divider)',
              borderRadius: 20,
              padding: '8px 16px 8px 36px',
              fontSize: 12,
              color: 'var(--section-text)',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--section-divider)'}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--section-text-muted)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* ── FAQ Accordion Stack ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AnimatePresence mode="popLayout">
          {filteredFAQs.map((faq, i) => {
            const isOpen = openId === faq.id;
            const itemNumber = faq.id < 10 ? `0${faq.id}` : faq.id;

            return (
              <motion.div
                key={faq.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.215, 0.61, 0.355, 1] }}
                style={{
                  background: isDark ? 'rgba(38, 33, 28, 0.4)' : 'rgba(248, 244, 238, 0.4)',
                  border: `1.5px solid ${isOpen ? 'var(--accent)' : 'var(--section-divider)'}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'border-color 0.3s ease',
                }}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '20px 24px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Serif Number Indicator */}
                    <span style={{
                      fontFamily: 'PT Serif, serif',
                      fontSize: 16,
                      fontWeight: 700,
                      color: isOpen ? 'var(--accent)' : 'var(--section-text-muted)',
                      opacity: isOpen ? 1 : 0.6,
                      width: 24,
                      transition: 'color 0.3s ease',
                    }}>
                      {itemNumber}
                    </span>
                    {/* Question text */}
                    <span style={{
                      fontFamily: 'PT Sans, sans-serif',
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'var(--section-text)',
                      transition: 'color 0.2s ease',
                    }}>
                      {faq.q}
                    </span>
                  </div>

                  {/* Elegant custom toggle icon */}
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: isOpen ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isOpen ? 'white' : 'var(--section-text-muted)',
                      fontSize: 10,
                      fontWeight: 800,
                      transition: 'transform 0.4s ease, background 0.3s ease, color 0.3s ease',
                      transform: isOpen ? 'rotate(135deg)' : 'rotate(0deg)',
                    }}
                  >
                    ＋
                  </div>
                </button>

                {/* Smooth Animated Height Answer Panel */}
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      padding: '0 24px 20px 64px',
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: 'var(--section-text-muted)',
                      borderTop: '1px dashed var(--section-divider)',
                      paddingTop: 16,
                      marginTop: -4,
                    }}
                  >
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty Search Result feedback */}
        {filteredFAQs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '40px 24px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1.5px dashed var(--section-divider)',
              borderRadius: 16,
              color: 'var(--section-text-muted)',
            }}
          >
            <p style={{ margin: '0 0 12px 0', fontSize: 14 }}>
              Can't find what you need? We're here to help.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              style={{
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 12,
                padding: '8px 18px',
                fontSize: 11,
                fontWeight: 700,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
