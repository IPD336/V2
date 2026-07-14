export default function SwapMockup() {
  return (
    <div className="mockup-swap">
      <div className="mockup-swap-card">
        <div className="mockup-swap-header">Swap Request</div>
        <div className="mockup-swap-parties">
          <div className="mockup-swap-party">
            <div className="mockup-swap-avatar" style={{ background: 'var(--indigo)' }}>You</div>
            <div className="mockup-swap-skill">React</div>
          </div>
          <div className="mockup-swap-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M7 16l-4-4 4-4" /><path d="M3 12h14" />
              <path d="M17 8l4 4-4 4" /><path d="M21 12H7" />
            </svg>
          </div>
          <div className="mockup-swap-party">
            <div className="mockup-swap-avatar" style={{ background: 'var(--sage)' }}>RS</div>
            <div className="mockup-swap-skill">Python</div>
          </div>
        </div>
        <div className="mockup-swap-meta">
          <span className="mockup-swap-format">📹 Video Call</span>
          <span className="mockup-swap-time">30 min session</span>
        </div>
        <div className="mockup-swap-accepted">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Accepted — Start learning!
        </div>
      </div>
    </div>
  );
}
