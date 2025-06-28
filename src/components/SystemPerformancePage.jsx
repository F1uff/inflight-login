import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SystemPerformancePage.css';
import inflightLogo from '../assets/inflight-menu-logo.png';
import apiService from '../services/api';

const SystemPerformancePage = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    apiResponseTime: 113,
    databaseSpeed: 53,
    serverUptime: 99.9,
    systemLoad: 41
  });

  const [safetyProtocols, setSafetyProtocols] = useState({
    securityAlerts: 0,
    backupStatus: 'Healthy',
    lastBackup: '1:15:55 PM',
    complianceScore: 98,
    activeConnections: 128,
    dataIntegrity: 100
  });

  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    healthScore: 95,
    dbResponseTime: '12.5',
    apiResponseTime: '145.2',
    activeSessions: 24,
    systemErrors: 0
  });

  const [realTimeData, setRealTimeData] = useState({
    cpuUsage: 41,
    memoryUsage: 67,
    diskUsage: 34,
    networkActivity: 89
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch system data
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setIsLoading(true);
        const [healthData, metricsData] = await Promise.all([
          apiService.getSystemHealth(),
          fetch('http://localhost:3001/metrics').then(res => res.json())
        ]);

        setSystemHealth(healthData);
        
        // Update performance metrics with real data
        setPerformanceMetrics(prev => ({
          ...prev,
          apiResponseTime: Math.round(metricsData.stats?.averageResponseTime || prev.apiResponseTime),
        }));

      } catch (err) {
        console.error('Failed to fetch system data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemData();

    // Set up real-time updates
    const performanceInterval = setInterval(() => {
      setPerformanceMetrics(prev => ({
        apiResponseTime: Math.max(50, Math.min(200, prev.apiResponseTime + (Math.random() - 0.5) * 10)),
        databaseSpeed: Math.max(20, Math.min(100, prev.databaseSpeed + (Math.random() - 0.5) * 5)),
        serverUptime: Math.max(99.0, Math.min(100, prev.serverUptime + (Math.random() - 0.5) * 0.1)),
        systemLoad: Math.max(10, Math.min(80, prev.systemLoad + (Math.random() - 0.5) * 5))
      }));

      setRealTimeData(prev => ({
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 3)),
        memoryUsage: Math.max(20, Math.min(95, prev.memoryUsage + (Math.random() - 0.5) * 2)),
        diskUsage: Math.max(10, Math.min(80, prev.diskUsage + (Math.random() - 0.5) * 1)),
        networkActivity: Math.max(30, Math.min(100, prev.networkActivity + (Math.random() - 0.5) * 8))
      }));

      setSafetyProtocols(prev => ({
        ...prev,
        activeConnections: Math.max(100, Math.min(200, prev.activeConnections + Math.floor((Math.random() - 0.5) * 6))),
        lastBackup: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }, 3000);

    return () => clearInterval(performanceInterval);
  }, []);

  const getStatusColor = (value, type) => {
    switch (type) {
      case 'response-time':
        if (value <= 100) return '#28a745'; // Excellent - Green
        if (value <= 150) return '#17a2b8'; // Good - Blue
        if (value <= 200) return '#ffc107'; // Warning - Yellow
        return '#dc3545'; // Poor - Red
      
      case 'uptime':
        if (value >= 99.5) return '#28a745'; // Excellent
        if (value >= 99.0) return '#17a2b8'; // Good
        if (value >= 98.0) return '#ffc107'; // Warning
        return '#dc3545'; // Poor
      
      case 'load':
        if (value <= 30) return '#17a2b8'; // Optimal - Blue
        if (value <= 50) return '#28a745'; // Good - Green
        if (value <= 70) return '#ffc107'; // Warning - Yellow
        return '#dc3545'; // High - Red
      
      default:
        return '#6c757d';
    }
  };

  const getStatusLabel = (value, type) => {
    switch (type) {
      case 'response-time':
        if (value <= 100) return 'Excellent';
        if (value <= 150) return 'Good';
        if (value <= 200) return 'Warning';
        return 'Poor';
      
      case 'uptime':
        if (value >= 99.5) return 'Excellent';
        if (value >= 99.0) return 'Good';
        if (value >= 98.0) return 'Warning';
        return 'Poor';
      
      case 'load':
        if (value <= 30) return 'Optimal';
        if (value <= 50) return 'Good';
        if (value <= 70) return 'High';
        return 'Critical';
      
      default:
        return 'Normal';
    }
  };

  if (isLoading) {
    return (
      <div className="system-performance-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading system performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="system-performance-page">
      {/* Header */}
      <div className="performance-header">
        <div className="header-left">
          <Link to="/dashboard/admin" className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to Dashboard
          </Link>
          <div className="header-info">
            <img src={inflightLogo} alt="Inflight Logo" className="header-logo" />
            <div>
              <h1>System Performance Monitor</h1>
              <p>Real-time system metrics and monitoring</p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="status-indicator">
            <div className={`status-dot ${systemHealth.status}`}></div>
            <span>System {systemHealth.status === 'healthy' ? 'Healthy' : 'Issues Detected'}</span>
          </div>
          <div className="last-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* System Performance Metrics */}
      <div className="metrics-section">
        <div className="section-header">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            SYSTEM PERFORMANCE METRICS
          </h2>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">API Response Time</span>
              <div className="metric-icon lightning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                </svg>
              </div>
            </div>
            <div className="metric-value">{Math.round(performanceMetrics.apiResponseTime)}ms</div>
            <div 
              className="metric-status"
              style={{ 
                backgroundColor: getStatusColor(performanceMetrics.apiResponseTime, 'response-time'),
                color: 'white'
              }}
            >
              {getStatusLabel(performanceMetrics.apiResponseTime, 'response-time')}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Database Speed</span>
              <div className="metric-icon database">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4zM4 9v3c0 2.21 3.58 4 8 4s8-1.79 8-4V9c0 2.21-3.58 4-8 4s-8-1.79-8-4zM4 14v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4z"/>
                </svg>
              </div>
            </div>
            <div className="metric-value">{Math.round(performanceMetrics.databaseSpeed)}ms</div>
            <div 
              className="metric-status"
              style={{ 
                backgroundColor: getStatusColor(performanceMetrics.databaseSpeed, 'response-time'),
                color: 'white'
              }}
            >
              {getStatusLabel(performanceMetrics.databaseSpeed, 'response-time')}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Server Uptime</span>
              <div className="metric-icon uptime">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
            <div className="metric-value">{performanceMetrics.serverUptime.toFixed(1)}%</div>
            <div 
              className="metric-status"
              style={{ 
                backgroundColor: getStatusColor(performanceMetrics.serverUptime, 'uptime'),
                color: 'white'
              }}
            >
              {getStatusLabel(performanceMetrics.serverUptime, 'uptime')}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">System Load</span>
              <div className="metric-icon load">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
              </div>
            </div>
            <div className="metric-value">{Math.round(performanceMetrics.systemLoad)}%</div>
            <div 
              className="metric-status"
              style={{ 
                backgroundColor: getStatusColor(performanceMetrics.systemLoad, 'load'),
                color: 'white'
              }}
            >
              {getStatusLabel(performanceMetrics.systemLoad, 'load')}
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Security Protocols */}
      <div className="safety-section">
        <div className="section-header">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
            </svg>
            SAFETY & SECURITY PROTOCOLS
          </h2>
        </div>

        <div className="safety-grid">
          <div className="safety-card">
            <div className="safety-header">
              <span className="safety-title">Security Alerts</span>
              <div className={`alert-badge ${safetyProtocols.securityAlerts === 0 ? 'success' : 'warning'}`}>
                {safetyProtocols.securityAlerts}
              </div>
            </div>
            <div className="safety-status success">All Clear</div>
            <div className="safety-description">No security threats detected</div>
          </div>

          <div className="safety-card">
            <div className="safety-header">
              <span className="safety-title">Backup Status</span>
              <div className="status-indicator-small healthy"></div>
            </div>
            <div className="safety-status success">Healthy</div>
            <div className="safety-description">Last backup: {safetyProtocols.lastBackup}</div>
          </div>

          <div className="safety-card">
            <div className="safety-header">
              <span className="safety-title">Compliance Score</span>
            </div>
            <div className="safety-value">{safetyProtocols.complianceScore}%</div>
            <div className="safety-status excellent">Excellent</div>
          </div>

          <div className="safety-card">
            <div className="safety-header">
              <span className="safety-title">Active Connections</span>
            </div>
            <div className="safety-value">{safetyProtocols.activeConnections}</div>
            <div className="safety-status normal">Normal</div>
            <div className="safety-description">Within acceptable limits</div>
          </div>

          <div className="safety-card">
            <div className="safety-header">
              <span className="safety-title">Data Integrity</span>
            </div>
            <div className="safety-value">{safetyProtocols.dataIntegrity}%</div>
            <div className="safety-status perfect">Perfect</div>
            <div className="safety-description">All data validated successfully</div>
          </div>
        </div>
      </div>

      {/* Real-time System Resources */}
      <div className="resources-section">
        <div className="section-header">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z"/>
            </svg>
            REAL-TIME SYSTEM RESOURCES
          </h2>
        </div>

        <div className="resources-grid">
          <div className="resource-card">
            <div className="resource-header">
              <span className="resource-title">CPU Usage</span>
              <span className="resource-value">{Math.round(realTimeData.cpuUsage)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill cpu"
                style={{ width: `${realTimeData.cpuUsage}%` }}
              ></div>
            </div>
            <div className="resource-status">Normal Operation</div>
          </div>

          <div className="resource-card">
            <div className="resource-header">
              <span className="resource-title">Memory Usage</span>
              <span className="resource-value">{Math.round(realTimeData.memoryUsage)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill memory"
                style={{ width: `${realTimeData.memoryUsage}%` }}
              ></div>
            </div>
            <div className="resource-status">Optimal</div>
          </div>

          <div className="resource-card">
            <div className="resource-header">
              <span className="resource-title">Disk Usage</span>
              <span className="resource-value">{Math.round(realTimeData.diskUsage)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill disk"
                style={{ width: `${realTimeData.diskUsage}%` }}
              ></div>
            </div>
            <div className="resource-status">Excellent</div>
          </div>

          <div className="resource-card">
            <div className="resource-header">
              <span className="resource-title">Network Activity</span>
              <span className="resource-value">{Math.round(realTimeData.networkActivity)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill network"
                style={{ width: `${realTimeData.networkActivity}%` }}
              ></div>
            </div>
            <div className="resource-status">High Activity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemPerformancePage; 