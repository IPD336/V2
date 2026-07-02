import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import SwapRequestModal from '../components/SwapRequestModal';
import Spinner from '../components/Spinner';
import TypingIndicator from '../components/TypingIndicator';
import { PinIcon, ClockIcon, StarIcon, DiamondIcon, TrophyIcon, MedalIcon, HandshakeIcon, LinkIcon, SparklesIcon, RocketIcon, SwapIcon, TargetIcon, CheckIcon, SendIcon, SearchIcon, WorkspaceIcon, PaletteIcon } from '../components/Icons';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function stars(n) {
  return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
}

const badgeIconMap = {
  RocketIcon, HandshakeIcon, StarIcon, SwapIcon, TargetIcon,
  DiamondIcon, SparklesIcon, CheckIcon, TrophyIcon, MedalIcon,
  PinIcon, SendIcon, SearchIcon, WorkspaceIcon,
};

function BadgeIcon({ name, size = 20 }) {
  const Icon = badgeIconMap[name];
  if (!Icon) return <span style={{ fontSize: size }}>•</span>;
  return <Icon size={size} />;
}

export default function UserProfile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [swapHistory, setSwapHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSwap, setShowSwap] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummarySlow, setAiSummarySlow] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [gamification, setGamification] = useState(null);
  const [flipHeight, setFlipHeight] = useState(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, rRes, sRes, gRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/reviews/user/${id}`),
          api.get(`/swaps/user/${id}`),
          api.get('/gamification').catch(() => null),
        ]);
        setUser(uRes.data);
        setReviews(rRes.data.reviews);
        setSwapHistory(sRes.data.swaps);
        setSaved(me?.savedProfiles?.includes(id));
        if (gRes) setGamification(gRes.data);

        if (rRes.data.reviews?.length > 0) {
          setAiSummaryLoading(true);
          const slowTimer = setTimeout(() => setAiSummarySlow(true), 5000);
          api.get(`/ai/reviews-summary/${id}`)
            .then(res => setAiSummary(res.data.summary))
            .catch(() => {})
            .finally(() => { setAiSummaryLoading(false); setAiSummarySlow(false); clearTimeout(slowTimer); });
        }
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

  useLayoutEffect(() => {
    if (!frontRef.current || !backRef.current) return;
    const front = frontRef.current;
    const back = backRef.current;
    // Use a small delay to ensure render is complete
    const timer = setTimeout(() => {
      setFlipHeight(Math.max(front.offsetHeight, back.offsetHeight));
    }, 50);
    return () => clearTimeout(timer);
  }, [user, gamification]);

  if (loading) return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ maxWidth: 800, paddingTop: 48, paddingBottom: 80 }}>
        <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 6, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: 100, height: 100, borderRadius: 20, marginBottom: 20 }} />
        <div className="skeleton" style={{ width: '40%', height: 28, borderRadius: 8, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '60%', height: 16, borderRadius: 6, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: '100%', height: 120, borderRadius: 16 }} />
      </div>
    </div>
  );
  if (!user) return null;

  const badgeList = gamification?.badges?.filter(b => b.earned) || [];

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ maxWidth: 800, paddingTop: 48, paddingBottom: 80 }}>
        <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px', marginBottom: 24 }} onClick={() => navigate(-1)}>← Back</button>

        {/* Flip Card Container */}
        <div className="flip-card" style={{ marginBottom: 24 }}>
          <div ref={innerRef} className={`flip-card-inner ${flipped ? 'flipped' : ''}`} style={flipHeight ? { height: flipHeight } : {}}>
            {/* FRONT */}
            <div ref={frontRef} className="flip-card-front">
              <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
                {(() => {
                  const bannerBg = user.bannerUrl || (user.bannerColor ? `linear-gradient(135deg, ${user.bannerColor}, ${user.bannerColor}aa)` : null);
                  if (!bannerBg) return null;
                  return <div style={{ height: 80, background: bannerBg, backgroundSize: 'cover', backgroundPosition: 'center' }} />;
                })()}
                <div style={{ padding: 40, display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: 100, height: 100, borderRadius: 24, background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : (user.avatarColor || '#C84B31'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 32, color: 'white', flexShrink: 0, position: 'relative' }}>
                  {!user.avatarUrl && initials(user.name)}
                  {isUserOnline(user._id) && <span className="presence-dot" style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, border: '3px solid var(--card-bg)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                        <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 32, fontWeight: 700, letterSpacing: -0.5, margin: 0, color: 'var(--ink)' }}>{user.name}</h1>
                        {me?._id !== user._id && user.matchScore > 0 && (
                          <span style={{
                            fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                            background: user.matchScore >= 80 ? 'rgba(200,75,49,0.12)' : user.matchScore >= 60 ? 'rgba(58,99,81,0.12)' : user.matchScore >= 40 ? 'rgba(185,144,42,0.12)' : 'rgba(122,114,104,0.12)',
                            color: user.matchScore >= 80 ? 'var(--accent)' : user.matchScore >= 60 ? 'var(--sage)' : user.matchScore >= 40 ? 'var(--gold)' : 'var(--muted)',
                            border: '1px solid currentColor',
                          }}>
                            {user.matchScore}% Match{user.mutualMatch ? ' · ⇄ Mutual' : ''}
                          </span>
                        )}
                        {user.league && (
                          <span style={{
                            background: user.league.color + '15', color: user.league.name === 'Diamond' ? '#00E5FF' : user.league.name === 'Platinum' ? '#8e9eab' : user.league.color,
                            padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800, border: `1.5px solid ${user.league.color}`, display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 0 10px ${user.league.color}20`
                          }}>
                            {user.league.name === 'Diamond' ? <DiamondIcon size={14} /> : user.league.name === 'Gold' ? <TrophyIcon size={14} /> : '✦'} {user.league.name} Mentor
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--muted)', display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                        {user.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PinIcon size={12} /> {user.location}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><StarIcon size={12} /> {user.rating?.toFixed(1) || '—'} ({user.reviewCount || 0} reviews)</span>
                        <span className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ClockIcon size={12} /> {user.availability}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Profile link copied!'); }}
                        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}
                        aria-label="Copy profile link"
                      ><LinkIcon size={12} /> Share</button>
                      <button onClick={() => setFlipped(!flipped)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MedalIcon size={12} /> Badges
                      </button>
                      {me?._id !== user._id && (
                        <>
                          <button className={`btn-icon ${saved ? 'saved' : ''}`} onClick={handleSave} title="Save">
                            {saved ? '★' : '☆'}
                          </button>
                          <button className="btn-cosmos btn-cosmos-primary" onClick={() => setShowSwap(true)} style={{ padding: '10px 20px', fontSize: 11 }}>Request Swap</button>
                        </>
                      )}
                    </div>
                  </div>
                  {user.bio && <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink)' }}>{user.bio}</p>}

                  {(user.socialLinks?.linkedin || user.socialLinks?.github || user.socialLinks?.portfolio) && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                      {user.socialLinks.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>LinkedIn ↗</a>}
                      {user.socialLinks.github && <a href={user.socialLinks.github} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>GitHub ↗</a>}
                      {user.socialLinks.portfolio && <a href={user.socialLinks.portfolio} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Portfolio ↗</a>}
                    </div>
                  )}
                  {user.createdAt && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
                      Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

            {/* BACK */}
            <div ref={backRef} className="flip-card-back">
              <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--border)', minHeight: 200, overflowY: 'auto', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'PT Serif, serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MedalIcon size={18} /> {gamification ? `Level ${gamification.level}` : 'Achievements'}
                  </h2>
                  <button onClick={() => setFlipped(false)} className="btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }}>
                    ← Back to profile
                  </button>
                </div>

                {gamification && (
                  <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--accent-light)', borderRadius: 12, border: '1px solid rgba(var(--accent-rgb),0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>XP Progress</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>Lv.{gamification.level} · {gamification.xpCurrent}/{gamification.xpNeeded} XP</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${Math.min(100, (gamification.xpCurrent / gamification.xpNeeded) * 100)}%`,
                        background: 'linear-gradient(90deg, var(--accent), #8B5CF6)', borderRadius: 4, transition: 'width .5s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: 'var(--muted)' }}>
                      <span>🔥 {gamification.streak?.current || 0} day streak</span>
                      <span>🏆 {gamification.xp.toLocaleString()} total XP</span>
                    </div>
                  </div>
                )}

                {badgeList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 13 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🏅</div>
                    No badges earned yet. Complete swaps and actions to earn badges!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {badgeList.map((b, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: 'var(--accent-light)',
                        borderRadius: 12, border: '1px solid rgba(var(--accent-rgb),0.2)',
                      }}>
                        <BadgeIcon name={b.icon} size={22} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--ink)' }}>{b.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                            Earned {new Date(b.earnedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section (original, for non-gamification badges) */}
        {user.badges && user.badges.length > 0 && !gamification && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, marginBottom: 24, border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><MedalIcon size={18} /> Achievements</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {user.badges.map((badge, idx) => (
                <div key={idx} style={{ background: 'var(--gold-light)', border: '1px solid var(--gold)', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24, display: 'flex', color: 'var(--gold)' }}><StarIcon size={20} /></div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>{badge.id || badge}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Earned achievement</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--border)' }}>
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

          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--border)' }}>
            <div className="skill-section-label">Skills Wanted</div>
            <div className="tag-row" style={{ marginBottom: 0 }}>
              {user.skillsWanted?.map((s, i) => (
                <span key={i} className="tag tag-g" style={{ fontSize: 13, padding: '6px 12px' }}>{s}</span>
              ))}
              {(!user.skillsWanted || user.skillsWanted.length === 0) && <span style={{ fontSize: 13, color: 'var(--muted)' }}>None listed</span>}
            </div>
          </div>
        </div>

        {user.languages?.length > 0 && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--border)', marginBottom: 32 }}>
            <div className="skill-section-label">Languages</div>
            <div className="tag-row" style={{ marginBottom: 0 }}>
              {user.languages.map((l, i) => (
                <span key={i} className="tag tag-b" style={{ fontSize: 13, padding: '6px 12px' }}>{l}</span>
              ))}
            </div>
          </div>
        )}

        {swapHistory.length > 0 ? (
          <div style={{ marginBottom: 32 }}>
            <div className="section-label">Activity</div>
            <h2 style={{ fontFamily: 'PT Serif, serif', fontSize: 24, fontWeight: 600, marginBottom: 24, color: 'var(--ink)' }}>Completed Swaps ({swapHistory.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {swapHistory.slice(0, 5).map((s) => {
                const other = s.sender._id === user._id ? s.receiver : s.sender;
                return (
                  <div key={s._id} style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '14px 18px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: other?.avatarUrl ? `url(${other.avatarUrl}) center/cover` : (other?.avatarColor || '#3A6351'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'white', flexShrink: 0 }}>
                      {!other?.avatarUrl && other?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>
                        {s.skillOffered} ↔ {s.skillWanted}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        with {other?.name} · {s.completedAt ? new Date(s.completedAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <span className="status-badge status-done">Done</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ marginBottom: 32, background: 'var(--card-bg)', borderRadius: 16, padding: 40, border: '1px solid var(--border)' }}>
            <div className="empty-state-icon"><HandshakeIcon size={32} /></div>
            <h3 style={{ color: 'var(--ink)' }}>No swaps yet</h3>
            <p style={{ margin: 0 }}>Completed swaps will appear here once they start trading skills.</p>
          </div>
        )}

        <div>
          <div className="section-label">Feedback</div>
          <h2 style={{ fontFamily: 'PT Serif, serif', fontSize: 24, fontWeight: 600, marginBottom: 24, color: 'var(--ink)' }}>Reviews ({reviews.length})</h2>

          {reviews.length > 0 && (
            <div style={{ background: 'var(--sage-light)', border: '1px solid var(--sage)', borderRadius: 16, padding: 24, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--sage)', marginTop: 2, display: 'flex' }}><SparklesIcon size={20} /></div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--sage)', marginBottom: 8, fontFamily: 'PT Mono, monospace' }}>AI Feedback Summary</h3>
                {aiSummaryLoading ? (
                  <TypingIndicator message={aiSummarySlow ? 'Still analyzing reviews...' : 'Analyzing reviews...'} />
                ) : (
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)', margin: 0, fontStyle: 'italic' }}>
                    "{aiSummary || 'No summary available.'}"
                  </p>
                )}
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div className="empty-state-icon"><StarIcon size={32} /></div>
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
                    <div style={{ color: 'var(--gold)', fontSize: 14 }}>{stars(r.rating)}</div>
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
