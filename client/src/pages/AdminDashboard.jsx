import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const reason = isBanned ? window.prompt('Enter ban reason:') : '';
    if (isBanned && reason === null) return; // user cancelled

    try {
      await api.put(`/admin/users/${id}/ban`, { isBanned, banReason: reason });
      showToast(`User ${isBanned ? 'banned' : 'unbanned'} successfully`);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const deleteTeam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await api.delete(`/admin/teams/${id}`);
      showToast('Team deleted successfully');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  if (loading || !stats) return <div className="spinner" />;

  return (
    <div className="page" style={{ background: 'var(--cream)' }}>
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
        </div>

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
                      <div style={{ fontWeight: 700, color: 'var(--gold)' }}>⭐ {u.rating ? u.rating.toFixed(1) : '—'}</div>
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
                      ⭐ {u.rating ? u.rating.toFixed(1) : '—'} <span style={{ color: 'var(--muted)', fontSize: 11 }}>({u.reviewCount})</span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        u.isBanned ? (
                          <button className="btn-accept" onClick={() => toggleBan(u._id, false)}>Unban</button>
                        ) : (
                          <button className="btn-decline" onClick={() => toggleBan(u._id, true)}>Ban User</button>
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
                        <button className="btn-decline" onClick={() => deleteTeam(t._id)}>Delete</button>
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
    </div>
  );
}
