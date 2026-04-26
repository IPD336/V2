import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function LeagueBadge({ league, rank, showRank = false }) {
  if (!league) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'white', border: `1.5px solid ${league.color}`,
      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      color: 'var(--ink)', boxShadow: `0 2px 8px ${league.color}33`
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: league.color }} />
      {league.name}
      {showRank && <span style={{ opacity: 0.6, marginLeft: 4 }}>#{rank}</span>}
    </div>
  );
}

function PodiumStep({ user, pos }) {
  const navigate = useNavigate();
  if (!user) return <div style={{ flex: 1 }} />;

  const heights = { 1: 180, 2: 140, 3: 110 };
  const colors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: pos === 1 ? 2 : 1 }}>
      <div 
        style={{ cursor: 'pointer', textAlign: 'center', marginBottom: 16 }}
        onClick={() => navigate(`/profile/${user._id}`)}
      >
        <div style={{
          width: pos === 1 ? 80 : 64, height: pos === 1 ? 80 : 64,
          borderRadius: 20, background: user.avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: pos === 1 ? 24 : 18, fontWeight: 800, color: 'white',
          border: `3px solid ${colors[pos]}`, margin: '0 auto 12px',
          boxShadow: `0 8px 24px ${colors[pos]}40`
        }}>
          {initials(user.name)}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Score: {user.score.toFixed(1)}</div>
      </div>
      
      <div style={{
        width: '100%', height: heights[pos],
        background: `linear-gradient(to bottom, ${colors[pos]}40, ${colors[pos]}10)`,
        borderTop: `4px solid ${colors[pos]}`,
        borderTopLeftRadius: 12, borderTopRightRadius: 12,
        display: 'flex', justifyContent: 'center', paddingTop: 16,
        fontSize: 32, fontWeight: 800, color: colors[pos], opacity: 0.8
      }}>
        {pos}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/leaderboard');
        setData(res.data);
      } catch (err) {
        showToast('Failed to load leaderboard', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showToast]);

  if (loading || !data) return <div className="spinner" />;

  const { top20, me, totalUsers } = data;
  const podium = [top20[1], top20[0], top20[2]]; // 2nd, 1st, 3rd

  return (
    <div className="page" style={{ background: 'var(--cream)' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 100, maxWidth: 800 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label">Top Mentors</div>
          <div className="section-title">Global <em>Leaderboard</em></div>
          <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 400, margin: '16px auto 0' }}>
            Rankings are based on a blended score of average rating and total completed swaps.
          </p>
        </div>

        {/* PODIUM */}
        <div className="podium-container" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, marginBottom: 64, padding: '0 20px', flexWrap: 'wrap' }}>
          {podium.map((u, i) => (
            <PodiumStep key={u?._id || i} user={u} pos={[2, 1, 3][i]} />
          ))}
        </div>

        {/* MY RANK BANNER (If not in top 3 and exists) */}
        {me && me.rank > 3 && (
          <div style={{
            background: 'var(--card-bg)', border: `1.5px solid ${me.league.color}`,
            borderRadius: 16, padding: 24, marginBottom: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: `0 4px 20px ${me.league.color}20`,
            flexWrap: 'wrap', gap: 20
          }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 6 }}>Your Ranking</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>
                You are in the <strong style={{ color: 'var(--accent)' }}>Top {me.percentile.toFixed(1)}%</strong> of all mentors!
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <LeagueBadge league={me.league} rank={me.rank} showRank />
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>Score: {me.score.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* LIST 4-20 */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {top20.slice(3).map((u, i) => (
            <div key={u._id} 
              style={{
                display: 'flex', alignItems: 'center', padding: '20px 24px',
                borderBottom: i === top20.slice(3).length - 1 ? 'none' : '1px solid var(--border)',
                background: me?._id === u._id ? 'var(--cream)' : 'var(--card-bg)',
                cursor: 'pointer', transition: 'background 0.2s',
                flexWrap: 'wrap', gap: 12
              }}
              onClick={() => navigate(`/profile/${u._id}`)}
            >
              <div style={{ width: 40, fontSize: 16, fontWeight: 700, color: 'var(--muted)' }}>#{u.rank}</div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: u.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', marginRight: 16 }}>
                {initials(u.name)}
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: 'var(--ink)' }}>{u.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 12 }}>
                  <span>⭐ {u.rating?.toFixed(1) || '—'}</span>
                  <span>🔄 {u.reviewCount} Swaps</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{u.score.toFixed(1)}</div>
                <LeagueBadge league={u.league} />
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
