import Logo from './Logo';

export default function Footer() {
  const links = ['About', 'Privacy Policy', 'Terms of Service', 'Contact'];
  const socials = ['Twitter', 'GitHub', 'LinkedIn'];

  return (
    <footer style={{
      background: 'var(--section-dark-secondary)',
      padding: '56px 24px 48px',
      borderTop: '1px solid var(--section-divider)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 24,
          paddingBottom: 32,
        }}>
          <div style={{
            color: 'var(--section-text)',
          }}>
            <Logo />
          </div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }} role="navigation">
            {links.map((label) => (
              <a
                key={label}
                href="#"
                style={{
                  color: 'var(--section-text-muted)', textDecoration: 'none',
                  fontSize: 12, fontWeight: 600, transition: 'color .2s',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--section-text)'}
                onMouseLeave={e => e.target.style.color = 'var(--section-text-muted)'}
              >
                {label}
              </a>
            ))}
            </div>
        </div>

        <div style={{ borderTop: '1px solid var(--section-divider)', paddingTop: 24 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: 16,
          }}>
            <div style={{ color: 'var(--section-text-muted)', fontSize: 12 }}>
              &copy; 2026 SkillSwap. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {socials.map((label) => (
                <a
                  key={label}
                  href="#"
                  style={{
                    color: 'var(--section-text-muted)', textDecoration: 'none',
                    fontSize: 12, fontWeight: 600, transition: 'color .2s',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--section-text)'}
                  onMouseLeave={e => e.target.style.color = 'var(--section-text-muted)'}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
