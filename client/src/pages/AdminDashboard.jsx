import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { StarIcon, WarningIcon } from '../components/Icons';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [banTarget, setBanTarget] = useState(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/browse');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, teamsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/teams')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setTeams(teamsRes.data);
    } catch (err) {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (id, isBanned) => {
    if (isBanned) {
      setBanTarget(id);
      setBanReason('');
      return;
    }
    try {
      await api.put(`/admin/users/${id}/ban`, { isBanned, banReason: '' });
      showToast('User unbanned successfully');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleBanConfirm = async () => {
    const id = banTarget;
    setBanTarget(null);
    try {
      await api.put(`/admin/users/${id}/ban`, { isBanned: true, banReason });
      showToast('User banned successfully');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleDeleteTeam = async () => {
    const id = showDeleteModal;
    setShowDeleteModal(null);
    try {
      await api.delete(`/admin/teams/${id}`);
      showToast('Team deleted successfully');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleSystemReset = async () => {
    setShowResetModal(false);
    try {
      const res = await api.delete('/admin/reset');
      showToast(res.data.message);
      loadData();
      setTab('analytics');
    } catch (err) {
      showToast('Reset failed', 'error');
    }
  };

  if (loading || !stats) return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ maxWidth: 900, paddingTop: 48, paddingBottom: 80 }}>
        <div className="skeleton" style={{ width: '30%', height: 32, borderRadius: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '50%', height: 16, borderRadius: 6, marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[1,2,3].map((n) => <div key={n} className="skeleton" style={{ width: '100%', height: 80, borderRadius: 12 }} />)}
        </div>
        <div className="skeleton" style={{ width: '100%', height: 300, borderRadius: 16 }} />
      </div>
    </div>
  );

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="section-label">Administration</div>
        <div className="section-title">Admin <em>Dashboard</em></div>
        
        <div className="tab-bar" style={{ marginBottom: 32, flexWrap: 'wrap' }}>
          <button className={`tab-btn ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>
            Platform Analytics
          </button>
          <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            User Management
          </button>
          <button className={`tab-btn ${tab === 'teams' ? 'active' : ''}`} onClick={() => setTab('teams')}>
            Team Management
          </button>
          <button className={`tab-btn ${tab === 'maintenance' ? 'active' : ''}`} onClick={() => setTab('maintenance')}>
            System Maintenance
          </button>
        </div>

        {tab === 'maintenance' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}><WarningIcon size={48} style={{ color: 'var(--accent)' }} /></div>
            <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 24, marginBottom: 12, color: 'var(--ink)' }}>System Reset</h3>
            <p style={{ color: 'var(--muted)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
              This will permanently delete <strong>all user accounts</strong> (except administrators), 
              all swaps, teams, messages, and reviews. This action cannot be undone. 
              Use this only when performing a major platform migration or cleanup.
            </p>
            <button 
              className="btn-cosmos-ghost" 
              style={{ width: 'auto', padding: '12px 32px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}
              onClick={() => setShowResetModal(true)}
            >
              Dangerous: Wipe All Data
            </button>
          </div>
        )}

        {tab === 'analytics' && (
          <div>
            <div className="stats-mini" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 0, marginBottom: 40 }}>
              <div className="stat-mini-card">
                <div className="stat-mini-num">{stats.totalUsers}</div>
                <div className="stat-mini-label">Total Users</div>
              </div>
              <div className="stat-mini-card">
                <div className="stat-mini-num" style={{ color: 'var(--indigo)' }}>{stats.totalSwaps}</div>
                <div className="stat-mini-label">Total Swaps Created</div>
              </div>
              <div className="stat-mini-card">
                <div className="stat-mini-num" style={{ color: 'var(--sage)' }}>{stats.completedSwaps}</div>
                <div className="stat-mini-label">Completed Sessions</div>
              </div>
              <div className="stat-mini-card">
                <div className="stat-mini-num" style={{ color: 'var(--gold)' }}>{stats.completionRate}%</div>
                <div className="stat-mini-label">Completion Rate</div>
              </div>
              <div className="stat-mini-card">
                <div className="stat-mini-num" style={{ color: '#7A5FA8' }}>{stats.bannedUsers}</div>
                <div className="stat-mini-label">Suspended Accounts</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 20, marginBottom: 16, color: 'var(--ink)' }}>Most Popular Skills</h3>
                {stats.popularSkills.length > 0 ? (() => {
                  const maxCount = Math.max(...stats.popularSkills.map(s => s.count));
                  return stats.popularSkills.map((skill, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{skill.name}</span>
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>{skill.count}</span>
                      </div>
                      <div style={{ background: 'var(--cream)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ background: 'var(--accent)', height: '100%', width: `${(skill.count / maxCount) * 100}%`, borderRadius: 4, transition: 'width 1s ease-out' }} />
                      </div>
                    </div>
                  ));
                })() : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No data yet</div>}
              </div>

              <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 20, marginBottom: 16, color: 'var(--ink)' }}>Top Mentors</h3>
                {stats.topMentors && stats.topMentors.map((u, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i === stats.topMentors.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', color: 'var(--ink)' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>#{i + 1}</span>
                        {u.name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}><StarIcon size={12} style={{ color: 'var(--gold)' }} />{u.rating ? u.rating.toFixed(1) : '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.reviews} swaps</div>
                    </div>
                  </div>
                ))}
                {(!stats.topMentors || stats.topMentors.length === 0) && <div style={{ color: 'var(--muted)', fontSize: 13 }}>No data yet</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginTop: 24 }}>
              <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 20, marginBottom: 16, color: 'var(--ink)' }}>League Distribution</h3>
                {stats.leagueDist ? (() => {
                  const maxCount = Math.max(...Object.values(stats.leagueDist), 1);
                  const colors = { Diamond: '#00E5FF', Platinum: '#B4C6DF', Gold: '#FFD700', Silver: '#C0C0C0', Bronze: '#CD7F32' };
                  return ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'].map((league, i) => {
                    const count = stats.leagueDist[league] || 0;
                    return (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 13, color: colors[league] }}>{league}</span>
                          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{count} users</span>
                        </div>
                        <div style={{ background: 'var(--cream)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ background: colors[league], height: '100%', width: `${(count / maxCount) * 100}%`, borderRadius: 4, transition: 'width 1s ease-out' }} />
                        </div>
                      </div>
                    );
                  });
                })() : <div style={{ color: 'var(--muted)', fontSize: 13 }}>No data yet</div>}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead style={{ background: 'var(--cream)' }}>
                <tr>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--border)' }}>User</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--border)' }}>Joined</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--border)' }}>Rating</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', opacity: u.isBanned ? 0.6 : 1 }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink)' }}>
                        {u.name} 
                        {u.role === 'admin' && <span className="card-badge badge-mutual" style={{ padding: '2px 6px', fontSize: 9 }}>Admin</span>}
                        {u.isBanned && <span className="card-badge" style={{ background: '#FDE8E4', color: 'var(--accent)', padding: '2px 6px', fontSize: 9 }}>Banned</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--ink)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><StarIcon size={12} style={{ color: 'var(--gold)' }} />{u.rating ? u.rating.toFixed(1) : '—'}</span> <span style={{ color: 'var(--muted)', fontSize: 11 }}>({u.reviewCount})</span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        u.isBanned ? (
                          <button className="btn-cosmos-primary" onClick={() => toggleBan(u._id, false)} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700 }}>Unban</button>
                        ) : (
                          <button className="btn-cosmos-ghost" onClick={() => toggleBan(u._id, true)} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700 }}>Ban User</button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'teams' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead style={{ background: 'var(--cream)' }}>
                <tr>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--border)' }}>Team Name</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--border)' }}>Creator</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--border)' }}>Members / Size</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--border)' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(t => {
                  const acceptedCount = t.members.filter(m => m.status === 'accepted').length;
                  return (
                    <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.purpose || t.description || 'No description'}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{t.creator?.name || 'Unknown'}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{t.creator?.email || ''}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--muted)' }}>
                        {acceptedCount} / {t.maxSize}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`team-badge ${t.status === 'open' ? 'team-open' : 'team-closed'}`}>
                          {t.status === 'open' ? '● Open' : '✓ Full'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button className="btn-cosmos-ghost" onClick={() => setShowDeleteModal(t._id)} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700 }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
                {teams.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No teams found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmModal
        open={showDeleteModal !== null}
        title="Delete Team?"
        message="Are you sure you want to delete this team?"
        confirmLabel="Delete Team"
        onConfirm={handleDeleteTeam}
        onCancel={() => setShowDeleteModal(null)}
      />
      <ConfirmModal
        open={showResetModal}
        title="System Reset"
        message="This will permanently delete all user accounts (except administrators), all swaps, teams, messages, and reviews. This action cannot be undone."
        confirmLabel="Wipe All Data"
        onConfirm={handleSystemReset}
        onCancel={() => setShowResetModal(false)}
      />
      {banTarget !== null && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setBanTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <button className="modal-close" onClick={() => setBanTarget(null)} aria-label="Close">✕</button>
            <div className="modal-heading" style={{ fontSize: 22 }}>Ban User</div>
            <div className="modal-sub">Provide a reason for the ban. This will be shown to the user.</div>
            <div className="form-group">
              <label className="form-label">Ban Reason</label>
              <textarea
                className="form-textarea"
                placeholder="Enter reason for banning this user…"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-cosmos-ghost" style={{ flex: 1, padding: '13px', fontWeight: 700 }} onClick={() => setBanTarget(null)}>Cancel</button>
              <button className="btn-cosmos-primary" style={{ flex: 1, padding: '13px', fontWeight: 700 }} onClick={handleBanConfirm} disabled={!banReason.trim()}>
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
