import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="page bg-gradient-subtle" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '80px 24px', maxWidth: 500 }}>
        <div style={{ fontSize: 96, fontWeight: 700, fontFamily: 'PT Serif, serif', color: 'var(--accent)', lineHeight: 1, marginBottom: 8, letterSpacing: -4 }}>
          404
        </div>
        <div style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 40, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or has been moved.
        </div>
        <button className="btn-ink" onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px' }}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
