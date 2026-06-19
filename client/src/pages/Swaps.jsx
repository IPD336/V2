import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { SkeletonRow } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { SwapIcon, MailIcon, SendIcon, CheckIcon, CalendarIcon, VideoIcon } from '../components/Icons';

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
      showToast('Review submitted!');
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
          <button className="btn-cosmos-primary" type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit Review'}</button>
        </form>
      </div>
    </div>
  );
}

export default function Swaps() {
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const { markTypeAsRead } = useSocket();
  const navigate = useNavigate();
  const [data, setData] = useState({ incoming: [], outgoing: [], active: [], completed: [] });
  const [tab, setTab] = useState('incoming');
  const [loading, setLoading] = useState(true);
  const [reviewSwap, setReviewSwap] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(null);
  const [showDeclineCompleteModal, setShowDeclineCompleteModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/swaps');
      setData(res.data);
    } catch { showToast('Failed to load swaps', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    load(); 
    markTypeAsRead('swap_request');
  }, []);

  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const firstNonEmptyTab = (d) => {
    const order = ['active', 'incoming', 'outgoing', 'completed'];
    return order.find((k) => d[k].length > 0) || 'incoming';
  };

  const accept = async (id) => {
    try {
      await api.put(`/swaps/${id}/accept`);
      showToast('Swap accepted!');
      await load();
      setTab('active');
    } catch { showToast('Failed to accept swap', 'error'); }
  };
  const decline = async (id) => {
    try {
      await api.put(`/swaps/${id}/decline`);
      showToast('Swap declined', 'error');
      await load();
      setTab(firstNonEmptyTab(data));
    } catch { showToast('Failed to decline swap', 'error'); }
  };
  const handleDelete = async () => {
    const id = showDeleteModal;
    setShowDeleteModal(null);
    try {
      await api.delete(`/swaps/${id}`);
      showToast('Request deleted');
      await load();
      setTab(firstNonEmptyTab(data));
    } catch { showToast('Failed to delete request', 'error'); }
  };
  const complete = async (id) => {
    setShowCompleteModal(null);
    try {
      await api.put(`/swaps/${id}/complete`);
      showToast('Swap marked complete!');
      await load();
    } catch { showToast('Failed to mark complete', 'error'); }
  };
  const confirmComplete = async (id) => {
    try {
      await api.put(`/swaps/${id}/confirm-complete`);
      showToast('Swap confirmed!');
      await load();
    } catch { showToast('Failed to confirm completion', 'error'); }
  };
  const handleDeclineComplete = async () => {
    const id = showDeclineCompleteModal;
    setShowDeclineCompleteModal(null);
    try {
      await api.put(`/swaps/${id}/decline-complete`);
      showToast('Completion request declined');
      await load();
    } catch { showToast('Failed to decline completion', 'error'); }
  };

  const tabs = [
    { key: 'incoming', label: 'Incoming', badge: data.incoming.length },
    { key: 'outgoing', label: 'Outgoing', badge: data.outgoing.length },
    { key: 'active', label: 'Active', badge: data.active.length },
    { key: 'completed', label: 'Completed', badge: 0 },
  ];

  const getOther = (swap) => swap.sender?._id === me?._id ? swap.receiver : swap.sender;

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container">
        <div className="swaps-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 64, paddingTop: 48, paddingBottom: 80, alignItems: 'start' }}>
          {/* Left */}
          <div className="swaps-sidebar" style={{ position: 'sticky', top: 90 }}>
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
          <div className="swaps-content">
            <div className="tab-bar" style={{ flexWrap: 'wrap' }}>
              {tabs.map((t) => (
                <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                  {t.label} {t.badge > 0 && <span className="tab-badge">{t.badge}</span>}
                </button>
              ))}
            </div>

            {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3,4].map((n) => <SkeletonRow key={n} />)}</div> : (
              <div className="swap-list">
                {data[tab].length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">{
                      tab === 'incoming' ? <MailIcon size={32} /> :
                      tab === 'outgoing' ? <SendIcon size={32} /> :
                      tab === 'active' ? <SwapIcon size={32} /> : <CheckIcon size={32} />
                    }</div>
                    <h3>{
                      tab === 'incoming' ? 'No incoming requests' :
                      tab === 'outgoing' ? 'No outgoing requests' :
                      tab === 'active' ? 'No active swaps' : 'No completed swaps'
                    }</h3>
                    <p>{
                      tab === 'incoming' ? 'When someone sends you a swap request, it will appear here.' :
                      tab === 'outgoing' ? 'Browse the community and send your first swap request!' :
                      tab === 'active' ? 'Accept an incoming swap to start collaborating.' : 'Completed swaps will show up here after both parties confirm.'
                    }</p>
                    {(tab === 'outgoing' || tab === 'incoming') && (
                      <button className="btn-cosmos btn-cosmos-primary" onClick={() => navigate('/browse')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', fontSize: 11 }}>
                        Browse Members
                      </button>
                    )}
                  </div>
                )}

                {tab === 'incoming' && data.incoming.map((s) => {
                  const other = s.sender;
                  return (
                    <div key={s._id} className="swap-card" style={{ background: 'var(--card-bg)' }}>
                      <div className="swap-ava" style={{ background: other?.avatarUrl ? `url(${other.avatarUrl}) center/cover` : (other?.avatarColor || '#C84B31') }}>
                        {!other?.avatarUrl && initials(other?.name)}
                      </div>
                      <div className="swap-meta">
                        <div className="swap-name" style={{ color: 'var(--ink)' }}>{other?.name}</div>
                        <div className="swap-skill-row">
                          <span className="swap-skill-tag">{s.skillOffered}</span>
                          <span className="hide-mobile">→ you offer →</span>
                          <span className="hide-desktop">→</span>
                          <span className="swap-skill-tag green">{s.skillWanted}</span>
                        </div>
                        {s.schedule && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}><CalendarIcon size={12} />{s.schedule}</div>}
                        {s.format && <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><VideoIcon size={12} />{s.format}</div>}
                        {s.message && <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', marginTop: 2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>" {s.message}"</div>}
                      </div>
                      <div className="swap-time hide-mobile">{timeAgo(s.createdAt)}</div>
                      <div className="swap-actions">
                        <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 11 }} onClick={() => navigate(`/profile/${other?._id}`)}>Profile</button>
                        <button className="btn-cosmos-primary" onClick={() => accept(s._id)} style={{ padding: '7px 14px', fontSize: 11, fontWeight: 700 }}>Accept</button>
                        <button className="btn-cosmos-ghost" onClick={() => decline(s._id)} style={{ padding: '7px 14px', fontSize: 11, fontWeight: 700 }}>Decline</button>
                      </div>
                    </div>
                  );
                })}

                {tab === 'outgoing' && data.outgoing.map((s) => {
                  const other = s.receiver;
                  return (
                    <div key={s._id} className="swap-card" style={{ background: 'var(--card-bg)' }}>
                      <div className="swap-ava" style={{ background: other?.avatarUrl ? `url(${other.avatarUrl}) center/cover` : (other?.avatarColor || '#3A6351') }}>
                        {!other?.avatarUrl && initials(other?.name)}
                      </div>
                      <div className="swap-meta">
                        <div className="swap-name" style={{ color: 'var(--ink)' }}>{other?.name}</div>
                        <div className="swap-skill-row">
                          <span className="swap-skill-tag green">{s.skillOffered}</span>
                          <span className="hide-mobile">→ they offer →</span>
                          <span className="hide-desktop">→</span>
                          <span className="swap-skill-tag">{s.skillWanted}</span>
                        </div>
                        {s.schedule && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}><CalendarIcon size={12} />{s.schedule}</div>}
                        {s.format && <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><VideoIcon size={12} />{s.format}</div>}
                        {s.message && <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', marginTop: 2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>" {s.message}"</div>}
                      </div>
                      <div className="swap-time hide-mobile"><span className="status-badge status-pending">Pending</span></div>
                      <div className="swap-actions">
                        <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 11 }} onClick={() => navigate(`/profile/${other?._id}`)}>Profile</button>
                        <button className="btn-cosmos-ghost" onClick={() => setShowDeleteModal(s._id)} style={{ padding: '7px 14px', fontSize: 11, fontWeight: 700 }}>Delete</button>
                      </div>
                    </div>
                  );
                })}

                {tab === 'active' && data.active.map((s) => {
                  const other = getOther(s);
                  const isPending = s.status === 'pending_completion';
                  const hasRequested = s.completedBy?.includes(me?._id);

                  return (
                    <div key={s._id} className="swap-card" style={{ background: 'var(--card-bg)' }}>
                      <div className="swap-ava" style={{ background: other?.avatarUrl ? `url(${other.avatarUrl}) center/cover` : (other?.avatarColor || '#3B4F8C') }}>
                        {!other?.avatarUrl && initials(other?.name)}
                      </div>
                      <div className="swap-meta">
                        <div className="swap-name" style={{ color: 'var(--ink)' }}>{other?.name}</div>
                        <div className="swap-skill-row">
                          <span className="swap-skill-tag">{s.skillOffered}</span>
                          <span>↔</span>
                          <span className="swap-skill-tag green">{s.skillWanted}</span>
                        </div>
                        {s.schedule && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}><CalendarIcon size={12} />{s.schedule}</div>}
                        {s.format && <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><VideoIcon size={12} />{s.format}</div>}
                      </div>
                      <div className="swap-time hide-mobile">
                        {isPending ? (
                          <span className="status-badge status-pending" style={{ background: 'var(--gold-light)', color: 'var(--gold)' }}>Awaiting Confirmation</span>
                        ) : (
                          <span className="status-badge status-active">Active</span>
                        )}
                      </div>
                      <div className="swap-actions">
                        <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 11 }} onClick={() => navigate(`/profile/${other?._id}`)}>Profile</button>
                        {isPending ? (
                          hasRequested ? (
                            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Requested</span>
                          ) : (
                            <span style={{ display: 'flex', gap: 6 }}>
                              <button className="btn-cosmos-primary" style={{ fontSize: 11, padding: '7px 10px', fontWeight: 700 }} onClick={() => confirmComplete(s._id)}>Confirm</button>
                              <button className="btn-cosmos-ghost" style={{ fontSize: 11, padding: '7px 10px', fontWeight: 700 }} onClick={() => setShowDeclineCompleteModal(s._id)}>Not Yet</button>
                            </span>
                          )
                        ) : (
                          <button className="btn-cosmos-ghost" onClick={() => setShowCompleteModal(s._id)} style={{ padding: '7px 14px', fontSize: 11, fontWeight: 700 }}>Mark Done</button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {tab === 'completed' && data.completed.map((s) => {
                  const other = getOther(s);
                  return (
                    <div key={s._id} className="swap-card" style={{ background: 'var(--card-bg)' }}>
                      <div className="swap-ava" style={{ background: other?.avatarUrl ? `url(${other.avatarUrl}) center/cover` : (other?.avatarColor || '#B8902A') }}>
                        {!other?.avatarUrl && initials(other?.name)}
                      </div>
                      <div className="swap-meta">
                        <div className="swap-name" style={{ color: 'var(--ink)' }}>{other?.name}</div>
                        <div className="swap-skill-row">
                          <span className="swap-skill-tag">{s.skillOffered}</span>
                          <span>↔</span>
                          <span className="swap-skill-tag green">{s.skillWanted}</span>
                        </div>
                        {s.schedule && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}><CalendarIcon size={12} />{s.schedule}</div>}
                        {s.format && <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><VideoIcon size={12} />{s.format}</div>}
                      </div>
                      <div className="swap-time hide-mobile"><span className="status-badge status-done">Done</span></div>
                      <div className="swap-actions">
                        <button className="btn-cosmos-ghost" onClick={() => navigate(`/profile/${other?._id}`)} style={{ padding: '7px 14px', fontSize: 11, fontWeight: 700 }}>Profile</button>
                        <button className="btn-cosmos-ghost" onClick={() => setReviewSwap(s)} style={{ padding: '7px 14px', fontSize: 11, fontWeight: 700 }}>Review</button>
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
      <ConfirmModal
        open={showDeleteModal !== null}
        title="Delete Request"
        message="Delete this swap request? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(null)}
      />
      <ConfirmModal
        open={showCompleteModal !== null}
        title="Mark Complete?"
        message="Confirm that you've completed your part of the swap?"
        confirmLabel="Mark Complete"
        onConfirm={() => complete(showCompleteModal)}
        onCancel={() => setShowCompleteModal(null)}
      />
      <ConfirmModal
        open={showDeclineCompleteModal !== null}
        title="Decline Completion?"
        message="Decline the completion request? The swap will remain active."
        confirmLabel="Decline"
        onConfirm={handleDeclineComplete}
        onCancel={() => setShowDeclineCompleteModal(null)}
      />
    </div>
  );
}
