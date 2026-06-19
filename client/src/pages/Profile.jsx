import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AVAIL_OPTIONS, CATEGORIES_NOALL as CATEGORIES } from '../utils';
import { PinIcon, DiamondIcon, TrophyIcon, StarIcon, MedalIcon, HandshakeIcon, CameraIcon } from '../components/Icons';

function StructuredSkillInput({ skills, onChange, colorClass = '' }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const add = () => {
    if (name.trim()) {
      onChange([...skills, { name: name.trim(), category }]);
      setName('');
    }
  };

  const remove = (i) => onChange(skills.filter((_, idx) => idx !== i));

  return (
    <div className="structured-skill-input">
      <div className="chips-container" style={{ marginBottom: 12 }}>
        {skills.map((s, i) => (
          <span key={i} className={`chip ${colorClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', fontWeight: 700 }}>{s.category}</span>
            <strong>{s.name}</strong>
            <button className="chip-x" type="button" onClick={() => remove(i)}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input 
          className="form-input" 
          placeholder="Skill name (e.g. React)" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
        />
        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: 140 }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" className="btn-ghost" onClick={add} style={{ padding: '0 16px' }}>Add</button>
      </div>
    </div>
  );
}

function ChipInput({ chips, onChange, colorClass = '' }) {
  const [val, setVal] = useState('');
  const add = (e) => {
    if (e.key === 'Enter' && val.trim()) {
      e.preventDefault();
      onChange([...chips, val.trim()]);
      setVal('');
    }
  };
  const remove = (i) => onChange(chips.filter((_, idx) => idx !== i));
  return (
    <>
      <div className="chips-container">
        {chips.map((c, i) => (
          <span key={i} className={`chip ${colorClass}`}>
            {c} <button className="chip-x" type="button" onClick={() => remove(i)}>×</button>
          </span>
        ))}
      </div>
      <input className="form-input" style={{ marginTop: 8 }} placeholder="Type and press Enter" value={val}
        onChange={(e) => setVal(e.target.value)} onKeyDown={add} />
    </>
  );
}

export default function Profile() {
  const { user: me, refreshUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(null);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    setLoading(true);
    try {
      await api.post(`/users/${me._id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshUser();
      showToast('Profile picture updated! ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (me) {
      setForm({
        name: me.name || '',
        location: me.location || '',
        bio: me.bio || '',
        availability: me.availability || 'Flexible / Any Time',
        skillsOffered: me.skillsOffered || [],
        skillsWanted: me.skillsWanted || [],
        languages: me.languages || [],
        isPublic: me.isPublic ?? true,
        socialLinks: { linkedin: me.socialLinks?.linkedin || '', github: me.socialLinks?.github || '', portfolio: me.socialLinks?.portfolio || '' },
      });
    }
  }, [me]);

  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const nameValid = form?.name?.trim().length >= 2;
  const nameError = touched.name && form?.name && !nameValid;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ ...touched, name: true });
    if (!nameValid) return;
    setLoading(true);
    try {
      await api.put(`/users/${me._id}`, {
        ...form,
        skillsOffered: form.skillsOffered,
      });
      await refreshUser();
      showToast('Profile saved! ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete(`/users/${me._id}`);
      showToast('Account deleted permanently.');
      logout();
      window.location.href = '/';
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
      setLoading(false);
    }
  };

  if (!form) return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ maxWidth: 700, paddingTop: 48, paddingBottom: 80 }}>
        <div className="skeleton" style={{ width: 120, height: 120, borderRadius: 24, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: '35%', height: 28, borderRadius: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '50%', height: 16, borderRadius: 6, marginBottom: 32 }} />
        <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: 10, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: 10, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: 10, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '40%', height: 44, borderRadius: 8 }} />
      </div>
    </div>
  );

  const initials = (me?.name || '').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ maxWidth: 680, paddingTop: 48, paddingBottom: 80 }}>
        {/* Header card */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, marginBottom: 24, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div 
              style={{ width: 72, height: 72, borderRadius: 18, background: me.avatarUrl ? `url(${me.avatarUrl}) center/cover` : me.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: 'white', flexShrink: 0, position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Picture"
            >
              {!me.avatarUrl && initials}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
<CameraIcon size={24} />
              </div>
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 28, fontWeight: 600, letterSpacing: -0.5, margin: 0, color: 'var(--ink)' }}>{me.name}</h1>
                {me.league && (
                  <span style={{ 
                    background: me.league.color + '15', color: me.league.name === 'Diamond' ? '#00E5FF' : me.league.name === 'Platinum' ? '#8e9eab' : me.league.color,
                    padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 800, border: `1.5px solid ${me.league.color}`, display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 0 10px ${me.league.color}20`
                  }}>
                    {me.league.name === 'Diamond' ? <DiamondIcon size={14} /> : me.league.name === 'Gold' ? <TrophyIcon size={14} /> : '✦'} {me.league.name} Mentor
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {me.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PinIcon size={12} /> {me.location}</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><StarIcon size={12} /> {me.rating?.toFixed(1) || '—'} ({me.reviewCount || 0} reviews)</span>
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={() => navigate(`/profile/${me._id}`)}>View Public Profile ↗</button>
        </div>

        {/* Achievements Section */}
        {me.badges && me.badges.length > 0 && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, marginBottom: 24, border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><MedalIcon size={18} /> Achievements</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {me.badges.map((badge, idx) => {
                let icon = <StarIcon size={20} />;
                let desc = '';
                if (badge === 'Early Bird') { icon = <StarIcon size={20} />; desc = 'Completed first swap'; }
                if (badge === 'Super Mentor') { icon = <StarIcon size={20} />; desc = '10+ five-star reviews'; }
                if (badge === 'Team Player') { icon = <HandshakeIcon size={20} />; desc = 'Completed a team project'; }
                return (
                  <div key={idx} style={{ background: 'var(--gold-light)', border: '1px solid var(--gold)', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 24, display: 'flex', color: 'var(--gold)' }}>{icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>{badge}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Basic Info</div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className={`form-input${nameError ? ' error' : ''}${touched.name && nameValid ? ' success' : ''}`}
                style={{ background: 'var(--cream)', color: 'var(--ink)' }}
                name="name" value={form.name} onChange={h} onBlur={handleBlur} required
                aria-label="Full name"
              />
              {nameError && <p className="form-error">Name must be at least 2 characters</p>}
            </div>
            <div className="form-group"><label className="form-label">Location</label><input className="form-input" style={{ background: 'var(--cream)', color: 'var(--ink)' }} name="location" value={form.location} onChange={h} placeholder="City, Country" /></div>
            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" style={{ background: 'var(--cream)', color: 'var(--ink)', minHeight: 90 }} name="bio" value={form.bio} onChange={h} placeholder="Tell people about yourself…" /></div>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select className="form-select" style={{ background: 'var(--cream)', color: 'var(--ink)' }} name="availability" value={form.availability} onChange={h}>
                {AVAIL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="toggle-row">
              <div><div className="toggle-label" style={{ color: 'var(--ink)' }}>Public Profile</div><div className="toggle-note">Allow others to find you</div></div>
              <label className="toggle">
                <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Skills</div>
            <div className="form-group">
              <label className="form-label">Skills You Offer</label>
              <StructuredSkillInput skills={form.skillsOffered} onChange={(v) => setForm({ ...form, skillsOffered: v })} />
            </div>
            <div className="form-group">
              <label className="form-label">Skills You Want to Learn</label>
              <ChipInput chips={form.skillsWanted} onChange={(v) => setForm({ ...form, skillsWanted: v })} colorClass="chip-green" />
            </div>
            <div className="form-group">
              <label className="form-label">Languages Spoken</label>
              <ChipInput chips={form.languages} onChange={(v) => setForm({ ...form, languages: v })} />
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--border)', marginBottom: 24 }}>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Social Links</div>
            <div className="form-group"><label className="form-label">LinkedIn</label><input className="form-input" style={{ background: 'var(--cream)', color: 'var(--ink)' }} name="linkedin" value={form.socialLinks.linkedin} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })} placeholder="https://linkedin.com/in/…" /></div>
            <div className="form-group"><label className="form-label">GitHub</label><input className="form-input" style={{ background: 'var(--cream)', color: 'var(--ink)' }} name="github" value={form.socialLinks.github} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, github: e.target.value } })} placeholder="https://github.com/…" /></div>
            <div className="form-group"><label className="form-label">Portfolio</label><input className="form-input" style={{ background: 'var(--cream)', color: 'var(--ink)' }} name="portfolio" value={form.socialLinks.portfolio} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, portfolio: e.target.value } })} placeholder="https://yoursite.com" /></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <button className="btn-cosmos btn-cosmos-primary" type="submit" disabled={loading} style={{ padding: '12px 32px', fontSize: 11 }}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowDeleteModal(true)} 
              disabled={loading}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Delete Account
            </button>
          </div>
        </form>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
            <div className="modal" style={{ maxWidth: 420 }}>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
              <div className="modal-heading" style={{ fontSize: 24 }}>Delete Account?</div>
              <div className="modal-sub">
                This action <strong>cannot be undone</strong>. All your data, swaps, teams, and reviews will be permanently removed.
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-cosmos-ghost" style={{ flex: 1, padding: '13px', fontWeight: 700 }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn-cosmos-primary" style={{ flex: 1, padding: '13px', fontWeight: 700, background: 'var(--accent)' }} onClick={handleDeleteAccount} disabled={loading}>
                  {loading ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
