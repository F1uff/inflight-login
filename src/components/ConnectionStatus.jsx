import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(null);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(300000); // Start with 5 minutes to avoid rate limiting
  const [rateLimited, setRateLimited] = useState(false);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      const startTime = Date.now();
      const healthData = await apiService.healthCheck();
      const responseTime = Date.now() - startTime;
      
      if (healthData.status === 'OK') {
        setStatus('connected');
        setLastCheck(new Date());
        setRateLimited(false);
        setPollingInterval(30000); // Reset to normal interval
        
        // Log performance metrics (development only)
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_API === 'true') {
          if (responseTime > 1000) {
            console.warn(`⚠️ Slow health check response: ${responseTime}ms`);
          } else {
            console.log(`✅ Health check: ${responseTime}ms`);
          }
        }
      } else {
        setStatus('error');
        setError('Health check failed');
      }
    } catch (err) {
      console.error('Connection check failed:', err);
      
      // Handle rate limiting
      if (err.message.includes('Too many requests') || err.message.includes('429')) {
        setStatus('error');
        setError('Rate limited - reducing check frequency');
        setRateLimited(true);
        setPollingInterval(300000); // Increase to 5 minutes when rate limited
      } else if (err.message.includes('CONNECTION_ERROR')) {
        setStatus('disconnected');
        setError('Cannot connect to server');
        setRateLimited(false);
      } else if (err.message.includes('TIMEOUT_ERROR')) {
        setStatus('error');
        setError('Request timeout');
        setRateLimited(false);
      } else {
        setStatus('disconnected');
        setError(err.message);
        setRateLimited(false);
      }
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Dynamic polling interval based on rate limiting status
    const interval = setInterval(checkConnection, pollingInterval);
    
    return () => clearInterval(interval);
  }, [pollingInterval]); // Re-create interval when pollingInterval changes

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#28a745';
      case 'checking': return '#ffc107';
      case 'disconnected': 
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = () => {
    if (rateLimited) {
      return 'Rate Limited - Reduced Frequency';
    }
    
    switch (status) {
      case 'connected': return 'Database Connected';
      case 'checking': return 'Checking Connection...';
      case 'disconnected': return 'Database Disconnected';
      case 'error': return 'Connection Error';
      default: return 'Unknown Status';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'checking':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z">
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </path>
          </svg>
        );
      case 'disconnected':
      case 'error':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const handleManualCheck = () => {
    // Allow manual checks but with throttling
    if (status !== 'checking') {
      checkConnection();
    }
  };

  return (
    <div 
      className="connection-status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        color: getStatusColor(),
        fontSize: '12px',
        fontWeight: '500',
        cursor: status !== 'checking' ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease',
        border: `1px solid ${getStatusColor()}20`,
        opacity: status === 'checking' ? 0.7 : 1,
      }}
      onClick={handleManualCheck}
      title={`Click to refresh • Last check: ${lastCheck ? lastCheck.toLocaleTimeString() : 'Never'}${error ? ` • Error: ${error}` : ''} • Check interval: ${pollingInterval/1000}s`}
    >
      <span style={{ color: getStatusColor() }}>
        {getStatusIcon()}
      </span>
      <span style={{ color: getStatusColor() }}>
        {getStatusText()}
      </span>
      {status === 'connected' && lastCheck && (
        <span style={{ 
          color: '#6c757d', 
          fontSize: '10px',
          marginLeft: '4px'
        }}>
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
      {rateLimited && (
        <span style={{ 
          color: '#ffc107', 
          fontSize: '10px',
          marginLeft: '4px'
        }}>
          (5min)
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus; 