import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { CheckIcon } from '../components/Icons';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return;
    if (password !== confirm) { showToast('Passwords do not match', 'error'); return; }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setDone(true);
      showToast('Password updated! You can now sign in.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-fade-in" style={{
      background: 'var(--cream)', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 30% 30%, rgba(var(--accent-rgb),0.05) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 70% 70%, rgba(var(--sage-rgb),0.03) 0%, transparent 50%)
        `,
      }} />
      <div className="orb-glow" style={{
        width: 350, height: 350, top: '20%', left: '10%',
        background: 'rgba(var(--accent-rgb),0.08)',
      }} />

      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Logo size={40} />
          <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 28, fontWeight: 600, letterSpacing: -1, color: 'var(--ink)', marginTop: 16, marginBottom: 8 }}>New Password</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Choose a new password for your account.</p>
        </div>

        <form onSubmit={submit} style={{
          background: 'var(--card-bg)', borderRadius: 16, padding: 32,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ marginBottom: 16 }}><CheckIcon size={48} style={{ color: 'var(--sage)' }} /></div>
              <p style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>
                Password updated successfully!
              </p>
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className={`form-input${password.length > 0 && password.length < 6 ? ' error' : ''}`}
                  type="password" placeholder="Min. 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  aria-label="New password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  className={`form-input${confirm.length > 0 && password !== confirm ? ' error' : ''}`}
                  type="password" placeholder="Repeat password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                  aria-label="Confirm password"
                />
                {confirm.length > 0 && password !== confirm && <p className="form-error">Passwords do not match</p>}
              </div>
              <button className="btn-cosmos-primary" type="submit" disabled={loading || password.length < 6 || password !== confirm} style={{ width: '100%', padding: '14px 24px', fontSize: 11 }}>
                {loading ? 'Updating…' : 'Reset Password'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
