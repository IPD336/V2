import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import TextRoll from '../components/TextRoll';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { isValidEmail } from '../utils';

export default function Register() {
  const { register } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    let timer = setTimeout(() => setIsWaking(true), 1500);
    api.get('/ping')
      .then(() => { clearTimeout(timer); setIsWaking(false); })
      .catch(() => { setIsWaking(true); });
    return () => clearTimeout(timer);
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const nameValid = form.name.trim().length >= 2;
  const nameError = touched.name && form.name && !nameValid;
  const emailValid = form.email && isValidEmail(form.email);
  const emailError = touched.email && form.email && !emailValid;
  const passwordValid = form.password.length >= 6;
  const passwordError = touched.password && form.password && !passwordValid;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!nameValid || !emailValid || !passwordValid) return;
    setError('');
    setLoading(true);
    try {
      await register(form);
      showToast('Account created! Welcome');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
      {/* Mesh gradient background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 30% 30%, rgba(var(--accent-rgb),0.05) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 70% 70%, rgba(var(--sage-rgb),0.03) 0%, transparent 50%)
        `,
      }} />
      {/* Orb glow */}
      <div className="orb-glow" style={{
        width: 350, height: 350, top: '20%', left: '10%',
        background: 'rgba(var(--accent-rgb),0.08)',
      }} />
      {/* Logo watermark */}
      <img src={theme === 'light' ? '/logo_white.webp' : '/logo_dark.webp'} alt="" width={300} height={300} loading="lazy" style={{
        position: 'absolute', right: '5%', bottom: '10%', zIndex: 0,
        opacity: 0.06, pointerEvents: 'none', objectFit: 'contain', borderRadius: 24,
      }} />

      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <Logo size={72} showText={false} />
          <span style={{
            fontFamily: 'PT Serif, serif', fontSize: 20, fontWeight: 700,
            letterSpacing: -0.5, color: 'var(--ink)', marginTop: 6,
          }}>SkillSwap</span>
          <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 28, fontWeight: 600, letterSpacing: -1, color: 'var(--ink)', marginTop: 16, marginBottom: 8 }}><TextRoll center>Create Account</TextRoll></h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0, textAlign: 'center' }}>Join the community. List your skills, find your match.</p>
        </div>

        {isWaking && (
          <div style={{
            background: 'rgba(var(--accent-rgb),0.06)',
            border: '1px solid rgba(var(--accent-rgb),0.2)',
            padding: '12px 16px',
            borderRadius: 12,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: 'var(--accent)',
            fontSize: 12,
            fontWeight: 600,
          }}>
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            <span>The server is waking up. This might take 10–30 seconds…</span>
          </div>
        )}

        <form onSubmit={submit} style={{
          background: 'var(--card-bg)', borderRadius: 16, padding: 32,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className={`form-input${nameError ? ' error' : ''}${touched.name && nameValid ? ' success' : ''}`}
              type="text" name="name" placeholder="Your full name"
              value={form.name} onChange={handle} onBlur={handleBlur} required
              aria-label="Full name"
            />
            {nameError && <p className="form-error">Name must be at least 2 characters</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className={`form-input${emailError ? ' error' : ''}${touched.email && emailValid ? ' success' : ''}`}
              type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handle} onBlur={handleBlur} required
              aria-label="Email"
            />
            {emailError && <p className="form-error">Please enter a valid email address</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className={`form-input${passwordError ? ' error' : ''}${touched.password && passwordValid ? ' success' : ''}`}
              type="password" name="password" placeholder="Min. 6 characters"
              value={form.password} onChange={handle} onBlur={handleBlur} required
              aria-label="Password"
            />
            {passwordError && <p className="form-error">Password must be at least 6 characters</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Location <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input className="form-input" type="text" name="location" placeholder="City, Country" value={form.location} onChange={handle} aria-label="Location" />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn-cosmos btn-cosmos-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px 24px', fontSize: 11 }}>
            {loading ? 'Creating account…' : <TextRoll center>Create Account</TextRoll>}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 4px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Google Sign-Up */}
          <button
            type="button"
            id="google-signup-btn"
            onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`; }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '12px 24px', borderRadius: 10,
              border: '1.5px solid var(--border)', background: 'var(--card-bg)',
              color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s', marginTop: 12,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#4285F4'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66,133,244,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {/* Official Google G logo */}
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}><TextRoll center>Sign In</TextRoll></Link>
          </p>
        </form>
      </div>
    </div>
  );
}
