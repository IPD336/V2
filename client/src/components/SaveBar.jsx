export default function SaveBar({ loading, hasChanges }) {
  return (
    <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
      <button className="btn-cosmos btn-cosmos-primary" type="submit" disabled={loading || !hasChanges} style={{ padding: '12px 28px', fontSize: 12, marginTop: 0 }}>
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
      <span style={{ fontSize: 11, color: hasChanges ? 'var(--accent)' : 'var(--muted)', fontWeight: 600 }}>
        {loading ? 'Saving…' : hasChanges ? 'Unsaved changes' : 'All saved ✓'}
      </span>
    </div>
  );
}
