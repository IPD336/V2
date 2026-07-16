import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

/**
 * This page handles the redirect from the backend after Google OAuth.
 * The backend redirects to: /auth/google/callback?token=<jwt>
 * This component reads the token, stores it, and navigates to the dashboard.
 */
export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');
    const reason = searchParams.get('reason');

    if (err === 'banned') {
      setError(`Your account has been suspended. ${reason ? `Reason: ${reason}` : ''}`);
      return;
    }

    if (err || !token) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    loginWithToken(token)
      .then((user) => {
        showToast(`Welcome, ${user.name}!`);
        navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      })
      .catch(() => {
        setError('Could not verify your Google account. Please try again.');
      });
  }, []);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--cream)', padding: 24, gap: 16,
      }}>
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 32, maxWidth: 400, width: '100%',
          textAlign: 'center', boxShadow: 'var(--shadow)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: 'var(--ink)', fontFamily: 'PT Serif, serif', marginBottom: 8 }}>Sign-in Failed</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>{error}</p>
          <button
            className="btn-cosmos btn-cosmos-primary"
            onClick={() => navigate('/login')}
            style={{ padding: '12px 24px', fontSize: 11 }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--cream)', gap: 16,
    }}>
      <Spinner />
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Completing sign-in with Google…</p>
    </div>
  );
}
