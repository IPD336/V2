import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function CreateTeamModal({ onClose, onCreated }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', description: '', purpose: '', maxSize: 3 });
  const [loading, setLoading] = useState(false);
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/teams', form);
      showToast('Team created! 🎉');
      onCreated(res.data);
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-heading">Create a Team</div>
        <div className="modal-sub">Define the purpose, set the size, invite who you want.</div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Team Name</label>
            <input className="form-input" name="name" placeholder="e.g. Python + Design Duo" value={form.name} onChange={h} required />
          </div>
          <div className="form-group">
            <label className="form-label">Purpose</label>
            <textarea className="form-textarea" name="purpose" placeholder="What is this team for? What will you build or learn together?" value={form.purpose} onChange={h} style={{ minHeight: 80 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input className="form-input" name="description" placeholder="Any extra details…" value={form.description} onChange={h} />
          </div>
          <div className="form-group">
            <label className="form-label">Max Team Size</label>
            <select className="form-select" name="maxSize" value={form.maxSize} onChange={h}>
              <option value={2}>2 People</option>
              <option value={3}>3 People</option>
              <option value={4}>4 People</option>
            </select>
          </div>
          <button className="btn-modal-primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Team →'}
          </button>
        </form>
      </div>
    </div>
  );
}

function TeamCard({ team, onClick }) {
  const accepted = team.members.filter((m) => m.status === 'accepted');
  const slots = Array.from({ length: team.maxSize });

  return (
    <div className="team-card" onClick={onClick}>
      <div className="team-card-header">
        <div>
          <div className="team-name">{team.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            by {team.creator?.name}
          </div>
        </div>
        <span className={`team-badge ${team.status === 'open' ? 'team-open' : 'team-closed'}`}>
          {team.status === 'open' ? '● Open' : '✓ Full'}
        </span>
      </div>
      <div className="team-purpose">{team.purpose || team.description || 'No description yet.'}</div>
      <div className="team-members-row">
        {slots.map((_, i) => {
          const m = accepted[i];
          return m ? (
            <div key={i} className="member-avatar" style={{ background: m.user?.avatarColor || '#C84B31' }}>
              {initials(m.user?.name)}
            </div>
          ) : (
            <div key={i} className="member-slot">+</div>
          );
        })}
        <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--muted)' }}>
          {accepted.length}/{team.maxSize} members
        </span>
      </div>
    </div>
  );
}

export default function Teams() {
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('browse');
  const [openTeams, setOpenTeams] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadOpen = async () => {
    const res = await api.get('/teams');
    setOpenTeams(res.data);
  };
  const loadMine = async () => {
    const res = await api.get('/teams', { params: { mine: true } });
    setMyTeams(res.data);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadOpen(), loadMine()]).finally(() => setLoading(false));
  }, []);

  const pendingInvites = myTeams.filter((t) =>
    t.members.some((m) => m.user?._id === me?._id && m.status === 'invited')
  );

  return (
    <div className="page" style={{ background: 'var(--cream)' }}>
      <div className="container">
        <div className="teams-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 48, marginBottom: 32, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="section-label">Collaborate</div>
            <div className="section-title">Team <em>Mode</em></div>
            <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 480, lineHeight: 1.7 }}>
              Form invite-only groups of 2–4. Define your purpose, invite your people, and close entries once you're full.
            </p>
          </div>
          <button className="btn-accent" style={{ padding: '12px 24px', flexShrink: 0 }} onClick={() => setShowCreate(true)}>
            + Create Team
          </button>
        </div>

        {pendingInvites.length > 0 && (
          <div style={{ background: 'var(--gold-light)', border: '1px solid var(--gold)', borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>📨</span>
            <div>
              <strong style={{ color: 'var(--ink)' }}>You have {pendingInvites.length} pending team invite{pendingInvites.length > 1 ? 's' : ''}!</strong>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Click "My Teams" tab to respond.</div>
            </div>
          </div>
        )}

        <div className="tab-bar" style={{ marginBottom: 32, flexWrap: 'wrap' }}>
          <button className={`tab-btn ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>
            Browse Open Teams
          </button>
          <button className={`tab-btn ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>
            My Teams {myTeams.length > 0 && <span className="tab-badge">{myTeams.length}</span>}
          </button>
        </div>

        {loading ? <div className="spinner" /> : (
          <div className="cards-grid">
            {tab === 'browse' && (
              openTeams.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <div className="empty-state-icon">👥</div>
                  <h3>No open teams yet</h3>
                  <p>Be the first to create one!</p>
                </div>
              ) : openTeams.map((t) => (
                <TeamCard key={t._id} team={t} onClick={() => navigate(`/teams/${t._id}`)} />
              ))
            )}
            {tab === 'mine' && (
              myTeams.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <div className="empty-state-icon">🤝</div>
                  <h3>No teams yet</h3>
                  <p>Create one or wait for an invite.</p>
                  <button className="btn-accent" onClick={() => setShowCreate(true)}>Create Team</button>
                </div>
              ) : myTeams.map((t) => (
                <TeamCard key={t._id} team={t} onClick={() => navigate(`/teams/${t._id}`)} />
              ))
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreated={(t) => { setMyTeams((p) => [t, ...p]); setTab('mine'); }}
        />
      )}
    </div>
  );
}
