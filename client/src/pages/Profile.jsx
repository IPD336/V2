import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AVAIL_OPTIONS, BANNER_COLORS, BANNER_GRADIENTS, initials } from '../utils';
import { BADGE_DETAILS, BadgeIcon } from '../utils/badges.jsx';
import { PinIcon, MedalIcon, CameraIcon, SparklesIcon, PaletteIcon, TrashIcon, ProfileIcon, LinkIcon } from '../components/Icons';
import FollowsListModal from '../components/FollowsListModal';
import StructuredSkillInput from '../components/StructuredSkillInput';
import ChipInput from '../components/ChipInput';
import SaveBar from '../components/SaveBar';

const AVATAR_STYLES = [
  { id: 'adventurer', label: 'Adventurer', desc: 'Illustrated characters' },
  { id: 'bottts', label: 'Bottts', desc: 'Robot avatars' },
  { id: 'fun-emoji', label: 'Fun Emoji', desc: 'Playful emoji faces' },
  { id: 'lorelei', label: 'Lorelei', desc: 'Abstract patterns' },
  { id: 'micah', label: 'Micah', desc: 'Soft portraits' },
];

function generateDicebearUrl(style, seed) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&size=200`;
}

export default function Profile() {
  const { user: me, refreshUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const initialFormRef = useRef(null);
  const [form, setForm] = useState(null);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [inferredSkills, setInferredSkills] = useState([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [gamification, setGamification] = useState(null);
  const [collapsed, setCollapsed] = useState({ basicInfo: true, skills: true, socialLinks: true });
  const toggleSection = (s) => setCollapsed(p => ({ ...p, [s]: !p[s] }));
  const [showAvatarLibrary, setShowAvatarLibrary] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState('adventurer');
  const [avatarSeeds] = useState(() => Array.from({ length: 16 }, () => Math.random().toString(36).slice(2, 10)));
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [showBannerLibrary, setShowBannerLibrary] = useState(false);
  const [bannerTab, setBannerTab] = useState('colors');
  const [savingBanner, setSavingBanner] = useState(false);
  const [modalType, setModalType] = useState(null); // 'followers' | 'following' | null
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'skills' | 'social' | 'security' | 'delete'
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handleGithubScan = async () => {
    if (!form.socialLinks.github) {
      showToast('Please enter your GitHub profile URL first', 'error');
      return;
    }
    setScanLoading(true);
    try {
      const res = await api.post('/ai/github-verify', { githubUrl: form.socialLinks.github });
      setInferredSkills(res.data.skills);
      setSelectedSkills(res.data.skills.map((_, i) => i)); // select all by default
      setShowScanModal(true);
      showToast('GitHub repositories scanned! ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to scan GitHub profile', 'error');
    } finally { setScanLoading(false); }
  };

  const handleAddSkills = () => {
    const toAdd = inferredSkills.filter((_, idx) => selectedSkills.includes(idx));
    const currentOffered = form.skillsOffered || [];
    const merged = [...currentOffered];
    
    toAdd.forEach(newSkill => {
      const exists = merged.some(s => s.name.toLowerCase() === newSkill.name.toLowerCase());
      if (!exists) {
        merged.push({ name: newSkill.name, category: newSkill.category, verified: true });
      }
    });

    setForm({ ...form, skillsOffered: merged });
    setShowScanModal(false);
    showToast(`Added ${toAdd.length} verified skills to your profile! ✓`);
  };

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

  const handleSelectDicebear = async (url) => {
    setSavingAvatar(true);
    try {
      await api.put(`/users/${me._id}/avatar-dicebear`, { avatarUrl: url });
      await refreshUser();
      setShowAvatarLibrary(false);
      showToast('Avatar updated! ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update avatar', 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setSavingAvatar(true);
    try {
      await api.delete(`/users/${me._id}/avatar`);
      await refreshUser();
      setShowAvatarLibrary(false);
      showToast('Avatar removed ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove avatar', 'error');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSelectBannerColor = async (color) => {
    setSavingBanner(true);
    try {
      await api.put(`/users/${me._id}/banner`, { bannerColor: color });
      await refreshUser();
      setShowBannerLibrary(false);
      showToast('Banner color set! ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to set banner color', 'error');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleSelectBannerGradient = async (gradient) => {
    setSavingBanner(true);
    try {
      await api.put(`/users/${me._id}/banner`, { bannerUrl: gradient });
      await refreshUser();
      setShowBannerLibrary(false);
      showToast('Banner selected! ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to set banner', 'error');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleRemoveBanner = async () => {
    setSavingBanner(true);
    try {
      await api.delete(`/users/${me._id}/banner`);
      await refreshUser();
      setShowBannerLibrary(false);
      showToast('Banner removed ✓');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove banner', 'error');
    } finally {
      setSavingBanner(false);
    }
  };

  useEffect(() => {
    if (me) {
      const init = {
        name: me.name || '',
        location: me.location || '',
        bio: me.bio || '',
        availability: me.availability || 'Flexible / Any Time',
        skillsOffered: me.skillsOffered || [],
        skillsWanted: me.skillsWanted || [],
        languages: me.languages || [],
        isPublic: me.isPublic ?? true,
        socialLinks: { linkedin: me.socialLinks?.linkedin || '', github: me.socialLinks?.github || '', portfolio: me.socialLinks?.portfolio || '' },
      };
      setForm(init);
      initialFormRef.current = init;
    }
  }, [me]);

  useEffect(() => {
    api.get('/gamification').then(res => setGamification(res.data)).catch(() => {});
  }, []);

  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const nameValid = form?.name?.trim().length >= 2;
  const nameError = touched.name && form?.name && !nameValid;
  const hasChanges = initialFormRef.current && form && JSON.stringify(form) !== JSON.stringify(initialFormRef.current);

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setPassLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      showToast('Password updated successfully! ✓');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Password update failed', 'error');
    } finally {
      setPassLoading(false);
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

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ maxWidth: 1000, paddingTop: 48, paddingBottom: 80 }}>
        {/* Account Settings Header */}
        <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 32, fontWeight: 700, marginBottom: 28, color: 'var(--ink)' }}>Account settings</h1>

        <div className="settings-layout">
          {/* Left Column Sidebar */}
          <div className="settings-sidebar">
            <button type="button" className={`settings-sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <ProfileIcon size={16} /> Profile
            </button>
            <button type="button" className={`settings-sidebar-btn ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
              <MedalIcon size={16} /> Skills & Languages
            </button>
            <button type="button" className={`settings-sidebar-btn ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>
              <LinkIcon size={16} /> Social profile
            </button>
            <button type="button" className={`settings-sidebar-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <SparklesIcon size={16} /> Achievements & Security
            </button>
            <button type="button" className={`settings-sidebar-btn ${activeTab === 'delete' ? 'active' : ''}`} style={{ borderColor: activeTab === 'delete' ? '#ef4444' : '', color: activeTab === 'delete' ? '#ef4444' : '' }} onClick={() => setActiveTab('delete')}>
              <TrashIcon size={16} /> Delete account
            </button>
          </div>

          {/* Right Column Content */}
          <div className="settings-content" style={{ flex: 1 }}>
            
            {activeTab === 'profile' && (
              <form onSubmit={submit}>
                {/* Header card with Avatar and Banner */}
                <div style={{ background: 'var(--card-bg)', borderRadius: 16, marginBottom: 24, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  {(() => {
                    const bannerBg = me.bannerUrl || (me.bannerColor ? `linear-gradient(135deg, ${me.bannerColor}, ${me.bannerColor}aa)` : null);
                    const hasBanner = !!bannerBg;
                    return (
                      <div
                        style={{ height: 80, background: bannerBg || 'var(--cream)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', cursor: 'pointer', borderBottom: hasBanner ? 'none' : '1px dashed var(--border)' }}
                        onClick={() => setShowBannerLibrary(true)}
                        title={hasBanner ? 'Change Banner' : 'Add Banner'}
                      >
                        <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.45)', borderRadius: 8, padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', gap: 4, fontSize: 11, fontWeight: 600 }}>
                          <PaletteIcon size={12} /> {hasBanner ? 'Change' : 'Add Banner'}
                        </div>
                      </div>
                    );
                  })()}
                  <div style={{ padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                      <div 
                        style={{ width: 72, height: 72, borderRadius: 18, background: me.avatarUrl ? `url(${me.avatarUrl}) center/cover` : me.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, color: 'white', flexShrink: 0, position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                        onClick={() => setShowAvatarLibrary(true)}
                        title="Change Profile Picture"
                      >
                        {!me.avatarUrl && initials}
                        <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.55)', borderRadius: '8px 0 12px 0', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <CameraIcon size={14} />
                        </div>
                      </div>
                      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                          <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 24, fontWeight: 600, letterSpacing: -0.5, margin: 0, color: 'var(--ink)' }}>{me.name}</h1>
                          {me.league && (
                            <span style={{ 
                              background: me.league.color + '15', color: me.league.name === 'Diamond' ? '#00E5FF' : me.league.name === 'Platinum' ? '#8e9eab' : me.league.color,
                              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, border: `1.5px solid ${me.league.color}`, display: 'flex', alignItems: 'center', gap: 6
                            }}>
                              {me.league.name} Mentor
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <span type="button" onClick={() => setModalType('followers')} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', textDecoration: 'underline' }}><strong>{me.followersCount || 0}</strong> Followers</span>
                          <span type="button" onClick={() => setModalType('following')} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', textDecoration: 'underline' }}><strong>{me.followingCount || 0}</strong> Following</span>
                          {me.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PinIcon size={12} /> {me.location}</span>}
                        </div>
                      </div>
                    </div>
                    <button type="button" className="btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate(`/profile/${me._id}`)}>View Public Profile ↗</button>
                  </div>
                </div>

                <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 32 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--ink)' }}>Profile</h2>
                  
                  <div className="modern-input-group">
                    <label className="modern-input-label">Display name</label>
                    <input
                      className={`modern-input-field${nameError ? ' error' : ''}`}
                      name="name" value={form.name} onChange={h} onBlur={handleBlur} required
                      aria-label="Display name"
                    />
                    {nameError && <p className="form-error">Name must be at least 2 characters</p>}
                  </div>

                  <div className="modern-input-group">
                    <label className="modern-input-label">Slogan / Bio</label>
                    <textarea
                      className="modern-input-field"
                      style={{ minHeight: 90 }}
                      name="bio" value={form.bio} onChange={h}
                      placeholder="Tell people about yourself…"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div className="modern-input-group">
                        <label className="modern-input-label">Email (Read-only)</label>
                        <input className="modern-input-field" style={{ opacity: 0.6 }} value={me.email} disabled />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div className="modern-input-group">
                        <label className="modern-input-label">Location</label>
                        <input className="modern-input-field" name="location" value={form.location} onChange={h} placeholder="City, Country" />
                      </div>
                    </div>
                  </div>

                  <div className="modern-input-group">
                    <label className="modern-input-label">Availability</label>
                    <select className="modern-input-field" name="availability" value={form.availability} onChange={h}>
                      {AVAIL_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>

                  <div className="toggle-row" style={{ marginTop: 24, border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', background: 'rgba(0,0,0,0.01)' }}>
                    <div>
                      <div className="toggle-label" style={{ color: 'var(--ink)' }}>Public Profile</div>
                      <div className="toggle-note">Allow others to find you</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <SaveBar loading={loading} hasChanges={hasChanges} />
                </div>
              </form>
            )}

            {activeTab === 'skills' && (
              <form onSubmit={submit}>
                <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 32 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--ink)' }}>Skills & Languages</h2>
                  
                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>Skills You Offer</label>
                    <StructuredSkillInput skills={form.skillsOffered} onChange={(v) => setForm({ ...form, skillsOffered: v })} />
                  </div>

                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>Skills You Want to Learn</label>
                    <ChipInput chips={form.skillsWanted} onChange={(v) => setForm({ ...form, skillsWanted: v })} colorClass="chip-green" />
                  </div>

                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>Languages Spoken</label>
                    <ChipInput chips={form.languages} onChange={(v) => setForm({ ...form, languages: v })} />
                  </div>

                  <SaveBar loading={loading} hasChanges={hasChanges} />
                </div>
              </form>
            )}

            {activeTab === 'social' && (
              <form onSubmit={submit}>
                <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 32 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--ink)' }}>Social Profile Links</h2>
                  
                  <div className="modern-input-group">
                    <label className="modern-input-label">LinkedIn</label>
                    <input className="modern-input-field" name="linkedin" value={form.socialLinks.linkedin} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })} placeholder="https://linkedin.com/in/…" />
                  </div>

                  <div className="modern-input-group">
                    <label className="modern-input-label">GitHub</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input 
                        className="modern-input-field" 
                        style={{ flex: 1 }} 
                        name="github" 
                        value={form.socialLinks.github} 
                        onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, github: e.target.value } })} 
                        placeholder="https://github.com/…" 
                      />
                      <button 
                        type="button" 
                        className="btn-outline-sm" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 16px', height: '48px', border: '1.5px solid var(--border)', borderRadius: 14 }}
                        onClick={handleGithubScan}
                        disabled={scanLoading}
                      >
                        <SparklesIcon size={14} /> {scanLoading ? 'Scanning…' : 'Scan Skills'}
                      </button>
                    </div>
                  </div>

                  <div className="modern-input-group">
                    <label className="modern-input-label">Portfolio</label>
                    <input className="modern-input-field" name="portfolio" value={form.socialLinks.portfolio} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, portfolio: e.target.value } })} placeholder="https://yoursite.com" />
                  </div>

                  <SaveBar loading={loading} hasChanges={hasChanges} />
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* XP/Level/Streak Progress */}
                {gamification && (
                  <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--ink)' }}>Gamification Stats</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SparklesIcon size={16} />
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Level {gamification.level}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{gamification.xpCurrent}/{gamification.xpNeeded} XP</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                      <div style={{
                        height: '100%', width: `${Math.min(100, (gamification.xpCurrent / gamification.xpNeeded) * 100)}%`,
                        background: 'linear-gradient(90deg, var(--accent), #8B5CF6)', borderRadius: 4, transition: 'width .5s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--muted)' }}>
                      <span>🔥 {gamification.streak?.current || 0} day streak</span>
                      <span>🏆 {gamification.xp.toLocaleString()} total XP</span>
                    </div>
                  </div>
                )}

                {/* Achievements Section */}
                {(() => {
                  const allBadges = gamification?.badges || BADGE_DETAILS.map(d => {
                    const earned = me.badges?.find(b => (typeof b === 'string' ? b : b.id) === d.id);
                    return { ...d, earned: !!earned, earnedAt: earned?.earnedAt || null };
                  });
                  const earnedCount = allBadges.filter(b => b.earned).length;
                  if (earnedCount === 0) return null;
                  const totalBadgeXp = allBadges.filter(b => b.earned).reduce((s, b) => s + (b.xpReward || 0), 0);

                  return (
                    <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h2 style={{ fontSize: 18, margin: 0, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink)' }}><MedalIcon size={18} /> Achievements</h2>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{earnedCount}<span style={{ color: 'var(--muted)', fontWeight: 400 }}>/{allBadges.length}</span></span>
                          {totalBadgeXp > 0 && <span style={{ fontSize: 11, color: 'var(--muted)' }}>+{totalBadgeXp} XP</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {allBadges.filter(b => b.earned).map((badge, idx) => (
                          <div key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                            background: 'var(--accent-light)', borderRadius: 12, border: '1px solid rgba(var(--accent-rgb),0.2)',
                          }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                              <BadgeIcon name={badge.icon} size={20} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{badge.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                                {badge.description}{badge.earnedAt ? ` · ${new Date(badge.earnedAt).toLocaleDateString()}` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Password Change Form */}
                <form onSubmit={handlePasswordChange}>
                  <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 32 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: 'var(--ink)' }}>Security / Change Password</h2>
                    
                    <div className="modern-input-group">
                      <label className="modern-input-label">Current Password</label>
                      <input
                        type="password"
                        className="modern-input-field"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="modern-input-group">
                      <label className="modern-input-label">New Password</label>
                      <input
                        type="password"
                        className="modern-input-field"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="modern-input-group">
                      <label className="modern-input-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="modern-input-field"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button className="btn-cosmos btn-cosmos-primary" type="submit" disabled={passLoading} style={{ padding: '12px 28px', fontSize: 12, marginTop: 12 }}>
                      {passLoading ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'delete' && (
              <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 32 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#ef4444' }}>Danger Zone / Delete Account</h2>
                
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
                  This action is permanent and <strong>cannot be undone</strong>. All your data, swaps, teams, reviews, and accumulated XP/levels will be permanently deleted from our database.
                </p>

                <button 
                  type="button" 
                  className="btn-cosmos btn-cosmos-primary" 
                  style={{ background: '#ef4444', borderColor: '#ef4444', padding: '12px 28px', fontSize: 12 }} 
                  onClick={() => setShowDeleteModal(true)} 
                  disabled={loading}
                >
                  Delete Account permanently
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <button className="modal-close" onClick={() => setShowDeleteModal(false)} aria-label="Close">✕</button>
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

      {/* GitHub Inferred Skills Modal */}
      {showScanModal && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setShowScanModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <button className="modal-close" onClick={() => setShowScanModal(false)} aria-label="Close">✕</button>
            <div className="modal-heading" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 24 }}>
              <SparklesIcon size={20} /> AI Inferred Skills
            </div>
            <div className="modal-sub">
              Based on your GitHub repositories, the AI detected these skills. Select the ones you want to list as verified on your profile:
            </div>
            
            <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 24, border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {inferredSkills.map((s, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '6px 8px', borderRadius: 8, background: selectedSkills.includes(idx) ? 'var(--accent-light)' : 'transparent', transition: 'background 0.2s' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedSkills.includes(idx)} 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSkills([...selectedSkills, idx]);
                      } else {
                        setSelectedSkills(selectedSkills.filter(i => i !== idx));
                      }
                    }} 
                  />
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ color: 'var(--ink)' }}>{s.name}</strong>
                    <span style={{ fontSize: 10, padding: '2px 6px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, textTransform: 'uppercase', color: 'var(--muted)' }}>
                      {s.category}
                    </span>
                  </div>
                </label>
              ))}
              {inferredSkills.length === 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>No skills could be inferred. Try updating your profile or repos.</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-cosmos-ghost" style={{ flex: 1, padding: '13px', fontWeight: 700 }} onClick={() => setShowScanModal(false)}>Cancel</button>
              <button className="btn-cosmos-primary" style={{ flex: 1, padding: '13px', fontWeight: 700 }} onClick={handleAddSkills}>
                Add Selected ({selectedSkills.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Library Modal */}
      {showAvatarLibrary && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setShowAvatarLibrary(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <button className="modal-close" onClick={() => setShowAvatarLibrary(false)} aria-label="Close">✕</button>
            <div className="modal-heading" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 24 }}>
              <PaletteIcon size={20} /> Choose Avatar
            </div>
            <div className="modal-sub">
              Pick a prebuilt avatar or upload your own image.
            </div>

            {/* Style tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {AVATAR_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`chip ${avatarStyle === s.id ? 'chip-active' : ''}`}
                  style={{
                    cursor: 'pointer',
                    background: avatarStyle === s.id ? 'var(--accent)' : 'var(--cream)',
                    color: avatarStyle === s.id ? 'white' : 'var(--ink)',
                    border: `1.5px solid ${avatarStyle === s.id ? 'var(--accent)' : 'var(--border)'}`,
                    fontWeight: avatarStyle === s.id ? 700 : 500,
                    fontSize: 12,
                    padding: '6px 14px',
                    borderRadius: 20,
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setAvatarStyle(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Avatar grid */}
            <div className="avatar-style-grid">
              {avatarSeeds.map((seed, idx) => {
                const url = generateDicebearUrl(avatarStyle, seed);
                const isSelected = me.avatarUrl === url;
                return (
                  <button
                    key={idx}
                    type="button"
                    className="avatar-style-card"
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 14,
                      border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                      background: 'var(--cream)',
                      cursor: savingAvatar ? 'wait' : 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isSelected ? '0 0 0 3px var(--accent-light)' : 'none',
                      opacity: savingAvatar ? 0.6 : 1,
                      padding: 0,
                    }}
                    onClick={() => !savingAvatar && handleSelectDicebear(url)}
                    title={isSelected ? 'Currently selected' : 'Use this avatar'}
                  >
                    <img
                      src={url}
                      alt={`${avatarStyle} avatar ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-outline-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 40, border: '1.5px solid var(--border)', fontSize: 12, fontWeight: 600, borderRadius: 10 }}
                onClick={() => { setShowAvatarLibrary(false); fileInputRef.current?.click(); }}
              >
                <CameraIcon size={14} /> Upload from device
              </button>
              {me.avatarUrl && (
                <button
                  type="button"
                  className="btn-outline-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 40, border: '1.5px solid #ef4444', fontSize: 12, fontWeight: 600, borderRadius: 10, color: '#ef4444' }}
                  onClick={handleRemoveAvatar}
                  disabled={savingAvatar}
                >
                  <TrashIcon size={14} /> Remove avatar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Banner Library Modal */}
      {showBannerLibrary && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setShowBannerLibrary(false)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <button className="modal-close" onClick={() => setShowBannerLibrary(false)} aria-label="Close">✕</button>
            <div className="modal-heading" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 24 }}>
              <PaletteIcon size={20} /> Choose Banner
            </div>
            <div className="modal-sub">
              Pick a solid color or a gradient design for your profile banner.
            </div>

            {/* Tab buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                type="button"
                className={`chip ${bannerTab === 'colors' ? 'chip-active' : ''}`}
                style={{
                  cursor: 'pointer',
                  background: bannerTab === 'colors' ? 'var(--accent)' : 'var(--cream)',
                  color: bannerTab === 'colors' ? 'white' : 'var(--ink)',
                  border: `1.5px solid ${bannerTab === 'colors' ? 'var(--accent)' : 'var(--border)'}`,
                  fontWeight: bannerTab === 'colors' ? 700 : 500,
                  fontSize: 12,
                  padding: '6px 14px',
                  borderRadius: 20,
                  transition: 'all 0.2s',
                }}
                onClick={() => setBannerTab('colors')}
              >
                Colors
              </button>
              <button
                type="button"
                className={`chip ${bannerTab === 'designs' ? 'chip-active' : ''}`}
                style={{
                  cursor: 'pointer',
                  background: bannerTab === 'designs' ? 'var(--accent)' : 'var(--cream)',
                  color: bannerTab === 'designs' ? 'white' : 'var(--ink)',
                  border: `1.5px solid ${bannerTab === 'designs' ? 'var(--accent)' : 'var(--border)'}`,
                  fontWeight: bannerTab === 'designs' ? 700 : 500,
                  fontSize: 12,
                  padding: '6px 14px',
                  borderRadius: 20,
                  transition: 'all 0.2s',
                }}
                onClick={() => setBannerTab('designs')}
              >
                Designs
              </button>
            </div>

            {/* Color swatches */}
            {bannerTab === 'colors' && (
              <div className="banner-color-grid">
                {BANNER_COLORS.map((color, idx) => {
                  const isSelected = me.bannerColor === color && !me.bannerUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="banner-color-swatch"
                      style={{
                        background: color,
                        border: `3px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                        outline: isSelected ? '2px solid var(--accent)' : 'none',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      }}
                      onClick={() => !savingBanner && handleSelectBannerColor(color)}
                      disabled={savingBanner}
                      title={isSelected ? 'Currently selected' : color}
                    />
                  );
                })}
              </div>
            )}

            {/* Gradient designs */}
            {bannerTab === 'designs' && (
              <div className="banner-gradient-grid">
                {BANNER_GRADIENTS.map((g, idx) => {
                  const isSelected = me.bannerUrl === g.value;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="banner-gradient-card"
                      style={{
                        background: g.value,
                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        outline: isSelected ? '2px solid var(--accent)' : 'none',
                        cursor: savingBanner ? 'wait' : 'pointer',
                        opacity: savingBanner ? 0.6 : 1,
                      }}
                      onClick={() => !savingBanner && handleSelectBannerGradient(g.value)}
                      disabled={savingBanner}
                      title={isSelected ? 'Currently selected' : g.label}
                    >
                      <span className="banner-gradient-label">{g.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Remove banner */}
            {(me.bannerUrl || me.bannerColor) && (
              <div style={{ marginTop: 20 }}>  
                <button
                  type="button"
                  className="btn-outline-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 40, border: '1.5px solid #ef4444', fontSize: 12, fontWeight: 600, borderRadius: 10, color: '#ef4444' }}
                  onClick={handleRemoveBanner}
                  disabled={savingBanner}
                >
                  <TrashIcon size={14} /> Remove banner
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {modalType && (
        <FollowsListModal userId={me._id} type={modalType} onClose={() => setModalType(null)} />
      )}
    </div>
  );
}
