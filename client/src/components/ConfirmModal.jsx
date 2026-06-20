export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <button className="modal-close" onClick={onCancel} disabled={loading} aria-label="Close">✕</button>
        <div className="modal-heading" style={{ fontSize: 24 }}>{title}</div>
        <div className="modal-sub">{message}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-cosmos-ghost" style={{ flex: 1, padding: '13px', fontWeight: 700 }} onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn-cosmos-primary" style={{ flex: 1, padding: '13px', fontWeight: 700, background: 'var(--accent)' }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
