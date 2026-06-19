import { Component } from 'react';
import { WarningIcon } from './Icons';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
          <div style={{ textAlign: 'center', padding: '80px 24px', maxWidth: 480 }}>
            <div style={{ marginBottom: 16 }}><WarningIcon size={48} style={{ color: 'var(--accent)' }} /></div>
            <h2 style={{ fontFamily: 'PT Serif, serif', fontSize: 28, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button className="btn-ink" onClick={this.handleReset} style={{ padding: '12px 28px' }}>
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
