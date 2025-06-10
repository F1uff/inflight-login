import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ClientDashboard.css';

// Icons for sidebar navigation
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
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  bookings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
    </svg>
  ),
  services: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 11V3H7v8H3v10h18V11h-4zm-8-6h2v2H9V5zm0 4h2v2H9V9zm4-4h2v2h-2V5zm0 4h2v2h-2V9zm4 0h2v2h-2V9zm0 4h2v2h-2v-2zm-8 0h2v2H9v-2zm4 0h2v2h-2v-2z"/>
    </svg>
  ),
  documents: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  support: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
    </svg>
  )
};

// Static data for the client dashboard
const userData = {
  name: 'ACME CORPORATION',
  role: 'SUPPLIER'
};

// Client dashboard stats
const clientStats = {
  activeServices: 3,
  pendingDocuments: 2,
  approvedDocuments: 15,
  activeRequests: 1
};

// Recent bookings
const recentBookings = [
  {
    id: 1,
    service: 'Hotel Accommodation',
    date: '2025-05-20',
    status: 'Confirmed',
    reference: 'HB-12345'
  },
  {
    id: 2,
    service: 'Ground Transportation',
    date: '2025-05-22',
    status: 'Pending',
    reference: 'GT-67890'
  },
  {
    id: 3,
    service: 'Catering Service',
    date: '2025-05-25',
    status: 'Confirmed',
    reference: 'CS-54321'
  }
];

// Service updates
const serviceUpdates = [
  {
    id: 1,
    title: 'Document Verification',
    message: 'Your business license has been verified successfully.',
    dateTime: '2025-05-24 09:30'
  },
  {
    id: 2,
    title: 'New Service Request',
    message: 'You have received a new catering service request.',
    dateTime: '2025-05-23 14:15'
  },
  {
    id: 3,
    title: 'Accreditation Update',
    message: 'Your accreditation is due for renewal in 30 days.',
    dateTime: '2025-05-22 11:45'
  }
];

// StatCard component for client dashboard metrics
const StatCard = ({ title, value, icon }) => {
  return (
    <div className="client-stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );
};

// Booking card component
const BookingCard = ({ booking }) => {
  const statusColor = booking.status === 'Confirmed' ? '#28a745' : '#ffc107';
  
  return (
    <div className="booking-card">
      <div className="booking-header">
        <span className="booking-service">{booking.service}</span>
        <span className="booking-reference">{booking.reference}</span>
      </div>
      <div className="booking-details">
        <div className="booking-date">
          <strong>Date:</strong> {booking.date}
        </div>
        <div className="booking-status" style={{ color: statusColor }}>
          {booking.status}
        </div>
      </div>
    </div>
  );
};

// Main ClientDashboard component
const ClientDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="client-dashboard-wrapper">
      <div className="client-dashboard-container">
        {/* Left Sidebar */}
        <div className="client-dashboard-sidebar">
          <div className="user-profile">
            <div className="profile-pic">
              <div className="profile-image" />
            </div>
            <h3>{userData.name}</h3>
            <p className="user-role">{userData.role}</p>
          </div>
          
          <nav className="sidebar-nav">
            <Link to="/client-dashboard" className="nav-item active">
              <span className="nav-icon">{Icons.dashboard}</span>
              <span className="nav-text">DASHBOARD</span>
            </Link>
            <Link to="/client-profile" className="nav-item">
              <span className="nav-icon">{Icons.profile}</span>
              <span className="nav-text">COMPANY PROFILE</span>
            </Link>
            <Link to="/client-services" className="nav-item">
              <span className="nav-icon">{Icons.services}</span>
              <span className="nav-text">SERVICES</span>
            </Link>
            <Link to="/client-bookings" className="nav-item">
              <span className="nav-icon">{Icons.bookings}</span>
              <span className="nav-text">BOOKINGS</span>
            </Link>
            <Link to="/client-documents" className="nav-item">
              <span className="nav-icon">{Icons.documents}</span>
              <span className="nav-text">DOCUMENTS</span>
            </Link>
            <Link to="/client-support" className="nav-item">
              <span className="nav-icon">{Icons.support}</span>
              <span className="nav-text">SUPPORT</span>
            </Link>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="client-dashboard-content">
          <div className="client-dashboard-header">
            <h1>Supplier Dashboard</h1>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
          
          {/* Stats Overview */}
          <div className="stats-overview">
            <StatCard 
              title="Active Services" 
              value={clientStats.activeServices} 
              icon={Icons.services}
            />
            <StatCard 
              title="Pending Documents" 
              value={clientStats.pendingDocuments} 
              icon={Icons.documents}
            />
            <StatCard 
              title="Approved Documents" 
              value={clientStats.approvedDocuments} 
              icon={Icons.documents}
            />
            <StatCard 
              title="Active Requests" 
              value={clientStats.activeRequests} 
              icon={Icons.notification}
            />
          </div>
          
          {/* Recent Bookings Section */}
          <div className="client-dashboard-section">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <Link to="/client-bookings" className="view-all-link">View All</Link>
            </div>
            <div className="bookings-container">
              {recentBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
          
          {/* Service Status */}
          <div className="client-dashboard-section">
            <div className="section-header">
              <h2>Service Status</h2>
            </div>
            <div className="service-status-container">
              <div className="service-status-card">
                <div className="status-header">Accreditation Status</div>
                <div className="status-value approved">Approved</div>
                <div className="status-detail">Valid until: Dec 31, 2025</div>
              </div>
              <div className="service-status-card">
                <div className="status-header">Document Verification</div>
                <div className="status-value in-progress">In Progress</div>
                <div className="status-detail">2 documents pending review</div>
              </div>
              <div className="service-status-card">
                <div className="status-header">Service Availability</div>
                <div className="status-value active">Active</div>
                <div className="status-detail">All services operational</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="client-dashboard-right-sidebar">
          {/* Updates Section */}
          <div className="updates-section">
            <div className="right-sidebar-title">RECENT UPDATES</div>
            <div className="updates-content">
              {serviceUpdates.map(update => (
                <div key={update.id} className="update-item">
                  <div className="update-title">{update.title}</div>
                  <div className="update-message">{update.message}</div>
                  <div className="update-time">{update.dateTime}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="quick-actions-section">
            <div className="right-sidebar-title">QUICK ACTIONS</div>
            <div className="quick-actions-content">
              <button className="quick-action-button">
                <span className="action-icon">{Icons.documents}</span>
                <span className="action-text">Upload Document</span>
              </button>
              <button className="quick-action-button">
                <span className="action-icon">{Icons.bookings}</span>
                <span className="action-text">New Service Request</span>
              </button>
              <button className="quick-action-button">
                <span className="action-icon">{Icons.support}</span>
                <span className="action-text">Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
