import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened. Please try again.</p>
            
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="retry-button"
              >
                Try Again
              </button>
              <button 
                onClick={this.handleReload}
                className="reload-button"
              >
                Reload Page
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>

          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .error-content {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 500px;
              width: 100%;
            }
            
            .error-icon {
              color: #e74c3c;
              margin-bottom: 20px;
            }
            
            .error-content h2 {
              color: #2c3e50;
              margin-bottom: 10px;
              font-size: 24px;
            }
            
            .error-content p {
              color: #7f8c8d;
              margin-bottom: 30px;
              line-height: 1.6;
            }
            
            .error-actions {
              display: flex;
              gap: 15px;
              justify-content: center;
              margin-bottom: 20px;
            }
            
            .retry-button, .reload-button {
              padding: 12px 24px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              transition: all 0.3s ease;
            }
            
            .retry-button {
              background: #3498db;
              color: white;
            }
            
            .retry-button:hover {
              background: #2980b9;
            }
            
            .reload-button {
              background: #ecf0f1;
              color: #2c3e50;
            }
            
            .reload-button:hover {
              background: #bdc3c7;
            }
            
            .error-details {
              margin-top: 20px;
              text-align: left;
            }
            
            .error-details summary {
              cursor: pointer;
              color: #7f8c8d;
              font-weight: 600;
              margin-bottom: 10px;
            }
            
            .error-details pre {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              font-size: 12px;
              overflow-x: auto;
              color: #e74c3c;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 