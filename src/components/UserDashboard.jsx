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
  driver: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11L6.5 6.5H17.5L19 11H5z"/>
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

// Status Indicators Component - Reused from AdminDashboard
const StatusIndicator = ({ status, label, isActive, onClick }) => {
  return (
    <div 
      className={`status-pill ${status} ${isActive ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <span className="status-dot"></span>
      {label}
    </div>
  );
};

const UserDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [dataRegistrationExpanded, setDataRegistrationExpanded] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  
  // Sample data for demonstration
  const [driverData] = useState([
    {
      id: 'DRV001',
      name: 'John Doe',
      area: 'Metro Manila',
      contact: '0917-123-4567',
      nda: 'Submitted',
      status: 'active'
    },
    {
      id: 'DRV002',
      name: 'Jane Smith',
      area: 'Quezon City',
      contact: '0918-765-4321',
      nda: 'Pending',
      status: 'pending'
    }
  ]);
  
  const [vehicleData] = useState([
    {
      id: 'ABC 1234',
      type: 'Sedan',
      model: 'Toyota Vios',
      year: '2022',
      color: 'White',
      safety: 'Complete',
      status: 'active'
    },
    {
      id: 'XYZ 5678',
      type: 'SUV',
      model: 'Honda CR-V',
      year: '2021',
      color: 'Black',
      safety: 'Partial',
      status: 'pending'
    }
  ]);
  
  const [bookingData] = useState([
    {
      voucher: 'TV-001',
      date: 'May 24, 2023',
      time: '09:00 AM',
      passenger: 'Mark Reiner',
      passengerContact: '0917-152-8222',
      driver: 'John Doe',
      driverContact: '0917-123-4567',
      status: 'active'
    },
    {
      voucher: 'TV-002',
      date: 'May 25, 2023',
      time: '10:30 AM',
      passenger: 'Luigi Morales',
      passengerContact: '0918-765-4321',
      driver: 'Jane Smith',
      driverContact: '0918-765-4321',
      status: 'pending'
    }
  ]);
  
  // Sample activity data
  const [activityData] = useState([
    {
      date: 'Jun 12, 2023',
      type: 'Driver',
      idName: 'DRV001 - John Doe',
      action: 'Registration',
      status: 'active'
    },
    {
      date: 'Jun 11, 2023',
      type: 'Vehicle',
      idName: 'ABC 1234 - Toyota Vios',
      action: 'Registration',
      status: 'pending'
    }
  ]);
  
  const [filteredData, setFilteredData] = useState({
    drivers: driverData,
    vehicles: vehicleData,
    bookings: bookingData,
    activities: activityData
  });
  
  // Search states for each section
  const [searchTerms, setSearchTerms] = useState({
    drivers: '',
    vehicles: '',
    bookings: '',
    activities: ''
  });
  
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

  // Comprehensive search and filter function
  const applyFilters = (section) => {
    const originalData = section === 'drivers' ? driverData : 
                        section === 'vehicles' ? vehicleData : 
                        section === 'bookings' ? bookingData :
                        section === 'activities' ? activityData : [];

    let filteredItems = [...originalData];

    // Apply status filter
    if (selectedStatus) {
      filteredItems = filteredItems.filter(item => item.status === selectedStatus);
    }

    // Apply search filter
    const searchTerm = searchTerms[section]?.toLowerCase() || '';
    if (searchTerm) {
      filteredItems = filteredItems.filter(item => {
        switch(section) {
          case 'drivers':
            return (
              item.driverId?.toLowerCase().includes(searchTerm) ||
              item.fullName?.toLowerCase().includes(searchTerm) ||
              item.designationArea?.toLowerCase().includes(searchTerm) ||
              item.contact?.toLowerCase().includes(searchTerm)
            );
          case 'vehicles':
            return (
              item.vehicleId?.toLowerCase().includes(searchTerm) ||
              item.plateNumber?.toLowerCase().includes(searchTerm) ||
              item.carModel?.toLowerCase().includes(searchTerm) ||
              item.ownerName?.toLowerCase().includes(searchTerm)
            );
          case 'bookings':
            return (
              item.id?.toLowerCase().includes(searchTerm) ||
              item.idName?.toLowerCase().includes(searchTerm) ||
              item.action?.toLowerCase().includes(searchTerm) ||
              item.type?.toLowerCase().includes(searchTerm)
            );
          case 'activities':
            return (
              item.id?.toLowerCase().includes(searchTerm) ||
              item.idName?.toLowerCase().includes(searchTerm) ||
              item.action?.toLowerCase().includes(searchTerm) ||
              item.type?.toLowerCase().includes(searchTerm)
            );
          default:
            return true;
        }
      });
    }

    setFilteredData(prev => ({
      ...prev,
      [section]: filteredItems
    }));
  };

  // Handle search input changes
  const handleSearchChange = (section, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [section]: value
    }));
    
    // Apply filters with debouncing
    setTimeout(() => {
      applyFilters(section);
    }, 300);
  };

  // Filter data based on status
  const filterByStatus = (status, section) => {
    if (selectedStatus === status) {
      // If clicking the same status again, clear the filter
      setSelectedStatus(null);
    } else {
      // Apply new filter
      setSelectedStatus(status);
    }

    // Apply all filters after status change
    setTimeout(() => {
      applyFilters(section);
    }, 0);
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
                  <div className="stat-box completed-box">
                    <h3 className="stat-title">Completed</h3>
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
                      <StatusIndicator 
                        status="active" 
                        label="Completed"
                        isActive={selectedStatus === 'active'}
                        onClick={() => filterByStatus('active', 'bookings')}
                      />
                      <StatusIndicator 
                        status="pending" 
                        label="On Going"
                        isActive={selectedStatus === 'pending'}
                        onClick={() => filterByStatus('pending', 'bookings')}
                      />
                      <StatusIndicator 
                        status="inactive" 
                        label="Cancelled"
                        isActive={selectedStatus === 'inactive'}
                        onClick={() => filterByStatus('inactive', 'bookings')}
                      />
                      <StatusIndicator 
                        status="request" 
                        label="Request"
                        isActive={selectedStatus === 'request'}
                        onClick={() => filterByStatus('request', 'bookings')}
                      />
                    </div>
                  </div>
                  
                  <div className="filter-bar">
                    <div className="filter-controls">
                      <select className="filter-dropdown">
                        <option>TRAVEL VOUCHER</option>
                      </select>
                      <div className="search-container">
                        <input 
                          type="text" 
                          placeholder="Search bookings..." 
                          className="id-search" 
                          value={searchTerms.bookings}
                          onChange={(e) => handleSearchChange('bookings', e.target.value)}
                          aria-label="Search bookings"
                        />
                        <button className="search-btn" type="button">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bookings Table */}
                  <div className="data-table-wrapper">
                    <table className="data-table bookings-table">
                      <thead>
                        <tr>
                          <th style={{width: '12%'}}>TRAVEL VOUCHER</th>
                          <th style={{width: '12%'}}>DATE OF SERVICE</th>
                          <th style={{width: '10%'}}>PICK UP TIME</th>
                          <th style={{width: '15%'}}>PASSENGER NAME</th>
                          <th style={{width: '12%'}}>CONTACT NUMBER</th>
                          <th style={{width: '15%'}}>ASSIGNED DRIVER</th>
                          <th style={{width: '12%'}}>CONTACT NUMBER</th>
                          <th style={{width: '12%'}}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.bookings && filteredData.bookings.length > 0 ? (
                          filteredData.bookings.map((booking, index) => (
                            <tr key={booking.voucher || `booking-${index}`}>
                              <td>{booking.voucher}</td>
                              <td>{booking.date}</td>
                              <td>{booking.time}</td>
                              <td>{booking.passenger}</td>
                              <td>{booking.passengerContact}</td>
                              <td>{booking.driver}</td>
                              <td>{booking.driverContact}</td>
                              <td>
                                <div className="status-indicator-cell">
                                  <div className={`account-status-indicator ${booking.status}`}></div>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="empty-table-row">
                              <div className="status-indicator-cell">
                                No bookings available
                              </div>
                            </td>
                          </tr>
                        )}
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
            
            {/* Recent Activity Section */}
            <div className="recent-activity-container">
              <div className="recent-activity-header">
                <h2 className="recent-activity-title">RECENT ACTIVITY</h2>
                <div className="activity-status-indicators">
                  <StatusIndicator 
                    status="active" 
                    label="Approved"
                    isActive={selectedStatus === 'active'}
                    onClick={() => filterByStatus('active', 'activities')}
                  />
                  <StatusIndicator 
                    status="pending" 
                    label="Pending"
                    isActive={selectedStatus === 'pending'}
                    onClick={() => filterByStatus('pending', 'activities')}
                  />
                  <StatusIndicator 
                    status="inactive" 
                    label="Rejected"
                    isActive={selectedStatus === 'inactive'}
                    onClick={() => filterByStatus('inactive', 'activities')}
                  />
                </div>
              </div>
              
              <div className="data-table-wrapper">
                <table className="data-table activity-table">
                  <thead>
                    <tr>
                      <th style={{width: '15%'}}>DATE</th>
                      <th style={{width: '15%'}}>TYPE</th>
                      <th style={{width: '35%'}}>ID/NAME</th>
                      <th style={{width: '20%'}}>ACTION</th>
                      <th style={{width: '15%'}}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.activities && filteredData.activities.length > 0 ? (
                      filteredData.activities.map((activity, index) => (
                        <tr key={`activity-${activity.date}-${activity.type}-${index}`}>
                          <td>{activity.date}</td>
                          <td>{activity.type}</td>
                          <td>{activity.idName}</td>
                          <td>{activity.action}</td>
                          <td>
                            <div className="status-indicator-cell">
                              <div className={`account-status-indicator ${activity.status}`}></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-table-row">
                          <div className="status-indicator-cell">
                            No recent activity
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      
      case 'notification':
        return (
          <div className="enrollment-content">
            <div className="data-section">
              <div className="section-header">
                <h2 className="section-title">NOTIFICATIONS</h2>
                <div className="section-actions">
                  <button className="action-btn">
                    <span className="btn-icon">🔔</span>
                    MARK ALL READ
                  </button>
                </div>
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown">
                    <option>ALL NOTIFICATIONS</option>
                    <option>UNREAD</option>
                    <option>READ</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      placeholder="Search notifications..." 
                      className="id-search" 
                    />
                    <button className="search-btn" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="data-table-wrapper">
                <div className="empty-state-container" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div className="empty-state-icon" style={{ fontSize: '48px', marginBottom: '20px', color: '#6c757d' }}>🔔</div>
                  <h3 style={{ color: '#495057', marginBottom: '10px' }}>No Notifications</h3>
                  <p style={{ color: '#6c757d', margin: '0' }}>You're all caught up! No new notifications at this time.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="enrollment-content">
            {/* DRIVER REGISTERED SECTION */}
            <div className="data-section">
              <div className="section-header">
                <h2 className="section-title">DRIVER REGISTERED</h2>
                <div className="section-actions">
                  <button className="action-btn add-driver-btn">
                    <span className="btn-icon">+</span>
                    ADD DRIVER
                  </button>
                  <button className="action-btn nda-btn">
                    <span className="btn-icon">📄</span>
                    DRIVER'S NDA
                  </button>
                </div>
              </div>
              
              <div className="status-indicators">
                <StatusIndicator 
                  status="active" 
                  label="Active"
                  isActive={selectedStatus === 'active'}
                  onClick={() => filterByStatus('active', 'drivers')}
                />
                <StatusIndicator 
                  status="pending" 
                  label="Pending"
                  isActive={selectedStatus === 'pending'}
                  onClick={() => filterByStatus('pending', 'drivers')}
                />
                <StatusIndicator 
                  status="inactive" 
                  label="In-active"
                  isActive={selectedStatus === 'inactive'}
                  onClick={() => filterByStatus('inactive', 'drivers')}
                />
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown">
                    <option>DRIVER ID</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      placeholder="Enter exact ID" 
                      className="id-search" 
                      value={searchTerms.drivers}
                      onChange={(e) => handleSearchChange('drivers', e.target.value)}
                    />
                    <button className="search-btn" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table drivers-table">
                    <thead>
                      <tr>
                      <th style={{width: '20%'}}>DRIVER ID (DRIVER LICENSE)</th>
                      <th style={{width: '18%'}}>FULL NAME</th>
                      <th style={{width: '18%'}}>DESIGNATION AREA</th>
                      <th style={{width: '15%'}}>CONTACT NUMBER</th>
                      <th style={{width: '17%'}}>DRIVER'S NDA</th>
                      <th style={{width: '12%'}}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.drivers && filteredData.drivers.length > 0 ? (
                        filteredData.drivers.map((driver, index) => (
                          <tr key={driver.id || `driver-${index}`}>
                            <td>{driver.id}</td>
                            <td>{driver.name}</td>
                            <td>{driver.area}</td>
                            <td>{driver.contact}</td>
                            <td>{driver.nda}</td>
                            <td>
                              <div className="status-indicator-cell">
                                <div className={`account-status-indicator ${driver.status}`}></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="empty-table-row">
                            <div className="status-indicator-cell">
                              No drivers registered
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            {/* VEHICLE REGISTERED SECTION */}
            <div className="data-section">
              <div className="section-header">
                <h2 className="section-title">VEHICLE REGISTERED</h2>
                <div className="section-actions">
                  <button className="action-btn add-vehicle-btn">
                    <span className="btn-icon">+</span>
                    ADD VEHICLE
                  </button>
                </div>
              </div>
              
              <div className="status-indicators">
                <StatusIndicator 
                  status="active" 
                  label="Active"
                  isActive={selectedStatus === 'active'}
                  onClick={() => filterByStatus('active', 'vehicles')}
                />
                <StatusIndicator 
                  status="pending" 
                  label="Pending"
                  isActive={selectedStatus === 'pending'}
                  onClick={() => filterByStatus('pending', 'vehicles')}
                />
                <StatusIndicator 
                  status="inactive" 
                  label="In-active"
                  isActive={selectedStatus === 'inactive'}
                  onClick={() => filterByStatus('inactive', 'vehicles')}
                />
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown">
                    <option>PLATE NUMBER</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      placeholder="Enter exact ID" 
                      className="id-search" 
                      value={searchTerms.vehicles}
                      onChange={(e) => handleSearchChange('vehicles', e.target.value)}
                    />
                    <button className="search-btn" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table vehicles-table">
                    <thead>
                      <tr>
                      <th style={{width: '18%'}}>VEHICLE ID (PLATE NUMBER)</th>
                      <th style={{width: '12%'}}>CAR TYPE</th>
                      <th style={{width: '18%'}}>CAR MODEL</th>
                      <th style={{width: '12%'}}>YEAR MODEL</th>
                      <th style={{width: '10%'}}>COLOR</th>
                      <th style={{width: '18%'}}>SAFETY FEATURES</th>
                      <th style={{width: '12%'}}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.vehicles && filteredData.vehicles.length > 0 ? (
                        filteredData.vehicles.map((vehicle, index) => (
                          <tr key={vehicle.id || `vehicle-${index}`}>
                            <td>{vehicle.id}</td>
                            <td>{vehicle.type}</td>
                            <td>{vehicle.model}</td>
                            <td>{vehicle.year}</td>
                            <td>{vehicle.color}</td>
                            <td>{vehicle.safety}</td>
                            <td>
                              <div className="status-indicator-cell">
                                <div className={`account-status-indicator ${vehicle.status}`}></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="empty-table-row">
                            <div className="status-indicator-cell">
                              No vehicles registered
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        );

      case 'documentFiles':
        return (
          <div className="enrollment-content">
            <div className="data-section">
              <div className="section-header">
                <h2 className="section-title">DOCUMENT FILES</h2>
                <div className="section-actions">
                  <button className="action-btn">
                    <span className="btn-icon">📁</span>
                    UPLOAD DOCUMENT
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">📊</span>
                    GENERATE REPORT
                  </button>
                </div>
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown">
                    <option>ALL DOCUMENTS</option>
                    <option>BUSINESS PERMITS</option>
                    <option>CERTIFICATES</option>
                    <option>INVOICES</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      placeholder="Search documents..." 
                      className="id-search" 
                    />
                    <button className="search-btn" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="data-table-wrapper">
                <div className="empty-state-container" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div className="empty-state-icon" style={{ fontSize: '48px', marginBottom: '20px', color: '#6c757d' }}>📁</div>
                  <h3 style={{ color: '#495057', marginBottom: '10px' }}>Document Management</h3>
                  <p style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Access and manage all uploaded documents.</p>
                  <p style={{ color: '#6c757d', margin: '0', fontSize: '14px' }}>Document management functionality coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'dir':
        return (
          <div className="enrollment-content">
            <div className="data-section">
              <div className="section-header">
                <h2 className="section-title">DATA INTEGRITY & REPORTING</h2>
                <div className="section-actions">
                  <button className="action-btn">
                    <span className="btn-icon">📊</span>
                    GENERATE REPORT
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">🔍</span>
                    RUN AUDIT
                  </button>
                </div>
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown">
                    <option>ALL REPORTS</option>
                    <option>DATA INTEGRITY</option>
                    <option>AUDIT LOGS</option>
                    <option>ANALYTICS</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      placeholder="Search reports..." 
                      className="id-search" 
                    />
                    <button className="search-btn" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="data-table-wrapper">
                <div className="empty-state-container" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div className="empty-state-icon" style={{ fontSize: '48px', marginBottom: '20px', color: '#6c757d' }}>📊</div>
                  <h3 style={{ color: '#495057', marginBottom: '10px' }}>Data Integrity & Reporting</h3>
                  <p style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Access data integrity reports and analytics.</p>
                  <p style={{ color: '#6c757d', margin: '0', fontSize: '14px' }}>DIR functionality coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'safety':
        return (
          <div className="enrollment-content">
            <div className="data-section">
              <div className="section-header">
                <h2 className="section-title">SAFETY, HEALTH & ENVIRONMENT</h2>
                <div className="section-actions">
                  <button className="action-btn">
                    <span className="btn-icon">🛡️</span>
                    SAFETY AUDIT
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">📋</span>
                    COMPLIANCE CHECK
                  </button>
                </div>
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown">
                    <option>ALL RECORDS</option>
                    <option>SAFETY INCIDENTS</option>
                    <option>HEALTH RECORDS</option>
                    <option>ENVIRONMENT</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      placeholder="Search safety records..." 
                      className="id-search" 
                    />
                    <button className="search-btn" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="data-table-wrapper">
                <div className="empty-state-container" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div className="empty-state-icon" style={{ fontSize: '48px', marginBottom: '20px', color: '#6c757d' }}>🛡️</div>
                  <h3 style={{ color: '#495057', marginBottom: '10px' }}>Safety, Health & Environment Management System</h3>
                  <p style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Monitor safety compliance and health standards.</p>
                  <p style={{ color: '#6c757d', margin: '0', fontSize: '14px' }}>SHE-MS functionality coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'incident':
        return (
          <div className="enrollment-content">
            <div className="data-section">
              <div className="section-header">
                <h2 className="section-title">INCIDENT REPORT</h2>
                <div className="section-actions">
                  <button className="action-btn">
                    <span className="btn-icon">⚠️</span>
                    REPORT INCIDENT
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">📊</span>
                    VIEW ANALYTICS
                  </button>
                </div>
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown">
                    <option>ALL INCIDENTS</option>
                    <option>ACCIDENTS</option>
                    <option>NEAR MISSES</option>
                    <option>RESOLVED</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      placeholder="Search incidents..." 
                      className="id-search" 
                    />
                    <button className="search-btn" type="button">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="data-table-wrapper">
                <div className="empty-state-container" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div className="empty-state-icon" style={{ fontSize: '48px', marginBottom: '20px', color: '#6c757d' }}>⚠️</div>
                  <h3 style={{ color: '#495057', marginBottom: '10px' }}>Incident Reporting System</h3>
                  <p style={{ color: '#6c757d', margin: '0 0 10px 0' }}>Report and track safety incidents and accidents.</p>
                  <p style={{ color: '#6c757d', margin: '0', fontSize: '14px' }}>Incident reporting functionality coming soon...</p>
                </div>
              </div>
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
                  <div className="status-indicators">
                    <StatusIndicator 
                      status="active" 
                      label="Active"
                      isActive={selectedStatus === 'active'}
                      onClick={() => filterByStatus('active', 'drivers')}
                    />
                    <StatusIndicator 
                      status="pending" 
                      label="Pending"
                      isActive={selectedStatus === 'pending'}
                      onClick={() => filterByStatus('pending', 'drivers')}
                    />
                    <StatusIndicator 
                      status="inactive" 
                      label="In-active"
                      isActive={selectedStatus === 'inactive'}
                      onClick={() => filterByStatus('inactive', 'drivers')}
                    />
                  </div>
                </div>
                
                <div className="filter-bar">
                  <div className="filter-controls">
                    <select className="filter-dropdown">
                      <option>DRIVER ID</option>
                    </select>
                    <div className="search-container">
                      <input 
                        type="text" 
                        placeholder="Enter exact ID" 
                        className="id-search" 
                        value={searchTerms.drivers}
                        onChange={(e) => handleSearchChange('drivers', e.target.value)}
                      />
                      <button className="search-btn" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </button>
                    </div>
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
                      {filteredData.drivers && filteredData.drivers.length > 0 ? (
                        filteredData.drivers.map((driver, index) => (
                          <tr key={driver.id || `driver-${index}`}>
                            <td>{driver.id}</td>
                            <td>{driver.name}</td>
                            <td>{driver.area}</td>
                            <td>{driver.contact}</td>
                            <td>{driver.nda}</td>
                            <td>
                              <div className="status-indicator-cell">
                                <div className={`account-status-indicator ${driver.status}`}></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="empty-table-row">
                            <div className="status-indicator-cell">
                              <div className="table-status-pill active">No drivers registered</div>
                            </div>
                          </td>
                        </tr>
                      )}
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
                  <div className="status-indicators">
                    <StatusIndicator 
                      status="active" 
                      label="Active"
                      isActive={selectedStatus === 'active'}
                      onClick={() => filterByStatus('active', 'vehicles')}
                    />
                    <StatusIndicator 
                      status="pending" 
                      label="Pending"
                      isActive={selectedStatus === 'pending'}
                      onClick={() => filterByStatus('pending', 'vehicles')}
                    />
                    <StatusIndicator 
                      status="inactive" 
                      label="In-active"
                      isActive={selectedStatus === 'inactive'}
                      onClick={() => filterByStatus('inactive', 'vehicles')}
                    />
                  </div>
                </div>
                
                <div className="filter-bar">
                  <div className="filter-controls">
                    <select className="filter-dropdown">
                      <option>PLATE NUMBER</option>
                    </select>
                    <div className="search-container">
                      <input 
                        type="text" 
                        placeholder="Enter exact ID" 
                        className="id-search" 
                        value={searchTerms.vehicles}
                        onChange={(e) => handleSearchChange('vehicles', e.target.value)}
                      />
                      <button className="search-btn" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </button>
                    </div>
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
                      {filteredData.vehicles && filteredData.vehicles.length > 0 ? (
                        filteredData.vehicles.map((vehicle, index) => (
                          <tr key={vehicle.id || `vehicle-${index}`}>
                            <td>{vehicle.id}</td>
                            <td>{vehicle.type}</td>
                            <td>{vehicle.model}</td>
                            <td>{vehicle.year}</td>
                            <td>{vehicle.color}</td>
                            <td>{vehicle.safety}</td>
                            <td>
                              <div className="status-indicator-cell">
                                <div className={`account-status-indicator ${vehicle.status}`}></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="empty-table-row">
                            <div className="status-indicator-cell">
                              <div className="table-status-pill pending">No vehicles registered</div>
                            </div>
                          </td>
                        </tr>
                      )}
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
        <div className={`user-content ${currentView === 'dashboard' ? 'dashboard-view' : ''}`}>
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
