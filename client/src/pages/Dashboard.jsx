import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { SkeletonCard } from '../components/Skeleton';
import { 
  SearchIcon, 
  SwapIcon, 
  TeamsIcon, 
  WorkspaceIcon, 
  CheckIcon, 
  MailIcon, 
  SendIcon, 
  RocketIcon,
  SparklesIcon,
  TrophyIcon,
  CalendarIcon,
  StarIcon,
  MedalIcon,
  ClockIcon,
  WarningIcon,
  PinIcon,
} from '../components/Icons';
import { BadgeIcon } from '../utils/badges';
import { initials, timeAgo } from '../utils';

function getGreeting(name) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  return `${g}, ${name.split(' ')[0]}`;
}

function formatDateTime(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) + ' · ' + 
         new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState({});

  const { data: dbData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const [swaps, teams, recs, gami] = await Promise.all([
        api.get('/swaps'),
        api.get('/teams'),
        api.get('/users/recommendations').catch(() => ({ data: { recommendations: [] } })),
        api.get('/gamification').catch(() => null),
      ]);
      refreshUser().catch(() => null);
      return {
        swapData: swaps.data,
        teamCount: teams.data.teams?.length || 0,
        recommendations: recs.data?.recommendations || [],
        gamification: gami?.data || null,
      };
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    placeholderData: { swapData: { incoming: [], outgoing: [], active: [], completed: [] }, teamCount: 0, recommendations: [], gamification: null },
  });

  const { swapData, teamCount, recommendations, gamification } = dbData;

  // Onboarding progress memo
  const onboardingSteps = useMemo(() => {
    if (!user) return [];
    
    const hasProfile = !!(user.bio?.trim() && user.location?.trim());
    const hasSkills = (user.skillsOffered?.length > 0) && (user.skillsWanted?.length > 0);
    const hasGithub = !!user.socialLinks?.github?.trim();
    const hasSent = swapData.outgoing?.length > 0 || swapData.active?.length > 0 || swapData.completed?.length > 0;
    const hasScheduled = [...swapData.active, ...swapData.incoming, ...swapData.outgoing, ...swapData.completed].some(s => s.scheduledAt);

    return [
      { id: 'profile', text: 'Complete your profile bio & location', completed: hasProfile, link: '/profile' },
      { id: 'skills', text: 'Add skills you offer & want to learn', completed: hasSkills, link: '/profile' },
      { id: 'github', text: 'Connect GitHub to verify your skills', completed: hasGithub, link: '/profile' },
      { id: 'send', text: 'Browse members and send a swap request', completed: hasSent, link: '/browse' },
      { id: 'schedule', text: 'Schedule a session on the calendar', completed: hasScheduled, link: '/swaps' }
    ];
  }, [user, swapData]);

  const onboardingProgress = useMemo(() => {
    if (onboardingSteps.length === 0) return 0;
    const completed = onboardingSteps.filter(s => s.completed).length;
    return Math.round((completed / onboardingSteps.length) * 100);
  }, [onboardingSteps]);

  const showOnboarding = onboardingProgress < 100;

  // Upcoming scheduled session
  const upcomingSession = useMemo(() => {
    const now = new Date();
    const activeWithSchedule = swapData.active.filter(s => s.scheduledAt && new Date(s.scheduledAt) > now);
    activeWithSchedule.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    return activeWithSchedule[0] || null;
  }, [swapData.active]);

  // Action Center tasks
  const actionItems = useMemo(() => {
    const items = [];
    
    // 1. Incoming Requests
    swapData.incoming.forEach(s => {
      items.push({
        id: s._id,
        type: 'incoming',
        text: `Swap request from ${s.sender?.name || 'User'}: wants to learn your ${s.skillWanted} in exchange for ${s.skillOffered}.`,
        swap: s
      });
    });

    // 2. Completion Verify
    const needsConfirm = swapData.active.filter(s => s.status === 'pending_completion' && !s.completedBy.includes(user?._id));
    needsConfirm.forEach(s => {
      const other = s.sender?._id === user?._id ? s.receiver : s.sender;
      items.push({
        id: s._id,
        type: 'confirm_completion',
        text: `${other?.name || 'User'} marked your swap (${s.skillOffered} ⇄ ${s.skillWanted}) as complete. Please verify.`,
        swap: s
      });
    });

    // 3. Needs Scheduling
    const needsSchedule = swapData.active.filter(s => s.status === 'active' && !s.scheduledAt);
    needsSchedule.forEach(s => {
      const other = s.sender?._id === user?._id ? s.receiver : s.sender;
      items.push({
        id: s._id,
        type: 'schedule_needed',
        text: `Swap with ${other?.name || 'User'} (${s.skillOffered} ⇄ ${s.skillWanted}) has been accepted. Set a date!`,
        swap: s
      });
    });

    return items;
  }, [swapData.incoming, swapData.active, user?._id]);

  // Activity feed (last 5)
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
    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [swapData]);

  // Action Handlers
  const handleAccept = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.put(`/swaps/${id}/accept`);
      showToast('Swap request accepted! 🎉');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDecline = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.put(`/swaps/${id}/decline`);
      showToast('Swap request declined');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      showToast('Failed to decline request', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleConfirmComplete = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.put(`/swaps/${id}/confirm-complete`);
      showToast('Swap confirmed as completed! 🎓');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      showToast('Failed to confirm completion', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Welcome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
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

        {isLoading ? (
          <div className="cards-grid" style={{ marginTop: 32 }}>
            {[1,2,3,4].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : (
          <div className="dashboard-layout">
            {/* LEFT COLUMN: Main Modules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              
              {/* Onboarding Checklist for new users */}
              {showOnboarding && (
                <div className="onboarding-tracker">
                  <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink)' }}>Get Started Checklist</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Complete these steps to unlock the full SkillSwap experience.</div>
                  
                  <div className="progress-container">
                    <div className="progress-header">
                      <span>Onboarding Progress</span>
                      <span>{onboardingProgress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${onboardingProgress}%` }} />
                    </div>
                  </div>

                  <div className="onboarding-checklist">
                    {onboardingSteps.map((step) => (
                      <div key={step.id} className={`onboarding-item${step.completed ? ' completed' : ''}`}>
                        <div className={`onboarding-item-checkbox${step.completed ? ' checked' : ''}`}>
                          {step.completed && <CheckIcon size={12} />}
                        </div>
                        <span className={`onboarding-item-text${step.completed ? ' line-through' : ''}`}>
                          {step.text}
                        </span>
                        {!step.completed && (
                          <button 
                            className="btn-ghost onboarding-item-action" 
                            style={{ padding: '2px 8px', fontSize: 11 }}
                            onClick={() => navigate(step.link)}
                          >
                            Go ↗
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Session Notification */}
              {upcomingSession && (
                <div className="upcoming-alert">
                  <div className="upcoming-alert-info">
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--indigo-light)', color: 'var(--indigo)', flexShrink: 0
                    }}>
                      <CalendarIcon size={20} />
                    </div>
                    <div>
                      <div className="upcoming-alert-time">Upcoming Swap Session</div>
                      <div className="upcoming-alert-title">
                        {upcomingSession.sender?._id === user?._id ? upcomingSession.receiver?.name : upcomingSession.sender?.name}
                        <span style={{ fontWeight: 400, color: 'var(--muted)', margin: '0 6px' }}>for</span>
                        <span style={{ color: 'var(--accent)' }}>{upcomingSession.skillOffered} ↔ {upcomingSession.skillWanted}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ClockIcon size={11} /> {formatDateTime(upcomingSession.scheduledAt)} ({upcomingSession.format})
                      </div>
                    </div>
                  </div>
                  <button className="btn-cosmos btn-cosmos-primary" onClick={() => navigate('/workspaces')} style={{ padding: '8px 16px' }}>
                    Join Room
                  </button>
                </div>
              )}

              {/* Action Center / Action Needed */}
              {actionItems.length > 0 && (
                <div className="dashboard-card">
                  <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 17, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <WarningIcon size={18} style={{ color: 'var(--gold)' }} /> Action Needed
                  </h3>
                  <div className="action-center">
                    {actionItems.map((item) => (
                      <div key={item.id} className="action-card">
                        <div className="action-card-text">{item.text}</div>
                        <div className="action-card-btns">
                          {item.type === 'incoming' && (
                            <>
                              <button 
                                className="btn-cosmos btn-cosmos-ghost" 
                                style={{ padding: '6px 12px', fontSize: 10 }}
                                onClick={() => handleDecline(item.id)}
                                disabled={actionLoading[item.id]}
                              >
                                Decline
                              </button>
                              <button 
                                className="btn-cosmos btn-cosmos-primary" 
                                style={{ padding: '6px 12px', fontSize: 10 }}
                                onClick={() => handleAccept(item.id)}
                                disabled={actionLoading[item.id]}
                              >
                                Accept
                              </button>
                            </>
                          )}
                          {item.type === 'confirm_completion' && (
                            <button 
                              className="btn-cosmos btn-cosmos-primary" 
                              style={{ padding: '6px 12px', fontSize: 10 }}
                              onClick={() => handleConfirmComplete(item.id)}
                              disabled={actionLoading[item.id]}
                            >
                              Confirm
                            </button>
                          )}
                          {item.type === 'schedule_needed' && (
                            <button 
                              className="btn-cosmos btn-cosmos-primary" 
                              style={{ padding: '6px 12px', fontSize: 10 }}
                              onClick={() => navigate('/calendar')}
                            >
                              Schedule
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 17, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px 0' }}>Quick Actions</h3>
                <div className="cards-grid">
                  {quickActions.map((a) => (
                    <button
                      key={a.to}
                      onClick={() => navigate(a.to)}
                      style={{
                        background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 20,
                        cursor: 'pointer', textAlign: 'left', transition: 'all .3s', display: 'flex', flexDirection: 'column', gap: 6,
                      }}
                      className="mockup-card"
                    >
                      <span style={{ color: 'var(--ink)', display: 'flex' }}><a.icon size={24} /></span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{a.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{a.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Match Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 17, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SparklesIcon size={18} style={{ color: 'var(--accent)' }} /> Smart Matches For You
                  </h3>
                  <div className="smart-matches-grid">
                    {recommendations.slice(0, 3).map((rec) => (
                      <div key={rec._id} className="smart-match-card">
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                              background: rec.avatarUrl ? `url(${rec.avatarUrl}) center/cover` : (rec.avatarColor || '#C84B31'),
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 700, fontSize: 13,
                            }}>
                              {!rec.avatarUrl && rec.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            {rec.mutualMatch ? (
                              <span className="match-badge mutual-match-badge">Mutual Match</span>
                            ) : (
                              <span className="match-badge">Match Score: {rec.matchScore}</span>
                            )}
                          </div>
                          
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginTop: 8 }}>{rec.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <PinIcon size={11} style={{ verticalAlign: 'middle', marginTop: -2 }} /> {rec.location || 'Remote'}
                          </div>

                          <div style={{ fontSize: 11, marginTop: 8 }}>
                            <div style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Teaches:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                              {rec.skillsOffered?.slice(0, 2).map((s, i) => (
                                <span key={i} style={{ fontSize: 10, background: 'var(--warm)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 6px', color: 'var(--accent)', fontWeight: 600 }}>
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button 
                          className="btn-ghost" 
                          style={{ fontSize: 11, padding: '6px 0', marginTop: 12, width: '100%', border: '1px solid var(--border)' }}
                          onClick={() => navigate(`/profile/${rec._id}`)}
                        >
                          View Profile
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 17, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px 0' }}>Recent Activity</h3>
                {activities.length === 0 ? (
                  <div className="empty-state" style={{ marginTop: 8, padding: '32px 0' }}>
                    <div className="empty-state-icon"><RocketIcon size={24} /></div>
                    <h3 style={{ fontSize: 14 }}>No activity yet</h3>
                    <p style={{ fontSize: 12 }}>Start by browsing skills and sending your first swap request.</p>
                    <button className="btn-cosmos btn-cosmos-primary" onClick={() => navigate('/browse')} style={{ padding: '8px 16px', fontSize: 10 }}>
                      Browse Skills
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activities.map((a, i) => (
                      <button key={i} onClick={() => navigate('/swaps')} style={{
                        background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12,
                        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                        textAlign: 'left', width: '100%', transition: 'all .2s',
                      }} className="mockup-card">
                        <span style={{ flexShrink: 0, display: 'flex', color: 'var(--muted)' }}>
                          {a.icon === 'check' ? <CheckIcon size={18} /> : a.icon === 'swap' ? <SwapIcon size={18} /> : a.icon === 'mail' ? <MailIcon size={18} /> : <SendIcon size={18} />}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--ink)' }}>{a.text}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.detail}</div>
                        </div>
                        <span style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>{timeAgo(a.date)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: Profile & Stats Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* XP & Level progress card */}
              <div className="dashboard-card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SparklesIcon size={16} /> Level {gamification?.level || 1}
                </h3>

                {gamification && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                      <span>{gamification.xpCurrent} / {gamification.xpNeeded} XP</span>
                      <span>{gamification.xp} total XP</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${Math.min(100, (gamification.xpCurrent / gamification.xpNeeded) * 100)}%`,
                        background: 'var(--sage)',
                        borderRadius: 4, transition: 'width .5s ease',
                      }} />
                    </div>
                  </div>
                )}

                <div className="league-badge-display" style={{ border: `1.5px solid ${user?.league?.color || 'var(--gold)'}`, background: 'var(--warm)', borderRadius: 12, padding: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <TrophyIcon size={24} style={{ color: user?.league?.color || '#CD7F32' }} />
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 0.5 }}>Current League</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{user?.league?.name || 'Bronze'} League</div>
                  </div>
                </div>

                {/* Streak display */}
                {gamification?.streak && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 12px', background: 'var(--warm)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 18 }}>🔥</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{gamification.streak.current} day streak</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>Longest: {gamification.streak.longest} days</div>
                    </div>
                  </div>
                )}

                {/* Rating & completed stats */}
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <div style={{ flex: 1, background: 'var(--accent-light)', border: '1px solid rgba(var(--accent-rgb),0.15)', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                      <StarIcon size={11} /> Rating
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginTop: 4 }}>{user?.rating?.toFixed(1) || '—'}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{user?.reviewCount || 0} reviews</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--warm)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Completed</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginTop: 4 }}>{swapData.completed.length}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>swaps</div>
                  </div>
                </div>
              </div>

              {/* Badges block with progress */}
              <div className="dashboard-card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MedalIcon size={16} /> Badges
                </h3>
                {(!gamification?.badges || gamification.badges.length === 0) ? (
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>
                    No badges earned yet. Complete swaps or join teams to earn your first badge!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {gamification.badges.map((b, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                        background: b.earned ? 'var(--accent-light)' : 'transparent',
                        borderRadius: 10, opacity: b.earned ? 1 : 0.5,
                        border: b.earned ? '1px solid rgba(var(--accent-rgb),0.2)' : '1px solid var(--border)',
                      }}>
                        <BadgeIcon name={b.icon} size={20} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
                            {b.name}
                            {b.earned && <span style={{ fontSize: 10, color: 'var(--accent)', marginLeft: 6 }}>✓</span>}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {b.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats detail list */}
              <div className="dashboard-card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: 'PT Serif, serif', fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '0 0 16px 0' }}>Activity Overview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Active Swaps', value: swapData.active.filter(s => s.status === 'active').length, color: 'var(--indigo)' },
                    { label: 'Pending Requests', value: swapData.incoming.length + swapData.outgoing.length, color: 'var(--gold)' },
                    { label: 'Collaborations', value: teamCount, color: 'var(--sage)' }
                  ].map((stat, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: stat.color }} />
                        {stat.label}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
