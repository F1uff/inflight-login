import React, { useState, useEffect } from 'react';
import pollingService from '../services/websocket';

const PollingStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    serviceId: null,
    transport: null,
    interval: null
  });

  useEffect(() => {
    const updateStatus = () => {
      setConnectionStatus(pollingService.getConnectionInfo());
    };

    // Update status every 10 seconds
    const interval = setInterval(updateStatus, 10000);
    
    // Initial update
    updateStatus();

    return () => clearInterval(interval);
  }, []);

  const statusIcon = connectionStatus.connected ? '🟢' : '🔴';
  const statusText = connectionStatus.connected ? 'Active' : 'Inactive';
  const statusColor = connectionStatus.connected ? '#28a745' : '#dc3545';

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: `2px solid ${statusColor}`,
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: statusColor,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      <span>{statusIcon}</span>
      <span>Updates: {statusText}</span>
      {connectionStatus.connected && connectionStatus.interval && (
        <span style={{ fontSize: '10px', opacity: 0.7 }}>
          ({(connectionStatus.interval / 1000)}s polling)
        </span>
      )}
    </div>
  );
};

export default PollingStatus; 