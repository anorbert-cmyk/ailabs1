import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Render error caught:', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-off-white p-8">
          <div className="max-w-md w-full bg-white rounded-lg border border-border-hairline shadow-sm p-8 text-center">
            <span className="material-symbols-outlined text-[48px] text-charcoal-muted mb-4 block">
              error_outline
            </span>
            <h2 className="text-lg font-bold text-charcoal mb-2 font-mono">
              Something went wrong
            </h2>
            <p className="text-sm text-charcoal-muted mb-6 font-mono">
              {this.state.error?.message
                ? this.state.error.message.length > 200
                  ? this.state.error.message.slice(0, 200) + '...'
                  : this.state.error.message
                : 'An unexpected error occurred while rendering.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-2 bg-charcoal text-white text-xs font-bold font-mono uppercase tracking-widest rounded-sm hover:bg-charcoal/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
