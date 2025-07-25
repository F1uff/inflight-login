import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProfileCard.css';

// SVG Icons for the profile card
const ProfileIcons = {
  edit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  ),
  verified: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L13.5 4.5C12.7 4.8 12 5.6 12 6.5V7.5C12 8.3 12.7 9 13.5 9H21ZM10 12C10 10.9 10.9 10 12 10S14 10.9 14 12S13.1 14 12 14S10 13.1 10 12ZM21 10H13.5C13.2 10 13 10.2 13 10.5V11.5C13 11.8 13.2 12 13.5 12H21V10ZM5.5 7.5C4.1 7.5 3 8.6 3 10S4.1 12.5 5.5 12.5S8 11.4 8 10S6.9 7.5 5.5 7.5ZM7.5 16H3.5C2.1 16 1 17.1 1 18.5V20H8V18.5C8 17.1 6.9 16 5.5 16H7.5ZM16 20H23V18.5C23 17.1 21.9 16 20.5 16H16.5C15.1 16 14 17.1 14 18.5V20H16Z"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  ),
  company: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
    </svg>
  ),
  id: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  location: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
    </svg>
  ),
  email: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  ),
  phone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
  )
};

const ProfileCard = ({ 
  companyData = {},
  onEdit = () => {},
  onSettings = () => {},
  isEditable = true,
  className = "",
  size = "default" // default, compact, expanded
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Default company data
  const defaultData = {
    companyName: "Ronway Cars & Travels",
    companyId: "2024-8899",
    logo: null,
    email: "info@redplanetlogistics.com",
    phone: "+63 2 8123 4567",
    address: "Manila, Philippines",
    status: "active",
    verificationStatus: "verified",
    memberSince: "2024",
    industry: "Logistics & Transportation",
    ...companyData
  };

  // Status configurations
  const statusConfig = {
    active: {
      color: "#28a745",
      bgColor: "#d4edda",
      text: "Active",
      icon: ProfileIcons.verified
    },
    pending: {
      color: "#ffc107",
      bgColor: "#fff3cd",
      text: "Pending",
      icon: ProfileIcons.warning
    },
    inactive: {
      color: "#6c757d",
      bgColor: "#f8f9fa",
      text: "Inactive",
      icon: ProfileIcons.warning
    }
  };

  const verificationConfig = {
    verified: {
      color: "#28a745",
      bgColor: "#d4edda",
      text: "Verified",
      icon: ProfileIcons.verified
    },
    pending: {
      color: "#ffc107",
      bgColor: "#fff3cd",
      text: "Pending Verification",
      icon: ProfileIcons.warning
    },
    unverified: {
      color: "#dc3545",
      bgColor: "#f8d7da",
      text: "Unverified",
      icon: ProfileIcons.warning
    }
  };

  const currentStatus = statusConfig[defaultData.status] || statusConfig.active;
  const currentVerification = verificationConfig[defaultData.verificationStatus] || verificationConfig.verified;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderLogo = () => {
    if (defaultData.logo && !imageError) {
      return (
        <img 
          src={defaultData.logo} 
          alt={`${defaultData.companyName} Logo`}
          className={`profile-card-logo-image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      );
    }
    
    return (
      <div className="profile-card-logo-placeholder">
        {ProfileIcons.company}
        <span className="profile-card-logo-text">
          {defaultData.companyName.split(' ').map(word => word.charAt(0)).join('').substring(0, 2)}
        </span>
      </div>
    );
  };

  const renderStatusBadge = (config) => (
    <div 
      className="profile-card-status-badge"
      style={{ 
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}20`
      }}
    >
      <span className="profile-card-status-icon">{config.icon}</span>
      <span className="profile-card-status-text">{config.text}</span>
    </div>
  );

  return (
    <div className={`profile-card ${className} profile-card-${size}`}>
      {/* Header Section */}
      <div className="profile-card-header">
        <div className="profile-card-logo-section">
          <div className="profile-card-logo-container">
            {renderLogo()}
          </div>
          <div className="profile-card-company-info">
            <h2 className="profile-card-company-name">{defaultData.companyName}</h2>
            <div className="profile-card-company-id">
              <span className="profile-card-id-icon">{ProfileIcons.id}</span>
              <span className="profile-card-id-text">ID: {defaultData.companyId}</span>
            </div>
          </div>
        </div>
        
        {isEditable && (
          <div className="profile-card-actions">
            <button 
              className="profile-card-action-btn profile-card-edit-btn"
              onClick={onEdit}
              title="Edit Profile"
            >
              {ProfileIcons.edit}
            </button>
            <button 
              className="profile-card-action-btn profile-card-settings-btn"
              onClick={onSettings}
              title="Settings"
            >
              {ProfileIcons.settings}
            </button>
          </div>
        )}
      </div>

      {/* Status Section */}
      <div className="profile-card-status-section">
        {renderStatusBadge(currentStatus)}
        {renderStatusBadge(currentVerification)}
      </div>

      {/* Details Section */}
      <div className="profile-card-details">
        <div className="profile-card-detail-item">
          <span className="profile-card-detail-icon">{ProfileIcons.email}</span>
          <span className="profile-card-detail-text">{defaultData.email}</span>
        </div>
        <div className="profile-card-detail-item">
          <span className="profile-card-detail-icon">{ProfileIcons.phone}</span>
          <span className="profile-card-detail-text">{defaultData.phone}</span>
        </div>
        <div className="profile-card-detail-item">
          <span className="profile-card-detail-icon">{ProfileIcons.location}</span>
          <span className="profile-card-detail-text">{defaultData.address}</span>
        </div>
      </div>

      {/* Footer Section */}
      <div className="profile-card-footer">
        <div className="profile-card-meta">
          <span className="profile-card-industry">{defaultData.industry}</span>
          <span className="profile-card-member-since">Member since {defaultData.memberSince}</span>
        </div>
        
        {isEditable && (
          <div className="profile-card-footer-actions">
            <Link 
              to="/dashboard/user/profile" 
              className="profile-card-footer-btn profile-card-view-profile-btn"
            >
              View Full Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard; 