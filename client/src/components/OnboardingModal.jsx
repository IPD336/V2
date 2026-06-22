import { useState } from 'react';

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
      <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
      <path d="M6 7l.5 1.5L8 9l-1.5.5L6 11l-.5-1.5L4 9l1.5-.5z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5L21 21" />
      <path d="M8 11h6" />
      <path d="M11 8v6" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16l-4-4 4-4" />
      <path d="M3 12h14" />
      <path d="M17 8l4 4-4 4" />
      <path d="M21 12H7" />
    </svg>
  );
}

function WorkspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <path d="M8 10h.01" />
      <path d="M12 10h.01" />
      <path d="M16 10h.01" />
    </svg>
  );
}

const steps = [
  {
    icon: SparkleIcon,
    title: 'Welcome to SkillSwap',
    desc: 'Trade what you know. Learn what you don\'t. Connect with peers and exchange skills in real-time.',
    gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    illustrationBg: 'rgba(124,58,237,0.2)',
    fillColor: '#7c3aed',
  },
  {
    icon: SearchIcon,
    title: 'Browse Skills',
    desc: 'Find people who offer what you want to learn and want what you already know.',
    gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',
    illustrationBg: 'rgba(37,99,235,0.2)',
    fillColor: '#2563eb',
  },
  {
    icon: SwapIcon,
    title: 'Request a Swap',
    desc: 'Send a swap request matching your skills. Once accepted, start collaborating right away.',
    gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    illustrationBg: 'rgba(217,119,6,0.2)',
    fillColor: '#d97706',
  },
  {
    icon: WorkspaceIcon,
    title: 'Use Workspaces',
    desc: 'Work together in shared workspaces with goals, chat, and progress tracking.',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    illustrationBg: 'rgba(5,150,105,0.2)',
    fillColor: '#059669',
  },
];

export default function OnboardingModal({ onDone }) {
  const [step, setStep] = useState(0);
  const s = steps[step];
  const isLast = step === steps.length - 1;

  const next = () => {
    if (isLast) {
      localStorage.setItem('ss_onboarded', 'true');
      onDone();
    } else {
      setStep(step + 1);
    }
  };

  const skip = () => {
    localStorage.setItem('ss_onboarded', 'true');
    onDone();
  };

  const Icon = s.icon;

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && skip()}>
      <div className="onboarding-card">
        <button className="onboarding-skip" onClick={skip} aria-label="Skip tutorial">Skip →</button>

        <div className="onboarding-header" style={{ background: s.gradient }}>
          <div className="onboarding-header-bg" style={{ color: '#fff' }}>
            <div className="onboarding-header-bg-circle" />
            <div className="onboarding-header-bg-circle" />
            <div className="onboarding-header-bg-circle" />
          </div>

          <div className="onboarding-illustration" style={{ background: s.illustrationBg }}>
            <Icon />
          </div>

          <div className="onboarding-step-label" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Step {step + 1} of {steps.length}
          </div>
        </div>

        <div className="onboarding-body">
          <div className="onboarding-slide" key={step}>
            <h3 className="onboarding-title">{s.title}</h3>
            <p className="onboarding-desc">{s.desc}</p>
          </div>

          <div className="onboarding-progress-wrap">
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'PT Mono, monospace', minWidth: 24 }}>
              {step + 1}/{steps.length}
            </span>
            <div className="onboarding-progress-track">
              <div className={`onboarding-progress-fill dot-${step + 1}`} style={{ background: s.fillColor }} />
            </div>
          </div>

          <div className="onboarding-btn-group">
            <button className="btn-cosmos-ghost" onClick={skip} style={{ padding: '10px 20px', fontSize: 12 }}>
              Skip
            </button>
            <button className="btn-cosmos-primary" onClick={next} style={{ padding: '10px 24px', fontSize: 12 }}>
              {isLast ? 'Get Started' : 'Next'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
