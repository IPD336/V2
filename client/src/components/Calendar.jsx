import { useState, useEffect } from 'react';

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
const DropdownArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);


const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const pad2 = (n) => String(n).padStart(2, '0');

function formatCalTime(hours, minutes, ampm) {
  return `${pad2(hours)}:${pad2(minutes)} ${ampm}`;
}

function combineDateTime(dateObj, timeStr) {
  const [timePart, ampm] = timeStr.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const d = new Date(dateObj);
  d.setHours(h, m, 0, 0);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(h)}:${pad2(m)}`;
}

function nowAmPm() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return { hours: String(h), minutes: String(m).padStart(2, '0'), ampm };
}

function parseInitial(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d;
}

function timeFromDate(d) {
  if (!d) return { hours: '9', minutes: '00', ampm: 'AM' };
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return { hours: String(h), minutes: String(m).padStart(2, '0'), ampm };
}

const overlayS = (isDark) => ({
  position: 'fixed', inset: 0, zIndex: 50,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});
const backdropS = {
  position: 'absolute', inset: 0, pointerEvents: 'auto',
};
const cardS = (isDark) => ({
  pointerEvents: 'auto', position: 'relative', zIndex: 1,
  width: 310,
  background: isDark ? '#1C1C1E' : '#FFFFFF',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
  borderRadius: 24,
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  overflow: 'hidden',
  padding: 18,
  transition: 'background 0.3s, border-color 0.3s',
  animation: 'calFadeIn 0.2s ease',
});
const headerS = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
};
const monthBtnS = {
  display: 'flex', alignItems: 'center', gap: 4,
  fontSize: 17, fontWeight: 600, color: '#FF3B30',
  background: 'none', border: 'none', cursor: 'pointer',
  fontFamily: 'inherit', padding: 0,
  transition: 'opacity 0.15s',
};
const iconBtnS = {
  padding: 6, borderRadius: '50%', color: '#FF3B30',
  background: 'none', border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'inherit',
  transition: 'background 0.15s',
};
const dayHeaderGridS = {
  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '4px 0', marginBottom: 8, textAlign: 'center',
};
const dayHeaderCellS = (isDark) => ({
  fontSize: 10, fontWeight: 700,
  color: isDark ? '#6B6B6B' : '#9CA3AF',
  letterSpacing: '0.05em',
});
const dayGridS = {
  display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '4px 0', justifyItems: 'center',
};
const dayBtnS = (day, now, selected) => {
  const isToday = now &&
    now.getFullYear() === new Date().getFullYear() &&
    now.getMonth() === new Date().getMonth() &&
    now.getDate() === new Date().getDate();
  let bg = 'transparent';
  let color = '#FF3B30';
  let fw = 500;
  let shadow = 'none';
  let scale = 1;
  let z = 0;
  let border = isToday ? '2px solid #FF3B30' : 'none';
  if (selected) {
    bg = '#FF3B30';
    color = '#FFFFFF';
    fw = 600;
    shadow = '0 2px 8px rgba(255,59,48,0.3)';
    scale = 1.05;
    z = 10;
    border = 'none';
  }
  return {
    width: 36, height: 36, borderRadius: '50%', border,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: fw, color,
    background: bg, cursor: 'pointer',
    fontFamily: 'inherit', padding: 0, zIndex: z,
    boxShadow: shadow, transform: `scale(${scale})`,
    transition: 'all 0.15s',
  };
};
const timeRowS = {
  borderTop: '1px solid rgba(0,0,0,0.06)',
  paddingTop: 12, marginTop: 4,
};
const timeLabelS = (isDark) => ({
  fontSize: 17, fontWeight: 600,
  color: isDark ? '#FFFFFF' : '#000000',
  margin: 0,
});
const timeInputWrapS = {
  display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
};
const timeInputGroupS = (isDark) => ({
  display: 'flex', alignItems: 'center',
  background: isDark ? '#2C2C2E' : '#E3E3E8',
  padding: '4px 8px', borderRadius: 8,
  fontSize: 17, fontWeight: 500,
  color: isDark ? '#FFFFFF' : '#000000',
});
const timeFieldS = {
  width: 24, background: 'transparent', textAlign: 'center',
  outline: 'none', fontWeight: 600, border: 'none',
  padding: 0, fontFamily: 'inherit', fontSize: 'inherit',
  color: 'inherit',
};
const ampmGroupS = (isDark) => ({
  display: 'flex', background: isDark ? '#2C2C2E' : '#E3E3E8',
  padding: 2, borderRadius: 8, fontSize: 13, fontWeight: 600,
});
const ampmBtnS = (active, isDark) => ({
  padding: '4px 10px', borderRadius: 6, border: 'none',
  background: active ? (isDark ? '#505054' : '#FFFFFF') : 'transparent',
  color: active ? (isDark ? '#FFFFFF' : '#000000') : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'),
  cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit',
  fontWeight: 600, boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  transition: 'all 0.15s',
});
const doneBtnS = {
  width: '100%', marginTop: 12,
  padding: '12px', borderRadius: 12, border: 'none',
  background: '#FF3B30', color: 'white',
  fontSize: 15, fontWeight: 600, cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'opacity 0.15s',
};
const dropdownOverlayS = (isDark) => ({
  position: 'absolute', inset: 0, zIndex: 30,
  display: 'flex', flexDirection: 'column', padding: 12,
  borderRadius: 18,
  background: isDark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(12px)',
});
const rangeFillS = {
  background: 'rgba(255,59,48,0.12)', borderRadius: 0,
};
const rangeStartS = {
  background: '#FF3B30', color: '#FFFFFF',
  borderRadius: '50%', position: 'relative', zIndex: 10,
};
const rangeEndS = {
  background: '#FF3B30', color: '#FFFFFF',
  borderRadius: '50%', position: 'relative', zIndex: 10,
};

const timeSepS = { opacity: 0.7 };

export function Calendar({ isOpen, onClose, onSelect, mode = 'single', initialDate, initialStart, initialEnd, minDate }) {
  const [isDark, setIsDark] = useState(false);

  const defaultNow = new Date();
  const initD = mode === 'single'
    ? (parseInitial(initialDate) || defaultNow)
    : null;
  const initS = mode === 'range'
    ? (parseInitial(initialStart) || defaultNow)
    : null;
  const initE = mode === 'range' && initialEnd
    ? (parseInitial(initialEnd) || new Date(initS.getTime() + 60 * 60 * 1000))
    : (mode === 'range' ? new Date(defaultNow.getTime() + 60 * 60 * 1000) : null);

  const [viewYear, setViewYear] = useState(initD?.getFullYear() || initS?.getFullYear() || defaultNow.getFullYear());
  const [viewMonth, setViewMonth] = useState(initD?.getMonth() || initS?.getMonth() || defaultNow.getMonth());
  const [selectedDay, setSelectedDay] = useState(initD?.getDate() || null);
  const [rangeStart, setRangeStart] = useState(initS || null);
  const [rangeEnd, setRangeEnd] = useState(initE || null);
  const [showDropdown, setShowDropdown] = useState(false);

  const singleTime = timeFromDate(initD);
  const [hours, setHours] = useState(singleTime.hours);
  const [minutes, setMinutes] = useState(singleTime.minutes);
  const [ampm, setAmpm] = useState(singleTime.ampm);

  const startTime = timeFromDate(initS);
  const [startHours, setStartHours] = useState(startTime.hours);
  const [startMinutes, setStartMinutes] = useState(startTime.minutes);
  const [startAmpm, setStartAmpm] = useState(startTime.ampm);

  const endTime = timeFromDate(initE);
  const [endHours, setEndHours] = useState(endTime.hours);
  const [endMinutes, setEndMinutes] = useState(endTime.minutes);
  const [endAmpm, setEndAmpm] = useState(endTime.ampm);

  const parsedMin = minDate ? parseInitial(typeof minDate === 'string' ? minDate : undefined) || minDate : null;

  useEffect(() => {
    if (!isOpen) return;
    const theme = document.documentElement.getAttribute('data-theme');
    setIsDark(theme === 'dark');
  }, [isOpen]);

  useEffect(() => { if (!isOpen) { setShowDropdown(false); } }, [isOpen]);

  if (!isOpen) return null;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else { setViewMonth(m => m - 1); }
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else { setViewMonth(m => m + 1); }
  }

  function isSelectedDay(day) {
    if (mode === 'single') return day === selectedDay;
    if (mode === 'range') {
      if (!rangeStart) return false;
      const d = new Date(viewYear, viewMonth, day);
      if (rangeEnd) {
        return d >= rangeStart && d <= rangeEnd;
      }
      return d.getTime() === rangeStart.getTime();
    }
    return false;
  }

  function isRangeStart(day) {
    if (mode !== 'range' || !rangeStart) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d.getTime() === rangeStart.getTime();
  }

  function isRangeEnd(day) {
    if (mode !== 'range' || !rangeEnd) return false;
    const d = new Date(viewYear, viewMonth, day);
    return d.getTime() === rangeEnd.getTime();
  }

  function handleDayClick(day) {
    const d = new Date(viewYear, viewMonth, day);
    if (parsedMin && d < parsedMin) return;
    if (mode === 'single') {
      setSelectedDay(day);
      onSelect?.({ date: d, time: formatCalTime(hours, minutes, ampm) });
      onClose();
      return;
    } else {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(d);
        setRangeEnd(null);
      } else {
        if (d < rangeStart) {
          setRangeStart(d);
          setRangeEnd(null);
        } else {
          setRangeEnd(d);
        }
      }
    }
  }

  function handleDone() {
    if (mode === 'single') {
      const d = new Date(viewYear, viewMonth, selectedDay || 1);
      onSelect?.({ date: d, time: formatCalTime(hours, minutes, ampm) });
    } else {
      if (rangeStart && rangeEnd) {
        const s = new Date(rangeStart);
        const e = new Date(rangeEnd);
        onSelect?.({
          start: { date: s, time: formatCalTime(startHours, startMinutes, startAmpm) },
          end: { date: e, time: formatCalTime(endHours, endMinutes, endAmpm) },
        });
      }
    }
    onClose();
  }

  function handleTimeChange(setter) {
    return (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 2) val = val.slice(0, 2);
      setter(val);
    };
  }

  function renderDays() {
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`e-${i}`} style={{ width: 36, height: 36 }} />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const disabled = parsedMin && d < parsedMin;
      const sel = isSelectedDay(day);
      const rStart = isRangeStart(day);
      const rEnd = isRangeEnd(day);
      const isToday =
        d.getDate() === new Date().getDate() &&
        d.getMonth() === new Date().getMonth() &&
        d.getFullYear() === new Date().getFullYear();

      let cellStyle = { ...dayBtnS(day, d, sel) };
      let wrapS = null;

      if (mode === 'range' && rangeStart && !rangeEnd && sel && day !== rangeStart.getDate()) {
        wrapS = { ...rangeFillS };
      } else if (mode === 'range' && rangeStart && rangeEnd && sel) {
        if (rStart) {
          cellStyle = { ...cellStyle, ...rangeStartS, transform: 'scale(1.05)', boxShadow: '0 2px 8px rgba(255,59,48,0.3)' };
        } else if (rEnd) {
          cellStyle = { ...cellStyle, ...rangeEndS, transform: 'scale(1.05)', boxShadow: '0 2px 8px rgba(255,59,48,0.3)' };
        } else {
          wrapS = { ...rangeFillS };
        }
      }

      if (sel && mode === 'single') {
        cellStyle = { ...cellStyle, transform: 'scale(1.05)', boxShadow: '0 2px 8px rgba(255,59,48,0.3)' };
      }

      if (disabled) {
        cellStyle = { ...cellStyle, opacity: 0.2, cursor: 'default', transform: 'none', boxShadow: 'none' };
      }

      days.push(
        <div key={`d-${day}`} style={wrapS || (sel && mode === 'range' && !rStart && !rEnd ? rangeFillS : undefined)}>
          <button
            type="button"
            onClick={() => handleDayClick(day)}
            style={cellStyle}
            disabled={disabled}
            onMouseEnter={e => { if (!sel) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'; }}
            onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
          >
            {day}
          </button>
        </div>
      );
    }
    return days;
  }

  function renderTimeRow(label, hVal, mVal, ampmVal, onH, onM, onA) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)', minWidth: 40 }}>{label}</span>
        <div style={timeInputGroupS(isDark)}>
          <input type="text" value={hVal} onChange={onH} placeholder="00" style={timeFieldS} />
          <span style={timeSepS}>:</span>
          <input type="text" value={mVal} onChange={onM} placeholder="00" style={timeFieldS} />
        </div>
        <div style={ampmGroupS(isDark)}>
          <button type="button" onClick={() => onA('AM')} style={ampmBtnS(ampmVal === 'AM', isDark)}>AM</button>
          <button type="button" onClick={() => onA('PM')} style={ampmBtnS(ampmVal === 'PM', isDark)}>PM</button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayS(isDark)}>
      <style>{`@keyframes calFadeIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
      <div style={backdropS} onClick={onClose} />
      <div style={cardS(isDark)}>
        {/* Header */}
        <div style={headerS}>
          <button type="button" onClick={() => setShowDropdown(!showDropdown)} style={monthBtnS}>
            <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <div style={{ transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              <DropdownArrowIcon />
            </div>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button type="button" onClick={prevMonth} style={iconBtnS}><ChevronLeftIcon /></button>
            <button type="button" onClick={nextMonth} style={iconBtnS}><ChevronRightIcon /></button>
          </div>
        </div>

        {/* Weekday headers */}
        <div style={dayHeaderGridS}>
          {WEEKDAYS.map(d => <div key={d} style={dayHeaderCellS(isDark)}>{d}</div>)}
        </div>

        {/* Day grid + dropdown */}
        <div style={{ position: 'relative', minHeight: 216, marginBottom: 4 }}>
          <div style={{ ...dayGridS, position: 'absolute', width: '100%', zIndex: 10 }}>
            {renderDays()}
          </div>
          {showDropdown && (
            <div style={{ ...dropdownOverlayS(isDark), position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, paddingBottom: 8 }}>
                <button type="button" onClick={() => setViewYear(y => y - 1)} style={iconBtnS}><ChevronLeftIcon /></button>
                <span style={{ fontWeight: 700, fontSize: 16, color: isDark ? '#FFFFFF' : '#000000' }}>{viewYear}</span>
                <button type="button" onClick={() => setViewYear(y => y + 1)} style={iconBtnS}><ChevronRightIcon /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, overflowY: 'auto', flex: 1 }}>
                {MONTH_NAMES.map((m, idx) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => { setViewMonth(idx); setShowDropdown(false); }}
                    style={{
                      padding: '6px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: idx === viewMonth ? '#FF3B30' : 'transparent',
                      color: idx === viewMonth ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#000000'),
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (idx !== viewMonth) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'; }}
                    onMouseLeave={e => { if (idx !== viewMonth) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Time section */}
        <div>
          {mode === 'range' ? (
            <>
              <div style={timeRowS}>
                {renderTimeRow('Start', startHours, startMinutes, startAmpm,
                  handleTimeChange((v) => {
                    const num = parseInt(v);
                    if (num > 12) v = '12';
                    setStartHours(v);
                  }),
                  handleTimeChange((v) => {
                    const num = parseInt(v);
                    if (num > 59) v = '59';
                    setStartMinutes(v);
                  }),
                  setStartAmpm
                )}
              </div>
              <div style={{ ...timeRowS, borderTop: 'none', paddingTop: 8 }}>
                {renderTimeRow('End', endHours, endMinutes, endAmpm,
                  handleTimeChange((v) => {
                    const num = parseInt(v);
                    if (num > 12) v = '12';
                    setEndHours(v);
                  }),
                  handleTimeChange((v) => {
                    const num = parseInt(v);
                    if (num > 59) v = '59';
                    setEndMinutes(v);
                  }),
                  setEndAmpm
                )}
              </div>
            </>
          ) : (
            <div style={timeRowS}>
              <p style={timeLabelS(isDark)}>Time</p>
              <div style={timeInputWrapS}>
                <div style={timeInputGroupS(isDark)}>
                  <input type="text" value={hours} onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length > 2) v = v.slice(0, 2);
                    const num = parseInt(v);
                    if (num > 12) v = '12';
                    setHours(v);
                  }} placeholder="00" style={timeFieldS} />
                  <span style={timeSepS}>:</span>
                  <input type="text" value={minutes} onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '');
                    if (v.length > 2) v = v.slice(0, 2);
                    const num = parseInt(v);
                    if (num > 59) v = '59';
                    setMinutes(v);
                  }} placeholder="00" style={timeFieldS} />
                </div>
                <div style={ampmGroupS(isDark)}>
                  <button type="button" onClick={() => setAmpm('AM')} style={ampmBtnS(ampm === 'AM', isDark)}>AM</button>
                  <button type="button" onClick={() => setAmpm('PM')} style={ampmBtnS(ampm === 'PM', isDark)}>PM</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Done button */}
        {mode === 'range' && (
          <button
            type="button"
            onClick={handleDone}
            style={{
              ...doneBtnS,
              opacity: rangeStart && rangeEnd ? 1 : 0.5,
              cursor: rangeStart && rangeEnd ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => { if (rangeStart && rangeEnd) e.currentTarget.style.opacity = 0.85; }}
            onMouseLeave={e => { if (rangeStart && rangeEnd) e.currentTarget.style.opacity = 1; }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
