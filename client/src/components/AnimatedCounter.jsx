import { useState, useEffect, useRef, useMemo } from 'react';

function rawParseValue(str) {
  const cleaned = str.replace(/,/g, '');
  const num = parseInt(cleaned, 10);
  const suffix = str.replace(/[\d,]/g, '');
  return { num, suffix };
}

export default function AnimatedCounter({ value, duration = 1500, ...props }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);
  const rafId = useRef(null);

  const { suffix } = useMemo(() => rawParseValue(value), [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const { num } = rawParseValue(value);
          const start = performance.now();
          const frame = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) * (1 - progress);
            setDisplay(Math.round(eased * num));
            if (progress < 1) {
              rafId.current = requestAnimationFrame(frame);
            }
          };
          rafId.current = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [value, duration]);

  const formatted = display.toLocaleString();

  return (
    <span ref={ref} {...props}>
      {formatted}{suffix}
    </span>
  );
}
