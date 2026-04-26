import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      showToast('Welcome back! 👋');
      navigate(data.user.role === 'admin' ? '/admin' : '/browse');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 440, padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div className="logo-mark">S²</div>
            <span style={{ fontFamily: 'PT Serif, serif', fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>SkillSwap</span>
          </div>
          <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 32, fontWeight: 600, letterSpacing: -1, color: 'var(--ink)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8 }}>Sign in to manage your swaps and profile.</p>
        </div>

        <form onSubmit={submit} style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 36, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Your password" value={form.password} onChange={handle} required />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn-modal-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
