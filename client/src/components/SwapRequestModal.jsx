import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TypingIndicator from './TypingIndicator';
import { SparklesIcon, HandshakeIcon } from './Icons';
import { DatePicker } from './DatePicker';

export default function SwapRequestModal({ target, onClose }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const mySkills = me?.skillsOffered?.map((s) => s.name) || [];
  const theirSkills = target.skillsOffered?.map((s) => s.name) || [];

  const [form, setForm] = useState({
    skillOffered: mySkills[0] || '',
    skillWanted: theirSkills[0] || '',
    message: '',
    schedule: '',
    format: 'Video Call',
    scheduledAt: '',
    duration: '60',
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSlow, setAiSlow] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [draggedSkill, setDraggedSkill] = useState(null);
  const dragSource = useRef(null);

  function handleScheduleChange(isoStr) {
    setForm({ ...form, scheduledAt: isoStr || '' });
  }

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const handleAiDraft = async () => {
    if (!form.skillOffered || !form.skillWanted) {
      showToast('Please select a skill to offer and want first', 'error');
      return;
    }
    setAiLoading(true);
    setAiSlow(false);
    setAiError(false);
    const slowTimer = setTimeout(() => setAiSlow(true), 5000);
    try {
      const res = await api.post('/ai/draft-proposal', {
        receiverId: target._id,
        skillOffered: form.skillOffered,
        skillWanted: form.skillWanted
      });
      setForm({ ...form, message: res.data.draft });
      showToast('AI draft message created!');
    } catch (err) {
      setAiError(true);
      showToast(err.response?.data?.message || 'Failed to generate draft', 'error');
    } finally { setAiLoading(false); setAiSlow(false); clearTimeout(slowTimer); }
  };

  const messageValid = form.message.trim().length >= 10;
  const messageError = touched.message && form.message && !messageValid;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ message: true });
    if (!messageValid) return;
    setLoading(true);
    try {
      let scheduledEndAt = null;
      if (form.scheduledAt) {
        const start = new Date(form.scheduledAt);
        scheduledEndAt = new Date(start.getTime() + parseInt(form.duration) * 60 * 1000).toISOString();
      }
      await api.post('/swaps', {
        receiverId: target._id,
        ...form,
        scheduledAt: form.scheduledAt || null,
        scheduledEndAt,
      });
      showToast('Swap request sent!');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send request', 'error');
    } finally { setLoading(false); }
  };

  // Drag handlers
  const handleDragStart = (skill, source) => (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', skill);
    setDraggedSkill(skill);
    dragSource.current = source;
  };

  const handleDragEnd = () => {
    setDraggedSkill(null);
    setDragOver(null);
    dragSource.current = null;
  };

  const handleDragOver = (zone) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(zone);
  };

  const handleDragLeave = (zone) => () => {
    if (dragOver === zone) setDragOver(null);
  };

  const handleDrop = (zone) => (e) => {
    e.preventDefault();
    const skill = e.dataTransfer.getData('text/plain');
    if (zone === 'offer') {
      setForm({ ...form, skillOffered: skill });
    } else {
      setForm({ ...form, skillWanted: skill });
    }
    setDraggedSkill(null);
    setDragOver(null);
    dragSource.current = null;
  };

  const SkillChip = ({ skill, isMySkill }) => (
    <span
      draggable
      onDragStart={handleDragStart(skill, isMySkill ? 'mine' : 'theirs')}
      onDragEnd={handleDragEnd}
      onClick={() => {
        if (isMySkill) setForm({ ...form, skillOffered: skill });
        else setForm({ ...form, skillWanted: skill });
      }}
      className={`swap-skill-chip ${draggedSkill === skill ? 'dragging' : ''} ${(isMySkill && form.skillOffered === skill) || (!isMySkill && form.skillWanted === skill) ? 'selected' : ''}`}
      style={{
        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'grab', userSelect: 'none', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 4,
        background: draggedSkill === skill ? 'var(--accent-light)' : (isMySkill ? 'rgba(200,75,49,0.08)' : 'rgba(58,99,81,0.08)'),
        border: `1.5px solid ${(isMySkill && form.skillOffered === skill) || (!isMySkill && form.skillWanted === skill) ? 'var(--accent)' : 'var(--border)'}`,
        color: 'var(--ink)', opacity: draggedSkill === skill ? 0.4 : 1,
      }}
    >
      {skill}
      {((isMySkill && form.skillOffered === skill) || (!isMySkill && form.skillWanted === skill)) && <span style={{ fontSize: 10, marginLeft: 2 }}>✓</span>}
    </span>
  );

  const DropZone = ({ zone, label, selected, placeholder }) => (
    <div
      onDragOver={handleDragOver(zone)}
      onDragLeave={handleDragLeave(zone)}
      onDrop={handleDrop(zone)}
      style={{
        flex: 1, minHeight: 80, border: `2px dashed ${dragOver === zone ? 'var(--accent)' : selected ? 'var(--sage)' : 'var(--border)'}`,
        borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: dragOver === zone ? 'rgba(200,75,49,0.06)' : selected ? 'rgba(58,99,81,0.06)' : 'transparent',
        transition: 'all 0.2s', cursor: dragOver === zone ? 'grabbing' : 'default',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: dragOver === zone ? 'var(--accent)' : selected ? 'var(--sage)' : 'var(--muted)' }}>
        {label}
      </div>
      {selected ? (
        <span style={{
          fontSize: 15, fontWeight: 700, color: 'var(--ink)', padding: '6px 16px', borderRadius: 20,
          background: zone === 'offer' ? 'rgba(200,75,49,0.1)' : 'rgba(58,99,81,0.1)',
          border: `1.5px solid ${zone === 'offer' ? 'rgba(200,75,49,0.3)' : 'rgba(58,99,81,0.3)'}`,
        }}>
          {selected}
        </span>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>{placeholder}</div>
      )}
    </div>
  );

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-heading" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HandshakeIcon size={18} /> Request Swap with {target.name}
        </div>
        <div className="modal-sub">Drag skills between columns or click to select.</div>
        <form onSubmit={submit}>
          {/* Drag & Drop Skill Selectors */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <DropZone zone="offer" label="I Offer" selected={form.skillOffered} placeholder="Drop your skill here" />
            <DropZone zone="want" label="I Want" selected={form.skillWanted} placeholder="Drop their skill here" />
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {/* Your Skills */}
            <div style={{ flex: 1, background: 'var(--cream)', borderRadius: 12, padding: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--accent)', marginBottom: 8 }}>Your Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {mySkills.length > 0 ? mySkills.map((s) => <SkillChip key={s} skill={s} isMySkill />) : <span style={{ fontSize: 12, color: 'var(--muted)' }}>No skills listed</span>}
              </div>
            </div>
            {/* Their Skills */}
            <div style={{ flex: 1, background: 'var(--cream)', borderRadius: 12, padding: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--sage)', marginBottom: 8 }}>{target.name}'s Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {theirSkills.length > 0 ? theirSkills.map((s) => <SkillChip key={s} skill={s} isMySkill={false} />) : <span style={{ fontSize: 12, color: 'var(--muted)' }}>No skills listed</span>}
              </div>
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Personal Message</label>
              {aiLoading ? (
                <TypingIndicator message={aiSlow ? 'Still writing...' : 'Writing draft...'} />
              ) : aiError ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: 'var(--accent)' }}>Failed</span>
                  <button
                    type="button"
                    className="btn-outline-sm"
                    style={{ padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, border: '1px solid var(--border)' }}
                    onClick={handleAiDraft}
                  >
                    <SparklesIcon size={12} /> Retry
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-outline-sm"
                  style={{ padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, border: '1px solid var(--border)' }}
                  onClick={handleAiDraft}
                >
                  <SparklesIcon size={12} /> Write with AI
                </button>
              )}
            </div>
            <textarea
              className={`form-textarea${messageError ? ' error' : ''}${touched.message && messageValid ? ' success' : ''}`}
              name="message" placeholder="Introduce yourself and explain why you'd like to swap…"
              value={form.message} onChange={handle} onBlur={handleBlur}
              aria-label="Personal message"
            />
            {messageError && <p className="form-error">Please write at least 10 characters</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Schedule Session <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <DatePicker
                label="Date & Time"
                value={form.scheduledAt}
                onChange={handleScheduleChange}
                min={new Date().toISOString().slice(0, 10)}
                style={{ flex: 1 }}
              />
              <select className="form-select" name="duration" value={form.duration} onChange={handle} style={{ width: 'auto', minWidth: 80 }} aria-label="Session duration">
                <option value="30">30m</option>
                <option value="60">1h</option>
                <option value="90">1.5h</option>
                <option value="120">2h</option>
              </select>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Pick a date to appear on the calendar. You can schedule later too.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Notes / Preferred Times</label>
            <input className="form-input" name="schedule" placeholder="e.g. Saturday evenings work best…" value={form.schedule} onChange={handle} aria-label="Schedule notes" />
          </div>

          <div className="form-group">
            <label className="form-label">Session Format</label>
            <select className="form-select" name="format" value={form.format} onChange={handle} aria-label="Session format">
              <option>Video Call</option>
              <option>In Person</option>
              <option>Async</option>
              <option>Hybrid</option>
            </select>
          </div>

          <button className="btn-cosmos-primary btn-ripple" type="submit" disabled={loading || !messageValid}>
            {loading ? 'Sending…' : 'Send Swap Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
