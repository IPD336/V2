import { useState, useCallback, useRef, memo } from 'react';
import '../styles/cards.css';
import { useNavigate } from 'react-router-dom';
import { COLORS, initials, stars } from '../utils';
import { PinIcon, ClockIcon, DiamondIcon, TrophyIcon, LinkedInIcon, GitHubIcon, LinkIcon } from './Icons';

// Sub-helper for League Badges
const LeagueBadge = ({ league }) => {
  if (!league) return null;
  const isDiamond = league.name === 'Diamond';
  const isGold = league.name === 'Gold';
  const displayColor = isDiamond ? '#00E5FF' : league.name === 'Platinum' ? '#a1b5c4' : league.color;
  return (
    <span style={{
      background: 'rgba(0,0,0,0.22)',
      color: displayColor,
      padding: '2px 8px',
      borderRadius: 12,
      fontSize: 10,
      fontWeight: 800,
      border: `1.5px solid ${league.color}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      verticalAlign: 'middle'
    }}>
      {isDiamond ? <DiamondIcon size={10} /> : isGold ? <TrophyIcon size={10} /> : null}
      <span>{league.name}</span>
    </span>
  );
};

export const ProfileCard = memo(function ProfileCard({
  styleId = 'style-1',
  user,
  onSwap,
  onFollow,
  isFollowing,
  isOnline,
  index,
  onTagClick
}) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const [followPopping, setFollowPopping] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const color = user.avatarColor || COLORS[0];
  const bannerBg = user.bannerUrl || (user.bannerColor ? `linear-gradient(135deg, ${user.bannerColor}, ${user.bannerColor}aa)` : `linear-gradient(135deg, ${color}, ${color}aa)`);
  const score = user.matchScore || 0;

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
  }, []);

  const handleFollowClick = (e) => {
    e.stopPropagation();
    setFollowPopping(true);
    onFollow(user._id);
    setTimeout(() => setFollowPopping(false), 500);
  };

  // Rendering common elements
  const renderOffers = (alignCenter = false, isCyber = false) => {
    const labelColor = isCyber ? 'var(--accent)' : 'var(--muted)';
    const tagClass = isCyber ? '' : 'tag tag-r tag-clickable';
    const tagStyle = isCyber ? {
      fontSize: 9, padding: '3px 8px', border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: 2, cursor: 'pointer'
    } : {
      fontSize: 10, padding: '4px 8px', borderRadius: 6, background: 'rgba(200, 75, 49, 0.12)', color: 'var(--accent)'
    };

    if (!user.skillsOffered?.length) {
      const emptyStyle = isCyber ? {
        fontSize: 9, padding: '3px 8px', border: '1.5px dashed var(--muted)', color: 'var(--muted)', borderRadius: 2
      } : {
        fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px dashed var(--border)', color: 'var(--muted)'
      };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: alignCenter ? 'center' : 'left' }}>
            {isCyber ? '// OFFERS' : 'Offers'}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: alignCenter ? 'center' : 'flex-start' }}>
            <span style={emptyStyle}>No skills listed</span>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: alignCenter ? 'center' : 'left' }}>
          {isCyber ? '// OFFERS' : 'Offers'}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: alignCenter ? 'center' : 'flex-start' }}>
          {user.skillsOffered.slice(0, 3).map((s, i) => (
            <span
              key={i}
              className={tagClass}
              style={tagStyle}
              onClick={(e) => { e.stopPropagation(); onTagClick(s.name || s); }}
            >
              {s.verified && '✓ '}{s.name || s}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderWants = (alignCenter = false, isCyber = false) => {
    const labelColor = isCyber ? 'var(--accent)' : 'var(--muted)';
    const tagClass = isCyber ? '' : 'tag tag-g tag-clickable';
    const tagStyle = isCyber ? {
      fontSize: 9, padding: '3px 8px', border: '1.5px solid var(--sage)', color: 'var(--sage)', background: 'rgba(var(--sage-rgb), 0.05)', borderRadius: 2, cursor: 'pointer'
    } : {
      fontSize: 10, padding: '4px 8px', borderRadius: 6, background: 'rgba(58, 99, 81, 0.12)', color: 'var(--sage)'
    };

    if (!user.skillsWanted?.length) {
      const emptyStyle = isCyber ? {
        fontSize: 9, padding: '3px 8px', border: '1.5px dashed var(--muted)', color: 'var(--muted)', borderRadius: 2
      } : {
        fontSize: 10, padding: '4px 8px', borderRadius: 6, border: '1px dashed var(--border)', color: 'var(--muted)'
      };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: alignCenter ? 'center' : 'left' }}>
            {isCyber ? '// WANTS' : 'Wants'}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: alignCenter ? 'center' : 'flex-start' }}>
            <span style={emptyStyle}>Flexible / Open to suggestions</span>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.8px', textAlign: alignCenter ? 'center' : 'left' }}>
          {isCyber ? '// WANTS' : 'Wants'}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: alignCenter ? 'center' : 'flex-start' }}>
          {user.skillsWanted.slice(0, 3).map((s, i) => (
            <span
              key={i}
              className={tagClass}
              style={tagStyle}
              onClick={(e) => { e.stopPropagation(); onTagClick(s); }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderMatchBanner = (isCyber = false) => {
    if (!user.aiMatchExplanation) return null;
    if (isCyber) {
      return (
        <div style={{ border: '1px solid var(--sage)', background: 'rgba(var(--sage-rgb), 0.08)', padding: '6px 10px', fontSize: 10, color: 'var(--sage)' }}>
          {"MATCH_REASON >> "}{user.aiMatchExplanation}
        </div>
      );
    }
    return (
      <div style={{
        border: '1px solid rgba(var(--sage-rgb), 0.25)',
        background: 'rgba(var(--sage-rgb), 0.08)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 11,
        lineHeight: '1.4',
        color: 'var(--sage)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 5
      }}>
        <span style={{ flexShrink: 0 }}>✨</span>
        <span style={{ fontStyle: 'italic' }}>{user.aiMatchExplanation}</span>
      </div>
    );
  };

  const renderSocialFooter = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)', height: 38, overflow: 'hidden', width: '100%', marginTop: 'auto' }}>
      <a href={user.socialLinks?.linkedin || '#'} target={user.socialLinks?.linkedin ? '_blank' : '_self'} rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border)', color: user.socialLinks?.linkedin ? 'var(--accent)' : 'var(--muted)', opacity: user.socialLinks?.linkedin ? 1 : 0.3 }} title="LinkedIn" onClick={(e) => { e.stopPropagation(); if (!user.socialLinks?.linkedin) e.preventDefault(); }}>
        <LinkedInIcon size={15} />
      </a>
      <a href={user.socialLinks?.github || '#'} target={user.socialLinks?.github ? '_blank' : '_self'} rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border)', color: user.socialLinks?.github ? 'var(--ink)' : 'var(--muted)', opacity: user.socialLinks?.github ? 1 : 0.3 }} title="GitHub" onClick={(e) => { e.stopPropagation(); if (!user.socialLinks?.github) e.preventDefault(); }}>
        <GitHubIcon size={15} />
      </a>
      <a href={user.socialLinks?.portfolio || '#'} target={user.socialLinks?.portfolio ? '_blank' : '_self'} rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: user.socialLinks?.portfolio ? 'var(--accent)' : 'var(--muted)', opacity: user.socialLinks?.portfolio ? 1 : 0.3 }} title="Portfolio" onClick={(e) => { e.stopPropagation(); if (!user.socialLinks?.portfolio) e.preventDefault(); }}>
        <LinkIcon size={14} />
      </a>
    </div>
  );

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 1: CLASSIC FLAT (REFERENCE STYLE)                */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-1') {
    return (
      <div
        ref={cardRef}
        className={`profile-card-3d ${flipped ? 'flipped' : ''}`}
        style={{ '--stagger': index }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => cardRef.current?.style.removeProperty('--mx')}
      >
        {/* FRONT */}
        <div className="card-face card-front" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Banner with Square Avatar */}
          <div className="card-banner-header" style={{ background: bannerBg, height: 100, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <div style={{ position: 'relative', width: 62, height: 62 }}>
              <div className="card-avatar-square" style={{ width: 62, height: 62, background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, borderRadius: 10 }}>
                {!user.avatarUrl && initials(user.name)}
              </div>
              {isOnline && <span className="presence-dot presence-pulse" style={{ position: 'absolute', bottom: -2, right: -2, border: '2px solid var(--card-bg)' }} />}
            </div>
            
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className="card-badge badge-match" style={{ background: 'rgba(0, 0, 0, 0.45)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.35)', padding: '4px 8px', borderRadius: 8, fontSize: 9, fontWeight: 800 }}>
                {score}% MATCH
              </span>
              <span className="card-badge badge-public" style={{ background: 'rgba(58, 99, 81, 0.85)', color: '#a7f3d0', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 8, fontSize: 9 }}>
                ● PUBLIC
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{user.name}</h3>
              <LeagueBadge league={user.league} />
            </div>

            <div className="card-loc" style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: -4 }}>
              <PinIcon size={11} /> <span>{user.location || 'Anywhere / Remote'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)', marginTop: -6 }}>
              <span style={{ color: '#B8902A' }}>{stars(user.rating || 0)}</span>
              <span style={{ fontWeight: 700 }}>{user.rating?.toFixed(1) || '0.0'}</span>
              <span>({user.reviewCount || 0} reviews)</span>
            </div>

            {renderOffers()}
            {renderWants()}
            {renderMatchBanner()}

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              <ClockIcon size={11} /> <span>{user.availability || 'Flexible Hours'}</span>
            </div>

            {/* Action Row */}
            <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
              <button className="btn-swap" onClick={() => onSwap(user)}>Request Swap</button>
              <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'} ${followPopping ? 'star-pop' : ''}`} onClick={handleFollowClick}>
                {isFollowing ? 'Following ✓' : 'Follow +'}
              </button>
              <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setFlipped(true); }} title="Flip Card" style={{ width: 34, height: 34, flexShrink: 0 }}>↻</button>
              <button className="btn-icon" onClick={() => navigate(`/profile/${user._id}`)} title="View Profile" style={{ width: 34, height: 34, flexShrink: 0 }}>↗</button>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="card-face card-back" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="card-back-inner" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <div className="card-back-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="card-avatar-square" style={{ width: 32, height: 32, background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, borderRadius: 6 }}>
                  {!user.avatarUrl && initials(user.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                  {user.location && <div className="card-loc" style={{ marginBottom: 0 }}><PinIcon size={10} /> {user.location.split(',')[0]}</div>}
                </div>
              </div>
              <button type="button" className="btn-flip-back" onClick={(e) => { e.stopPropagation(); setFlipped(false); }}>✕</button>
            </div>

            <p className="card-back-bio" style={{ fontSize: 12, color: 'var(--muted)', maxHeight: 60, overflowY: 'auto', lineHeight: 1.4, margin: '4px 0 8px 0', fontStyle: user.bio ? 'normal' : 'italic' }}>
              {user.bio || "No bio written yet. Request a swap to start collaborating!"}
            </p>

            {/* Three-column stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '8px 0', margin: '4px 0', background: 'rgba(0,0,0,0.01)' }}>
              <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{user.rating?.toFixed(1) || '—'} ★</div>
                <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Rating</div>
              </div>
              <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{user.followersCount || 0}</div>
                <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Followers</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{user.reviewCount || 0}</div>
                <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Reviews</div>
              </div>
            </div>

            {/* Match Score visual block */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0', borderTop: '1px solid var(--border)', margin: '4px 0', flex: 1 }}>
              <div style={{ position: 'relative', width: 68, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
                <svg width="68" height="68" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                  <circle cx="34" cy="34" r="30" fill="none" stroke="var(--border)" strokeWidth="2.5" />
                  <circle
                    cx="34"
                    cy="34"
                    r="30"
                    fill="none"
                    stroke={score >= 80 ? 'var(--accent)' : score >= 60 ? 'var(--sage)' : score >= 40 ? 'var(--gold)' : 'var(--muted)'}
                    strokeWidth="3"
                    strokeDasharray="188.49"
                    strokeDashoffset={188.49 - (score / 100) * 188.49}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--ink)', lineHeight: 1 }}>{score}%</span>
                  <span style={{ fontSize: 7, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Match</span>
                </div>
              </div>
              
              {user.aiMatchExplanation ? (
                <div style={{ fontSize: 10.5, fontStyle: 'italic', color: 'var(--sage)', textAlign: 'center', padding: '0 8px', display: 'flex', alignItems: 'flex-start', gap: 4, marginTop: 4, lineHeight: 1.3 }}>
                  <span style={{ flexShrink: 0 }}>✨</span> 
                  <span>{user.aiMatchExplanation}</span>
                </div>
              ) : (
                <div style={{ fontSize: 10.5, color: 'var(--muted)', textAlign: 'center', marginTop: 4, fontStyle: 'italic' }}>
                  No overlapping skills yet. Try swapping suggestion ideas!
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, marginTop: 'auto', marginBottom: 44 }}>
              <button className="btn-swap" style={{ flex: 1 }} onClick={() => onSwap(user)}>Request Swap</button>
              <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} style={{ padding: '6px 12px', fontSize: 11 }} onClick={handleFollowClick}>
                {isFollowing ? 'Following ✓' : 'Follow +'}
              </button>
              <button className="btn-icon" onClick={() => navigate(`/profile/${user._id}`)} title="View Profile" style={{ width: 34, height: 34, flexShrink: 0 }}>↗</button>
            </div>

            {renderSocialFooter()}
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 2: GLASSMORPHIC SPOTLIGHT                        */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-2') {
    return (
      <div
        ref={cardRef}
        className="profile-card card-glass"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => cardRef.current?.style.removeProperty('--mx')}
        style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}
      >
        <div className="card-spotlight" />
        <div className="card-banner" style={{ background: bannerBg, height: 80, opacity: 0.85 }} />
        
        <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: -30, zIndex: 3 }}>
          <div style={{ display: 'flex', justifySelf: 'flex-start', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginBottom: 4 }}>
            <div style={{ position: 'relative', width: 62, height: 62 }}>
              <div className="card-avatar-square" style={{ width: 62, height: 62, background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, borderRadius: 12, border: '3.5px solid var(--card-bg)' }}>
                {!user.avatarUrl && initials(user.name)}
              </div>
              {isOnline && <span className="presence-dot presence-pulse" style={{ position: 'absolute', bottom: -2, right: -2, border: '2px solid var(--card-bg)' }} />}
            </div>
            <span className="card-badge badge-public" style={{ background: 'rgba(58, 99, 81, 0.15)', color: 'var(--sage)', border: '1px solid rgba(58, 99, 81, 0.2)' }}>
              ● PUBLIC
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{user.name}</h3>
            <LeagueBadge league={user.league} />
          </div>

          {user.location && (
            <div className="card-loc" style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: -4 }}>
              <PinIcon size={11} /> <span>{user.location}</span>
            </div>
          )}

          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 6px', fontStyle: 'italic', lineHeight: 1.4 }}>
            {user.bio ? (user.bio.length > 70 ? user.bio.slice(0, 70) + '...' : user.bio) : 'No bio provided.'}
          </p>

          {renderOffers()}
          {renderWants()}
          {renderMatchBanner()}

          <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
            <button className="btn-swap" onClick={() => onSwap(user)}>Request Swap</button>
            <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} onClick={handleFollowClick}>
              {isFollowing ? 'Following ✓' : 'Follow +'}
            </button>
            <button className="btn-icon" onClick={() => navigate(`/profile/${user._id}`)} style={{ width: 34, height: 34, flexShrink: 0 }}>↗</button>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 3: MODERN MINIMALIST (NO BANNER)                 */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-3') {
    const borderThemeColor = user.league ? user.league.color : 'var(--border)';
    return (
      <div className="profile-card card-minimalist" style={{ '--stagger': index, borderTopColor: borderThemeColor, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
        <div className="card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="card-minimalist-avatar-ring" style={{ borderColor: borderThemeColor }}>
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: 16
              }}>
                {!user.avatarUrl && initials(user.name)}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{user.name}</h3>
                {isOnline && <span className="presence-dot" style={{ width: 8, height: 8 }} />}
              </div>
              {user.location && <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><PinIcon size={10} /> {user.location}</div>}
              {user.matchScore && (
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>
                  {user.matchScore}% Match Score
                </div>
              )}
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0', lineHeight: 1.4 }}>
            {user.bio ? (user.bio.length > 80 ? user.bio.slice(0, 80) + '...' : user.bio) : 'No bio.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Offers</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {user.skillsOffered?.slice(0, 2).map((s, i) => (
                  <span key={i} style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(200,75,49,0.08)', color: 'var(--accent)', borderRadius: 4 }}>{s.name || s}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Wants</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {user.skillsWanted?.slice(0, 2).map((s, i) => (
                  <span key={i} style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(58,99,81,0.08)', color: 'var(--sage)', borderRadius: 4 }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {renderMatchBanner()}

          <div style={{ display: 'flex', gap: 6, marginTop: 'auto', alignItems: 'center' }}>
            <button className="btn-swap" style={{ padding: '8px' }} onClick={() => onSwap(user)}>Request Swap</button>
            <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} style={{ padding: '6px 10px', fontSize: 11 }} onClick={handleFollowClick}>
              {isFollowing ? 'Following ✓' : 'Follow +'}
            </button>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => navigate(`/profile/${user._id}`)}>↗</button>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 4: 3D FLIP CARD (CURRENT ACTIVE STYLE)            */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-4') {
    return (
      <div
        ref={cardRef}
        className={`profile-card-3d ${flipped ? 'flipped' : ''}`}
        style={{ '--stagger': index }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => cardRef.current?.style.removeProperty('--mx')}
      >
        {/* FRONT */}
        <div className="card-face card-front" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="card-spotlight" />
          <div className="card-banner" style={{ background: bannerBg, height: 110, position: 'relative', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <button type="button" className={`follow-float-btn ${followPopping ? 'star-pop' : ''}`} onClick={handleFollowClick} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255, 255, 255, 0.95)', border: 'none', padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: isFollowing ? 'var(--accent)' : '#0f172a', cursor: 'pointer', zIndex: 10 }}>
              {isFollowing ? 'Following ✓' : 'Follow +'}
            </button>
          </div>

          <div className="card-body" style={{ padding: '0 0 48px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'relative', marginTop: '-42px', display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div style={{ position: 'relative', width: 84, height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="84" height="84" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx="42" cy="42" r="38" fill="none" stroke="var(--border)" strokeWidth="3" />
                  <circle cx="42" cy="42" r="38" fill="none" stroke={user.matchScore >= 80 ? 'var(--accent)' : user.matchScore >= 60 ? 'var(--sage)' : user.matchScore >= 40 ? 'var(--gold)' : 'var(--muted)'} strokeWidth="3.5" strokeDasharray="238.76" strokeDashoffset={238.76 - ((user.matchScore || 0) / 100) * 238.76} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                </svg>
                <div className="card-avatar" style={{ width: 68, height: 68, background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, borderRadius: '50%', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: 'white', zIndex: 2 }}>
                  {!user.avatarUrl && initials(user.name)}
                  {isOnline && <span className="presence-dot presence-pulse" style={{ position: 'absolute', bottom: 2, right: 2, border: '2px solid white' }} />}
                </div>
                <div style={{ position: 'absolute', bottom: -2, right: -2, background: user.matchScore >= 80 ? 'var(--accent)' : user.matchScore >= 60 ? 'var(--sage)' : user.matchScore >= 40 ? 'var(--gold)' : 'var(--muted)', color: 'white', borderRadius: 12, padding: '2px 6px', fontSize: 10, fontWeight: 800, border: '2px solid white', zIndex: 3 }}>
                  {user.matchScore || 0}%
                </div>
              </div>
            </div>

            <div className="card-name" style={{ marginTop: 16, padding: '0 24px', fontSize: 18, fontWeight: 700, color: 'var(--ink)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              {user.name}
              <LeagueBadge league={user.league} />
            </div>

            <div style={{ padding: '0 24px', margin: '6px 0 16px', fontSize: 13, color: 'var(--muted)', minHeight: 40, lineHeight: 1.4, flex: 1, textAlign: 'center' }}>
              {user.bio ? (user.bio.length > 85 ? user.bio.slice(0, 85) + '...' : user.bio) : 'No bio provided.'}
            </div>

            <div style={{ padding: '0 24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
              {renderOffers(true)}
              {renderWants(true)}
            </div>

            <div className="card-peek-overlay">
              <button className="btn-swap peek-swap" onClick={() => onSwap(user)}>Request Swap</button>
              <button className="btn-icon peek-icon" title="View Profile" onClick={() => navigate(`/profile/${user._id}`)}>↗</button>
              <button className="btn-icon peek-icon" title="Flip" onClick={() => setFlipped(true)}>↻</button>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="card-face card-back">
          <div className="card-back-inner" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-back-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="card-avatar-sm" style={{ background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, borderRadius: '50%', width: 32, height: 32 }}>
                  {!user.avatarUrl && initials(user.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                  {user.location && <div className="card-loc" style={{ marginBottom: 0 }}><PinIcon size={10} /> {user.location}</div>}
                </div>
              </div>
              <button type="button" className="btn-flip-back" onClick={() => setFlipped(false)}>✕</button>
            </div>

            <p className="card-back-bio" style={{ fontSize: 12, color: 'var(--muted)', maxHeight: 60, overflowY: 'auto', fontStyle: user.bio ? 'normal' : 'italic' }}>
              {user.bio || "No bio written yet. Request a swap to start collaborating!"}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '10px 0', margin: '8px 0', background: 'rgba(0,0,0,0.01)' }}>
              <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{user.rating?.toFixed(1) || '—'} ★</div>
                <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Rating</div>
              </div>
              <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{user.followersCount || 0}</div>
                <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Followers</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{user.reviewCount || 0}</div>
                <div style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase' }}>Reviews</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', marginBottom: 52 }}>
              <button className="btn-swap" onClick={() => onSwap(user)}>Request Swap</button>
              <button className="btn-ghost" onClick={() => navigate(`/profile/${user._id}`)}>Profile ↗</button>
            </div>
            {renderSocialFooter()}
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 5: GLASSMORPHIC 3D FLIP                           */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-5') {
    return (
      <div
        ref={cardRef}
        className={`profile-card-3d ${flipped ? 'flipped' : ''}`}
        style={{ '--stagger': index }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => cardRef.current?.style.removeProperty('--mx')}
      >
        {/* FRONT */}
        <div className="card-face card-front card-glass card-glass-neon" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="card-spotlight" />
          <div className="card-banner" style={{ background: bannerBg, height: 100, opacity: 0.8 }} />
          
          <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: -32, zIndex: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
              <div style={{ position: 'relative', width: 60, height: 60 }}>
                <div className="card-avatar" style={{ width: 60, height: 60, borderRadius: '50%', background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, border: '3.5px solid var(--card-bg)' }}>
                  {!user.avatarUrl && initials(user.name)}
                </div>
                {isOnline && <span className="presence-dot presence-pulse" style={{ position: 'absolute', bottom: 0, right: 0 }} />}
              </div>
              <span className="card-badge" style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)', border: '1px solid rgba(var(--accent-rgb), 0.2)' }}>
                {user.matchScore || 0}% MATCH
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{user.name}</h3>
              <LeagueBadge league={user.league} />
            </div>

            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, fontStyle: 'italic' }}>
              {user.bio ? (user.bio.length > 70 ? user.bio.slice(0, 70) + '...' : user.bio) : 'No bio.'}
            </p>

            {renderOffers()}
            {renderWants()}

            <div className="card-peek-overlay" style={{ marginTop: 'auto' }}>
              <button className="btn-swap peek-swap" onClick={() => onSwap(user)}>Request Swap</button>
              <button className="btn-icon peek-icon" onClick={() => setFlipped(true)}>↻</button>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="card-face card-back card-glass card-glass-neon">
          <div className="card-back-inner" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>
                  {initials(user.name)}
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{user.name}</div>
              </div>
              <button className="btn-flip-back" style={{ width: 24, height: 24 }} onClick={() => setFlipped(false)}>✕</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, fontSize: 11, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              <div>★ Rating: {user.rating?.toFixed(1) || '—'}</div>
              <div>👥 Followers: {user.followersCount || 0}</div>
              <div>📝 Reviews: {user.reviewCount || 0}</div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 'auto', marginBottom: 44 }}>
              <button className="btn-swap" onClick={() => onSwap(user)}>Swap</button>
              <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} style={{ padding: '6px 12px', fontSize: 11 }} onClick={handleFollowClick}>
                {isFollowing ? 'Following ✓' : 'Follow +'}
              </button>
              <button className="btn-ghost" style={{ padding: '8px' }} onClick={() => navigate(`/profile/${user._id}`)}>Profile ↗</button>
            </div>
            {renderSocialFooter()}
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 6: HORIZONTAL LIST CARD                           */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-6') {
    return (
      <div className="profile-card card-horizontal" style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
        <div className="card-banner-header" style={{ background: bannerBg }}>
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            <div className="card-avatar-square" style={{ width: 56, height: 56, background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, borderRadius: 10 }}>
              {!user.avatarUrl && initials(user.name)}
            </div>
            {isOnline && <span className="presence-dot presence-pulse" style={{ position: 'absolute', bottom: -2, right: -2 }} />}
          </div>
          <LeagueBadge league={user.league} />
        </div>

        <div className="card-horizontal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{user.name}</h3>
              {user.location && <span style={{ fontSize: 11, color: 'var(--muted)' }}>• {user.location}</span>}
            </div>
            
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 6px', lineHeight: 1.4 }}>
              {user.bio ? (user.bio.length > 90 ? user.bio.slice(0, 90) + '...' : user.bio) : 'No bio.'}
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 4 }}>
              {renderOffers()}
              {renderWants()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 150 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#B8902A' }}>★</span>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{user.rating?.toFixed(1) || '0.0'}</span>
              <span>({user.reviewCount || 0} reviews)</span>
            </div>

            {user.availability && <div style={{ fontSize: 10, color: 'var(--muted)' }}>🕐 {user.availability}</div>}

            <div style={{ display: 'flex', gap: 5, width: '100%', marginTop: 8 }}>
              <button className="btn-swap" style={{ padding: '8px 12px' }} onClick={() => onSwap(user)}>Swap</button>
              <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} style={{ padding: '6px 10px', fontSize: 11 }} onClick={handleFollowClick}>
                {isFollowing ? 'Following ✓' : 'Follow +'}
              </button>
              <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => navigate(`/profile/${user._id}`)}>↗</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 7: CYBERPUNK / NEON Theme (Theme-Aligned)        */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-7') {
    const isRecommended = !!user.aiMatchExplanation;
    return (
      <div className={`profile-card card-cyberpunk ${isRecommended ? 'cyber-neon-border-green' : ''}`} style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
        <div className="cyber-scanner" />
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1, color: 'var(--accent)' }}>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 50, height: 50, borderRadius: 4,
              border: '2px solid var(--accent)', background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: 16
            }}>
              {!user.avatarUrl && initials(user.name)}
              {user.avatarUrl && <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{user.name}</h3>
              <div style={{ fontSize: 9, color: 'var(--accent)' }}>ID: {user._id?.slice(-6).toUpperCase()}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {user.league && (
              <div style={{ fontSize: 9, padding: '2px 6px', border: `1.5px solid ${user.league.color}`, background: 'rgba(0,0,0,0.1)', color: user.league.color, borderRadius: 2 }}>
                LEAGUE::{user.league.name.toUpperCase()}
              </div>
            )}
            {isOnline && <span style={{ fontSize: 9, color: 'var(--sage)', fontWeight: 700 }}>● ONLINE_STATE</span>}
          </div>

          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '4px 0', lineHeight: 1.4 }}>
            {user.bio ? (user.bio.length > 70 ? user.bio.slice(0, 70) + '...' : user.bio) : 'NO_DATA_ENTERED'}
          </p>

          {renderOffers(false, true)}
          {renderWants(false, true)}
          {renderMatchBanner(true)}

          <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 10 }}>
            <button className="btn-swap" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 2 }} onClick={() => onSwap(user)}>INIT_SWAP</button>
            
            <button className="btn-follow-text followed" style={{ borderColor: 'var(--accent)', background: isFollowing ? 'rgba(var(--accent-rgb), 0.12)' : 'transparent', color: 'var(--accent)', borderRadius: 2 }} onClick={handleFollowClick}>
              {isFollowing ? 'FOLLOWING::OK' : 'FOLLOW::ADD'}
            </button>

            <button className="btn-icon" style={{ borderColor: 'var(--accent)', background: 'transparent', color: 'var(--accent)', borderRadius: 2, width: 34, height: 34 }} onClick={() => navigate(`/profile/${user._id}`)}>↗</button>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 8: HIGH-DENSITY COMPACT CARD                     */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-8') {
    return (
      <div className="profile-card card-compact" style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
        <div className="card-compact-header">
          <div style={{
            width: 42, height: 42, borderRadius: 8, background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0
          }}>
            {!user.avatarUrl && initials(user.name)}
            {user.avatarUrl && <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }} />}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</h3>
            {user.location && <div style={{ fontSize: 10, color: 'var(--muted)' }}>📍 {user.location.split(',')[0]}</div>}
          </div>
          {isOnline && <span className="presence-dot" style={{ width: 8, height: 8 }} />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, paddingBottom: 10 }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {user.skillsOffered?.slice(0, 2).map((s, i) => (
              <span key={i} style={{ fontSize: 9, padding: '2px 5px', background: 'rgba(200, 75, 49, 0.08)', color: 'var(--accent)', borderRadius: 4 }}>{s.name || s}</span>
            ))}
            {user.skillsWanted?.slice(0, 2).map((s, i) => (
              <span key={i} style={{ fontSize: 9, padding: '2px 5px', background: 'rgba(58, 99, 81, 0.08)', color: 'var(--sage)', borderRadius: 4 }}>{s}</span>
            ))}
          </div>
          
          <div style={{ fontSize: 10, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ color: '#B8902A' }}>★</span>
            <span style={{ fontWeight: 700 }}>{user.rating?.toFixed(1) || '0.0'}</span>
            <span>({user.reviewCount || 0})</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 8, alignItems: 'center' }}>
          <button className="btn-swap" style={{ padding: '6px', fontSize: 11 }} onClick={() => onSwap(user)}>Swap</button>
          
          <button className="btn-follow-text" style={{ padding: '4px 8px', fontSize: 9, minWidth: 60, height: 28, background: isFollowing ? 'var(--gold-light)' : 'transparent', color: isFollowing ? 'var(--gold)' : 'var(--muted)', border: `1px solid ${isFollowing ? 'var(--gold)' : 'var(--border)'}` }} onClick={handleFollowClick}>
            {isFollowing ? 'Following' : 'Follow'}
          </button>

          <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => navigate(`/profile/${user._id}`)}>↗</button>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 9: FLAT CARD WITH EXPANDABLE DETAILS ACCORDION   */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-9') {
    return (
      <div className="profile-card" style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
        <div className="card-banner-header" style={{ background: bannerBg, height: 80 }} />
        
        <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: -26, zIndex: 3, flex: 1 }}>
          <div style={{ display: 'flex', justifySelf: 'flex-start', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
            <div style={{ position: 'relative', width: 56, height: 56 }}>
              <div className="card-avatar-square" style={{ width: 56, height: 56, background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, borderRadius: 10, border: '3px solid var(--card-bg)' }}>
                {!user.avatarUrl && initials(user.name)}
              </div>
              {isOnline && <span className="presence-dot presence-pulse" style={{ position: 'absolute', bottom: -2, right: -2 }} />}
            </div>
            <LeagueBadge league={user.league} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{user.name}</h3>
            {user.location && <span style={{ fontSize: 11, color: 'var(--muted)' }}>📍 {user.location.split(',')[0]}</span>}
          </div>

          {renderOffers()}
          {renderWants()}
          {renderMatchBanner()}

          <div className={`accordion-drawer ${expanded ? 'open' : ''}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div style={{ display: 'flex', justify: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Rating:</span>
                <span style={{ fontWeight: 700 }}>{user.rating?.toFixed(1) || '0.0'} ★</span>
              </div>
              <div style={{ display: 'flex', justify: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Reviews:</span>
                <span style={{ fontWeight: 700 }}>{user.reviewCount || 0} reviews</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
                "{user.bio ? (user.bio.slice(0, 100) + (user.bio.length > 100 ? '...' : '')) : 'No bio written yet. Request a swap to start collaborating!'}"
              </div>
            </div>
          </div>

          <button className="btn-accordion-toggle" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show Less ▴' : 'Show Details ▾'}
          </button>

          <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
            <button className="btn-swap" onClick={() => onSwap(user)}>Request Swap</button>
            <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} onClick={handleFollowClick}>
              {isFollowing ? 'Following ✓' : 'Follow +'}
            </button>
            <button className="btn-icon" onClick={() => navigate(`/profile/${user._id}`)} style={{ width: 34, height: 34, flexShrink: 0 }}>↗</button>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 10: AI MATCH-CENTRIC GLOW                        */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-10') {
    return (
      <div className="profile-card" style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
        <div className="card-banner-header" style={{ background: bannerBg, height: 90, display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="card-avatar" style={{ width: 44, height: 44, borderRadius: '50%', background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, border: '2.5px solid white' }}>
              {!user.avatarUrl && initials(user.name)}
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{user.name}</h3>
              {isOnline && <span style={{ fontSize: 9, color: '#4ade80', fontWeight: 700 }}>● ONLINE</span>}
            </div>
          </div>

          {/* Big match score bubble */}
          <div style={{
            width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', color: score >= 75 ? 'var(--accent)' : 'var(--sage)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
          }}>
            <span style={{ fontSize: 13, fontWeight: 900, lineHeight: 1 }}>{score}%</span>
            <span style={{ fontSize: 7, fontWeight: 800 }}>MATCH</span>
          </div>
        </div>

        <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <LeagueBadge league={user.league} />
            {user.location && <span style={{ fontSize: 11, color: 'var(--muted)' }}>📍 {user.location.split(',')[0]}</span>}
          </div>

          {renderMatchBanner()}
          {renderOffers()}
          {renderWants()}

          <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
            <button className="btn-swap" onClick={() => onSwap(user)}>Request Swap</button>
            <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} onClick={handleFollowClick}>
              {isFollowing ? 'Following ✓' : 'Follow +'}
            </button>
            <button className="btn-icon" onClick={() => navigate(`/profile/${user._id}`)} style={{ width: 34, height: 34, flexShrink: 0 }}>↗</button>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 11: HYBRID CYBERPUNK FLAT (THEME-ALIGNED)         */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-11') {
    return (
      <div className="profile-card card-cyber-flat" style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
        <div className="cyber-scanner" style={{ height: 1 }} />
        <div className="card-banner-header" style={{ background: bannerBg, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div className="card-avatar-square" style={{ width: 50, height: 50, background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, borderRadius: 6, border: '2px solid white' }}>
            {!user.avatarUrl && initials(user.name)}
          </div>
          <span style={{ fontSize: 9, color: 'white', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', fontFamily: 'monospace' }}>SYS_OK</span>
        </div>
        <div className="card-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{user.name}</h3>
            <LeagueBadge league={user.league} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>{user.bio ? (user.bio.length > 70 ? user.bio.slice(0, 70) + '...' : user.bio) : 'NO_DATA'}</p>
          
          {renderOffers(false, true)}
          {renderWants(false, true)}
          {renderMatchBanner(true)}

          <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
            <button className="btn-swap" style={{ background: 'var(--accent)', borderRadius: 2 }} onClick={() => onSwap(user)}>INIT_SWAP</button>
            <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} style={{ borderRadius: 2 }} onClick={handleFollowClick}>
              {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
            </button>
            <button className="btn-icon" style={{ borderRadius: 2, width: 34, height: 34 }} onClick={() => navigate(`/profile/${user._id}`)}>↗</button>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 12: HYBRID GLASSMORPHIC NEO-CLASSIC              */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-12') {
    return (
      <div className="profile-card card-glass-classic" style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
        <div className="card-banner-header" style={{ background: bannerBg, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div style={{ position: 'relative', width: 56, height: 56 }}>
            <div className="card-avatar-square" style={{ width: 56, height: 56, background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, borderRadius: 10, border: '2.5px solid rgba(255,255,255,0.4)' }}>
              {!user.avatarUrl && initials(user.name)}
            </div>
            {isOnline && <span className="presence-dot presence-pulse" style={{ position: 'absolute', bottom: -2, right: -2 }} />}
          </div>
          <span style={{ fontSize: 9, background: 'rgba(var(--gold-rgb), 0.15)', color: 'var(--gold)', border: '1px solid rgba(var(--gold-rgb), 0.3)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>CLASSIC</span>
        </div>

        <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{user.name}</h3>
            <LeagueBadge league={user.league} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)', marginTop: -6 }}>
            <PinIcon size={11} /> <span>{user.location}</span>
          </div>

          {renderOffers()}
          {renderWants()}
          {renderMatchBanner()}

          <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
            <button className="btn-swap" onClick={() => onSwap(user)}>Request Swap</button>
            <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} onClick={handleFollowClick}>
              {isFollowing ? 'Following ✓' : 'Follow +'}
            </button>
            <button className="btn-icon" onClick={() => navigate(`/profile/${user._id}`)} style={{ width: 34, height: 34, flexShrink: 0 }}>↗</button>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 13: MINIMALIST TECH GRID                          */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-13') {
    return (
      <div className="profile-card card-tech-grid" style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
        <div className="card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', width: 50, height: 50 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: user.avatarUrl ? `url(${user.avatarUrl}) center/cover` : color, border: '2.5px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                {!user.avatarUrl && initials(user.name)}
              </div>
              {isOnline && <span className="presence-dot" style={{ position: 'absolute', bottom: 0, right: 0 }} />}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <LeagueBadge league={user.league} />
              {user.matchScore && <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)' }}>{user.matchScore}% Match</span>}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, margin: '4px 0 2px 0' }}>{user.name}</h3>
            {user.location && <span style={{ fontSize: 10, color: 'var(--muted)' }}>📍 {user.location}</span>}
          </div>

          <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>{user.bio ? user.bio.slice(0, 80) + '...' : 'No bio provided.'}</p>
          
          {renderOffers()}
          {renderWants()}

          <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
            <button className="btn-swap" onClick={() => onSwap(user)}>Request Swap</button>
            <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} onClick={handleFollowClick}>
              {isFollowing ? 'Following ✓' : 'Follow +'}
            </button>
            <button className="btn-icon" onClick={() => navigate(`/profile/${user._id}`)} style={{ width: 34, height: 34, flexShrink: 0 }}>↗</button>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 14: RETRO CYBER-TERMINAL                          */
  /* ──────────────────────────────────────────────────────── */
  if (styleId === 'style-14') {
    return (
      <div className="profile-card card-terminal" style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
        <div style={{ background: '#1c1611', padding: '6px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)' }}>
          <span>console.log(user)</span>
          <span style={{ color: 'var(--accent)' }}>● terminal</span>
        </div>
        <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ color: 'var(--accent)', fontSize: 11 }}>$ whoami</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginLeft: 8 }}>{user.name}</div>
          </div>

          {user.location && (
            <div>
              <div style={{ color: 'var(--accent)', fontSize: 11 }}>$ location</div>
              <div style={{ fontSize: 11, color: '#f0ebe4', marginLeft: 8 }}>{user.location}</div>
            </div>
          )}

          <div>
            <div style={{ color: 'var(--accent)', fontSize: 11 }}>$ skills --offers</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginLeft: 8, marginTop: 2 }}>
              {user.skillsOffered?.slice(0, 3).map((s, i) => (
                <span key={i} style={{ color: 'var(--gold)', fontSize: 10 }}>[{s.name || s}]</span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ color: 'var(--accent)', fontSize: 11 }}>$ skills --wants</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginLeft: 8, marginTop: 2 }}>
              {user.skillsWanted?.slice(0, 3).map((s, i) => (
                <span key={i} style={{ color: 'var(--sage)', fontSize: 10 }}>[{s}]</span>
              ))}
            </div>
          </div>

          {user.aiMatchExplanation && (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 8, borderLeft: '3px solid var(--sage)', fontSize: 10, color: 'var(--sage)', fontStyle: 'italic' }}>
              &gt; {user.aiMatchExplanation}
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 10 }}>
            <button className="btn-swap" style={{ background: 'transparent', border: '1.5px solid var(--accent)', color: 'var(--accent)', borderRadius: 0 }} onClick={() => onSwap(user)}>$ swap</button>
            <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} style={{ borderRadius: 0, padding: '6px 12px' }} onClick={handleFollowClick}>
              {isFollowing ? '$ following' : '$ follow'}
            </button>
            <button className="btn-icon" style={{ borderRadius: 0, width: 34, height: 34 }} onClick={() => navigate(`/profile/${user._id}`)}>&gt;&gt;</button>
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /*  STYLE 15: AI-DRIVEN COMPACT MATCH                       */
  /* ──────────────────────────────────────────────────────── */
  return (
    <div className="profile-card card-ai-compact" style={{ '--stagger': index, animation: 'cardIn 0.5s cubic-bezier(.2,.8,.2,1) both', animationDelay: `calc(var(--stagger, 0) * 55ms)` }}>
      <div style={{ background: 'rgba(var(--sage-rgb), 0.1)', padding: '6px 12px', fontSize: 10, fontWeight: 800, color: 'var(--sage)', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(var(--sage-rgb), 0.15)' }}>
        <span>AI SMART RECOMMENDATION</span>
        <span>{score}% MATCH</span>
      </div>
      <div className="card-body" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12 }}>
            {!user.avatarUrl && initials(user.name)}
            {user.avatarUrl && <img src={user.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />}
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{user.name}</h3>
            <LeagueBadge league={user.league} />
          </div>
        </div>

        {renderMatchBanner()}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase' }}>Offers: {user.skillsOffered?.slice(0, 2).map(s => s.name || s).join(', ')}</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase' }}>Wants: {user.skillsWanted?.slice(0, 2).join(', ')}</div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
          <button className="btn-swap" style={{ padding: '8px 12px', background: 'var(--sage)' }} onClick={() => onSwap(user)}>Swap Now</button>
          <button className={`btn-follow-text ${isFollowing ? 'followed' : 'unfollowed'}`} style={{ padding: '6px 12px', fontSize: 11 }} onClick={handleFollowClick}>
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => navigate(`/profile/${user._id}`)}>↗</button>
        </div>
      </div>
    </div>
  );
});
