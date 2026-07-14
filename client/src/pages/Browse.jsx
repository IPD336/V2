import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';

import SwapRequestModal from '../components/SwapRequestModal';
import TypingIndicator from '../components/TypingIndicator';
import { SkeletonCard } from '../components/Skeleton';
import { ProfileCard } from '../components/CardStyles';

import { COLORS, CATEGORIES, initials, stars } from '../utils';
import { SearchIcon } from '../components/Icons';


/* ── Browse Page ─────────────────────────────────── */
export default function Browse() {
  const { user: me, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { isUserOnline } = useSocket();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimer = useRef(null);
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [following, setFollowing] = useState(new Set());
  const [swapTarget, setSwapTarget] = useState(null);
  const [cardKey, setCardKey] = useState(0);

  const cardStyle = localStorage.getItem('ss_card_style') || 'style-1';

  // Load following IDs from the new endpoint
  useEffect(() => {
    if (me) {
      api.get('/users/me/following-ids')
        .then(res => setFollowing(new Set(res.data.followingIds || [])))
        .catch(() => {});
    }
  }, [me]); // force stagger re-run on category change

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const handleCategoryChange = useCallback((c) => {
    setCategory(c);
    setPage(1);
    setCardKey(k => k + 1);
  }, []);

  const { data: browseData, isLoading } = useQuery({
    queryKey: ['users', debouncedSearch, category, page],
    queryFn: () => api.get('/users', { params: { search: debouncedSearch, category, page } }).then(r => r.data),
    placeholderData: { users: [], total: 0, pages: 1 },
  });

  const queryClient = useQueryClient();

  const prefetchRecs = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['recommendations'],
      queryFn: () => api.get('/ai/smart-recommendations').then(r => r.data.recommendations),
      staleTime: 60_000,
    });
  }, [queryClient]);

  useEffect(() => {
    const timer = setTimeout(prefetchRecs, 2000);
    return () => clearTimeout(timer);
  }, [prefetchRecs]);

  const [recsLoadingSlow, setRecsLoadingSlow] = useState(false);

  const { data: recs, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
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
        setRecsLoadingSlow(false);
      }
    },
    staleTime: 60_000,
  });

  const users = (browseData.users || []).filter((u) => u._id !== me?._id);
  const totalPages = browseData.pages;
  const recommendations = recs || [];

  const handleFollow = useCallback(async (userId) => {
    try {
      const res = await api.post(`/users/${userId}/follow`);
      setFollowing((prev) => {
        const next = new Set(prev);
        res.data.following ? next.add(userId) : next.delete(userId);
        return next;
      });
      showToast(res.data.following ? 'Followed! ★' : 'Unfollowed');
      await refreshUser();
    } catch { showToast('Could not follow', 'error'); }
  }, [refreshUser]);

  const handleTagClick = useCallback((skillName) => {
    setSearch(skillName);
    setDebouncedSearch(skillName);
    setPage(1);
    setCardKey(k => k + 1);
  }, []);

  const gridStyle = cardStyle === 'style-6' ? { gridTemplateColumns: '1fr' } : undefined;

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container">
        <div className="page-header" style={{ padding: '0 0 32px 0' }}>
          <div className="section-label">Discover</div>
          <div className="section-title">Browse <em>Skills</em> &amp; Find Your Match</div>
        </div>

        {/* Recommendations */}
        {recsLoading ? (
          <div className="rec-section">
            <div className="rec-header">
              <span className="rec-label">✦ For You</span>
              <span className="hide-mobile" style={{ fontSize: 13, color: 'var(--muted)' }}>Matched to your skill goals</span>
            </div>
            <TypingIndicator message={recsLoadingSlow ? 'Still finding your matches...' : 'Finding your matches...'} />
            <div className="cards-grid" style={{ marginTop: 20 }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="rec-section">
            <div className="rec-header">
              <span className="rec-label">✦ For You</span>
              <span className="hide-mobile" style={{ fontSize: 13, color: 'var(--muted)' }}>Matched to your skill goals</span>
            </div>
            <div className="cards-grid" style={gridStyle}>
              {recommendations.map((u, i) => (
                <ProfileCard styleId={cardStyle} key={u._id} user={u} onSwap={setSwapTarget} onFollow={handleFollow} isFollowing={following.has(u._id)} isOnline={isUserOnline(u._id)} index={i} onTagClick={handleTagClick} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Search */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex', pointerEvents: 'none' }}><SearchIcon size={18} /></span>
            <input
              className="form-input browse-search"
              style={{ paddingLeft: 44, background: 'var(--card-bg)' }}
              placeholder="Search by skill — e.g. React, Python, Docker…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setDebouncedSearch(''); setPage(1); }}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, lineHeight: 1 }}
                title="Clear"
              >✕</button>
            )}
          </div>
          
          {/* Filter Pills (All viewports) */}
          <div className="filter-row browse-pills" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 32, display: 'flex' }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`filter-pill ${category === c ? 'active' : ''}`}
                onClick={() => handleCategoryChange(c)}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="cards-grid" style={gridStyle}>
            {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : (
          <>
            {users.length === 0 ? (
              <div className="empty-state browse-empty">
                <div className="empty-orbit">
                  <div className="empty-orbit-ring" />
                  <div className="empty-orbit-ring" style={{ animationDelay: '-1s', width: 80, height: 80, top: 'calc(50% - 40px)', left: 'calc(50% - 40px)' }} />
                  <div className="empty-state-icon"><SearchIcon size={28} /></div>
                </div>
                <h3 style={{ marginTop: 16 }}>No matches found</h3>
                <p>Try a different search or <button className="link-btn" onClick={() => { setSearch(''); setCategory('All'); }}>clear filters</button></p>
              </div>
            ) : (
              <div className="cards-grid" key={cardKey} style={gridStyle}>
                {users.map((u, i) => (
                  <ProfileCard styleId={cardStyle} key={u._id} user={u} onSwap={setSwapTarget} onFollow={handleFollow} isFollowing={following.has(u._id)} isOnline={isUserOnline(u._id)} index={i} onTagClick={handleTagClick} />
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
