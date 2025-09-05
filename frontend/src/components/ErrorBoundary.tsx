import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<any, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Runtime render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-6 border rounded-md bg-red-50 text-red-800">
          <h2 className="font-bold text-lg mb-2">Something went wrong.</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}


