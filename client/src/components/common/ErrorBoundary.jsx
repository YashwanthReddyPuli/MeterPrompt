import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-24 px-6 min-h-screen bg-[#fafafa]">
          <h1 className="text-4xl font-extrabold text-zinc-900 mb-3 tracking-tight">Something Went Wrong</h1>
          <p className="text-sm text-zinc-500 mb-6 max-w-md">
            An unexpected application error occurred. Click below to clear corrupt state and return to home.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-5 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}