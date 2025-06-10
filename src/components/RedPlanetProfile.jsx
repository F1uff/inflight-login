import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RedPlanetProfile.css';
import './HotelDashboard.css'; // Import HotelDashboard styles for sidebar

// Import Red Planet logo
import redPlanetLogo from '../assets/redplanet-logo.png';
import inflightLogo from '../assets/inflight-menu-logo.png';

// SVG Icons for Red Planet Profile - Exact copy from HotelDashboard
const HotelIcons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z"/>
    </svg>
  ),
  notification: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
    </svg>
  ),
  formSubmission: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  roomCategory: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
    </svg>
  ),
  database: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4zM4 9v3c0 2.21 3.58 4 8 4s8-1.79 8-4V9c0 2.21-3.58 4-8 4s-8-1.79-8-4zm0 5v3c0 2.21 3.58 4 8 4s8-1.79 8-4v-3c0 2.21-3.58 4-8 4s-8-1.79-8-4z"/>
    </svg>
  ),
  documentFiles: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h10l6-6V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
    </svg>
  ),
  dir: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
      <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z"/>
    </svg>
  ),
  safety: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
    </svg>
  ),
  incident: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
    </svg>
  ),
  profile: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  add: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  )
};

const RedPlanetProfile = () => {
  const navigate = useNavigate();
  // const location = useLocation(); // Uncomment when location is needed
  const [currentView, setCurrentView] = useState('profile');
  const [isFormSubmissionExpanded, setIsFormSubmissionExpanded] = useState(false);

  // Navigation handlers - exact copy from HotelDashboard
  const handleNavClick = (view) => {
    if (view === 'formSubmission') {
      setIsFormSubmissionExpanded(!isFormSubmissionExpanded);
    } else {
      setCurrentView(view);
      // Navigate to dashboard with the specific view
      sessionStorage.setItem('hotelDashboardView', view);
      navigate('/dashboard/user2');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <>
      {/* Hotel Dashboard Header */}
      <header className="hotel-dashboard-header">
        <div className="hotel-dashboard-logo">
          <img src={inflightLogo} alt="Service Portal" className="hotel-service-portal-logo" />
          <span className="hotel-service-portal-text">SERVICE PORTAL</span>
        </div>
        <nav className="hotel-dashboard-nav">
          <a href="https://tim.ph" target="_blank" rel="noopener noreferrer" className="hotel-header-link">
            TIM OFFICIAL WEBSITE
          </a>
          <a href="#contact" className="hotel-header-link">
            CONTACT
          </a>
          <Link to="/dashboard/user2/profile" className="hotel-header-link profile-link">
            PROFILE
          </Link>
          <button 
            onClick={handleLogout} 
            className="hotel-header-link logout-link"
            style={{background: 'none', border: 'none', cursor: 'pointer'}}
          >
            LOG OUT
          </button>
        </nav>
      </header>

      <div className="hotel-dashboard-wrapper">
        {/* Left Sidebar - Exact copy from HotelDashboard */}
        <aside className="hotel-sidebar">
          <div className="hotel-company-logo-container">
            <div className="hotel-redplanet-logo">
              <img src={redPlanetLogo} alt="Red Planet Logo" />
            </div>
          </div>
          <div className="hotel-company-info-section">
            <div className="hotel-company-name">RED PLANET</div>
            <div className="hotel-company-id">ID: HTL00789</div>
          </div>
          <nav className="hotel-nav">
            <button
              className={`hotel-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <span className="hotel-nav-icon">{HotelIcons.dashboard}</span>
              <span className="hotel-nav-text">DASHBOARD</span>
            </button>
            
            <button 
              className={`hotel-nav-item ${currentView === 'notification' ? 'active' : ''}`}
              onClick={() => handleNavClick('notification')}
            >
              <span className="hotel-nav-icon">{HotelIcons.notification}</span>
              <span className="hotel-nav-text">NOTIFICATION</span>
            </button>
            
            <button
              className={`hotel-nav-item ${currentView === 'formSubmission' ? 'active' : ''}`}
              onClick={() => handleNavClick('formSubmission')}
            >
              <span className="hotel-nav-icon">{HotelIcons.formSubmission}</span>
              <span className="hotel-nav-text">FORM SUBMISSION</span>
            </button>
            
            {isFormSubmissionExpanded && (
              <>
                <button 
                  className={`hotel-nav-item hotel-nav-expanded ${currentView === 'roomCategory' ? 'active' : ''}`}
                  onClick={() => handleNavClick('roomCategory')}
                >
                  <span className="hotel-nav-icon">{HotelIcons.roomCategory}</span>
                  <span className="hotel-nav-text">ROOM CATEGORY / RATES</span>
                </button>
                
                <button 
                  className={`hotel-nav-item hotel-nav-expanded ${currentView === 'database' ? 'active' : ''}`}
                  onClick={() => handleNavClick('database')}
                >
                  <span className="hotel-nav-icon">{HotelIcons.database}</span>
                  <span className="hotel-nav-text">DATABASE</span>
                </button>
                
                <button 
                  className={`hotel-nav-item hotel-nav-expanded ${currentView === 'documentFiles' ? 'active' : ''}`}
                  onClick={() => handleNavClick('documentFiles')}
                >
                  <span className="hotel-nav-icon">{HotelIcons.documentFiles}</span>
                  <span className="hotel-nav-text">DOCUMENT FILES</span>
                </button>
              </>
            )}
            
            <button 
              className={`hotel-nav-item ${currentView === 'dir' ? 'active' : ''}`}
              onClick={() => handleNavClick('dir')}
            >
              <span className="hotel-nav-icon">{HotelIcons.dir}</span>
              <span className="hotel-nav-text">DIR</span>
            </button>
            
            <button 
              className={`hotel-nav-item ${currentView === 'safety' ? 'active' : ''}`}
              onClick={() => handleNavClick('safety')}
            >
              <span className="hotel-nav-icon">{HotelIcons.safety}</span>
              <span className="hotel-nav-text">SHE-MS</span>
            </button>
            
            <button 
              className={`hotel-nav-item ${currentView === 'incident' ? 'active' : ''}`}
              onClick={() => handleNavClick('incident')}
            >
              <span className="hotel-nav-icon">{HotelIcons.incident}</span>
              <span className="hotel-nav-text">INCIDENT REPORT</span>
            </button>
          </nav>
        </aside>
        
        {/* Main Content */}
        <div className="hotel-content">
          <div className="hotel-dashboard-content">
            <div className="hotel-dashboard-main-content">
              {/* Profile Header */}
              <div className="red-planet-profile-header">
                <div className="red-planet-profile-title-container">
                  <div className="red-planet-profile-icon">{HotelIcons.profile}</div>
                  <h2 className="red-planet-profile-title">Company Information</h2>
                </div>
              </div>

              {/* Company Information Section */}
              <div className="red-planet-section">
                <div className="red-planet-section-header">
                  <h2 className="red-planet-section-title">Company Information</h2>
                </div>
                
                <div className="red-planet-company-content">
                  <div className="red-planet-logo-section">
                    <h3 className="red-planet-logo-title">Company Profile Logo</h3>
                    <div className="red-planet-logo-upload">
                      <div className="red-planet-upload-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="#ccc">
                          <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                        </svg>
                      </div>
                      <button className="red-planet-upload-btn">Upload</button>
                    </div>
                  </div>

                  <div className="red-planet-form-section">
                    <div className="red-planet-form-row">
                      <div className="red-planet-form-group">
                        <label>User ID <span className="red-planet-auto-note">(Generated Automatically Base in Registration)</span></label>
                        <input type="text" className="red-planet-form-input" readOnly />
                      </div>
                      <div className="red-planet-form-group">
                        <label>Company Name</label>
                        <input type="text" className="red-planet-form-input" />
                      </div>
                    </div>
                    
                    <div className="red-planet-form-row">
                      <div className="red-planet-form-group">
                        <label>Last Name <span className="red-planet-auto-note">(Company Representative)</span></label>
                        <input type="text" className="red-planet-form-input" />
                      </div>
                      <div className="red-planet-form-group">
                        <label>Contact # <span className="red-planet-required-note">*details required to fill out!</span></label>
                        <input type="text" className="red-planet-form-input" />
                      </div>
                    </div>
                    
                    <div className="red-planet-form-row">
                      <div className="red-planet-form-group">
                        <label>First Name <span className="red-planet-auto-note">(Company Representative)</span></label>
                        <input type="text" className="red-planet-form-input" />
                      </div>
                      <div className="red-planet-form-group">
                        <label>Telephone #</label>
                        <input type="text" className="red-planet-form-input" />
                      </div>
                    </div>
                    
                    <div className="red-planet-form-row">
                      <div className="red-planet-form-group">
                        <label>Designation</label>
                        <input type="text" className="red-planet-form-input" />
                      </div>
                      <div className="red-planet-form-group">
                        <label>Email Address</label>
                        <input type="email" className="red-planet-form-input" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Documents Section */}
              <div className="red-planet-section">
                <div className="red-planet-section-header">
                  <h2 className="red-planet-section-title">Primary Documents</h2>
                </div>
                
                <div className="red-planet-documents-content">
                  <div className="red-planet-document-row">
                    <div className="red-planet-document-item">
                      <div className="red-planet-check-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#28a745">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                      <div className="red-planet-doc-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                      </div>
                      <input type="text" className="red-planet-doc-input" value="Business Permit" readOnly />
                    </div>
                    
                    <div className="red-planet-document-item">
                      <div className="red-planet-check-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#28a745">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                      <div className="red-planet-doc-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                      </div>
                      <input type="text" className="red-planet-doc-input" value="DTI/SEC" readOnly />
                    </div>
                    
                    <div className="red-planet-document-item">
                      <div className="red-planet-check-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#28a745">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                      <div className="red-planet-doc-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                      </div>
                      <input type="text" className="red-planet-doc-input" value="BIR 2303" readOnly />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode of Payment Section */}
              <div className="red-planet-section">
                <div className="red-planet-section-header">
                  <h2 className="red-planet-section-title">Mode of Payment</h2>
                </div>
                
                <div className="red-planet-payment-content">
                  <div className="red-planet-payment-options">
                    <label className="red-planet-payment-checkbox">
                      <input type="checkbox" />
                      <span>Bank Transfer</span>
                    </label>
                    <label className="red-planet-payment-checkbox">
                      <input type="checkbox" />
                      <span>GCLink</span>
                    </label>
                    <label className="red-planet-payment-checkbox">
                      <input type="checkbox" />
                      <span>GCAF</span>
                    </label>
                    <label className="red-planet-payment-checkbox">
                      <input type="checkbox" />
                      <span>LOA</span>
                    </label>
                    <label className="red-planet-payment-checkbox">
                      <input type="checkbox" />
                      <span>Others</span>
                    </label>
                  </div>
                  
                  <div className="red-planet-payment-row">
                    <div className="red-planet-payment-group">
                      <label>Name of Bank</label>
                      <div className="red-planet-bank-container">
                        <button className="red-planet-add-bank">
                          <span className="red-planet-plus-icon">{HotelIcons.add}</span>
                        </button>
                        <select className="red-planet-bank-select">
                          <option>Select Bank</option>
                        </select>
                      </div>
                    </div>
                    <div className="red-planet-payment-group">
                      <label>Account Name</label>
                      <input type="text" className="red-planet-payment-input" />
                    </div>
                  </div>
                  
                  <div className="red-planet-payment-row">
                    <div className="red-planet-payment-group">
                      <label>Account Number</label>
                      <input type="text" className="red-planet-payment-input" />
                    </div>
                    <div className="red-planet-payment-group">
                      <label>Credit Terms</label>
                      <select className="red-planet-credit-select">
                        <option>Select Terms</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="red-planet-submit-container">
                <button className="red-planet-submit-btn">Submit</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RedPlanetProfile; 