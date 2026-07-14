import { CheckIcon } from '../Icons';

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile', 'AI/ML', 'Programming Languages'];

export default function CompletionModal({ completedSkill, selectedCategory, setSelectedCategory, handleAddSkill, setShowCompletionModal }) {
  return (
    <div className="modal-overlay active">
      <div className="modal-content" style={{ maxWidth: 450, textAlign: 'center', padding: 40, background: 'var(--card-bg)', borderRadius: 16, boxShadow: 'var(--shadow-lg)', position: 'relative' }}>
        <div style={{ marginBottom: 20 }}><CheckIcon size={64} style={{ color: 'var(--accent)' }} /></div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--ink)' }}>Congratulations!</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 32 }}>
          You've successfully completed your swap and learned <strong>{completedSkill}</strong>.
          Would you like to add it to your offered skills so you can mentor others?
        </p>
        <div style={{ textAlign: 'left', marginBottom: 32 }}>
          <label className="form-label">Select Category for {completedSkill}</label>
          <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ background: 'var(--cream)' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-cosmos-primary" style={{ marginTop: 0 }} onClick={handleAddSkill}>Yes, add it!</button>
          <button className="btn-ghost" onClick={() => setShowCompletionModal(false)}>Not now</button>
        </div>
      </div>
    </div>
  );
}
