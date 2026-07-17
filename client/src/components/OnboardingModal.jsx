import { useState, useCallback, useEffect, useRef } from 'react';
import BrowseMockup from './onboarding/BrowseMockup';
import SwapMockup from './onboarding/SwapMockup';
import WorkspaceMockup from './onboarding/WorkspaceMockup';
import '../styles/onboarding.css';

const STEPS = [
  {
    title: 'Discover your match',
    desc: 'Browse people who have the skills you want. Match scores show compatibility at a glance.',
    Mockup: BrowseMockup,
    accent: '#2563eb',
  },
  {
    title: 'Request a swap',
    desc: 'Send a swap request and choose video call, async, or in-person. Start learning in minutes.',
    Mockup: SwapMockup,
    accent: '#d97706',
  },
  {
    title: 'Collaborate and grow',
    desc: 'Work together in a shared space with real-time chat, goals, and progress tracking.',
    Mockup: WorkspaceMockup,
    accent: '#059669',
  },
];

export default function OnboardingModal({ onDone }) {
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);
  const isLast = step === STEPS.length - 1;
  const modalRef = useRef(null);

  const goTo = useCallback((idx) => {
    if (idx === step || idx < 0 || idx >= STEPS.length) return;
    setFading(true);
    setTimeout(() => {
      setStep(idx);
      setFading(false);
    }, 180);
  }, [step]);

  const next = useCallback(() => {
    if (isLast) {
      localStorage.setItem('ss_onboarded', 'true');
      onDone();
    } else {
      goTo(step + 1);
    }
  }, [isLast, step, goTo, onDone]);

  const skip = useCallback(() => {
    localStorage.setItem('ss_onboarded', 'true');
    onDone();
  }, [onDone]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') skip();
      else if (e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, skip]);

  useEffect(() => {
    modalRef.current?.focus();
  }, [step]);

  const s = STEPS[step];
  const MockupComponent = s.Mockup;

  return (
    <div
      className="onboarding-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) skip(); }}
      role="dialog"
      aria-label="Welcome tutorial"
    >
      <div className="onboarding-card" ref={modalRef} tabIndex={-1}>
        <button className="onboarding-skip" onClick={skip} aria-label="Skip tutorial">
          Skip
        </button>

        <div className={`onboarding-mockup-area ${fading ? 'onboarding-fade-out' : 'onboarding-fade-in'}`} key={step}>
          <MockupComponent />
        </div>

        <div className="onboarding-text-area">
          <h3 className="onboarding-title">{s.title}</h3>
          <p className="onboarding-desc">{s.desc}</p>

          <div className="onboarding-footer">
            <div className="onboarding-dots">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  className={`onboarding-dot ${i === step ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to step ${i + 1}`}
                  type="button"
                />
              ))}
            </div>

            <button
              className="onboarding-next"
              onClick={next}
              style={{ background: s.accent }}
            >
              {isLast ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
