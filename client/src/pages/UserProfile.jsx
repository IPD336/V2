import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import SwapRequestModal from '../components/SwapRequestModal';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function stars(n) {
  return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
}

export default function UserProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSwap, setShowSwap] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, rRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/reviews/user/${id}`)
        ]);
        setUser(uRes.data);
        setReviews(rRes.data);
        setSaved(me?.savedProfiles?.includes(id));
      } catch {
        showToast('User not found', 'error');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, me, navigate, showToast]);

  const handleSave = async () => {
    try {
      const res = await api.post(`/users/${id}/save`);
      setSaved(res.data.saved);
      showToast(res.data.saved ? 'Saved to favourites ★' : 'Removed from favourites');
    } catch {
      showToast('Could not save', 'error');
    }
  };

  if (loading) return <div className="spinner" />;
  if (!user) return null;

  return (
    <div className="page" style={{ background: 'var(--cream)' }}>
      <div className="container" style={{ maxWidth: 800, paddingTop: 48, paddingBottom: 80 }}>
        <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px', marginBottom: 24 }} onClick={() => navigate(-1)}>← Back</button>

        {/* Profile Header */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 40, border: '1px solid var(--border)', marginBottom: 24, display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: 100, height: 100, borderRadius: 24, background: user.avatarColor || '#C84B31', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 32, color: 'white', flexShrink: 0 }}>
            {initials(user.name)}
          </div>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 32, fontWeight: 700, letterSpacing: -0.5, margin: 0, color: 'var(--ink)' }}>{user.name}</h1>
                  {user.league && user.league.name !== 'Bronze' && (
                    <span style={{ 
                      background: user.league.color + '20', color: user.league.name === 'Diamond' ? '#00E5FF' : user.league.name === 'Platinum' ? '#8e9eab' : user.league.color,
                      padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800, border: `1.5px solid ${user.league.color}`
                    }}>
                      {user.league.name} Mentor
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)', display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  {user.location && <span>📍 {user.location}</span>}
                  <span>⭐ {user.rating?.toFixed(1) || '—'} ({user.reviewCount || 0} reviews)</span>
                  <span className="hide-mobile">🕐 {user.availability}</span>
                </div>
              </div>
              {me?._id !== user._id && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className={`btn-icon ${saved ? 'saved' : ''}`} onClick={handleSave} title="Save">
                    {saved ? '★' : '☆'}
                  </button>
                  <button className="btn-accent" onClick={() => setShowSwap(true)}>Request Swap</button>
                </div>
              )}
            </div>
            {user.bio && <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink)' }}>{user.bio}</p>}
            
            {(user.socialLinks?.linkedin || user.socialLinks?.github || user.socialLinks?.portfolio) && (
              <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                {user.socialLinks.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>LinkedIn ↗</a>}
                {user.socialLinks.github && <a href={user.socialLinks.github} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>GitHub ↗</a>}
                {user.socialLinks.portfolio && <a href={user.socialLinks.portfolio} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Portfolio ↗</a>}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
          {/* Skills Offered */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)' }}>
            <div className="skill-section-label">Skills Offered</div>
            <div className="tag-row" style={{ marginBottom: 0 }}>
              {user.skillsOffered?.map((s, i) => (
                <span key={i} className="tag tag-r" style={{ fontSize: 13, padding: '6px 12px' }}>
                  {s.verified && <span title="Verified" style={{ marginRight: 4 }}>✓</span>} {s.name}
                </span>
              ))}
              {(!user.skillsOffered || user.skillsOffered.length === 0) && <span style={{ fontSize: 13, color: 'var(--muted)' }}>None listed</span>}
            </div>
          </div>

          {/* Skills Wanted */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)' }}>
            <div className="skill-section-label">Skills Wanted</div>
            <div className="tag-row" style={{ marginBottom: 0 }}>
              {user.skillsWanted?.map((s, i) => (
                <span key={i} className="tag tag-g" style={{ fontSize: 13, padding: '6px 12px' }}>{s}</span>
              ))}
              {(!user.skillsWanted || user.skillsWanted.length === 0) && <span style={{ fontSize: 13, color: 'var(--muted)' }}>None listed</span>}
            </div>
          </div>
        </div>

        {/* Languages */}
        {user.languages?.length > 0 && (
           <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--border)', marginBottom: 32 }}>
            <div className="skill-section-label">Languages</div>
            <div className="tag-row" style={{ marginBottom: 0 }}>
              {user.languages.map((l, i) => (
                <span key={i} className="tag tag-b" style={{ fontSize: 13, padding: '6px 12px' }}>{l}</span>
              ))}
            </div>
           </div>
        )}

        {/* Reviews */}
        <div>
          <div className="section-label">Feedback</div>
          <h2 style={{ fontFamily: 'PT Serif, serif', fontSize: 24, fontWeight: 600, marginBottom: 24, color: 'var(--ink)' }}>Reviews ({reviews.length})</h2>
          
          {reviews.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--border)' }}>
              <div className="empty-state-icon">⭐</div>
              <h3 style={{ color: 'var(--ink)' }}>No reviews yet</h3>
              <p>Complete a swap with {user.name} to leave the first review.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map((r) => (
                <div key={r._id} style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: r.reviewer?.avatarColor || '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'white' }}>
                        {initials(r.reviewer?.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{r.reviewer?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ color: '#B8902A', fontSize: 14 }}>{stars(r.rating)}</div>
                  </div>
                  {r.learned && <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}><strong>Learned:</strong> {r.learned}</div>}
                  {r.feedback && <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>"{r.feedback}"</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showSwap && <SwapRequestModal target={user} onClose={() => setShowSwap(false)} />}
    </div>
  );
}
