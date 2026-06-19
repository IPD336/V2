export function SkeletonCard() {
  return (
    <div className="profile-card" style={{ pointerEvents: 'none' }}>
      <div className="card-banner skeleton" style={{ borderRadius: 0 }} />
      <div className="card-body">
        <div className="card-avatar-wrap" style={{ marginBottom: 16 }}>
          <div className="skeleton skeleton-avatar" />
          <div className="skeleton skeleton-badge" />
        </div>
        <div className="skeleton skeleton-text" style={{ width: '50%' }} />
        <div className="skeleton skeleton-text-sm" style={{ marginBottom: 12 }} />
        <div className="skeleton skeleton-text-sm" />
        <div className="tag-row" style={{ marginTop: 12 }}>
          <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 5 }} />
          <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 5 }} />
        </div>
        <div className="tag-row">
          <div className="skeleton" style={{ width: 55, height: 22, borderRadius: 5 }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0' }}>
      <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ width: '30%' }} />
        <div className="skeleton skeleton-text-sm" />
      </div>
    </div>
  );
}
