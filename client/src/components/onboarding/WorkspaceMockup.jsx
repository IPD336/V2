const MESSAGES = [
  { from: 'them', text: 'Hey! Ready for our Go session?', delay: 0 },
  { from: 'me', text: 'Yes! Let me share my screen', delay: 800 },
  { from: 'them', text: 'Great, I\'ll start with goroutines', delay: 1600 },
];

const GOALS = [
  { text: 'Learn goroutines', done: true, delay: 1200 },
  { text: 'Build REST API', done: true, delay: 2000 },
  { text: 'Deploy with Docker', done: false, delay: 0 },
];

export default function WorkspaceMockup() {
  return (
    <div className="mockup-workspace">
      <div className="mockup-ws-chat">
        <div className="mockup-ws-chat-header">
          <span className="mockup-ws-online" /> Python ↔ Go Swap
        </div>
        <div className="mockup-ws-messages">
          {MESSAGES.map((m, i) => (
            <div
              key={i}
              className={`mockup-ws-bubble mockup-ws-bubble-${m.from}`}
              style={{ animationDelay: `${m.delay}ms` }}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="mockup-ws-input">
          <span>Type a message...</span>
          <span className="mockup-ws-send">↑</span>
        </div>
      </div>
      <div className="mockup-ws-goals">
        <div className="mockup-ws-goals-title">Goals</div>
        {GOALS.map((g, i) => (
          <div
            key={i}
            className="mockup-ws-goal"
            style={{ animationDelay: `${g.delay}ms` }}
          >
            <span className={`mockup-ws-check ${g.done ? 'done' : ''}`}>
              {g.done && '✓'}
            </span>
            <span className={g.done ? 'mockup-ws-goal-done' : ''}>{g.text}</span>
          </div>
        ))}
        <div className="mockup-ws-progress">
          <div className="mockup-ws-progress-track">
            <div className="mockup-ws-progress-fill" />
          </div>
          <span className="mockup-ws-progress-label">2/3 complete</span>
        </div>
      </div>
    </div>
  );
}
