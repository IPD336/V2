import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

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

  const searchUsers = async () => {
    if (!inviteSearch.trim()) return;
    const res = await api.get('/users', { params: { search: inviteSearch, limit: 5 } });
    setSearchResults(res.data.users.filter((u) => u._id !== me?._id));
  };

  const invite = async (userId) => {
    setInviting(userId);
    try {
      await api.post(`/teams/${id}/invite`, { userId });
      showToast('Invite sent! 📨');
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
      showToast(action === 'accept' ? 'You joined the team! 🎉' : 'Invite declined');
      load();
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteTeam = async () => {
    if (!confirm('Delete this team? This cannot be undone.')) return;
    await api.delete(`/teams/${id}`);
    showToast('Team deleted');
    navigate('/teams');
  };

  if (loading) return <div className="spinner" />;
  if (!team) return null;

  return (
    <div className="page" style={{ background: 'var(--cream)' }}>
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
          </div>
          {isCreator && (
            <button className="btn-decline" style={{ flexShrink: 0 }} onClick={deleteTeam}>Delete Team</button>
          )}
        </div>

        {/* Pending invite for me */}
        {myMembership?.status === 'invited' && (
          <div style={{ background: 'var(--gold-light)', border: '1px solid var(--gold)', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--ink)' }}>You've been invited to join this team!</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>The creator wants you as part of <strong>{team.name}</strong>.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-accept" onClick={() => respond('accept')}>Accept Invite</button>
              <button className="btn-decline" onClick={() => respond('decline')}>Decline</button>
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
                <div style={{ width: 42, height: 42, borderRadius: 10, background: m.user?.avatarColor || '#C84B31', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'white' }}>
                  {initials(m.user?.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{m.user?.name} {m.user?._id === team.creator?._id && <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>· Creator</span>}</div>
                  {m.user?.location && <div style={{ fontSize: 12, color: 'var(--muted)' }}>📍 {m.user.location}</div>}
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
                <div style={{ width: 36, height: 36, borderRadius: 9, background: m.user?.avatarColor || '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'white' }}>
                  {initials(m.user?.name)}
                </div>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{m.user?.name}</span>
                <span className="status-badge status-pending" style={{ marginLeft: 'auto' }}>Awaiting</span>
              </div>
            ))}
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
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: u.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: 'white' }}>
                        {initials(u.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.location}</div>
                      </div>
                      <button
                        className={alreadyInvited ? 'btn-ghost' : 'btn-accent'}
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
            <span style={{ fontSize: 20 }}>🔒</span>
            <div><strong style={{ color: 'var(--indigo)' }}>Team is full.</strong><span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 6 }}>No more members can be added.</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
