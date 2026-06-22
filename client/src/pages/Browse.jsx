import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import SwapRequestModal from '../components/SwapRequestModal';
import TypingIndicator from '../components/TypingIndicator';
import { SkeletonCard } from '../components/Skeleton';
import { COLORS, CATEGORIES, initials, stars } from '../utils';
import { SearchIcon, PinIcon, ClockIcon, DiamondIcon, TrophyIcon, SparklesIcon } from '../components/Icons';

const ProfileCard = memo(function ProfileCard({ user, onSwap, onSave, saved, isOnline }) {
  const navigate = useNavigate();
  const color = user.avatarColor || COLORS[0];

  return (
    <div className="profile-card">
      <div className="card-banner" style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)` }} />
      <div className="card-body">
        <div className="card-avatar-wrap">
          <div className="card-avatar" style={{ background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, position: 'relative' }}>
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} loading="lazy" /> : initials(user.name)}
            {isOnline && <span className="presence-dot" style={{ position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, border: '2px solid var(--card-bg)' }} />}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {user.mutualMatch && <span className="card-badge badge-mutual">⇄ Mutual</span>}
            {user.matchScore > 0 ? (
              <span className="card-badge" style={{
                background: user.matchScore >= 80 ? 'rgba(200,75,49,0.12)' : user.matchScore >= 60 ? 'rgba(58,99,81,0.12)' : user.matchScore >= 40 ? 'rgba(185,144,42,0.12)' : 'rgba(122,114,104,0.12)',
                color: user.matchScore >= 80 ? 'var(--accent)' : user.matchScore >= 60 ? 'var(--sage)' : user.matchScore >= 40 ? 'var(--gold)' : 'var(--muted)',
                fontWeight: 800, fontSize: 10,
              }}>
                {user.matchScore}% Match
              </span>
            ) : (
              <span className="card-badge badge-public">● Public</span>
            )}
          </div>
        </div>
        <div className="card-name" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user.name}
          {user.league && (
            <span style={{ 
              background: user.league.color + '20', color: user.league.name === 'Diamond' ? '#00E5FF' : user.league.name === 'Platinum' ? '#8e9eab' : user.league.color,
              padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 800, border: `1px solid ${user.league.color}`, display: 'flex', alignItems: 'center', gap: 4
            }}>
              {user.league.name === 'Diamond' ? <DiamondIcon size={12} /> : user.league.name === 'Gold' ? <TrophyIcon size={12} /> : null} {user.league.name}
            </span>
          )}
        </div>
        {user.location && <div className="card-loc"><PinIcon size={12} /> {user.location}</div>}
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
         {user.aiMatchExplanation && (
           <div style={{ background: 'var(--sage-light)', border: '1px solid var(--sage)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: 'var(--sage)', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
             <SparklesIcon size={12} style={{ marginTop: 2, flexShrink: 0 }} />
             <span style={{ fontStyle: 'italic', lineHeight: 1.4 }}>{user.aiMatchExplanation}</span>
           </div>
         )}
         <div className="avail-row"><ClockIcon size={12} /> <strong>{user.availability}</strong></div>
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
});

export default function Browse() {
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const { isUserOnline } = useSocket();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimer = useRef(null);
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [saved, setSaved] = useState(new Set(me?.savedProfiles || []));
  const [swapTarget, setSwapTarget] = useState(null);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const { data: browseData, isLoading } = useQuery({
    queryKey: ['users', debouncedSearch, category, page],
    queryFn: () => api.get('/users', { params: { search: debouncedSearch, category, page } }).then(r => r.data),
    placeholderData: { users: [], total: 0, pages: 1 },
  });

  const [recsLoaded, setRecsLoaded] = useState(false);
  const [recsLoadingSlow, setRecsLoadingSlow] = useState(false);

  const { data: recs } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      setRecsLoaded(false);
      setRecsLoadingSlow(false);
      const slowTimer = setTimeout(() => setRecsLoadingSlow(true), 5000);
      try {
        const r = await api.get('/ai/smart-recommendations');
        return r.data.recommendations;
      } catch {
        const r = await api.get('/users/recommendations');
        return r.data.recommendations;
      } finally {
        clearTimeout(slowTimer);
        setRecsLoaded(true);
        setRecsLoadingSlow(false);
      }
    },
    staleTime: 60_000,
  });

  const prefetchRecs = useCallback(async () => {
    try {
      await api.get('/ai/smart-recommendations');
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const timer = setTimeout(prefetchRecs, 2000);
    return () => clearTimeout(timer);
  }, [prefetchRecs]);

  const users = (browseData.users || []).filter((u) => u._id !== me?._id);
  const totalPages = browseData.pages;
  const recommendations = recs || [];

  const handleSave = useCallback(async (userId) => {
    try {
      const res = await api.post(`/users/${userId}/save`);
      setSaved((prev) => {
        const next = new Set(prev);
        res.data.saved ? next.add(userId) : next.delete(userId);
        return next;
      });
      showToast(res.data.saved ? 'Saved to favourites ★' : 'Removed from favourites');
    } catch { showToast('Could not save', 'error'); }
  }, []);

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container">
        <div className="page-header">
          <div className="section-label">Discover</div>
          <div className="section-title">Browse <em>Skills</em> &amp; Find Your Match</div>
        </div>

        {/* Recommendations */}
        {!recsLoaded ? (
          <div style={{ marginBottom: 48, background: 'var(--accent-light)', borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(200,75,49,0.10)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)' }}>✦ For You</span>
              <span className="hide-mobile" style={{ fontSize: 13, color: 'var(--muted)' }}>Matched to your skill goals</span>
            </div>
            <TypingIndicator message={recsLoadingSlow ? 'Still finding your matches...' : 'Finding your matches...'} />
            <div className="cards-grid" style={{ marginTop: 20 }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : recommendations.length > 0 ? (
          <div style={{ marginBottom: 48, background: 'var(--accent-light)', borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(200,75,49,0.10)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)' }}>✦ For You</span>
              <span className="hide-mobile" style={{ fontSize: 13, color: 'var(--muted)' }}>Matched to your skill goals</span>
            </div>
            <div className="cards-grid">
              {recommendations.map((u) => (
                <ProfileCard key={u._id} user={u} onSwap={setSwapTarget} onSave={handleSave} saved={saved.has(u._id)} isOnline={isUserOnline(u._id)} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Search & Filter */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex', pointerEvents: 'none' }}><SearchIcon size={18} /></span>
            <input
              className="form-input"
              style={{ paddingLeft: 44, background: 'var(--card-bg)' }}
              placeholder="Search by skill — e.g. React, Python, Docker…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        {isLoading ? (
          <div className="cards-grid">
            {[1,2,3,4,5,6].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : (
          <>
            {users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><SearchIcon size={32} /></div>
                <h3>No matches found</h3>
                <p>Try a different search term or category.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {users.map((u) => (
                  <ProfileCard key={u._id} user={u} onSwap={setSwapTarget} onSave={handleSave} saved={saved.has(u._id)} isOnline={isUserOnline(u._id)} />
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
