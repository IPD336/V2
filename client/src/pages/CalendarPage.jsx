import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, VideoIcon, CheckIcon, SwapIcon, StarIcon } from '../components/Icons';
import { DateRangePicker } from '../components/DatePicker';

/* ─── Helpers ─── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DURATION_LABELS = { 30: '30m', 60: '1h', 90: '1.5h', 120: '2h' };

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function formatDateFull(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatDateTime(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + formatTime(date);
}
function isSameDay(d1, d2) {
  const a = new Date(d1), b = new Date(d2);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getDurationMins(swap) {
  if (!swap.scheduledAt || !swap.scheduledEndAt) return 60;
  return Math.round((new Date(swap.scheduledEndAt) - new Date(swap.scheduledAt)) / 60000);
}

/* ─── Status Config ─── */
function statusConfig(status) {
  switch (status) {
    case 'active': return { color: 'var(--indigo)', bg: 'var(--indigo-light)', label: 'Active' };
    case 'pending': return { color: 'var(--gold)', bg: 'var(--gold-light)', label: 'Pending' };
    case 'pending_completion': return { color: 'var(--gold)', bg: 'var(--gold-light)', label: 'Pending Completion' };
    case 'completed': return { color: 'var(--sage)', bg: 'var(--sage-light)', label: 'Completed' };
    default: return { color: 'var(--muted)', bg: 'var(--warm)', label: status };
  }
}

/* ─── Schedule Modal ─── */
function ScheduleModal({ swap, me, onClose, onDone }) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(swap.skillOffered ? `${swap.skillOffered} ↔ ${swap.skillWanted}` : '');
  const [startDate, setStartDate] = useState(
    swap.scheduledAt ? new Date(swap.scheduledAt).toISOString().slice(0, 16) : ''
  );
  const [endDate, setEndDate] = useState(() => {
    if (swap.scheduledAt && swap.scheduledEndAt) {
      return new Date(swap.scheduledEndAt).toISOString().slice(0, 16);
    }
    const start = swap.scheduledAt ? new Date(swap.scheduledAt) : new Date();
    return new Date(start.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState(swap.format || '');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#7986CB');
  const [loading, setLoading] = useState(false);

  function handleRangeChange({ start, end }) {
    setStartDate(start);
    setEndDate(end);
  }

  const COLORS = [
    { hex: '#7986CB', name: 'Lavender' },
    { hex: '#33B679', name: 'Sage' },
    { hex: '#8E24AA', name: 'Grape' },
    { hex: '#E67C73', name: 'Flamingo' },
    { hex: '#F6BF26', name: 'Banana' },
    { hex: '#F4511E', name: 'Tangerine' },
    { hex: '#039BE5', name: 'Peacock' },
    { hex: '#616161', name: 'Graphite' },
    { hex: '#3F51B5', name: 'Blueberry' },
    { hex: '#0B8043', name: 'Basil' },
    { hex: '#D50000', name: 'Tomato' },
  ];

  const submit = async (e) => {
    e.preventDefault();
    if (!startDate) { showToast('Please pick a start date and time', 'error'); return; }
    setLoading(true);
    try {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date(start.getTime() + 60 * 60 * 1000);
      await api.put(`/swaps/${swap._id}/schedule`, {
        scheduledAt: start.toISOString(),
        scheduledEndAt: end.toISOString(),
      });
      showToast('Session scheduled! ✓');
      onDone();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule', 'error');
    } finally { setLoading(false); }
  };

  const other = swap.sender?._id === me?._id ? swap.receiver : swap.sender;

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        width: '100%', maxWidth: 440, borderRadius: 12,
        padding: 24, boxShadow: 'var(--shadow-lg)', position: 'relative',
      }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
          <CalendarIcon size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Create Event
        </h2>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Schedule your swap with <strong style={{ color: 'var(--ink)' }}>{other?.name}</strong> — {swap.skillOffered} ↔ {swap.skillWanted}
        </div>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Read-only skill swap title */}
            <div
              style={{
                border: '1px solid var(--border)', background: 'var(--warm)',
                width: '100%', borderRadius: 6, padding: '10px 14px',
                fontSize: 13, boxSizing: 'border-box',
                color: 'var(--ink)', cursor: 'default',
                userSelect: 'none',
              }}
            >
              {title}
            </div>
            <DateRangePicker
              label="Date & Time Range"
              value={{ start: startDate, end: endDate }}
              onChange={handleRangeChange}
              min={new Date().toISOString().slice(0, 10)}
            />
            <input
              placeholder="Location (e.g. Google Meet, Zoom)"
              style={{
                border: '1px solid var(--border)', background: 'var(--card-bg)',
                width: '100%', borderRadius: 6, padding: '10px 14px',
                fontSize: 13, outline: 'none', boxSizing: 'border-box',
                color: 'var(--ink)',
              }}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <textarea
              placeholder="Description or notes"
              rows={3}
              style={{
                border: '1px solid var(--border)', background: 'var(--card-bg)',
                width: '100%', borderRadius: 6, padding: '10px 14px',
                fontSize: 13, outline: 'none', boxSizing: 'border-box',
                resize: 'none', color: 'var(--ink)',
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, display: 'block' }}>Color</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    title={c.name}
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: c.hex, border: color === c.hex ? '2px solid var(--ink)' : '2px solid transparent',
                      cursor: 'pointer', padding: 0,
                      opacity: color === c.hex ? 1 : 0.6,
                      transition: 'all 0.15s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button
              type="button"
              style={{
                padding: '10px 20px', fontSize: 12, fontWeight: 600,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', letterSpacing: '0.5px',
              }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px', fontSize: 12, fontWeight: 600,
                background: 'var(--accent)', border: 'none', borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer',
                color: 'white', letterSpacing: '0.5px',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Saving…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Event Card ─── */
function EventCard({ swap, me, onSchedule, compact = false }) {
  const other = swap.sender?._id === me?._id ? swap.receiver : swap.sender;
  const cfg = statusConfig(swap.status);
  const dur = getDurationMins(swap);

  return (
    <div className="cal-event-card" style={{ borderLeftColor: cfg.color }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div
          style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: other?.avatarUrl ? `url(${other.avatarUrl}) center/cover` : (other?.avatarColor || cfg.color), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}
        >
          {!other?.avatarUrl && (other?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 2 }}>{other?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{swap.skillOffered}</span>
            <span> ↔ </span>
            <span style={{ color: 'var(--sage)', fontWeight: 600 }}>{swap.skillWanted}</span>
          </div>
          {!compact && swap.scheduledAt && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <ClockIcon size={11} /> {formatTime(swap.scheduledAt)} – {swap.scheduledEndAt ? formatTime(swap.scheduledEndAt) : '?'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <VideoIcon size={11} /> {swap.format || 'Video Call'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>⏱ {DURATION_LABELS[dur] || dur + 'm'}</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}`, textTransform: 'uppercase', letterSpacing: 0.5 }}>{cfg.label}</span>
          {!compact && ['active', 'pending'].includes(swap.status) && (
            <button
              className="btn-ghost"
              style={{ fontSize: 10, padding: '4px 10px' }}
              onClick={() => onSchedule(swap)}
            >
              {swap.scheduledAt ? 'Reschedule' : 'Schedule'}
            </button>
          )}
        </div>
      </div>
      {!compact && swap.scheduledAt && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', paddingLeft: 42 }}>
          📅 {formatDateFull(swap.scheduledAt)}
        </div>
      )}
    </div>
  );
}

/* ─── History Timeline ─── */
function HistoryTimeline({ swaps, me }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const completed = swaps
    .filter(s => s.status === 'completed')
    .filter(s => !search || s.skillOffered.toLowerCase().includes(search.toLowerCase()) || s.skillWanted.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          className="form-input"
          placeholder="Filter by skill…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontSize: 12, padding: '8px 12px' }}
        />
      </div>
      {completed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
          <CheckIcon size={28} style={{ marginBottom: 8 }} />
          <p>No completed swaps yet.</p>
        </div>
      ) : (
        <div className="history-timeline">
          {completed.map((s, i) => {
            const other = s.sender?._id === me?._id ? s.receiver : s.sender;
            const dateStr = s.completedAt ? formatDateTime(s.completedAt) : formatDateTime(s.updatedAt);
            return (
              <div key={s._id} className="history-item">
                <div className="history-dot" />
                {i < completed.length - 1 && <div className="history-line" />}
                <div className="history-content">
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4, fontFamily: 'PT Mono, monospace', letterSpacing: 0.5 }}>{dateStr}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: other?.avatarUrl ? `url(${other.avatarUrl}) center/cover` : (other?.avatarColor || '#3A6351'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                      {!other?.avatarUrl && (other?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{other?.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{s.skillOffered}</span>
                    <span> ↔ </span>
                    <span style={{ color: 'var(--sage)', fontWeight: 600 }}>{s.skillWanted}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button className="btn-ghost" style={{ fontSize: 10, padding: '3px 10px' }} onClick={() => navigate(`/profile/${other?._id}`)}>Profile ↗</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Month Grid ─── */
function MonthGrid({ events, year, month, selectedDay, onSelectDay }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Build grid cells: 6 rows × 7 cols = 42 cells
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dayNum = i - firstDay + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null);
  }

  // Map events by day number
  const eventsByDay = {};
  events.forEach(ev => {
    if (!ev.scheduledAt) return;
    const d = new Date(ev.scheduledAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(ev);
    }
  });

  return (
    <div>
      {/* Day headers */}
      <div className="cal-grid cal-header-row">
        {DAYS.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="cal-grid">
        {cells.map((dayNum, idx) => {
          const isToday = dayNum && today.getDate() === dayNum && today.getMonth() === month && today.getFullYear() === year;
          const isSelected = dayNum && selectedDay === dayNum;
          const dayEvents = dayNum ? (eventsByDay[dayNum] || []) : [];
          const isPast = dayNum && new Date(year, month, dayNum) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <div
              key={idx}
              className={`cal-day${dayNum ? ' cal-day-active' : ''}${isToday ? ' cal-day-today' : ''}${isSelected ? ' cal-day-selected' : ''}${isPast ? ' cal-day-past' : ''}`}
              onClick={() => dayNum && onSelectDay(dayNum)}
            >
              {dayNum && (
                <>
                  <span className="cal-day-num">{dayNum}</span>
                  {dayEvents.length > 0 && (
                    <div className="cal-dots">
                      {dayEvents.slice(0, 3).map((ev, i) => {
                        const cfg = statusConfig(ev.status);
                        return <span key={i} className="cal-dot" style={{ background: cfg.color }} />;
                      })}
                      {dayEvents.length > 3 && <span className="cal-dot-more">+{dayEvents.length - 3}</span>}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Calendar Page ─── */
export default function CalendarPage() {
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [calEvents, setCalEvents] = useState([]);
  const [allSwaps, setAllSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleSwap, setScheduleSwap] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'history'

  const loadCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const [calRes, swapsRes] = await Promise.all([
        api.get('/swaps/calendar', { params: { year, month: month + 1 } }),
        api.get('/swaps'),
      ]);
      setCalEvents(calRes.data.swaps);
      const { incoming, outgoing, active, completed } = swapsRes.data;
      setAllSwaps([...incoming, ...outgoing, ...active, ...completed]);
    } catch {
      showToast('Failed to load calendar data', 'error');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { loadCalendar(); }, [loadCalendar]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); } else { setMonth(m => m - 1); }
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); } else { setMonth(m => m + 1); }
    setSelectedDay(null);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()); };

  const selectedDayEvents = selectedDay
    ? calEvents.filter(ev => ev.scheduledAt && isSameDay(ev.scheduledAt, new Date(year, month, selectedDay)))
    : [];

  // Upcoming = scheduled in the future
  const now = new Date();
  const upcoming = calEvents.filter(ev => ev.scheduledAt && new Date(ev.scheduledAt) >= now)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  return (
    <div className="page bg-gradient-subtle page-fade-in">
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>

        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-label">Schedule</div>
          <div className="section-title">Your Swap <em>Calendar</em></div>
        </div>

        {/* Tab Bar */}
        <div className="tab-bar" style={{ marginBottom: 32 }}>
          <button className={`tab-btn${activeTab === 'calendar' ? ' active' : ''}`} onClick={() => setActiveTab('calendar')}>
            Calendar View
          </button>
          <button className={`tab-btn${activeTab === 'history' ? ' active' : ''}`} onClick={() => setActiveTab('history')}>
            Swap History
          </button>
        </div>

        {activeTab === 'calendar' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
            {/* Left: Calendar */}
            <div style={{ flex: '1 1 400px', minWidth: 0 }}>
              {/* Calendar Card */}
              <div style={{ background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                {/* Month Navigation */}
                <div className="cal-nav">
                  <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">
                    <ChevronLeftIcon size={18} />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h2 className="cal-month-title">{MONTHS[month]} {year}</h2>
                    <button className="btn-ghost" style={{ fontSize: 10, padding: '4px 12px' }} onClick={goToday}>Today</button>
                  </div>
                  <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">
                    <ChevronRightIcon size={18} />
                  </button>
                </div>

                {loading ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div className="skeleton" style={{ width: '100%', height: 280, borderRadius: 12 }} />
                  </div>
                ) : (
                  <div style={{ padding: '0 16px 16px' }}>
                    <MonthGrid
                      events={calEvents}
                      year={year}
                      month={month}
                      selectedDay={selectedDay}
                      onSelectDay={setSelectedDay}
                    />
                  </div>
                )}

                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, padding: '12px 20px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  {[['active','Active'],['pending','Pending'],['completed','Completed']].map(([s, label]) => {
                    const cfg = statusConfig(s);
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--muted)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Events */}
              {selectedDay && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
                    {selectedDayEvents.length > 0
                      ? `${MONTHS[month]} ${selectedDay} — ${selectedDayEvents.length} session${selectedDayEvents.length > 1 ? 's' : ''}`
                      : `${MONTHS[month]} ${selectedDay} — No sessions`}
                  </div>
                  {selectedDayEvents.length === 0 ? (
                    <div style={{ background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                      <CalendarIcon size={24} style={{ marginBottom: 8 }} />
                      <p>No sessions scheduled for this day.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selectedDayEvents.map(ev => (
                        <EventCard key={ev._id} swap={ev} me={me} onSchedule={setScheduleSwap} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Upcoming + Unscheduled */}
            <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Upcoming Sessions */}
              <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
                <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Upcoming</div>
                {upcoming.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', fontSize: 12 }}>
                    <p>No upcoming sessions scheduled.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {upcoming.slice(0, 5).map(ev => (
                      <div key={ev._id} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--warm)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, marginBottom: 4 }}>
                          {formatDateTime(ev.scheduledAt)}
                        </div>
                        <EventCard swap={ev} me={me} onSchedule={setScheduleSwap} compact />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Swaps Without Dates */}
              {(() => {
                const unscheduled = allSwaps.filter(s => ['active', 'pending'].includes(s.status) && !s.scheduledAt);
                if (unscheduled.length === 0) return null;
                return (
                  <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
                    <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>Needs Scheduling</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {unscheduled.slice(0, 4).map(s => (
                        <EventCard key={s._id} swap={s} me={me} onSchedule={setScheduleSwap} compact />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          /* History Tab */
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 400px', minWidth: 0 }}>
              <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontFamily: 'PT Serif, serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Swap History</h2>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{allSwaps.filter(s => s.status === 'completed').length} total</span>
                </div>
                <HistoryTimeline swaps={allSwaps} me={me} />
              </div>
            </div>
            {/* Stats sidebar */}
            <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--border)', padding: 24 }}>
                <div style={{ fontFamily: 'PT Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>Stats</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Completed', value: allSwaps.filter(s => s.status === 'completed').length, color: 'var(--sage)' },
                    { label: 'Active', value: allSwaps.filter(s => s.status === 'active').length, color: 'var(--indigo)' },
                    { label: 'Pending', value: allSwaps.filter(s => s.status === 'pending').length, color: 'var(--gold)' },
                    { label: 'Scheduled', value: calEvents.length, color: 'var(--accent)' },
                  ].map(stat => (
                    <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: stat.color, display: 'inline-block' }} />
                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{stat.label}</span>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--accent-light)', border: '1px solid rgba(var(--accent-rgb),0.15)', borderRadius: 16, padding: 20, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 700, color: 'var(--accent)' }}>
                  <StarIcon size={14} /> Your Rating
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)' }}>{me?.rating?.toFixed(1) || '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{me?.reviewCount || 0} reviews</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {scheduleSwap && (
        <ScheduleModal
          swap={scheduleSwap}
          me={me}
          onClose={() => setScheduleSwap(null)}
          onDone={loadCalendar}
        />
      )}
    </div>
  );
}
