import { useState } from 'react';

const steps = [
  {
    icon: '✦',
    title: 'Welcome to SkillSwap',
    desc: 'Trade what you know. Learn what you don\'t. Connect with peers and exchange skills in real-time.',
  },
  {
    icon: '⌕',
    title: 'Browse Skills',
    desc: 'Find people who offer what you want to learn and want what you already know.',
  },
  {
    icon: '⇄',
    title: 'Request a Swap',
    desc: 'Send a swap request matching your skills. Once accepted, start collaborating right away.',
  },
  {
    icon: '⚡',
    title: 'Use Workspaces',
    desc: 'Work together in shared workspaces with goals, chat, and progress tracking.',
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

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && skip()}>
      <div className="modal onboarding-modal" style={{ maxWidth: 420, textAlign: 'center', padding: '48px 40px' }}>
        <div className="onboarding-icon">{s.icon}</div>
        <div className="onboarding-title">{s.title}</div>
        <div className="onboarding-desc">{s.desc}</div>
        <div className="onboarding-dots">
          {steps.map((_, i) => (
            <span key={i} className={`onboarding-dot${i === step ? ' active' : ''}`} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-cosmos-ghost" onClick={skip} style={{ padding: '10px 20px', fontSize: 12 }}>Skip</button>
          <button className="btn-cosmos-primary" onClick={next} style={{ padding: '10px 24px', fontSize: 12 }}>
            {isLast ? 'Get Started →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
