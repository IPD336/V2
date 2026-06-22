import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { isValidEmail } from '../utils';

export default function Login() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    let timer = setTimeout(() => setIsWaking(true), 1500);
    api.get('/health')
      .then(() => { clearTimeout(timer); setIsWaking(false); })
      .catch(() => { setIsWaking(true); });
    return () => clearTimeout(timer);
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const emailValid = form.email && isValidEmail(form.email);
  const emailError = touched.email && form.email && !emailValid;
  const passwordValid = form.password.length >= 6;
  const passwordError = touched.password && form.password && !passwordValid;

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!emailValid || !passwordValid) return;
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      showToast('Welcome back!');
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
      <img src={theme === 'light' ? '/logo_new_-_white-removebg-preview.png' : '/logo_new_-_dark_-removebg-preview.png'} alt="" width={300} height={300} style={{
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
          <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 28, fontWeight: 600, letterSpacing: -1, color: 'var(--ink)', marginTop: 16, marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0, textAlign: 'center' }}>Sign in to manage your swaps and profile.</p>
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
              type="password" name="password" placeholder="Your password"
              value={form.password} onChange={handle} onBlur={handleBlur} required
              aria-label="Password"
            />
            {passwordError && <p className="form-error">Password must be at least 6 characters</p>}
          </div>
          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
            <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</Link>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn-cosmos btn-cosmos-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px 24px', fontSize: 11 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
