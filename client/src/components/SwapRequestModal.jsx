import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
  });
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const messageValid = form.message.trim().length >= 10;
  const messageError = touched.message && form.message && !messageValid;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ message: true });
    if (!messageValid) return;
    setLoading(true);
    try {
      await api.post('/swaps', { receiverId: target._id, ...form });
      showToast('Swap request sent!');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send request', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-heading">Request Swap with {target.name}</div>
        <div className="modal-sub">Be specific — thoughtful requests get far more responses.</div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Your Skill to Offer</label>
            {mySkills.length > 0 ? (
              <select className="form-select" name="skillOffered" value={form.skillOffered} onChange={handle} aria-label="Skill to offer">
                {mySkills.map((s) => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <input className="form-input" name="skillOffered" placeholder="e.g. Graphic Design" value={form.skillOffered} onChange={handle} required aria-label="Skill to offer" />
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Skill You Want from Them</label>
            {theirSkills.length > 0 ? (
              <select className="form-select" name="skillWanted" value={form.skillWanted} onChange={handle} aria-label="Skill wanted">
                {theirSkills.map((s) => <option key={s}>{s}</option>)}
              </select>
            ) : (
              <input className="form-input" name="skillWanted" placeholder="e.g. Python" value={form.skillWanted} onChange={handle} required aria-label="Skill wanted" />
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Personal Message</label>
            <textarea
              className={`form-textarea${messageError ? ' error' : ''}${touched.message && messageValid ? ' success' : ''}`}
              name="message" placeholder="Introduce yourself and explain why you'd like to swap…"
              value={form.message} onChange={handle} onBlur={handleBlur}
              aria-label="Personal message"
            />
            {messageError && <p className="form-error">Please write at least 10 characters</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Schedule</label>
            <input className="form-input" name="schedule" placeholder="e.g. Saturday evenings, 7–9pm IST" value={form.schedule} onChange={handle} aria-label="Preferred schedule" />
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
