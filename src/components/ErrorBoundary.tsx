import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
          <div className="max-w-md w-full bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-bold text-red-500 mb-4">Something went wrong</h2>
            <div className="bg-zinc-950 p-4 rounded-lg overflow-auto max-h-64 text-sm font-mono text-zinc-300">
              {this.state.error?.message}
            </div>
            <button
              className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
