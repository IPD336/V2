import { useState } from 'react';
import { CATEGORIES_NOALL as CATEGORIES } from '../utils';

const chipColors = ['#C84B31', '#3A6351', '#B8902A', '#5B7DB1', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function StructuredSkillInput({ skills, onChange, colorClass = '' }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const add = () => {
    if (name.trim()) {
      onChange([...skills, { name: name.trim(), category }]);
      setName('');
    }
  };

  const remove = (i) => onChange(skills.filter((_, idx) => idx !== i));

  return (
    <div className="structured-skill-input">
      <div className="chips-container" style={{ marginBottom: 12 }}>
        {skills.map((s, i) => (
          <span key={i} className={`chip ${colorClass}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: s.verified ? 'var(--sage-light)' : '',
            transition: 'transform 0.15s, box-shadow 0.15s',
            cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: chipColors[CATEGORIES.indexOf(s.category) % chipColors.length],
              flexShrink: 0,
            }} />
            <strong>{s.name}</strong>
            {s.verified && <span title="GitHub Verified" style={{ color: 'var(--sage)', fontSize: 11, fontWeight: 700, background: 'white', borderRadius: 4, padding: '0 4px' }}>✓</span>}
            <button className="chip-x" type="button" onClick={() => remove(i)}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input 
          className="form-input" 
          placeholder="Skill name (e.g. React)" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
        />
        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: 140 }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" className="btn-cosmos btn-cosmos-primary" onClick={add} style={{ padding: '0 20px', fontSize: 11, whiteSpace: 'nowrap' }}>+ Add</button>
      </div>
    </div>
  );
}
