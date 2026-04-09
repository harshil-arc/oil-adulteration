import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Hardware Crash]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-white font-bold text-lg mb-2">Connection Interface Crash</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xs">
            The hardware bridge encountered an unhandled error. This usually happens due to browser security restrictions.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} />
            RELAY MODULE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
