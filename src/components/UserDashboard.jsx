import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserDashboard.css';

import ronwayLogo from '../assets/ronway.png';
import inflightLogo from '../assets/inflight-menu-logo.png';

// Dashboard icons
const Icons = {
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
  dataRegistration: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  enrollmentForm: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v2H5c-.55 0-1 .45-1 1s.45 1 1 1h1v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V6h1c.55 0 1-.45 1-1s-.45-1-1-1zM9 4h6v1H9V4z"/>
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
  transport: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z"/>
    </svg>
  ),
  search: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z"/>
    </svg>
  ),
  filter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </svg>
  )
};

const UserDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [dataRegistrationExpanded, setDataRegistrationExpanded] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  
  // Restore view from session storage
  useEffect(() => {
    const storedView = sessionStorage.getItem('userDashboardView');
    const storedExpansion = sessionStorage.getItem('dataRegistrationExpanded');
    
    if (storedView) {
      setCurrentView(storedView);
      sessionStorage.removeItem('userDashboardView');
      
      // Expand menu if needed
      if (['enrollmentForm', 'database', 'documentFiles'].includes(storedView)) {
        setDataRegistrationExpanded(true);
      }
    }
    
    if (storedExpansion === 'true') {
      setDataRegistrationExpanded(true);
      sessionStorage.removeItem('dataRegistrationExpanded');
    }
  }, []);
  
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleNavClick = (view) => {
    if (view === 'dataRegistration') {
      setDataRegistrationExpanded(!dataRegistrationExpanded);
      // Handle expansion/collapse
      if (!dataRegistrationExpanded) {
        setCurrentView('dataRegistrationDashboard');
      } else {
        setCurrentView('dashboard');
      }
    } else {
      setCurrentView(view);
      // Collapse menu for non-data registration views
      if (!['enrollmentForm', 'database', 'documentFiles', 'dataRegistrationDashboard'].includes(view)) {
        setDataRegistrationExpanded(false);
      } else {
        // Keep expanded for sub-items
        setDataRegistrationExpanded(true);
      }
    }
  };

  const handleAddDriver = () => {
    setShowAddDriverModal(true);
  };

  const handleAddVehicle = () => {
    setShowAddVehicleModal(true);
  };

  const closeModal = () => {
    setShowAddDriverModal(false);
    setShowAddVehicleModal(false);
  };

  // Driver modal component
  const AddDriverModal = () => (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content add-driver-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>ADD DRIVER</h2>
        </div>
        
        <div className="modal-body">
          <div className="driver-form-container">
            {/* Left side - License Upload */}
            <div className="license-upload-section">
              <h3>DRIVER LICENSE <span className="upload-note">(Upload cleared/Scan ID)</span></h3>
              <div className="license-upload-area">
                <div className="upload-placeholder">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="#ccc">
                    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                  </svg>
                </div>
                <button className="upload-btn-modal">UPLOAD</button>
              </div>
              
              <div className="driver-type-selection">
                <label className="checkbox-item">
                  <input type="checkbox" name="driverType" value="regular" />
                  <span>REGULAR</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" name="driverType" value="subcon" />
                  <span>SUBCON</span>
                </label>
              </div>
            </div>

            {/* Right side - Driver Information Form */}
            <div className="driver-info-section">
              <div className="driver-form-group">
                <label>DRIVER ID <span className="field-note">(Driver License Number)</span></label>
                <input type="text" className="modal-form-input" />
              </div>
              
              <div className="driver-form-group">
                <label>FULL NAME</label>
                <input type="text" className="modal-form-input" />
              </div>
              
              <div className="driver-form-group">
                <label>DESIGNATION AREA</label>
                <input type="text" className="modal-form-input" />
              </div>
              
              <div className="driver-form-group">
                <label>CONTACT</label>
                <input type="text" className="modal-form-input" />
              </div>
              
              <div className="driver-form-group nda-upload-group">
                <div className="nda-upload-container">
                  <div className="nda-upload-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                  </div>
                  <span className="nda-upload-text">upload signed NDA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-btn back-btn" onClick={closeModal}>
            <span>‹ BACK</span>
          </button>
          <button className="modal-btn enroll-btn">
            <span>ENROLL ›</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Vehicle modal component
  const AddVehicleModal = () => (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content add-vehicle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>ADD VEHICLE</h2>
        </div>
        
        <div className="modal-body">
          <div className="vehicle-form-container">
            {/* Left side - Car Unit Upload */}
            <div className="car-upload-section">
              <h3>CAR UNIT <span className="upload-note">(Exterior and Interior)</span></h3>
              <div className="car-upload-area">
                <div className="upload-placeholder">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="#ccc">
                    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                  </svg>
                </div>
                <button className="upload-btn-modal">UPLOAD</button>
              </div>
              
              <div className="vehicle-type-selection">
                <label className="checkbox-item">
                  <input type="checkbox" name="vehicleType" value="own" />
                  <span>OWN</span>
                </label>
                <label className="checkbox-item">
                  <input type="checkbox" name="vehicleType" value="subcon" />
                  <span>SUBCON</span>
                </label>
              </div>
            </div>

            {/* Right side - Vehicle Information Form */}
            <div className="vehicle-info-section">
              <div className="vehicle-form-row">
                <div className="vehicle-form-group">
                  <label>VEHICLE ID <span className="field-note">(Plate Number)</span></label>
                  <input type="text" className="modal-form-input" />
                </div>
              </div>
              
              <div className="vehicle-form-row">
                <div className="vehicle-form-group">
                  <label>CAR TYPE</label>
                  <select className="modal-form-select">
                    <option value="">Select Car Type</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                <div className="vehicle-form-group">
                  <label>YEAR MODEL</label>
                  <input type="text" className="modal-form-input" />
                </div>
              </div>
              
              <div className="vehicle-form-row">
                <div className="vehicle-form-group">
                  <label>CAR MODEL</label>
                  <input type="text" className="modal-form-input" />
                </div>
                <div className="vehicle-form-group">
                  <label>COLOR</label>
                  <input type="text" className="modal-form-input" />
                </div>
              </div>
              
              <div className="vehicle-form-group">
                <label>SAFETY FEATURES</label>
                <div className="safety-features-grid">
                  <div className="safety-feature-item">
                    <div className="safety-upload-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                    </div>
                    <span className="safety-upload-text">upload portable fire extinguisher</span>
                  </div>
                  <div className="safety-feature-item">
                    <div className="safety-upload-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                    </div>
                    <span className="safety-upload-text">upload first aid kit</span>
                  </div>
                  <div className="safety-feature-item">
                    <div className="safety-upload-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                    </div>
                    <span className="safety-upload-text">upload Dashcam</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Documents Section */}
          <div className="vehicle-documents-section">
            <div className="documents-row">
              <div className="document-upload-item">
                <div className="document-upload-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <span className="document-upload-text">upload Official Receipt (OR)</span>
              </div>
              <div className="document-upload-item">
                <div className="document-upload-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <span className="document-upload-text">upload Certificate of Registration (CR)</span>
              </div>
            </div>
            <div className="documents-row">
              <div className="document-upload-item">
                <div className="document-upload-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <span className="document-upload-text">upload recent PMS Record</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="modal-btn back-btn" onClick={closeModal}>
            <span>‹ BACK</span>
          </button>
          <button className="modal-btn enroll-btn">
            <span>ENROLL ›</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
              <>
                {/* Service Header */}
                <div className="service-header-container">
                  <div className="service-title-container">
                    <div className="service-icon transport-icon">{Icons.transport}</div>
                    <h2 className="service-title">LAND TRANSPORTATION</h2>
                  </div>
                  <div className="service-controls">
                    <div className="date-selector">
                      <span className="date-icon">{Icons.calendar}</span>
                      <select className="date-range-select">
                        <option>25/04/2025 - 24/05/2025</option>
                      </select>
                    </div>
                    <button className="filters-btn">
                      <span className="filter-icon">{Icons.filter}</span>
                      <span>Filters</span>
                    </button>
                  </div>
                </div>
                
                {/* Service Stats */}
                <div className="service-stats-container">
                  <div className="stat-box request-box">
                    <h3 className="stat-title">Request</h3>
                    <div className="stat-value">0</div>
                  </div>
                  <div className="stat-box ongoing-box">
                    <h3 className="stat-title">Ongoing</h3>
                    <div className="stat-value">0</div>
                  </div>
                  <div className="stat-box total-box active-stat">
                    <h3 className="stat-title">Total Service</h3>
                    <div className="stat-value">0</div>
                  </div>
                </div>
                
                {/* Bookings Section */}
                <div className="bookings-container">
                  <div className="bookings-header">
                    <h2 className="bookings-title">BOOKINGS</h2>
                    <div className="status-indicators">
                      <div className="status-indicator">
                        <div className="status-dot done-status"></div>
                        <span>Done Service</span>
                      </div>
                      <div className="status-indicator">
                        <div className="status-dot ongoing-status"></div>
                        <span>On Going</span>
                      </div>
                      <div className="status-indicator">
                        <div className="status-dot cancelled-status"></div>
                        <span>Cancelled</span>
                      </div>
                      <div className="status-indicator">
                        <div className="status-dot request-status"></div>
                        <span>Request</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="booking-filters">
                    <div className="voucher-selector">
                      <select className="voucher-select">
                        <option>TRAVEL VOUCHER</option>
                      </select>
                    </div>
                    <div className="search-container">
                      <input type="text" placeholder="Enter exact ID" className="id-search" />
                      <button className="search-btn">
                        <span className="search-icon">{Icons.search}</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Bookings Table */}
                  <div className="bookings-table-wrapper">
                    <table className="bookings-table">
                      <thead>
                        <tr>
                          <th>Travel Voucher</th>
                          <th>Date of service</th>
                          <th>Pick up Time</th>
                          <th>Passenger Name</th>
                          <th>Contact number</th>
                          <th>Assigned Driver</th>
                          <th>Contact number</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Table is empty by default */}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
        );
      
      case 'dataRegistrationDashboard':
        return (
          <>
            {/* Data Registration Header */}
            <div className="service-header-container">
              <div className="service-title-container">
                <div className="service-icon">{Icons.dataRegistration}</div>
                <h2 className="service-title">DATA REGISTRATION</h2>
              </div>
              <div className="service-controls">
                <div className="date-selector">
                  <span className="date-icon">{Icons.calendar}</span>
                  <select className="date-range-select">
                    <option>25/04/2025 - 24/05/2025</option>
                  </select>
                </div>
                <button className="filters-btn">
                  <span className="filter-icon">{Icons.filter}</span>
                  <span>Filters</span>
                </button>
              </div>
            </div>
            
            {/* Registration Stats */}
            <div className="service-stats-container">
              <div className="stat-box active-stat">
                <h3 className="stat-title">Active Drivers</h3>
                <div className="stat-value">0</div>
              </div>
              <div className="stat-box pending-stat">
                <h3 className="stat-title">Pending Drivers</h3>
                <div className="stat-value">0</div>
              </div>
              <div className="stat-box">
                <h3 className="stat-title">Active Vehicles</h3>
                <div className="stat-value">0</div>
              </div>
              <div className="stat-box">
                <h3 className="stat-title">Total Registered</h3>
                <div className="stat-value">0</div>
              </div>
            </div>
            
            {/* Quick Actions Section */}
            <div className="quick-actions-container">
              <div className="quick-actions-header">
                <h2 className="quick-actions-title">QUICK ACTIONS</h2>
              </div>
              
              <div className="quick-actions-grid">
                <button 
                  className="quick-action-card"
                  onClick={() => setCurrentView('enrollmentForm')}
                >
                  <div className="quick-action-icon">{Icons.enrollmentForm}</div>
                  <div className="quick-action-content">
                    <h3>Enrollment Form</h3>
                    <p>Register new drivers and vehicles</p>
                  </div>
                </button>
                
                <button 
                  className="quick-action-card"
                  onClick={() => setCurrentView('database')}
                >
                  <div className="quick-action-icon">{Icons.database}</div>
                  <div className="quick-action-content">
                    <h3>Database</h3>
                    <p>View all registered data</p>
                  </div>
                </button>
                
                <button 
                  className="quick-action-card"
                  onClick={() => setCurrentView('documentFiles')}
                >
                  <div className="quick-action-icon">{Icons.documentFiles}</div>
                  <div className="quick-action-content">
                    <h3>Document Files</h3>
                    <p>Manage uploaded documents</p>
                  </div>
                </button>
                
                <button className="quick-action-card" onClick={handleAddDriver}>
                  <div className="quick-action-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </div>
                  <div className="quick-action-content">
                    <h3>Add Driver</h3>
                    <p>Quick driver registration</p>
                  </div>
                </button>
                
                <button className="quick-action-card" onClick={handleAddVehicle}>
                  <div className="quick-action-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </div>
                  <div className="quick-action-content">
                    <h3>Add Vehicle</h3>
                    <p>Quick vehicle registration</p>
                  </div>
                </button>
                
                <button 
                  className="quick-action-card"
                  onClick={() => setCurrentView('safety')}
                >
                  <div className="quick-action-icon">{Icons.safety}</div>
                  <div className="quick-action-content">
                    <h3>Safety Reports</h3>
                    <p>View safety compliance</p>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Recent Activity Section */}
            <div className="recent-activity-container">
              <div className="recent-activity-header">
                <h2 className="recent-activity-title">RECENT ACTIVITY</h2>
                <div className="activity-status-indicators">
                  <div className="status-indicator">
                    <div className="status-dot active-status"></div>
                    <span>Approved</span>
                  </div>
                  <div className="status-indicator">
                    <div className="status-dot pending-status"></div>
                    <span>Pending</span>
                  </div>
                  <div className="status-indicator">
                    <div className="status-dot inactive-status"></div>
                    <span>Rejected</span>
                  </div>
                </div>
              </div>
              
              <div className="activity-table-wrapper">
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>ID/Name</th>
                      <th>Action</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="5" className="empty-activity">
                        No recent activity
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      
      case 'notification':
        return (
          <div className="default-content">
            <div className="service-header-container">
              <div className="service-title-container">
                <div className="service-icon">{Icons.notification}</div>
                <h2 className="service-title">NOTIFICATIONS</h2>
              </div>
            </div>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Notification Center</h3>
              <p>No new notifications at this time.</p>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="database-content">
            {/* Driver Registered Section */}
            <div className="driver-registered-section">
              <div className="section-header-db">
                <h2 className="section-title-db">DRIVER REGISTERED</h2>
                
                {/* Driver Statistics Cards in Header */}
                <div className="header-stats-container">
                  <div className="header-stat-card">
                    <div className="header-stat-label">REGULAR DRIVERS</div>
                    <div className="header-stat-value">5</div>
                  </div>
                  <div className="header-stat-card">
                    <div className="header-stat-label">SUBCON DRIVERS</div>
                    <div className="header-stat-value">0</div>
                  </div>
                  <div className="header-stat-card highlighted">
                    <div className="header-stat-label">TOTAL DRIVER HANDLED</div>
                    <div className="header-stat-value">5</div>
                  </div>
                </div>
              </div>
              
              <div className="table-section-db">
                <div className="table-header-db">
                  <h3 className="table-title-db">DRIVER</h3>
                  
                  {/* Radio Button Style Filter Bar */}
                  <div className="filter-bar">
                    <div className="radio-status-filters">
                      <label className="radio-status-item">
                        <input type="radio" name="driver-status" value="active" defaultChecked />
                        <span className="radio-indicator"></span>
                        <span className="radio-label">ACTIVE</span>
                      </label>
                      <label className="radio-status-item">
                        <input type="radio" name="driver-status" value="pending" />
                        <span className="radio-indicator"></span>
                        <span className="radio-label">PENDING</span>
                      </label>
                      <label className="radio-status-item">
                        <input type="radio" name="driver-status" value="inactive" />
                        <span className="radio-indicator"></span>
                        <span className="radio-label">IN-ACTIVE</span>
                      </label>
                    </div>
                    
                    <div className="filter-controls">
                      <select className="filter-dropdown">
                        <option value="driver-id">DRIVER ID</option>
                        <option value="license">LICENSE</option>
                        <option value="name">FULL NAME</option>
                      </select>
                      <input 
                        type="text" 
                        className="filter-search-input" 
                        placeholder="Enter exact ID"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="data-table-wrapper-db">
                  <table className="data-table-db">
                    <thead>
                      <tr>
                        <th>Driver ID<br/>(Driver License)</th>
                        <th>Full Name</th>
                        <th>Designation Area</th>
                        <th>Contact number</th>
                        <th>Driver's NDA</th>
                        <th>Status</th>
                        <th>Edit details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                          <div className="status-indicator-cell">
                            <div className="table-status-pill active">ACTIVE</div>
                          </div>
                        </td>
                        <td>
                          <button className="edit-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Vehicle Registered Section */}
            <div className="vehicle-registered-section">
              <div className="section-header-db">
                <h2 className="section-title-db">VEHICLE REGISTERED</h2>
                
                {/* Vehicle Statistics Cards in Header */}
                <div className="header-stats-container">
                  <div className="header-stat-card">
                    <div className="header-stat-label">COMPANY OWN</div>
                    <div className="header-stat-value">5</div>
                  </div>
                  <div className="header-stat-card">
                    <div className="header-stat-label">SUBCON VECHICLE</div>
                    <div className="header-stat-value">2</div>
                  </div>
                  <div className="header-stat-card highlighted">
                    <div className="header-stat-label">TOTAL VEHICLE HANDLED</div>
                    <div className="header-stat-value">7</div>
                  </div>
                </div>
              </div>
              
              <div className="table-section-db">
                <div className="table-header-db">
                  <h3 className="table-title-db">VEHICLE</h3>
                  
                  {/* Radio Button Style Filter Bar */}
                  <div className="filter-bar">
                    <div className="radio-status-filters">
                      <label className="radio-status-item">
                        <input type="radio" name="vehicle-status" value="active" defaultChecked />
                        <span className="radio-indicator"></span>
                        <span className="radio-label">ACTIVE</span>
                      </label>
                      <label className="radio-status-item">
                        <input type="radio" name="vehicle-status" value="pending" />
                        <span className="radio-indicator"></span>
                        <span className="radio-label">PENDING</span>
                      </label>
                      <label className="radio-status-item">
                        <input type="radio" name="vehicle-status" value="inactive" />
                        <span className="radio-indicator"></span>
                        <span className="radio-label">IN-ACTIVE</span>
                      </label>
                    </div>
                    
                    <div className="filter-controls">
                      <select className="filter-dropdown">
                        <option value="vehicle-id">VEHICLE ID</option>
                        <option value="plate">PLATE NUMBER</option>
                        <option value="model">CAR MODEL</option>
                      </select>
                      <input 
                        type="text" 
                        className="filter-search-input" 
                        placeholder="Enter exact ID"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="data-table-wrapper-db">
                  <table className="data-table-db">
                    <thead>
                      <tr>
                        <th>Vehicle ID<br/>(Plate Number)</th>
                        <th>Car Type</th>
                        <th>Car Model</th>
                        <th>Year Model</th>
                        <th>Color</th>
                        <th>Safety features</th>
                        <th>Status</th>
                        <th>Edit details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                          <div className="status-indicator-cell">
                            <div className="table-status-pill pending">PENDING</div>
                          </div>
                        </td>
                        <td>
                          <button className="edit-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Modals */}
            {showAddDriverModal && <AddDriverModal />}
            {showAddVehicleModal && <AddVehicleModal />}
          </div>
        );

      case 'documentFiles':
        return (
          <div className="default-content">
            <div className="service-header-container">
              <div className="service-title-container">
                <div className="service-icon">{Icons.documentFiles}</div>
                <h2 className="service-title">DOCUMENT FILES</h2>
              </div>
            </div>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Document Management</h3>
              <p>Access and manage all uploaded documents.</p>
              <p>Document management functionality coming soon...</p>
            </div>
          </div>
        );

      case 'dir':
        return (
          <div className="default-content">
            <div className="service-header-container">
              <div className="service-title-container">
                <div className="service-icon">{Icons.dir}</div>
                <h2 className="service-title">DIR</h2>
              </div>
            </div>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Data Integrity & Reporting</h3>
              <p>Access data integrity reports and analytics.</p>
              <p>DIR functionality coming soon...</p>
            </div>
          </div>
        );

      case 'safety':
        return (
          <div className="default-content">
            <div className="service-header-container">
              <div className="service-title-container">
                <div className="service-icon">{Icons.safety}</div>
                <h2 className="service-title">SHE-MS</h2>
              </div>
            </div>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Safety, Health & Environment Management System</h3>
              <p>Monitor safety compliance and health standards.</p>
              <p>SHE-MS functionality coming soon...</p>
            </div>
          </div>
        );

      case 'incident':
        return (
          <div className="default-content">
            <div className="service-header-container">
              <div className="service-title-container">
                <div className="service-icon">{Icons.incident}</div>
                <h2 className="service-title">INCIDENT REPORT</h2>
              </div>
            </div>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Incident Reporting System</h3>
              <p>Report and track safety incidents and accidents.</p>
              <p>Incident reporting functionality coming soon...</p>
            </div>
          </div>
        );
      
      case 'enrollmentForm':
        return (
          <div className="enrollment-content">
            {/* Driver Registered Section */}
            <div className="driver-registered-section">
              <div className="section-header">
                <h2 className="section-title">DRIVER REGISTERED</h2>
                <div className="section-actions">
                  <button className="action-btn add-driver-btn" onClick={handleAddDriver}>
                    <span className="btn-icon">+</span>
                    ADD DRIVER
                  </button>
                  <button className="action-btn nda-btn">
                    <span className="btn-icon">📄</span>
                    DRIVER'S NDA
                  </button>
                </div>
              </div>
              
              <div className="table-section">
                <div className="table-header">
                  <h3 className="table-title">DRIVER</h3>
                  <div className="status-indicators">
                    <div className="status-indicator">
                      <div className="status-dot active-dot"></div>
                      <span>Active</span>
                    </div>
                    <div className="status-indicator">
                      <div className="status-dot pending-dot"></div>
                      <span>Pending</span>
                    </div>
                    <div className="status-indicator">
                      <div className="status-dot inactive-dot"></div>
                      <span>In-active</span>
                    </div>
                  </div>
                  <div className="table-controls">
                    <select className="control-select">
                      <option>DRIVER ID</option>
                    </select>
                    <input type="text" placeholder="Enter exact ID" className="control-input" />
                    <button className="control-btn">
                      <span className="search-icon">{Icons.search}</span>
                    </button>
                  </div>
                </div>
                
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Driver ID<br/>(Driver License)</th>
                        <th>Full Name</th>
                        <th>Designation Area</th>
                        <th>Contact number</th>
                        <th>Driver's NDA</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="6" className="empty-table-row">
                          <div className="status-indicator-cell">
                            <div className="table-status-pill active">ACTIVE</div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Vehicle Registered Section */}
            <div className="vehicle-registered-section">
              <div className="section-header">
                <h2 className="section-title">VEHICLE REGISTERED</h2>
                <div className="section-actions">
                  <button className="action-btn add-vehicle-btn" onClick={handleAddVehicle}>
                    <span className="btn-icon">+</span>
                    ADD VEHICLE
                  </button>
                </div>
              </div>
              
              <div className="table-section">
                <div className="table-header">
                  <h3 className="table-title">VEHICLE</h3>
                  <div className="status-indicators">
                    <div className="status-indicator">
                      <div className="status-dot active-dot"></div>
                      <span>Active</span>
                    </div>
                    <div className="status-indicator">
                      <div className="status-dot pending-dot"></div>
                      <span>Pending</span>
                    </div>
                    <div className="status-indicator">
                      <div className="status-dot inactive-dot"></div>
                      <span>In-active</span>
                    </div>
                  </div>
                  <div className="table-controls">
                    <select className="control-select">
                      <option>PLATE NUMBER</option>
                    </select>
                    <input type="text" placeholder="Enter exact ID" className="control-input" />
                    <button className="control-btn">
                      <span className="search-icon">{Icons.search}</span>
                    </button>
                  </div>
                </div>
                
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Vehicle ID<br/>(Plate Number)</th>
                        <th>Car Type</th>
                        <th>Car Model</th>
                        <th>Year Model</th>
                        <th>Color</th>
                        <th>Safety features</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="7" className="empty-table-row">
                          <div className="status-indicator-cell">
                            <div className="table-status-pill pending">PENDING</div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Modals */}
            {showAddDriverModal && <AddDriverModal />}
            {showAddVehicleModal && <AddVehicleModal />}
          </div>
        );
      
      default:
        return (
          <div className="default-content">
            <h2>Select an option from the sidebar</h2>
          </div>
        );
    }
  };

  return (
    <>
      {/* User Dashboard Header */}
      <header className="user-dashboard-header">
        <div className="user-dashboard-logo">
          <img src={inflightLogo} alt="Service Portal" className="service-portal-logo" />
          <span className="service-portal-text">SERVICE PORTAL</span>
        </div>
        <nav className="user-dashboard-nav">
          <a href="https://tim.ph" target="_blank" rel="noopener noreferrer" className="user-header-link">
            TIM OFFICIAL WEBSITE
          </a>
          <a href="#contact" className="user-header-link">
            CONTACT
          </a>
          <Link to="/dashboard/user/profile" className="user-header-link profile-link">
            PROFILE
          </Link>
          <button 
            onClick={handleLogout} 
            className="user-header-link logout-link"
            style={{background: 'none', border: 'none', cursor: 'pointer'}}
          >
            LOG OUT
          </button>
        </nav>
      </header>

      <div className="user-dashboard-wrapper">
        {/* Left Sidebar */}
        <aside className="user-sidebar">
          <div className="user-company-logo-container">
            <div className="user-ronway-logo">
              <img src={ronwayLogo} alt="Ronway Logo" />
            </div>
          </div>
          <div className="user-company-info-section">
            <div className="user-company-name">RONWAY CARS AND TRAVEL</div>
            <div className="user-company-id">ID: LTP00789</div>
          </div>
          <nav className="user-nav">
            <button
              className={`user-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <span className="user-nav-icon">{Icons.dashboard}</span>
              <span className="user-nav-text">DASHBOARD</span>
            </button>
            
            <button 
              className={`user-nav-item ${currentView === 'notification' ? 'active' : ''}`}
              onClick={() => handleNavClick('notification')}
            >
              <span className="user-nav-icon">{Icons.notification}</span>
              <span className="user-nav-text">NOTIFICATION</span>
            </button>
            
            <button
              className={`user-nav-item ${currentView === 'dataRegistration' ? 'active' : ''}`}
              onClick={() => handleNavClick('dataRegistration')}
            >
              <span className="user-nav-icon">{Icons.dataRegistration}</span>
              <span className="user-nav-text">DATA REGISTRATION</span>
            </button>
            
            {dataRegistrationExpanded && (
              <>
                <button 
                  className={`user-nav-item user-nav-expanded ${currentView === 'enrollmentForm' ? 'active' : ''}`}
                  onClick={() => handleNavClick('enrollmentForm')}
                >
                  <span className="user-nav-icon">{Icons.enrollmentForm}</span>
                  <span className="user-nav-text">ENROLLMENT FORM</span>
                </button>
                
                <button 
                  className={`user-nav-item user-nav-expanded ${currentView === 'database' ? 'active' : ''}`}
                  onClick={() => handleNavClick('database')}
                >
                  <span className="user-nav-icon">{Icons.database}</span>
                  <span className="user-nav-text">DATABASE</span>
                </button>
                
                <button 
                  className={`user-nav-item user-nav-expanded ${currentView === 'documentFiles' ? 'active' : ''}`}
                  onClick={() => handleNavClick('documentFiles')}
                >
                  <span className="user-nav-icon">{Icons.documentFiles}</span>
                  <span className="user-nav-text">DOCUMENT FILES</span>
                </button>
              </>
            )}
            
            <button 
              className={`user-nav-item ${currentView === 'dir' ? 'active' : ''}`}
              onClick={() => handleNavClick('dir')}
            >
              <span className="user-nav-icon">{Icons.dir}</span>
              <span className="user-nav-text">DIR</span>
            </button>
            
            <button 
              className={`user-nav-item ${currentView === 'safety' ? 'active' : ''}`}
              onClick={() => handleNavClick('safety')}
            >
              <span className="user-nav-icon">{Icons.safety}</span>
              <span className="user-nav-text">SHE-MS</span>
            </button>
            
            <button 
              className={`user-nav-item ${currentView === 'incident' ? 'active' : ''}`}
              onClick={() => handleNavClick('incident')}
            >
              <span className="user-nav-icon">{Icons.incident}</span>
              <span className="user-nav-text">INCIDENT REPORT</span>
            </button>
          </nav>
        </aside>
        
        {/* Main Content */}
        <div className="user-content">
          <div className="user-dashboard-content">
            <div className="user-dashboard-main-content">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
