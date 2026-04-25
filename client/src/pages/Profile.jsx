import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AVAIL_OPTIONS = ['Weekends','Evenings','Weekday Mornings','Flexible / Any Time','Custom'];

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
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (me) {
      setForm({
        name: me.name || '',
        location: me.location || '',
        bio: me.bio || '',
        availability: me.availability || 'Flexible / Any Time',
        skillsOffered: me.skillsOffered?.map((s) => s.name) || [],
        skillsWanted: me.skillsWanted || [],
        languages: me.languages || [],
        isPublic: me.isPublic ?? true,
        socialLinks: { linkedin: me.socialLinks?.linkedin || '', github: me.socialLinks?.github || '', portfolio: me.socialLinks?.portfolio || '' },
      });
    }
  }, [me]);

  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${me._id}`, {
        ...form,
        skillsOffered: form.skillsOffered.map((n) => ({ name: n })),
      });
      await refreshUser();
      showToast('Profile saved! ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) return;
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

  if (!form) return <div className="spinner" />;

  const initials = (me?.name || '').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="page" style={{ background: 'var(--cream)' }}>
      <div className="container" style={{ maxWidth: 680, paddingTop: 48, paddingBottom: 80 }}>
        {/* Header card */}
        <div style={{ background: 'white', borderRadius: 20, padding: 32, marginBottom: 24, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: me.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: 'white', flexShrink: 0 }}>{initials}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 28, fontWeight: 600, letterSpacing: -0.5, margin: 0 }}>{me.name}</h1>
                {me.league && me.league.name !== 'Bronze' && (
                  <span style={{ 
                    background: me.league.color + '20', color: me.league.name === 'Diamond' ? '#00E5FF' : me.league.name === 'Platinum' ? '#8e9eab' : me.league.color,
                    padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800, border: `1.5px solid ${me.league.color}`
                  }}>
                    {me.league.name} Mentor
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 16 }}>
                {me.location && <span>📍 {me.location}</span>}
                <span>⭐ {me.rating?.toFixed(1) || '—'} ({me.reviewCount || 0} reviews)</span>
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={() => window.location.href = `/profile/${me._id}`}>View Public Profile ↗</button>
        </div>

        <form onSubmit={submit}>
          <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Basic Info</div>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" name="name" value={form.name} onChange={h} required /></div>
            <div className="form-group"><label className="form-label">Location</label><input className="form-input" name="location" value={form.location} onChange={h} placeholder="City, Country" /></div>
            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" name="bio" value={form.bio} onChange={h} placeholder="Tell people about yourself…" style={{ minHeight: 90 }} /></div>
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select className="form-select" name="availability" value={form.availability} onChange={h}>
                {AVAIL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="toggle-row">
              <div><div className="toggle-label">Public Profile</div><div className="toggle-note">Allow others to find you</div></div>
              <label className="toggle">
                <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Skills</div>
            <div className="form-group">
              <label className="form-label">Skills You Offer</label>
              <ChipInput chips={form.skillsOffered} onChange={(v) => setForm({ ...form, skillsOffered: v })} />
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

          <div style={{ background: 'white', borderRadius: 20, padding: 32, border: '1px solid var(--border)', marginBottom: 24 }}>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Social Links</div>
            <div className="form-group"><label className="form-label">LinkedIn</label><input className="form-input" name="linkedin" value={form.socialLinks.linkedin} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })} placeholder="https://linkedin.com/in/…" /></div>
            <div className="form-group"><label className="form-label">GitHub</label><input className="form-input" name="github" value={form.socialLinks.github} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, github: e.target.value } })} placeholder="https://github.com/…" /></div>
            <div className="form-group"><label className="form-label">Portfolio</label><input className="form-input" name="portfolio" value={form.socialLinks.portfolio} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, portfolio: e.target.value } })} placeholder="https://yoursite.com" /></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn-modal-primary" type="submit" disabled={loading} style={{ width: 'auto', padding: '0 32px' }}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              onClick={handleDeleteAccount} 
              disabled={loading}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
