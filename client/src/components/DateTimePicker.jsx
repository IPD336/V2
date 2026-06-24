import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import 'react-day-picker/dist/style.css';

/* ─── Chevron icons (inline SVG, no extra dep) ─── */
function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
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

/* ─── DateTimePicker ─── */
/**
 * Props:
 *  value        – ISO string or ''
 *  onChange     – (isoString) => void
 *  label        – string
 *  allDay       – boolean  (hides time input when true)
 *  min          – ISO string for minimum selectable date (optional)
 *  id           – string
 */
export default function DateTimePicker({ value, onChange, label, allDay = false, min, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Derive date + time from the ISO value */
  const parsedDate = value ? new Date(value) : undefined;
  const validDate = parsedDate && isValid(parsedDate) ? parsedDate : undefined;

  const dateStr  = validDate ? format(validDate, 'dd-MM-yyyy') : '';
  const timeStr  = validDate ? format(validDate, 'HH:mm') : '';

  const minDate = min ? new Date(min) : undefined;

  /* Close on outside click */
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* When a day is selected from the picker */
  function handleDaySelect(day) {
    if (!day) return;
    const existing = validDate || new Date();
    day.setHours(existing.getHours(), existing.getMinutes(), 0, 0);
    onChange(day.toISOString().slice(0, 16));
    setOpen(false);
  }

  /* When the time input changes */
  function handleTimeChange(e) {
    const t = e.target.value; // "HH:mm"
    const base = validDate || new Date();
    const [h, m] = t.split(':').map(Number);
    const next = new Date(base);
    next.setHours(h, m, 0, 0);
    onChange(next.toISOString().slice(0, 16));
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label htmlFor={id} style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {label}
        </label>
      )}

      {/* Trigger row */}
      <div style={{ display: 'flex', gap: 6 }}>
        {/* Date button */}
        <button
          id={id}
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            flex: 1,
            border: '1px solid var(--border)',
            background: 'var(--card-bg)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            color: dateStr ? 'var(--ink)' : 'var(--muted)',
            cursor: 'pointer',
            justifyContent: 'space-between',
            transition: 'border-color 0.15s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarIcon14 />
            {dateStr || 'Select date'}
          </span>
          <ChevronDown />
        </button>

        {/* Time input (hidden when allDay) */}
        {!allDay && (
          <input
            type="time"
            value={timeStr}
            onChange={handleTimeChange}
            style={{
              border: '1px solid var(--border)',
              background: 'var(--card-bg)',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 12,
              color: 'var(--ink)',
              outline: 'none',
              width: 96,
              fontFamily: 'inherit',
              cursor: 'pointer',
              colorScheme: 'dark',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        )}
      </div>

      {/* Popover calendar */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 1000,
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            animation: 'fadeSlideIn 0.15s ease',
          }}
        >
          <DayPicker
            mode="single"
            selected={validDate}
            onSelect={handleDaySelect}
            defaultMonth={validDate}
            disabled={minDate ? { before: minDate } : undefined}
            captionLayout="dropdown"
            fromYear={new Date().getFullYear()}
            toYear={new Date().getFullYear() + 5}
            styles={{
              root: {
                '--rdp-accent-color': 'var(--accent)',
                '--rdp-background-color': 'var(--accent-light)',
                '--rdp-accent-color-dark': 'var(--accent)',
                '--rdp-background-color-dark': 'var(--accent-light)',
                fontFamily: 'inherit',
                fontSize: 13,
                color: 'var(--ink)',
                margin: 0,
              },
              months: { background: 'transparent' },
              month: { background: 'transparent' },
              caption: { color: 'var(--ink)', padding: '0 4px' },
              head_cell: { color: 'var(--muted)', fontWeight: 600, fontSize: 11 },
              day: { borderRadius: 6 },
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rdp { --rdp-cell-size: 36px; }
        .rdp-day_selected, .rdp-day_selected:hover {
          background: var(--accent) !important;
          color: #fff !important;
        }
        .rdp-day_today { font-weight: 700; color: var(--accent) !important; }
        .rdp-button:hover:not(.rdp-day_selected) { background: var(--warm) !important; }
        .rdp-caption_dropdowns select {
          background: var(--card-bg);
          color: var(--ink);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 2px 6px;
          font-size: 12px;
        }
        .rdp-nav_button { color: var(--muted) !important; }
        .rdp-day_disabled { opacity: 0.3; }
      `}</style>
    </div>
  );
}
