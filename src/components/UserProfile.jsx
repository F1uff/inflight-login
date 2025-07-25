import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import './CompanyInformationPage.css';
import './UserProfile.css';

// Import logos
import ronwayLogo from '../assets/ronway.png';
import inflightLogo from '../assets/inflight-menu-logo.png';

// SVG Icons
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
  info: (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="#2196F3">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  ),
  camera: (
    <svg width="100" height="100" viewBox="0 0 24 24" fill="#333">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>
  ),
  documentIcon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#666">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#4CAF50">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  ),
  save: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50">
      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff9800">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#f44336">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  ),
  progress: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#2196F3">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  )
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [dataRegistrationExpanded, setDataRegistrationExpanded] = useState(false);
  
  // File upload states
  const [companyLogo, setCompanyLogo] = useState(null);
  const [documents, setDocuments] = useState({
    'business-permit': true,
    'dtsec': true,
    'bir2303': true,
    'sample-soa': null,
    'sample-invoice': null,
    'service-agreement': null
  });
  
  // Form field states with validation
  const [formFields, setFormFields] = useState({
    userId: 'Generated Automatically Base in Registration',
    companyName: '',
    lastName: '',
    firstName: '',
    designation: '',
    contactNumber: '',
    telephoneNumber: '',
    emailAddress: '',
    nameOfBank: '',
    accountName: '',
    accountNumber: '',
    creditTerms: ''
  });

  // New state for enhanced functionality
  const [fieldErrors, setFieldErrors] = useState({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for file inputs
  const logoInputRef = useRef(null);
  const documentInputRefs = {
    'business-permit': useRef(null),
    'dtsec': useRef(null),
    'bir2303': useRef(null),
    'sample-soa': useRef(null),
    'sample-invoice': useRef(null),
    'service-agreement': useRef(null)
  };

  // Auto-save function
  const autoSave = useCallback(async () => {
    setIsAutoSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setLastSaved(new Date());
      console.log('Profile auto-saved:', formFields);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [formFields]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (Object.values(formFields).some(field => field !== '' && field !== 'Generated Automatically Base in Registration')) {
        autoSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formFields, autoSave]);

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = ['companyName', 'lastName', 'firstName', 'contactNumber', 'emailAddress'];
    const requiredDocuments = ['business-permit', 'dtsec', 'bir2303'];
    
    const completedFields = requiredFields.filter(field => formFields[field].trim() !== '').length;
    const completedDocs = requiredDocuments.filter(doc => documents[doc]).length;
    
    const totalRequired = requiredFields.length + requiredDocuments.length;
    const totalCompleted = completedFields + completedDocs;
    
    setFormProgress(Math.round((totalCompleted / totalRequired) * 100));
  }, [formFields, documents]);

  // Validation functions
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'companyName':
        if (!value.trim()) error = 'Company name is required';
        break;
      case 'lastName':
        if (!value.trim()) error = 'Last name is required';
        break;
      case 'firstName':
        if (!value.trim()) error = 'First name is required';
        break;
      case 'contactNumber':
        if (!value.trim()) {
          error = 'Contact number is required';
        } else if (!/^[0-9+\-\s()]+$/.test(value)) {
          error = 'Invalid contact number format';
        }
        break;
      case 'emailAddress':
        if (!value.trim()) {
          error = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email format';
        }
        break;
      case 'telephoneNumber':
        if (value && !/^[0-9+\-\s()]+$/.test(value)) {
          error = 'Invalid telephone number format';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // Navigation functions
  const handleDataRegistrationClick = () => {
    setDataRegistrationExpanded(!dataRegistrationExpanded);
  };

  const navigateToView = (view) => {
    sessionStorage.setItem('userDashboardView', view);
    navigate('/dashboard/user');
  };

  const navigateToExpandedView = (view) => {
    sessionStorage.setItem('userDashboardView', view);
    sessionStorage.setItem('dataRegistrationExpanded', 'true');
    navigate('/dashboard/user');
  };
  
  // Enhanced logo upload with validation
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setCompanyLogo(file);
    }
  };
  
  // Enhanced document upload
  const handleDocumentUpload = (docId, e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setDocuments(prev => ({
        ...prev,
        [docId]: file
      }));
    }
  };
  
  // Enhanced input change with validation
  const handleInputChange = (field, value) => {
    setFormFields(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear previous error and validate
    const error = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };
  
  // Enhanced submit with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate all required fields
    const requiredFields = ['companyName', 'lastName', 'firstName', 'contactNumber', 'emailAddress'];
    const errors = {};
    
    requiredFields.forEach(field => {
      const error = validateField(field, formFields[field]);
      if (error) errors[field] = error;
    });
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      console.log('Profile updated successfully:', {
        formFields,
        documents,
        companyLogo
      });
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get field class with error state
  const getFieldClass = (field) => {
    let baseClass = 'profile-input';
    if (fieldErrors[field]) baseClass += ' profile-input-error';
    return baseClass;
  };

  return (
    <>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="profile-success-banner">
          <div className="profile-success-content">
            {Icons.check}
            <span>Profile updated successfully!</span>
          </div>
        </div>
      )}

      {/* User Profile Header */}
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
          <Link to="/dashboard/user/profile" className="user-header-link profile-link" style={{color: '#ffd700', fontWeight: 'bold'}}>
            PROFILE
          </Link>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/');
            }} 
            className="user-header-link logout-link"
            style={{background: 'none', border: 'none', cursor: 'pointer'}}
          >
            LOG OUT
          </button>
        </nav>
      </header>

      <div className="user-dashboard-wrapper">
        {/* Left Sidebar - Enhanced Navigation */}
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
            <Link 
              to="/dashboard/user" 
              className="user-nav-item"
            >
              <span className="user-nav-icon">{Icons.dashboard}</span>
              <span className="user-nav-text">DASHBOARD</span>
            </Link>
            
            <button 
              className="user-nav-item"
              onClick={() => navigateToView('notification')}
            >
              <span className="user-nav-icon">{Icons.notification}</span>
              <span className="user-nav-text">NOTIFICATION</span>
            </button>
            
            <button
              className={`user-nav-item ${dataRegistrationExpanded ? 'active' : ''}`}
              onClick={handleDataRegistrationClick}
            >
              <span className="user-nav-icon">{Icons.dataRegistration}</span>
              <span className="user-nav-text">DATA REGISTRATION</span>
            </button>
            
            {dataRegistrationExpanded && (
              <>
                <button 
                  className="user-nav-item user-nav-expanded"
                  onClick={() => navigateToExpandedView('enrollmentForm')}
                >
                  <span className="user-nav-icon">{Icons.enrollmentForm}</span>
                  <span className="user-nav-text">ENROLLMENT FORM</span>
                </button>
                
                <button 
                  className="user-nav-item user-nav-expanded"
                  onClick={() => navigateToExpandedView('database')}
                >
                  <span className="user-nav-icon">{Icons.database}</span>
                  <span className="user-nav-text">DATABASE</span>
                </button>
                
                <button 
                  className="user-nav-item user-nav-expanded"
                  onClick={() => navigateToExpandedView('documentFiles')}
                >
                  <span className="user-nav-icon">{Icons.documentFiles}</span>
                  <span className="user-nav-text">DOCUMENT FILES</span>
                </button>
              </>
            )}
            
            <button 
              className="user-nav-item"
              onClick={() => navigateToView('dir')}
            >
              <span className="user-nav-icon">{Icons.dir}</span>
              <span className="user-nav-text">DIR</span>
            </button>
            
            <button 
              className="user-nav-item"
              onClick={() => navigateToView('safety')}
            >
              <span className="user-nav-icon">{Icons.safety}</span>
              <span className="user-nav-text">SHE-MS</span>
            </button>
            
            <button 
              className="user-nav-item"
              onClick={() => navigateToView('incident')}
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
              <div className="profile-content">
                {/* Progress Bar */}
                <div className="profile-progress-section">
                  <div className="profile-progress-header">
                    <span className="profile-progress-title">Profile Completion</span>
                    <span className="profile-progress-percentage">{formProgress}%</span>
                  </div>
                  <div className="profile-progress-bar">
                    <div 
                      className="profile-progress-fill" 
                      style={{ width: `${formProgress}%` }}
                    ></div>
                  </div>
                  {lastSaved && (
                    <div className="profile-auto-save-status">
                      {Icons.save}
                      <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                      {isAutoSaving && <span className="profile-saving">Saving...</span>}
                    </div>
                  )}
                </div>

                {/* Info Banner */}
                <div className="profile-info-banner">
                  <div className="info-icon">{Icons.info}</div>
                  <div className="info-text">
                    <div>To register an account, please fill out the following fields and we will e-mail your login information.</div>
                    <div>For any questions or concerns about the account registration, please email bizdev@inflightmenuph.com</div>
                  </div>
                </div>
                
                {/* Company Information Section */}
                <div className="profile-section-title">COMPANY INFORMATION</div>
                
                <form onSubmit={handleSubmit} className="profile-form">
                  {/* Company Info Layout */}
                  <div className="profile-company-section">
                    {/* Company Logo */}
                    <div className="profile-logo-section">
                      <div className="profile-logo-label">COMPANY PROFILE LOGO</div>
                      <div className="profile-logo-upload">
                        <div className="profile-logo-box">
                          {companyLogo ? (
                            <img 
                              src={URL.createObjectURL(companyLogo)} 
                              alt="Company Logo" 
                              className="profile-uploaded-logo"
                            />
                          ) : (
                            <div className="profile-logo-placeholder">
                              {Icons.camera}
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          ref={logoInputRef}
                          style={{ display: 'none' }}
                          onChange={handleLogoUpload}
                        />
                        <button 
                          type="button" 
                          className="profile-upload-btn"
                          onClick={() => logoInputRef.current.click()}
                        >
                          UPLOAD
                        </button>
                        <div className="profile-upload-hint">
                          Max 5MB • JPG, PNG, GIF
                        </div>
                      </div>
                    </div>
                    
                    {/* Form Fields */}
                    <div className="profile-form-fields">
                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label className="profile-label">USER ID <span className="profile-field-note">(Generated Automatically Base in Registration)</span></label>
                          <input 
                            type="text" 
                            className="profile-input" 
                            value={formFields.userId}
                            disabled
                          />
                        </div>
                        <div className="profile-form-group">
                          <label className="profile-label">
                            COMPANY NAME <span className="profile-required">*</span>
                          </label>
                          <input 
                            type="text" 
                            className={getFieldClass('companyName')}
                            value={formFields.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            placeholder="Enter company name"
                          />
                          {fieldErrors.companyName && (
                            <div className="profile-error-message">
                              {Icons.error}
                              {fieldErrors.companyName}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label className="profile-label">
                            LAST NAME <span className="profile-field-note">(Company Representative)</span> <span className="profile-required">*</span>
                          </label>
                          <input 
                            type="text" 
                            className={getFieldClass('lastName')}
                            value={formFields.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Enter last name"
                          />
                          {fieldErrors.lastName && (
                            <div className="profile-error-message">
                              {Icons.error}
                              {fieldErrors.lastName}
                            </div>
                          )}
                        </div>
                        <div className="profile-form-group">
                          <label className="profile-label">
                            CONTACT # <span className="profile-required">*</span>
                          </label>
                          <input 
                            type="text" 
                            className={getFieldClass('contactNumber')}
                            value={formFields.contactNumber}
                            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                            placeholder="e.g. +63 917 123 4567"
                          />
                          {fieldErrors.contactNumber && (
                            <div className="profile-error-message">
                              {Icons.error}
                              {fieldErrors.contactNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label className="profile-label">
                            FIRST NAME <span className="profile-field-note">(Company Representative)</span> <span className="profile-required">*</span>
                          </label>
                          <input 
                            type="text" 
                            className={getFieldClass('firstName')}
                            value={formFields.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="Enter first name"
                          />
                          {fieldErrors.firstName && (
                            <div className="profile-error-message">
                              {Icons.error}
                              {fieldErrors.firstName}
                            </div>
                          )}
                        </div>
                        <div className="profile-form-group">
                          <label className="profile-label">TELEPHONE #</label>
                          <input 
                            type="text" 
                            className={getFieldClass('telephoneNumber')}
                            value={formFields.telephoneNumber}
                            onChange={(e) => handleInputChange('telephoneNumber', e.target.value)}
                            placeholder="e.g. (02) 8123 4567"
                          />
                          {fieldErrors.telephoneNumber && (
                            <div className="profile-error-message">
                              {Icons.error}
                              {fieldErrors.telephoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label className="profile-label">DESIGNATION</label>
                          <input 
                            type="text" 
                            className="profile-input"
                            value={formFields.designation}
                            onChange={(e) => handleInputChange('designation', e.target.value)}
                            placeholder="e.g. General Manager"
                          />
                        </div>
                        <div className="profile-form-group">
                          <label className="profile-label">
                            EMAIL ADDRESS <span className="profile-required">*</span>
                          </label>
                          <input 
                            type="email" 
                            className={getFieldClass('emailAddress')}
                            value={formFields.emailAddress}
                            onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                            placeholder="example@company.com"
                          />
                          {fieldErrors.emailAddress && (
                            <div className="profile-error-message">
                              {Icons.error}
                              {fieldErrors.emailAddress}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Primary Documents Section */}
                  <div className="profile-section-title">
                    PRIMARY DOCUMENTS
                    <span className="profile-section-subtitle">Required documents for account verification</span>
                  </div>
                  <div className="profile-documents-section">
                    <div className="profile-documents-row">
                      <div className="profile-document-item">
                        <div className="profile-document-status">
                          {documents['business-permit'] ? (
                            <div className="profile-check-icon">{Icons.check}</div>
                          ) : null}
                        </div>
                        <div className="profile-document-icon">{Icons.documentIcon}</div>
                        <input
                          type="file"
                          ref={documentInputRefs['business-permit']}
                          style={{ display: 'none' }}
                          onChange={(e) => handleDocumentUpload('business-permit', e)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <button 
                          type="button"
                          className={`profile-document-btn ${documents['business-permit'] ? 'uploaded' : ''}`}
                          onClick={() => documentInputRefs['business-permit'].current.click()}
                        >
                          Business Permit
                          {documents['business-permit'] && <span className="profile-required">*</span>}
                        </button>
                      </div>

                      <div className="profile-document-item">
                        <div className="profile-document-status">
                          {documents['sample-soa'] ? (
                            <div className="profile-check-icon">{Icons.check}</div>
                          ) : null}
                        </div>
                        <div className="profile-document-icon">{Icons.documentIcon}</div>
                        <input
                          type="file"
                          ref={documentInputRefs['sample-soa']}
                          style={{ display: 'none' }}
                          onChange={(e) => handleDocumentUpload('sample-soa', e)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <button 
                          type="button"
                          className={`profile-document-btn ${documents['sample-soa'] ? 'uploaded' : ''}`}
                          onClick={() => documentInputRefs['sample-soa'].current.click()}
                        >
                          Sample of SOA
                        </button>
                      </div>
                    </div>

                    <div className="profile-documents-row">
                      <div className="profile-document-item">
                        <div className="profile-document-status">
                          {documents['dtsec'] ? (
                            <div className="profile-check-icon">{Icons.check}</div>
                          ) : null}
                        </div>
                        <div className="profile-document-icon">{Icons.documentIcon}</div>
                        <input
                          type="file"
                          ref={documentInputRefs['dtsec']}
                          style={{ display: 'none' }}
                          onChange={(e) => handleDocumentUpload('dtsec', e)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <button 
                          type="button"
                          className={`profile-document-btn ${documents['dtsec'] ? 'uploaded' : ''}`}
                          onClick={() => documentInputRefs['dtsec'].current.click()}
                        >
                          DTI/SEC
                          {documents['dtsec'] && <span className="profile-required">*</span>}
                        </button>
                      </div>

                      <div className="profile-document-item">
                        <div className="profile-document-status">
                          {documents['sample-invoice'] ? (
                            <div className="profile-check-icon">{Icons.check}</div>
                          ) : null}
                        </div>
                        <div className="profile-document-icon">{Icons.documentIcon}</div>
                        <input
                          type="file"
                          ref={documentInputRefs['sample-invoice']}
                          style={{ display: 'none' }}
                          onChange={(e) => handleDocumentUpload('sample-invoice', e)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <button 
                          type="button"
                          className={`profile-document-btn ${documents['sample-invoice'] ? 'uploaded' : ''}`}
                          onClick={() => documentInputRefs['sample-invoice'].current.click()}
                        >
                          Sample of Service Invoice
                        </button>
                      </div>
                    </div>

                    <div className="profile-documents-row">
                      <div className="profile-document-item">
                        <div className="profile-document-status">
                          {documents['bir2303'] ? (
                            <div className="profile-check-icon">{Icons.check}</div>
                          ) : null}
                        </div>
                        <div className="profile-document-icon">{Icons.documentIcon}</div>
                        <input
                          type="file"
                          ref={documentInputRefs['bir2303']}
                          style={{ display: 'none' }}
                          onChange={(e) => handleDocumentUpload('bir2303', e)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <button 
                          type="button"
                          className={`profile-document-btn ${documents['bir2303'] ? 'uploaded' : ''}`}
                          onClick={() => documentInputRefs['bir2303'].current.click()}
                        >
                          BIR 2303
                          {documents['bir2303'] && <span className="profile-required">*</span>}
                        </button>
                      </div>

                      <div className="profile-document-item">
                        <div className="profile-document-status">
                          {documents['service-agreement'] ? (
                            <div className="profile-check-icon">{Icons.check}</div>
                          ) : null}
                        </div>
                        <div className="profile-document-icon">{Icons.documentIcon}</div>
                        <input
                          type="file"
                          ref={documentInputRefs['service-agreement']}
                          style={{ display: 'none' }}
                          onChange={(e) => handleDocumentUpload('service-agreement', e)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <button 
                          type="button"
                          className={`profile-document-btn ${documents['service-agreement'] ? 'uploaded' : ''}`}
                          onClick={() => documentInputRefs['service-agreement'].current.click()}
                        >
                          Service Agreement
                        </button>
                      </div>
                    </div>
                    
                    <div className="profile-upload-hint">
                      Accepted formats: PDF, DOC, DOCX, JPG, PNG • Max 10MB per file
                    </div>
                  </div>

                  {/* Payment Terms Section */}
                  <div className="profile-section-title">PAYMENT TERMS</div>
                  <div className="profile-payment-section">
                    <div className="profile-payment-row">
                      <div className="profile-form-group">
                        <label className="profile-label">NAME OF BANK</label>
                        <select 
                          className="profile-select"
                          value={formFields.nameOfBank}
                          onChange={(e) => handleInputChange('nameOfBank', e.target.value)}
                        >
                          <option value="">Select a bank</option>
                          <option value="BDO">BDO Unibank</option>
                          <option value="BPI">Bank of the Philippine Islands</option>
                          <option value="Metrobank">Metropolitan Bank & Trust Company</option>
                          <option value="Security Bank">Security Bank Corporation</option>
                          <option value="PNB">Philippine National Bank</option>
                          <option value="Unionbank">Union Bank of the Philippines</option>
                          <option value="RCBC">Rizal Commercial Banking Corporation</option>
                          <option value="Chinabank">China Banking Corporation</option>
                        </select>
                      </div>
                      <div className="profile-form-group profile-form-group-single">
                        <label className="profile-label">CREDIT TERMS</label>
                        <select 
                          className="profile-select"
                          value={formFields.creditTerms}
                          onChange={(e) => handleInputChange('creditTerms', e.target.value)}
                        >
                          <option value="">Select credit terms</option>
                          <option value="15 days">15 days</option>
                          <option value="30 days">30 days</option>
                          <option value="45 days">45 days</option>
                          <option value="60 days">60 days</option>
                          <option value="90 days">90 days</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="profile-payment-row">
                      <div className="profile-form-group">
                        <label className="profile-label">ACCOUNT NAME</label>
                        <input 
                          type="text" 
                          className="profile-input" 
                          value={formFields.accountName}
                          onChange={(e) => handleInputChange('accountName', e.target.value)}
                          placeholder="Enter account name as it appears on bank records"
                        />
                      </div>
                      <div className="profile-form-group">
                        <label className="profile-label">ACCOUNT NUMBER</label>
                        <input 
                          type="text" 
                          className="profile-input" 
                          value={formFields.accountNumber}
                          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                          placeholder="Enter bank account number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="profile-submit-section">
                    <button 
                      type="submit" 
                      className={`profile-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                      disabled={isSubmitting || formProgress < 70}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="profile-spinner"></div>
                          UPDATING PROFILE...
                        </>
                      ) : (
                        'SUBMIT'
                      )}
                    </button>
                    {formProgress < 70 && (
                      <div className="profile-submit-hint">
                        {Icons.warning}
                        Please complete at least 70% of the form to submit
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile; 