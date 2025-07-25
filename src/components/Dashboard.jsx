import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import DashboardStats from './DashboardStats';

// SVG icons used for navigation menu items
const Icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
    </svg>
  ),
  notification: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
    </svg>
  ),
  transaction: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      <path d="M10.75 8.75L9.5 8.5v-1h1.75V6.5h-1.75V6H8.5v.5c-.73.11-1 .5-1 1.25s.27 1.14 1 1.25v1h-1.5v1h1.5v.5H10v-.5c.73-.11 1-.5 1-1.25s-.27-1.14-1-1.25z"/>
    </svg>
  ),
  hotel: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 11V3H7v8H3v10h18V11h-4zm-8-6h2v2H9V5zm0 4h2v2H9V9zm4-4h2v2h-2V5zm0 4h2v2h-2V9zm4 0h2v2h-2V9zm0 4h2v2h-2v-2zm-8 0h2v2H9v-2zm4 0h2v2h-2v-2z"/>
    </svg>
  ),
  landTransport: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z"/>
    </svg>
  ),
  documents: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  dir: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>
    </svg>
  ),
  security: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
    </svg>
  ),
  incident: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  )
};

// User information to display in the profile section
const userData = {
  name: 'REINER REBAYNO',
  role: 'ADMIN'
};

// Sample data that can be uncommented when needed
/*
// Regional client statistics
const registeredClients = {
  ncr: 29,
  luzon: 32,
  visayas: 1,
  mindanao: 5
};

// Transportation provider statistics
const landTransportation = {
  accredited: 34,
  pending: 23,
  disaccredited: 2
};

// Hotel statistics by category
const hotels = {
  accredited: 1096,
  pending: 1765,
  nonAccredited: 208,
  nonAccreditedOnline: 386
};

// Airline partner count
const airlines = {
  accredited: 10
};

// Tour operator statistics
const travelOperators = {
  accredited: 10
};

// Monthly registration data for charts
const monthlyData = [
  { month: 'JAN', value: 7 },
  { month: 'FEB', value: 12 },
  { month: 'MAR', value: 15 },
  { month: 'APR', value: 20 },
  { month: 'MAY', value: 18 },
  { month: 'JUN', value: 30 },
  { month: 'JUL', value: 38 },
  { month: 'AUG', value: 40 },
  { month: 'SEP', value: 65 },
  { month: 'OCT', value: 70 },
  { month: 'NOV', value: 75 },
  { month: 'DEC', value: 80 }
];
*/

// Empty notifications array - will be populated from API
const notifications = [];

const Dashboard = () => {
  /* Uncomment these when implementing navigation and charts
  const navigate = useNavigate();
  const maxChartValue = Math.max(...monthlyData.map(item => item.value));
  
  const handleLogout = () => {
    navigate('/');
  };
  */

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Left sidebar with user profile and navigation */}
        <div className="dashboard-sidebar">
          <div className="user-profile">
            <div className="profile-pic">
              <div className="profile-image" />
            </div>
            <h3>{userData.name}</h3>
            <p className="user-role">{userData.role}</p>
          </div>
          
          <nav className="sidebar-nav">
            <Link to="/dashboard" className="nav-item active">
              <span className="nav-icon">{Icons.dashboard}</span>
              <span className="nav-text">DASHBOARD</span>
            </Link>
            <Link to="/notification" className="nav-item">
              <span className="nav-icon">{Icons.notification}</span>
              <span className="nav-text">NOTIFICATION</span>
            </Link>
            <Link to="/transaction" className="nav-item">
              <span className="nav-icon">{Icons.transaction}</span>
              <span className="nav-text">TRANSACTION</span>
            </Link>
            <Link to="/hotel-accredited" className="nav-item">
              <span className="nav-icon">{Icons.hotel}</span>
              <span className="nav-text">HOTEL ACCREDITED</span>
            </Link>
            <Link to="/land-transportation" className="nav-item">
              <span className="nav-icon">{Icons.landTransport}</span>
              <span className="nav-text">LAND TRANSPORTATION PROVIDER</span>
            </Link>
            <Link to="/documents" className="nav-item">
              <span className="nav-icon">{Icons.documents}</span>
              <span className="nav-text">DOCUMENTS</span>
            </Link>
            <Link to="/db" className="nav-item">
              <span className="nav-icon">{Icons.dir}</span>
              <span className="nav-text">DIR</span>
            </Link>
            <Link to="/security" className="nav-item">
              <span className="nav-icon">{Icons.security}</span>
              <span className="nav-text">SMS</span>
            </Link>
            <Link to="/incident-report" className="nav-item">
              <span className="nav-icon">{Icons.incident}</span>
              <span className="nav-text">INCIDENT REPORT</span>
            </Link>
          </nav>
        </div>
        
        {/* Main content area with dashboard statistics */}
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
          </div>
          <div className="dashboard-stats-container">
            <DashboardStats />
          </div>
        </div>
        
        {/* Right sidebar with notifications and inbox */}
        <div className="dashboard-right-sidebar">
          <div className="notification-section">
            <div className="right-sidebar-title">NOTIFICATION</div>
            <div className="notification-content">
              {/* Empty notification section - will be populated later */}
            </div>
          </div>
          
          {/* Inbox messages */}
          <div className="inbox-section">
            <div className="right-sidebar-title">INBOX</div>
            <div className="inbox-content">
              {notifications.map(notification => (
                <div key={notification.id} className="inbox-item">
                  <div className="company-logo">
                    <div className="circle-placeholder"></div>
                  </div>
                  <div className="company-info">
                    <div className="company-name">{notification.company}</div>
                    <div className="company-message">{notification.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
