import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { isValidEmail } from '../utils';
import { MailIcon } from '../components/Icons';

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailError = touched && email.length > 0 && !isValidEmail(email);
  const emailValid = touched && email.length > 0 && isValidEmail(email);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      showToast('Check server console for reset link (dev mode)');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
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
          <Logo size={72} />
          <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 28, fontWeight: 600, letterSpacing: -1, color: 'var(--ink)', marginTop: 16, marginBottom: 8 }}>Reset Password</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Enter your email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={submit} style={{
          background: 'var(--card-bg)', borderRadius: 16, padding: 32,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ marginBottom: 16 }}><MailIcon size={48} style={{ color: 'var(--accent)' }} /></div>
              <p style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>
                Reset link sent! In development mode, check the server console.
              </p>
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className={`form-input${emailError ? ' error' : ''}${emailValid ? ' success' : ''}`}
                  type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched(true)} required
                  aria-label="Email"
                />
                {emailError && <p className="form-error">Please enter a valid email</p>}
              </div>
              <button className="btn-cosmos-primary" type="submit" disabled={loading || !isValidEmail(email)} style={{ width: '100%', padding: '14px 24px', fontSize: 11 }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
