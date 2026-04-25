import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const h = Math.floor(diff / 36e5);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function ReviewModal({ swap, me, onClose, onDone }) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [learned, setLearned] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reviews', { swapId: swap._id, rating, learned, feedback });
      showToast('Review submitted! ⭐');
      onDone();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-heading">Leave a Review</div>
        <div className="modal-sub">Your honest feedback helps the whole community grow.</div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Overall Rating</label>
            <div className="star-rating">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" className={`star-btn ${n <= rating ? 'lit' : ''}`} onClick={() => setRating(n)}>★</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">What did you learn?</label>
            <textarea className="form-textarea" placeholder="Describe the skills or knowledge you gained…" value={learned} onChange={(e) => setLearned(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Your Feedback</label>
            <textarea className="form-textarea" placeholder="Was the other person punctual, well-prepared, and engaging?" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </div>
          <button className="btn-modal-primary" type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit Review'}</button>
        </form>
      </div>
    </div>
  );
}

export default function Swaps() {
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState({ incoming: [], outgoing: [], active: [], completed: [] });
  const [tab, setTab] = useState('incoming');
  const [loading, setLoading] = useState(true);
  const [reviewSwap, setReviewSwap] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/swaps');
      setData(res.data);
    } catch { showToast('Failed to load swaps', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const accept = async (id) => {
    await api.put(`/swaps/${id}/accept`);
    showToast('Swap accepted! 🎉');
    load();
  };
  const decline = async (id) => {
    await api.put(`/swaps/${id}/decline`);
    showToast('Swap declined', 'error');
    load();
  };
  const del = async (id) => {
    if (!confirm('Delete this swap request?')) return;
    await api.delete(`/swaps/${id}`);
    showToast('Request deleted');
    load();
  };
  const complete = async (id) => {
    await api.put(`/swaps/${id}/complete`);
    showToast('Swap marked complete! 🎉');
    load();
  };

  const tabs = [
    { key: 'incoming', label: 'Incoming', badge: data.incoming.length },
    { key: 'outgoing', label: 'Outgoing', badge: data.outgoing.length },
    { key: 'active', label: 'Active', badge: data.active.length },
    { key: 'completed', label: 'Completed', badge: 0 },
  ];

  const getOther = (swap) => swap.sender?._id === me?._id ? swap.receiver : swap.sender;

  return (
    <div className="page" style={{ background: 'var(--warm)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 64, paddingTop: 48, paddingBottom: 80, alignItems: 'start' }}>
          {/* Left */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div className="section-label">Dashboard</div>
            <div className="section-title">Manage Your <em>Swaps</em></div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', marginBottom: 28 }}>
              Track all your incoming and outgoing swap requests. You're always in control.
            </p>
            <div className="stats-mini">
              <div className="stat-mini-card"><div className="stat-mini-num">{data.completed.length}</div><div className="stat-mini-label">Completed</div></div>
              <div className="stat-mini-card"><div className="stat-mini-num">{data.incoming.length}</div><div className="stat-mini-label">Pending</div></div>
              <div className="stat-mini-card"><div className="stat-mini-num">{data.active.length}</div><div className="stat-mini-label">Active</div></div>
              <div className="stat-mini-card"><div className="stat-mini-num" style={{ fontSize: 24 }}>{me?.rating?.toFixed(1) || '—'}</div><div className="stat-mini-label">Rating</div></div>
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="tab-bar">
              {tabs.map((t) => (
                <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                  {t.label} {t.badge > 0 && <span className="tab-badge">{t.badge}</span>}
                </button>
              ))}
            </div>

            {loading ? <div className="spinner" /> : (
              <div className="swap-list">
                {data[tab].length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <h3>Nothing here yet</h3>
                    <p>Your {tab} swaps will appear here.</p>
                  </div>
                )}

                {tab === 'incoming' && data.incoming.map((s) => {
                  const other = s.sender;
                  return (
                    <div key={s._id} className="swap-card">
                      <div className="swap-ava" style={{ background: other?.avatarColor || '#C84B31' }}>{initials(other?.name)}</div>
                      <div className="swap-meta">
                        <div className="swap-name">{other?.name}</div>
                        <div className="swap-skill-row">
                          <span className="swap-skill-tag">{s.skillOffered}</span>
                          <span>→ you offer →</span>
                          <span className="swap-skill-tag green">{s.skillWanted}</span>
                        </div>
                      </div>
                      <div className="swap-time">{timeAgo(s.createdAt)}</div>
                      <div className="swap-actions">
                        <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 11 }} onClick={() => window.location.href = `/profile/${other?._id}`}>Profile</button>
                        <button className="btn-accept" onClick={() => accept(s._id)}>Accept</button>
                        <button className="btn-decline" onClick={() => decline(s._id)}>Decline</button>
                      </div>
                    </div>
                  );
                })}

                {tab === 'outgoing' && data.outgoing.map((s) => {
                  const other = s.receiver;
                  return (
                    <div key={s._id} className="swap-card">
                      <div className="swap-ava" style={{ background: other?.avatarColor || '#3A6351' }}>{initials(other?.name)}</div>
                      <div className="swap-meta">
                        <div className="swap-name">{other?.name}</div>
                        <div className="swap-skill-row">
                          <span className="swap-skill-tag green">{s.skillOffered}</span>
                          <span>→ they offer →</span>
                          <span className="swap-skill-tag">{s.skillWanted}</span>
                        </div>
                      </div>
                      <div className="swap-time"><span className="status-badge status-pending">Pending</span></div>
                      <div className="swap-actions">
                        <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 11 }} onClick={() => window.location.href = `/profile/${other?._id}`}>Profile</button>
                        <button className="btn-delete" onClick={() => del(s._id)}>Delete</button>
                      </div>
                    </div>
                  );
                })}

                {tab === 'active' && data.active.map((s) => {
                  const other = getOther(s);
                  return (
                    <div key={s._id} className="swap-card">
                      <div className="swap-ava" style={{ background: other?.avatarColor || '#3B4F8C' }}>{initials(other?.name)}</div>
                      <div className="swap-meta">
                        <div className="swap-name">{other?.name}</div>
                        <div className="swap-skill-row">
                          <span className="swap-skill-tag">{s.skillOffered}</span>
                          <span>↔</span>
                          <span className="swap-skill-tag green">{s.skillWanted}</span>
                        </div>
                      </div>
                      <div className="swap-time"><span className="status-badge status-active">Active</span></div>
                      <div className="swap-actions">
                        <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 11 }} onClick={() => window.location.href = `/profile/${other?._id}`}>Profile</button>
                        <button className="btn-review" onClick={() => complete(s._id)}>Mark Done</button>
                      </div>
                    </div>
                  );
                })}

                {tab === 'completed' && data.completed.map((s) => {
                  const other = getOther(s);
                  return (
                    <div key={s._id} className="swap-card">
                      <div className="swap-ava" style={{ background: other?.avatarColor || '#B8902A' }}>{initials(other?.name)}</div>
                      <div className="swap-meta">
                        <div className="swap-name">{other?.name}</div>
                        <div className="swap-skill-row">
                          <span className="swap-skill-tag">{s.skillOffered}</span>
                          <span>↔</span>
                          <span className="swap-skill-tag green">{s.skillWanted}</span>
                        </div>
                      </div>
                      <div className="swap-time"><span className="status-badge status-done">Done</span></div>
                      <div className="swap-actions">
                        <button className="btn-review" onClick={() => window.location.href = `/profile/${other?._id}`}>View Profile</button>
                        <button className="btn-review" onClick={() => setReviewSwap(s)}>Review</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {reviewSwap && (
        <ReviewModal swap={reviewSwap} me={me} onClose={() => setReviewSwap(null)} onDone={load} />
      )}
    </div>
  );
}
