import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { MailIcon, LinkIcon, PinIcon, LockIcon } from '../components/Icons';
import { initials } from '../utils';
import '../styles/teams.css';

export default function TeamDetail() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteSearch, setInviteSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [inviting, setInviting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      setTeam(res.data);
    } catch { showToast('Team not found', 'error'); navigate('/teams'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const isCreator = team?.creator?._id === me?._id;
  const myMembership = team?.members?.find((m) => m.user?._id === me?._id);
  const accepted = team?.members?.filter((m) => m.status === 'accepted') || [];
  const invited = team?.members?.filter((m) => m.status === 'invited') || [];
  const requested = team?.members?.filter((m) => m.status === 'requested') || [];
  const isMember = accepted.some((m) => m.user?._id === me?._id);

  const joinRequest = async () => {
    try {
      await api.post(`/teams/${id}/join`);
      showToast('Join request sent!');
      load();
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const respondToRequest = async (userId, action) => {
    try {
      await api.put(`/teams/${id}/respond`, { userId, action });
      showToast(action === 'accept' ? 'Request accepted!' : 'Request declined');
      load();
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const searchUsers = async () => {
    if (!inviteSearch.trim()) return;
    const res = await api.get('/users', { params: { search: inviteSearch, limit: 5 } });
    setSearchResults(res.data.users.filter((u) => u._id !== me?._id));
  };

  const invite = async (userId) => {
    setInviting(userId);
    try {
      await api.post(`/teams/${id}/invite`, { userId });
      showToast('Invite sent! ✓');
      load();
      setSearchResults([]);
      setInviteSearch('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setInviting(null); }
  };

  const respond = async (action) => {
    try {
      await api.put(`/teams/${id}/respond`, { action });
      showToast(action === 'accept' ? 'You joined the team!' : 'Invite declined');
      load();
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteTeam = async () => {
    setShowDeleteModal(false);
    try {
      await api.delete(`/teams/${id}`);
      showToast('Team deleted');
      navigate('/teams');
    } catch { showToast('Failed to delete team', 'error'); }
  };

  if (loading) return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ maxWidth: 700, paddingTop: 48, paddingBottom: 80 }}>
        <div className="skeleton" style={{ width: 80, height: 28, borderRadius: 6, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: '50%', height: 32, borderRadius: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '70%', height: 16, borderRadius: 6, marginBottom: 24 }} />
        <div className="skeleton" style={{ width: '100%', height: 200, borderRadius: 16, marginBottom: 20 }} />
        <div className="skeleton" style={{ width: '100%', height: 100, borderRadius: 16 }} />
      </div>
    </div>
  );
  if (!team) return (
    <div className="page bg-gradient-subtle page-fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <h2 style={{ fontFamily: 'PT Serif, serif', fontWeight: 600, color: 'var(--ink)' }}>Team not found</h2>
        <p style={{ marginBottom: 24 }}>This team may have been deleted or you don't have access.</p>
        <button className="btn-ink" onClick={() => navigate('/teams')}>Back to Teams</button>
      </div>
    </div>
  );

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 760 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px', marginBottom: 16 }} onClick={() => navigate('/teams')}>← Back</button>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 36, fontWeight: 600, letterSpacing: -1, color: 'var(--ink)' }}>{team.name}</h1>
              <span className={`team-badge ${team.status === 'open' ? 'team-open' : 'team-closed'}`}>
                {team.status === 'open' ? '● Open' : '✓ Full'}
              </span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>{team.purpose || team.description}</p>
            {team.inviteCode && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'PT Mono, monospace', letterSpacing: 1 }}>Invite Code</span>
                <code style={{
                  background: 'var(--gold-light)', border: '1px solid var(--gold)', borderRadius: 8, padding: '6px 14px',
                  fontFamily: 'PT Mono, monospace', fontSize: 15, fontWeight: 800, color: 'var(--gold)', letterSpacing: 2,
                }}>{team.inviteCode}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(team.inviteCode); showToast('Code copied!'); }}
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}
                  aria-label="Copy invite code"
                >Copy</button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {!isCreator && !myMembership && team.status === 'open' && (
              <button className="btn-cosmos-primary" style={{ padding: '8px 16px', fontSize: 12 }} onClick={joinRequest}>
                Request to Join
              </button>
            )}
            {isCreator && (
              <button className="btn-cosmos-ghost" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => setShowDeleteModal(true)}>Delete Team</button>
            )}
          </div>
        </div>

        {/* Pending invite for me */}
        {myMembership?.status === 'invited' && (
          <div style={{ background: 'var(--gold-light)', border: '1px solid var(--gold)', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--ink)' }}>You've been invited to join this team!</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>The creator wants you as part of <strong>{team.name}</strong>.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-cosmos-primary" onClick={() => respond('accept')} style={{ padding: '8px 18px', fontSize: 12, fontWeight: 700 }}>Accept Invite</button>
              <button className="btn-cosmos-ghost" onClick={() => respond('decline')} style={{ padding: '8px 18px', fontSize: 12, fontWeight: 700 }}>Decline</button>
            </div>
          </div>
        )}

        {/* Members */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 28, marginBottom: 24 }}>
          <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>
            Members — {accepted.length}/{team.maxSize}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {accepted.map((m) => (
              <div key={m.user?._id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: m.user?.avatarUrl ? `url(${m.user.avatarUrl}) center/cover` : (m.user?.avatarColor || '#C84B31'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'white' }}>
                  {!m.user?.avatarUrl && initials(m.user?.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{m.user?.name} {m.user?._id === team.creator?._id && <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>· Creator</span>}</div>
                  {m.user?.location && <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}><PinIcon size={12} />{m.user.location}</div>}
                </div>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: team.maxSize - accepted.length }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--muted)' }}>+</div>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>Open slot</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending invites */}
        {invited.length > 0 && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 28, marginBottom: 24 }}>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Pending Invites</div>
            {invited.map((m) => (
              <div key={m.user?._id} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: m.user?.avatarUrl ? `url(${m.user.avatarUrl}) center/cover` : (m.user?.avatarColor || '#aaa'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'white' }}>
                  {!m.user?.avatarUrl && initials(m.user?.name)}
                </div>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{m.user?.name}</span>
                <span className="status-badge status-pending" style={{ marginLeft: 'auto' }}>Awaiting</span>
              </div>
            ))}
          </div>
        )}

        {/* Pending join requests — creator only */}
        {isCreator && requested.length > 0 && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 28, marginBottom: 24 }}>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Join Requests</div>
            {requested.map((m) => (
              <div key={m.user?._id} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: m.user?.avatarUrl ? `url(${m.user.avatarUrl}) center/cover` : (m.user?.avatarColor || '#aaa'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'white' }}>
                  {!m.user?.avatarUrl && initials(m.user?.name)}
                </div>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', flex: 1 }}>{m.user?.name}</span>
                <button className="btn-cosmos-primary" style={{ padding: '5px 12px', fontSize: 11, fontWeight: 700 }} onClick={() => respondToRequest(m.user._id, 'accept')}>Accept</button>
                <button className="btn-cosmos-ghost" style={{ padding: '5px 12px', fontSize: 11, fontWeight: 700 }} onClick={() => respondToRequest(m.user._id, 'decline')}>Decline</button>
              </div>
            ))}
          </div>
        )}

        {/* Team Goals */}
        {team.goals && team.goals.length > 0 && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 28, marginBottom: 24 }}>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>🎯 Team Goals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {team.goals.map((goal) => (
                <div key={goal._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: goal.completed ? 'var(--muted)' : 'var(--ink)', textDecoration: goal.completed ? 'line-through' : 'none' }}>
                  <span style={{ color: goal.completed ? 'var(--sage)' : 'var(--muted)', fontSize: 14 }}>{goal.completed ? '✓' : '○'}</span>
                  <span>{goal.text}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12, fontStyle: 'italic' }}>
              Goals are synchronized in real-time via the Workspace.
            </p>
          </div>
        )}

        {/* Invite panel — creator only, team open */}
        {isCreator && team.status === 'open' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 28 }}>
            <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Invite Members</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <input
                className="form-input"
                placeholder="Search by name or skill…"
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                style={{ flex: 1, minWidth: '200px', background: 'var(--cream)', color: 'var(--ink)' }}
              />
              <button className="btn-ink" style={{ padding: '11px 20px', flexShrink: 0 }} onClick={searchUsers}>Search</button>
            </div>
            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {searchResults.map((u) => {
                  const alreadyInvited = team.members.some((m) => m.user?._id === u._id);
                  return (
                    <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--cream)', borderRadius: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: u.avatarUrl ? `url(${u.avatarUrl}) center/cover` : u.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'white' }}>
                        {!u.avatarUrl && initials(u.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.location}</div>
                      </div>
                      <button
                        className={alreadyInvited ? 'btn-ghost' : 'btn-cosmos-primary'}
                        style={{ padding: '6px 16px', fontSize: 12 }}
                        disabled={alreadyInvited || inviting === u._id}
                        onClick={() => invite(u._id)}
                      >
                        {alreadyInvited ? 'Invited' : inviting === u._id ? '…' : 'Invite'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {team.status === 'closed' && (
          <div style={{ background: 'var(--indigo-light)', border: '1px solid var(--indigo)', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
<LockIcon size={20} style={{ flexShrink: 0 }} />
            <div><strong style={{ color: 'var(--indigo)' }}>Team is full.</strong><span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 6 }}>No more members can be added.</span></div>
          </div>
        )}
      </div>
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Team?"
        message="Delete this team? This cannot be undone. All member data will be lost."
        confirmLabel="Delete Team"
        onConfirm={deleteTeam}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
