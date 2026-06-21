export default function Spinner({ size = 36, className = '' }) {
  return (
    <div
      className={`spinner ${className}`}
      style={{ '--spinner-size': `${size}px` }}
    />
  );
}
