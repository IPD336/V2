import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      showToast('Account created! Welcome 🎉');
      navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div className="logo-mark">S²</div>
            <span style={{ fontFamily: 'PT Serif, serif', fontSize: 24, fontWeight: 700 }}>SkillSwap</span>
          </div>
          <h1 style={{ fontFamily: 'PT Serif, serif', fontSize: 32, fontWeight: 600, letterSpacing: -1 }}>Create Account</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8 }}>Join the community. List your skills, find your match.</p>
        </div>

        <form onSubmit={submit} style={{ background: 'white', borderRadius: 20, padding: 36, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" name="name" placeholder="Your full name" value={form.name} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label">Location <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input className="form-input" type="text" name="location" placeholder="City, Country" value={form.location} onChange={handle} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn-modal-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
