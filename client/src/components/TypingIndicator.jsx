import '../styles/typing.css';

export default function TypingIndicator({ message = "AI is thinking..." }) {
  return (
    <div className="typing-indicator">
      <span className="typing-message">{message}</span>
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
