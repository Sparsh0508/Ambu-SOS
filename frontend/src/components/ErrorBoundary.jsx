import { Component } from "react";
import { MaterialIcon } from "./ui/MaterialIcon";
import { Button } from "./ui/Button";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error details in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container">
                <MaterialIcon name="error" className="text-3xl text-error" />
              </div>
            </div>

            <h1 className="mb-2 text-headline-lg text-on-surface">Something Went Wrong</h1>

            <p className="mb-6 text-body-md text-on-surface-variant">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-6 rounded-lg bg-error-container/20 p-4 text-left">
                <p className="text-label-sm font-mono text-error">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-label-sm text-secondary hover:text-on-surface">
                      Show details
                    </summary>
                    <pre className="mt-2 max-h-40 overflow-auto text-label-xs text-secondary">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
              <Button
                className="flex-1"
                onClick={this.handleReset}
              >
                Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
