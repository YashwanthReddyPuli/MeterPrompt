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
        <div className="flex flex-col items-center justify-center text-center py-24 px-6 min-h-screen">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Something Went Wrong</h1>
          <p className="text-xl text-gray-600 mb-6">
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}