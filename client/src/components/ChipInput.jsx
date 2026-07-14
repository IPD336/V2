import { useState } from 'react';

export default function ChipInput({ chips, onChange, colorClass = '' }) {
  const [val, setVal] = useState('');
  const add = (e) => {
    if (e.key === 'Enter' && val.trim()) {
      e.preventDefault();
      onChange([...chips, val.trim()]);
      setVal('');
    }
  };
  const remove = (i) => onChange(chips.filter((_, idx) => idx !== i));
  return (
    <>
      <div className="chips-container">
        {chips.map((c, i) => (
          <span key={i} className={`chip ${colorClass}`}>
            {c} <button className="chip-x" type="button" onClick={() => remove(i)}>×</button>
          </span>
        ))}
      </div>
      <input className="form-input" style={{ marginTop: 8 }} placeholder="Type and press Enter" value={val}
        onChange={(e) => setVal(e.target.value)} onKeyDown={add} />
    </>
  );
}
