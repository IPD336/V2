import Reveal from './Reveal';
import TextRoll from './TextRoll';

export default function FeatureSection({ title, description, items, reverse = false, children }) {
  return (
    <div className="section-spacing" style={{ position: 'relative', zIndex: 1 }}>
      <div className={`split-section ${reverse ? 'reverse' : ''}`} style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Reveal className="split-content" delay={0}>
          <div>
            <div style={{
              fontFamily: 'PT Mono, monospace', fontSize: 10,
              letterSpacing: 2.5, textTransform: 'uppercase',
              color: 'var(--muted)', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ display: 'inline-block', width: 24, height: 1, background: 'var(--muted)' }} />
              <TextRoll>Feature</TextRoll>
            </div>
            <h2 style={{
              fontFamily: 'PT Serif, serif',
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              fontWeight: 600, lineHeight: 1.08, letterSpacing: -1.2,
              margin: '0 0 20px', color: 'var(--ink)',
            }}>
              <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}><TextRoll center>{title}</TextRoll></em>
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--muted)', margin: '0 0 28px' }}>
              {description}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--ink)' }}>
                  <span style={{ color: 'var(--sage)', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal className="split-visual" delay={150}>
          {children}
        </Reveal>
      </div>
    </div>
  );
}
