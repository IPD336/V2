import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SwapRequestModal from '../components/SwapRequestModal';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile', 'AI/ML', 'Programming Languages'];
const COLORS = { 0: '#C84B31', 1: '#3A6351', 2: '#3B4F8C', 3: '#B8902A', 4: '#7A5FA8', 5: '#2980b9' };

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function stars(n) {
  return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
}

function ProfileCard({ user, onSwap, onSave, saved }) {
  const navigate = useNavigate();
  const color = user.avatarColor || COLORS[0];

  return (
    <div className="profile-card">
      <div className="card-banner" style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }} />
      <div className="card-body">
        <div className="card-avatar-wrap">
          <div className="card-avatar" style={{ background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color }}>
            {!user.avatarUrl && initials(user.name)}
          </div>
          {user.mutualMatch
            ? <span className="card-badge badge-mutual">⇄ Mutual Match</span>
            : <span className="card-badge badge-public">● Public</span>}
        </div>
        <div className="card-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user.name}
          {user.league && user.league.name !== 'Bronze' && (
            <span style={{ 
              background: user.league.color + '20', color: user.league.name === 'Diamond' ? '#00E5FF' : user.league.name === 'Platinum' ? '#8e9eab' : user.league.color,
              padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 800, border: `1px solid ${user.league.color}`
            }}>
              {user.league.name}
            </span>
          )}
        </div>
        {user.location && <div className="card-loc">📍 {user.location}</div>}
        <div className="card-rating">
          <span className="card-stars">{stars(user.rating || 0)}</span>
          <span className="card-score">{user.rating?.toFixed(1) || '—'}</span>
          <span className="card-reviews">({user.reviewCount || 0} reviews)</span>
        </div>

        {user.skillsOffered?.length > 0 && (
          <>
            <div className="skill-section-label">Offers</div>
            <div className="tag-row">
              {user.skillsOffered.slice(0, 3).map((s, i) => (
                <span key={i} className="tag tag-r">
                  {s.verified && <span title="Verified">✓</span>} {s.name}
                </span>
              ))}
            </div>
          </>
        )}
        {user.skillsWanted?.length > 0 && (
          <>
            <div className="skill-section-label">Wants</div>
            <div className="tag-row">
              {user.skillsWanted.slice(0, 3).map((s, i) => (
                <span key={i} className="tag tag-g">{s}</span>
              ))}
            </div>
          </>
        )}
        <div className="avail-row">🕐 <strong>{user.availability}</strong></div>
        <div className="card-actions">
          <button className="btn-swap" onClick={() => onSwap(user)}>Request Swap</button>
          <button className={`btn-icon ${saved ? 'saved' : ''}`} onClick={() => onSave(user._id)} title="Save">
            {saved ? '★' : '☆'}
          </button>
          <button className="btn-icon" title="View Profile" onClick={() => navigate(`/profile/${user._id}`)}>↗</button>
        </div>
      </div>
    </div>
  );
}

export default function Browse() {
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saved, setSaved] = useState(new Set(me?.savedProfiles || []));
  const [swapTarget, setSwapTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { search, category, page } });
      setUsers(res.data.users.filter((u) => u._id !== me?._id));
      setTotalPages(res.data.pages);
    } catch { showToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, [search, category, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    api.get('/users/recommendations').then((r) => setRecommendations(r.data)).catch(() => {});
  }, []);

  const handleSave = async (userId) => {
    try {
      const res = await api.post(`/users/${userId}/save`);
      setSaved((prev) => {
        const next = new Set(prev);
        res.data.saved ? next.add(userId) : next.delete(userId);
        return next;
      });
      showToast(res.data.saved ? 'Saved to favourites ★' : 'Removed from favourites');
    } catch { showToast('Could not save', 'error'); }
  };

  return (
    <div className="page" style={{ background: 'var(--cream)' }}>
      <div className="container">
        <div className="page-header">
          <div className="section-label">Discover</div>
          <div className="section-title">Browse <em>Skills</em> &amp; Find Your Match</div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)' }}>✦ For You</span>
              <span className="hide-mobile" style={{ fontSize: 12, color: 'var(--muted)' }}>Matched to your skill goals</span>
            </div>
            <div className="cards-grid">
              {recommendations.map((u) => (
                <ProfileCard key={u._id} user={u} onSwap={setSwapTarget} onSave={handleSave} saved={saved.has(u._id)} />
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 18 }}>⌕</span>
            <input
              className="form-input"
              style={{ paddingLeft: 44, background: 'var(--card-bg)' }}
              placeholder="Search by skill — e.g. React, Python, Docker…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="filter-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`filter-pill ${category === c ? 'active' : ''}`}
                onClick={() => { setCategory(c); setPage(1); }}
              >{c}</button>
            ))}
          </div>
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            {users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No matches found</h3>
                <p>Try a different search term or category.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {users.map((u) => (
                  <ProfileCard key={u._id} user={u} onSwap={setSwapTarget} onSave={handleSave} saved={saved.has(u._id)} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40, paddingBottom: 60 }}>
                <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
                <span style={{ padding: '8px 16px', fontSize: 13, color: 'var(--muted)' }}>{page} / {totalPages}</span>
                <button className="btn-ghost" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {swapTarget && (
        <SwapRequestModal target={swapTarget} onClose={() => setSwapTarget(null)} />
      )}
    </div>
  );
}
