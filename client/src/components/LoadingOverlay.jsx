import Spinner from './Spinner';

export default function LoadingOverlay({ message }) {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <Spinner size={48} />
        {message && <p className="loading-overlay-message">{message}</p>}
      </div>
    </div>
  );
}
