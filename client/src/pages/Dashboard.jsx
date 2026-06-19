import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { SkeletonCard } from '../components/Skeleton';
import { SearchIcon, SwapIcon, TeamsIcon, WorkspaceIcon, CheckIcon, MailIcon, SendIcon, RocketIcon } from '../components/Icons';

function timeAgo(date) {
  const diff = Date.now() - new Date(date);
  const h = Math.floor(diff / 36e5);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getGreeting(name) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return `${g}, ${name.split(' ')[0]}`;
}

const quickActions = [
  { to: '/browse', label: 'Browse Skills', icon: SearchIcon, desc: 'Find people to swap skills with' },
  { to: '/swaps', label: 'My Swaps', icon: SwapIcon, desc: 'Incoming, outgoing & active swaps' },
  { to: '/teams', label: 'Teams', icon: TeamsIcon, desc: 'Collaborate in skill-based teams' },
  { to: '/workspaces', label: 'Workspaces', icon: WorkspaceIcon, desc: 'Shared spaces for active swaps' },
];

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [swapData, setSwapData] = useState({ incoming: [], outgoing: [], active: [], completed: [] });
  const [teamCount, setTeamCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboard = () => {
    Promise.all([
      api.get('/swaps'),
      api.get('/teams'),
      refreshUser(),
    ])
      .then(([swaps, teams]) => {
        setSwapData(swaps.data);
        setTeamCount(teams.data.length || 0);
      })
      .catch(() => showToast('Failed to load dashboard', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, []);

  useEffect(() => {
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onFocus = () => loadDashboard();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const activities = useMemo(() => {
    const items = [];
    swapData.completed.forEach((s) => {
      if (s.completedAt) items.push({ date: s.completedAt, text: `Swap completed`, detail: `${s.skillOffered} ↔ ${s.skillWanted}`, icon: 'check' });
    });
    swapData.active.forEach((s) => {
      items.push({ date: s.createdAt, text: `Swap started`, detail: `${s.skillOffered} ↔ ${s.skillWanted}`, icon: 'swap' });
    });
    swapData.incoming.forEach((s) => {
      items.push({ date: s.createdAt, text: `Incoming request`, detail: `${s.skillWanted} from ${s.sender?.name || 'someone'}`, icon: 'mail' });
    });
    swapData.outgoing.forEach((s) => {
      items.push({ date: s.createdAt, text: `Outgoing request`, detail: `${s.skillOffered} to ${s.receiver?.name || 'someone'}`, icon: 'send' });
    });
    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  }, [swapData]);

  const stats = useMemo(() => [
    { label: 'Total Swaps', value: swapData.completed.length + swapData.active.length + swapData.incoming.length + swapData.outgoing.length },
    { label: 'Active', value: swapData.active.length },
    { label: 'Teams', value: teamCount },
    { label: 'Rating', value: user?.rating?.toFixed(1) || '—' },
  ], [swapData, user, teamCount]);

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Welcome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
            background: user?.avatarUrl ? `url(${user.avatarUrl}) center/cover` : (user?.avatarColor || '#C84B31'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16,
          }}>
            {!user?.avatarUrl && user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div className="section-label" style={{ marginBottom: 2 }}>Dashboard</div>
            <div className="section-title" style={{ fontSize: 22, margin: 0 }}>{getGreeting(user?.name || 'there')} ✦</div>
          </div>
        </div>

        {loading ? (
          <div className="cards-grid" style={{ marginTop: 32 }}>
            {[1,2,3,4].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-mini" style={{ marginTop: 32, marginBottom: 48 }}>
              {stats.map((s) => (
                <div key={s.label} className="stat-mini-card" style={{ textAlign: 'center' }}>
                  <div className="stat-mini-num">{s.value}</div>
                  <div className="stat-mini-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 48 }}>
              <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Quick Actions</h3>
              <div className="cards-grid">
                {quickActions.map((a) => (
                  <button
                    key={a.to}
                    onClick={() => navigate(a.to)}
                    style={{
                      background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 24,
                      cursor: 'pointer', textAlign: 'left', transition: 'all .3s', display: 'flex', flexDirection: 'column', gap: 8,
                    }}
                    className="mockup-card"
                  >
                    <span style={{ color: 'var(--ink)', display: 'flex' }}><a.icon size={28} /></span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{a.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Recent Activity</h3>
              {activities.length === 0 ? (
                <div className="empty-state" style={{ marginTop: 8 }}>
                  <div className="empty-state-icon"><RocketIcon size={32} /></div>
                  <h3>No activity yet</h3>
                  <p>Start by browsing skills and sending your first swap request.</p>
                  <button className="btn-cosmos btn-cosmos-primary" onClick={() => navigate('/browse')} style={{ padding: '10px 20px', fontSize: 11 }}>
                    Browse Skills
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activities.map((a, i) => (
                    <button key={i} onClick={() => navigate('/swaps')} style={{
                      background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12,
                      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                      textAlign: 'left', width: '100%', transition: 'all .2s',
                    }} className="mockup-card">
                      <span style={{ flexShrink: 0, display: 'flex', color: 'var(--muted)' }}>
                        {a.icon === 'check' ? <CheckIcon size={20} /> : a.icon === 'swap' ? <SwapIcon size={20} /> : a.icon === 'mail' ? <MailIcon size={20} /> : <SendIcon size={20} />}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{a.text}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.detail}</div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{timeAgo(a.date)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
