import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      return (
        <div className="flex-1 flex items-center justify-center bg-surface-container-lowest p-4">
          <div className="max-w-md w-full bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-4xl text-error">error</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Terjadi Kesalahan</h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Halaman ini mengalami masalah. Silakan coba muat ulang atau kembali ke dashboard.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="font-label-md text-label-md text-primary cursor-pointer">Detail Error</summary>
                <pre className="mt-2 p-3 bg-surface-container-lowest rounded-lg text-xs text-on-surface-variant overflow-auto max-h-40 border border-outline-variant/50">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 h-10 px-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => { window.location.href = '#/'; }}
                className="flex-1 h-10 px-4 bg-surface border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
              >
                Ke Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
