import React from 'react';
import './DocumentStyles.css';

/**
 * Error Display Component
 * Provides standardized error messaging for document loading issues
 */
const ErrorDisplay = ({ error, onRetry }) => (
  <div className="error-container">
    <div className="error-icon">⚠️</div>
    <h3>Document Loading Error</h3>
    <p>{error || "There was a problem loading this document."}</p>
    {onRetry && (
      <button className="retry-button" onClick={onRetry}>
        Retry Loading
      </button>
    )}
  </div>
);

export default ErrorDisplay;
