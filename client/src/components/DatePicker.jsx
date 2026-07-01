import { useState, useRef, useEffect } from 'react';
import { Calendar } from './Calendar';

function CalendarIcon14() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const styles = `
.dp-trigger {
  display: flex; align-items: center; gap: 6px;
  flex: 1; border: 1px solid var(--border);
  background: var(--card-bg); border-radius: 8px;
  padding: 8px 12px; font-size: 12px;
  color: var(--ink); cursor: pointer;
  font-family: inherit; transition: border-color 0.15s;
}
.dp-trigger:hover { border-color: var(--accent); }
.dp-trigger:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.dp-trigger-placeholder { color: var(--muted); }
.dp-label {
  font-size: 10px; color: var(--muted);
  font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.8px;
}
`;

function formatDateTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function combineDateTime(date, time) {
  const [timePart, ampm] = time.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  const pad2 = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(h)}:${pad2(m)}`;
}

export function DatePicker({ value, label, onChange, min, style: containerStyle, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSelect({ date, time }) {
    const iso = combineDateTime(date, time);
    onChange?.(iso);
    setOpen(false);
  }

  return (
    <div ref={ref} className={className} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, ...containerStyle }}>
      {label && <label className="dp-label">{label}</label>}
      <button type="button" className="dp-trigger" onClick={() => setOpen(o => !o)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <CalendarIcon14 />
          {value ? formatDateTime(value) : <span className="dp-trigger-placeholder">Select date & time</span>}
        </span>
        <ChevronDownIcon />
      </button>
      <Calendar
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
        mode="single"
        initialDate={value || undefined}
        minDate={min}
      />
      <style>{styles}</style>
    </div>
  );
}

export function DateRangePicker({ value, label, onChange, min, style: containerStyle, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSelect({ start, end }) {
    const startIso = combineDateTime(start.date, start.time);
    const endIso = combineDateTime(end.date, end.time);
    onChange?.({ start: startIso, end: endIso });
    setOpen(false);
  }

  function formatRange() {
    if (!value?.start) return '';
    const s = formatDateTime(value.start);
    if (!value?.end) return s;
    return `${s} – ${formatDateTime(value.end)}`;
  }

  return (
    <div ref={ref} className={className} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, ...containerStyle }}>
      {label && <label className="dp-label">{label}</label>}
      <button type="button" className="dp-trigger" onClick={() => setOpen(o => !o)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <CalendarIcon14 />
          {value?.start ? formatRange() : <span className="dp-trigger-placeholder">Select date & time range</span>}
        </span>
        <ChevronDownIcon />
      </button>
      <Calendar
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
        mode="range"
        initialStart={value?.start || undefined}
        initialEnd={value?.end || undefined}
        minDate={min}
      />
      <style>{styles}</style>
    </div>
  );
}
