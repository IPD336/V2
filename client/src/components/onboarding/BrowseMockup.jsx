const USERS = [
  { name: 'Rahul Sharma', skills: 'Python · Django', match: 96, color: 'var(--sage)', delay: 0 },
  { name: 'Sara Chen', skills: 'TypeScript · React', match: 88, color: 'var(--indigo)', delay: 300 },
  { name: 'Alex Kim', skills: 'Go · Docker', match: 82, color: 'var(--gold)', delay: 600 },
];

export default function BrowseMockup() {
  return (
    <div className="mockup-browse">
      <div className="mockup-browse-header">
        <span className="mockup-browse-title">Match Results</span>
        <span className="mockup-browse-sub">Sorted by compatibility</span>
      </div>
      {USERS.map((u, i) => (
        <div
          key={i}
          className="mockup-browse-row"
          style={{ animationDelay: `${u.delay}ms` }}
        >
          <div className="mockup-browse-avatar" style={{ background: u.color }}>
            {u.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="mockup-browse-info">
            <div className="mockup-browse-name">{u.name}</div>
            <div className="mockup-browse-skills">{u.skills}</div>
          </div>
          <div className="mockup-browse-score" style={{ color: u.match >= 90 ? 'var(--sage)' : 'var(--accent)' }}>
            <span className="mockup-browse-score-num">{u.match}</span>%
          </div>
          {i === 0 && <span className="mockup-browse-badge">Best Match</span>}
        </div>
      ))}
    </div>
  );
}
