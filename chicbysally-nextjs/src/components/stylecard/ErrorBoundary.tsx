"use client";

import { Component, ReactNode, useState } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log the error to console for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    
    // Reset error state if resetKeys have changed
    if (resetKeys && prevProps.resetKeys !== resetKeys) {
      if (this.hasResetKeysChanged(prevProps.resetKeys, resetKeys)) {
        this.resetErrorBoundary();
      }
    }
    
    // Reset error state if any props have changed and resetOnPropsChange is true
    if (resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  private hasResetKeysChanged(prevResetKeys: Array<string | number> = [], currentResetKeys: Array<string | number> = []) {
    if (prevResetKeys.length !== currentResetKeys.length) {
      return true;
    }
    
    return !prevResetKeys.every((key, index) => key === currentResetKeys[index]);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="mb-4">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500"></i>
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-red-600 mb-4">
              We encountered an unexpected error while processing your StyleCard. 
              Please try again or contact support if the problem persists.
            </p>
            
            {/* Show error details in development mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-red-700 font-medium mb-2">
                  Error Details (Development Mode)
                </summary>
                <div className="bg-red-100 p-3 rounded text-sm font-mono overflow-auto">
                  <p className="font-semibold">{this.state.error.name}: {this.state.error.message}</p>
                  <pre className="mt-2 text-xs">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 text-xs">
                      Component Stack: {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex justify-center gap-3">
              <button
                onClick={this.resetErrorBoundary}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-300"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="border border-red-300 text-red-700 px-6 py-2 rounded-lg hover:bg-red-50 transition duration-300"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    // Log the error
    console.error("Error caught by useErrorHandler:", error, errorInfo);
    
    // You could also send the error to an error tracking service here
    // For example: Sentry.captureException(error, { extra: errorInfo });
    
    // For now, we'll just throw the error to be caught by the nearest ErrorBoundary
    throw error;
  };
}

// Component for handling async errors in promises
interface AsyncErrorBoundaryProps {
  children: (error: Error | null, reset: () => void) => ReactNode;
}

export function AsyncErrorBoundary({ children }: AsyncErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  const reset = () => {
    setError(null);
  };

  const handleError = (err: Error) => {
    setError(err);
  };

  // Wrap the children in a try-catch for async operations
  const wrappedChildren = children(error, reset);

  return (
    <ErrorBoundary
      onError={(err, errorInfo) => {
        handleError(err);
      }}
      resetKeys={[error ? error.message : '']}
    >
      {wrappedChildren}
    </ErrorBoundary>
  );
}
