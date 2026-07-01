import { useState, useRef, useEffect } from 'react';
import TextRoll from './TextRoll';

const faqs = [
  {
    q: 'How does the skill swap process work?',
    a: 'After creating your profile and listing skills you offer and want to learn, our matching algorithm suggests compatible partners. You send a swap proposal describing what you\'ll teach and what you want to learn. Once accepted, you coordinate sessions through the built-in calendar and workspace.',
  },
  {
    q: 'Is SkillSwap really free?',
    a: 'Yes — there are no fees, subscriptions, or hidden charges. SkillSwap is built around genuine knowledge exchange. The only currency is the skills you share.',
  },
  {
    q: 'How does the matching algorithm work?',
    a: 'The algorithm analyzes complementary skill gaps — it finds people who offer what you want to learn AND want to learn what you offer. It also factors in experience level, availability, timezone, and review scores to surface the best matches first.',
  },
  {
    q: 'What if I don\'t have a skill to offer?',
    a: 'Everyone has something to teach — whether it\'s coding, design, marketing, a language, or even soft skills like public speaking. If you\'re just starting out, you can offer to teach beginner-level concepts in exchange for more advanced guidance.',
  },
  {
    q: 'How much time do I need to commit?',
    a: 'You\'re in control. Swaps can be structured as single sessions or multi-week programs. Most members start with 4 sessions of 1 hour each, scheduled at whatever pace works for both parties.',
  },
  {
    q: 'Can I swap skills with a team?',
    a: 'Yes — the Teams feature lets you form groups of 4+ members with complementary skills. Each team gets shared workspaces, collaborative goals, and the ability to split teaching responsibilities.',
  },
];

export default function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState(null);
  const contentRefs = useRef({});
  const [heights, setHeights] = useState({});

  useEffect(() => {
    const next = {};
    faqs.forEach((_, i) => {
      const el = contentRefs.current[i];
      if (el) next[i] = el.scrollHeight;
    });
    setHeights(next);
  }, []);

  return (
    <div className="faq-list">
      {faqs.map((faq, i) => {
        const isOpen = openIdx === i;
        return (
          <div
            key={i}
            className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}
          >
            <button
              className="faq-question"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span><TextRoll>{faq.q}</TextRoll></span>
              <span className={`faq-chevron ${isOpen ? 'faq-chevron-open' : ''}`}>↓</span>
            </button>
            <div
              className="faq-answer-wrap"
              style={{ height: isOpen ? heights[i] || 'auto' : 0, opacity: isOpen ? 1 : 0 }}
            >
              <div ref={el => { if (el) contentRefs.current[i] = el; }} className="faq-answer">
                {faq.a}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
