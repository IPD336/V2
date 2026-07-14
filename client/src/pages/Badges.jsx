import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { BadgeIcon } from '../utils/badges';
import Spinner from '../components/Spinner';

const LEAGUE_COLORS = {
  Diamond: '#00E5FF', Platinum: '#B4C6DF', Gold: '#FFD700', Silver: '#C0C0C0', Bronze: '#CD7F32',
};

export default function Badges() {
  const navigate = useNavigate();
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/gamification')
      .then((res) => setGamification(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load badges'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page" style={{ paddingTop: 80, display: 'flex', justifyContent: 'center' }}><Spinner /></div>;

  if (error) {
    return (
      <div className="page page-fade-in" style={{ paddingTop: 80 }}>
        <div className="container" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: 'PT Serif, serif', color: 'var(--ink)' }}>Something went wrong</h2>
          <p style={{ color: 'var(--muted)', margin: '8px 0 24px' }}>{error}</p>
          <button className="btn-cosmos btn-cosmos-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { badges, xp, streak } = gamification;
  const earnedCount = badges.filter((b) => b.earned).length;
  const totalXpFromBadges = badges.filter((b) => b.earned).reduce((sum, b) => sum + (b.xpReward || 0), 0);

  return (
    <div className="page page-fade-in" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 13 }}>
            ← Back
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 28, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
              Badges & Achievements
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              Complete actions to earn badges and bonus XP
            </p>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>{earnedCount}<span style={{ fontSize: 14, color: 'var(--muted)' }}>/{badges.length}</span></div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Earned</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 16px', background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>{totalXpFromBadges.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Badge XP</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 32, background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Overall Progress</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{earnedCount} / {badges.length} badges</span>
          </div>
          <div style={{ height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${(earnedCount / badges.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--accent), #8B5CF6)',
              borderRadius: 5, transition: 'width .5s ease',
            }} />
          </div>
        </div>

        <div className="badges-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}>
          {badges.map((badge) => (
            <div
              key={badge.id}
              style={{
                background: badge.earned ? 'var(--card-bg)' : 'var(--card-bg)',
                border: badge.earned
                  ? '2px solid var(--accent)'
                  : '1px solid var(--border)',
                borderRadius: 16, padding: 20, textAlign: 'center',
                opacity: badge.earned ? 1 : 0.55,
                transition: 'all .3s',
                position: 'relative',
                cursor: 'default',
              }}
              className="mockup-card"
              title={badge.earned ? `Earned on ${new Date(badge.earnedAt).toLocaleDateString()}` : badge.description}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: badge.earned
                  ? 'linear-gradient(135deg, var(--accent-light), rgba(var(--accent-rgb),0.08))'
                  : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                color: badge.earned ? 'var(--accent)' : 'var(--muted)',
              }}>
                <BadgeIcon name={badge.icon} size={26} />
              </div>

              <div style={{ fontWeight: 700, fontSize: 13, color: badge.earned ? 'var(--ink)' : 'var(--muted)', marginBottom: 4 }}>
                {badge.name}
              </div>

              <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4, marginBottom: 8 }}>
                {badge.description}
              </div>

              {badge.earned ? (
                <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>
                  ✓ Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </div>
              ) : (
                <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                  +{badge.xpReward} XP on earn
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
