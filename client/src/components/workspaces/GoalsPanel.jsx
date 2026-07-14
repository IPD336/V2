import { TargetIcon } from '../Icons';

function GoalItem({ goal, handleToggleGoal }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: goal.completed ? 'var(--muted)' : 'var(--ink)', textDecoration: goal.completed ? 'line-through' : 'none', cursor: 'pointer', padding: '4px 0' }}
      onClick={() => handleToggleGoal(goal._id)}
    >
      <div style={{ width: 18, height: 18, borderRadius: 4, border: goal.completed ? 'none' : '1.5px solid var(--border)', background: goal.completed ? 'var(--sage)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, flexShrink: 0, marginTop: 1 }}>
        {goal.completed && '✓'}
      </div>
      <span style={{ wordBreak: 'break-word' }}>{goal.text}</span>
    </div>
  );
}

export default function GoalsPanel({ currentGoals, handleToggleGoal, handleAddGoal, mobileTab, setMobileTab }) {
  return (
    <>
      {/* Desktop panel */}
      <div style={{ width: 320, borderLeft: '1px solid var(--border)', background: 'var(--card-bg)', padding: 24, display: 'flex', flexDirection: 'column', flexShrink: 0 }} className="hide-mobile">
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><TargetIcon size={14} />Collaborative Goals</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {currentGoals.map(goal => <GoalItem key={goal._id} goal={goal} handleToggleGoal={handleToggleGoal} />)}
          </div>
          <input className="form-input" placeholder="+ Add a goal..." onKeyDown={handleAddGoal} style={{ fontSize: 12, padding: '8px 12px', background: 'var(--cream)', borderRadius: 8 }} />
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>Press Enter to add. Synchronized in real-time!</p>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileTab === 'goals' && (
        <div className="hide-desktop" style={{ position: 'absolute', top: 68, left: 0, right: 0, bottom: 0, background: 'var(--card-bg)', overflowY: 'auto', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--card-bg)', position: 'sticky', top: 0, zIndex: 1 }}>
            <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setMobileTab('chat')}>← Chat</button>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}><TargetIcon size={16} />Goals</h4>
          </div>
          <div style={{ padding: 20, flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {currentGoals.map(goal => (
                <div key={goal._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: goal.completed ? 'var(--muted)' : 'var(--ink)', textDecoration: goal.completed ? 'line-through' : 'none', cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--border)' }} onClick={() => handleToggleGoal(goal._id)}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: goal.completed ? 'none' : '1.5px solid var(--border)', background: goal.completed ? 'var(--sage)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, flexShrink: 0 }}>
                    {goal.completed && '✓'}
                  </div>
                  <span style={{ wordBreak: 'break-word' }}>{goal.text}</span>
                </div>
              ))}
              {currentGoals.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No goals yet. Add one below!</div>}
            </div>
            <input className="form-input" placeholder="+ Add a goal and press Enter..." onKeyDown={handleAddGoal} style={{ fontSize: 13, padding: '10px 14px', background: 'var(--cream)', borderRadius: 8 }} />
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Synchronized in real-time with your partner!</p>
          </div>
        </div>
      )}
    </>
  );
}
