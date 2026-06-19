import { useEffect, useState, useRef } from 'react';

const COLORS_CELEBRATION = ['#C84B31', '#3A6351', '#B8902A', '#3B4F8C', '#7A5FA8', '#FFD700', '#FF6B6B', '#4ECDC4'];
const PIECES = 60;

export default function Confetti({ active, duration = 3000 }) {
  const [pieces, setPieces] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }

    const newPieces = Array.from({ length: PIECES }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS_CELEBRATION[i % COLORS_CELEBRATION.length],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      shape: Math.random() > 0.5 ? '50%' : '2px',
    }));

    setPieces(newPieces);

    timerRef.current = setTimeout(() => setPieces([]), duration);
    return () => clearTimeout(timerRef.current);
  }, [active, duration]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
