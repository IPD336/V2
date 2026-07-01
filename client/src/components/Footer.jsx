import { LogoMark } from './Logo';
import { TwitterIcon, LinkedInIcon, GitHubIcon, FacebookIcon, InstagramIcon } from './Icons';

const navLinks = [
  { label: 'Browse', href: '/browse' },
  { label: 'Swaps', href: '/swaps' },
  { label: 'Teams', href: '/teams' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Badges', href: '/badges' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
];

const socialLinks = [
  { icon: TwitterIcon, href: '#', label: 'Twitter' },
  { icon: LinkedInIcon, href: '#', label: 'LinkedIn' },
  { icon: GitHubIcon, href: '#', label: 'GitHub' },
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      zIndex: 101,
      background: 'var(--section-dark-secondary)',
      padding: '64px 24px 40px',
      borderTop: '1px solid var(--section-divider)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Logo + Brand ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark size={36} style={{ borderRadius: 8 }} />
            <span style={{
              fontFamily: 'PT Serif, serif', fontSize: 22, fontWeight: 700,
              letterSpacing: -0.5, color: 'var(--section-text)',
            }}>
              SkillSwap
            </span>
          </div>
        </div>

        {/* ── Navigation Links ── */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px 28px', marginBottom: 40,
        }} role="navigation" aria-label="Footer navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                color: 'var(--section-text-muted)',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: 0.3,
                transition: 'color .2s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--section-text)'}
              onMouseLeave={e => e.target.style.color = 'var(--section-text-muted)'}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* ── Dotted Separator ── */}
        <div style={{
          borderTop: '2px dotted var(--section-divider)',
          marginBottom: 28,
        }} />

        {/* ── Bottom Row: Copyright + Social Icons ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{
            color: 'var(--section-text-muted)',
            fontSize: 13,
            fontWeight: 400,
          }}>
            &copy; 2026 SkillSwap. All rights reserved.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--section-text-muted)',
                  border: '1px solid var(--section-divider)',
                  textDecoration: 'none',
                  transition: 'background .2s, color .2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.color = 'var(--section-text)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'var(--section-text-muted)';
                }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
