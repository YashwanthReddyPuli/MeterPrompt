import React from 'react';
import { AlertTriangle } from 'lucide-react';
import ErrorLayout from '../../pages/errors/ErrorLayout';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Boundary Exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorLayout 
          code="500" 
          title="Application Encountered an Error" 
          description={this.state.error?.message || "A client-side exception occurred. Refreshing the session should resolve the rendering issue."} 
          icon={AlertTriangle} 
          actionText="Reload Workspace" 
          onAction={() => {
            this.setState({ hasError: false, error: null });
            window.location.href = '/console';
          }} 
        />
      );
    }
    return this.props.children;
  }
}