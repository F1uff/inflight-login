import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HotelDashboard.css';

import redPlanetLogo from '../assets/redplanet-logo.png';
import inflightLogo from '../assets/inflight-menu-logo.png';

// SVG icons used in the hotel dashboard
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
  hotel: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
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
  ),
  add: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  )
};

// Sample hotel booking records for display
const hotelBookingData = [
  {
    id: 1,
    hotelVoucher: 'HV0007656',
    hotelReference: 'TCG-78351478',
    coveredDate: 'May 24, 2025\nMay 25, 2025',
    guestName: 'Mr. Mark Reiner Rebayno',
    contactNumber: '0917-152-8222',
    noOfStay: '1',
    branch: 'BGC',
    status: 'checkin'
  },
  {
    id: 2,
    hotelVoucher: 'HV0007656',
    hotelReference: 'TCG-13MT938465',
    coveredDate: 'May 24, 2025\nMay 25, 2025',
    guestName: 'Mr. Mark Reiner Rebayno',
    contactNumber: '0917-152-8222',
    noOfStay: '1',
    branch: 'Davao',
    status: 'ongoing'
  }
];

// Dashboard statistics summary
const hotelServiceStats = {
  request: 12,
  checkin: 6,
  totalService: 34
};

const HotelDashboard = () => {
  // UI state management
  const [currentView, setCurrentView] = useState('dashboard');
  const [isFormSubmissionExpanded, setIsFormSubmissionExpanded] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState(null);
  
  const navigate = useNavigate();
  
  // Handle user logout by removing token and redirecting to login
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Change current view when sidebar navigation is clicked
  const handleNavClick = (view) => {
    if (view === 'formSubmission') {
      setIsFormSubmissionExpanded(!isFormSubmissionExpanded);
    }
    setCurrentView(view);
  };

  // Expand/collapse booking details row
  const toggleRowExpansion = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  // Render different content based on selected navigation item
  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <>
            {/* Dashboard header with title and filter controls */}
            <div className="hotel-service-header-container">
              <div className="hotel-service-title-container">
                <div className="hotel-service-icon">{HotelIcons.hotel}</div>
                <h2 className="hotel-service-title">HOTELS</h2>
              </div>
              <div className="hotel-service-controls">
                <div className="hotel-date-selector">
                  <span className="hotel-date-icon">{HotelIcons.calendar}</span>
                  <select className="hotel-date-range-select">
                    <option>25/04/2025 - 24/05/2025</option>
                  </select>
                </div>
                <button className="hotel-filters-btn">
                  <span className="hotel-filter-icon">{HotelIcons.filter}</span>
                  <span>Filters</span>
                </button>
              </div>
            </div>
            
            {/* Statistics overview boxes */}
            <div className="hotel-service-stats-container">
              <div className="hotel-stat-box">
                <h3 className="hotel-stat-title">REQUEST</h3>
                <div className="hotel-stat-value">{hotelServiceStats.request}</div>
              </div>
              <div className="hotel-stat-box">
                <h3 className="hotel-stat-title">CHECK-IN</h3>
                <div className="hotel-stat-value">{hotelServiceStats.checkin}</div>
              </div>
              <div className="hotel-stat-box hotel-active-stat">
                <h3 className="hotel-stat-title">TOTAL SERVICE</h3>
                <div className="hotel-stat-value">{hotelServiceStats.totalService}</div>
              </div>
            </div>
            
            {/* Bookings table with status indicators */}
            <div className="hotel-bookings-container">
              <div className="hotel-bookings-header">
                <h2 className="hotel-bookings-title">BOOKINGS</h2>
                <div className="hotel-status-indicators">
                  <div className="hotel-status-indicator">
                    <div className="hotel-status-dot hotel-checkout-status"></div>
                    <span>Check-out</span>
                  </div>
                  <div className="hotel-status-indicator">
                    <div className="hotel-status-dot hotel-checkin-status"></div>
                    <span>Check-in</span>
                  </div>
                  <div className="hotel-status-indicator">
                    <div className="hotel-status-dot hotel-cancelled-status"></div>
                    <span>Cancelled</span>
                  </div>
                  <div className="hotel-status-indicator">
                    <div className="hotel-status-dot hotel-request-status"></div>
                    <span>Request / Pencil book</span>
                  </div>
                </div>
              </div>
              
              <div className="hotel-booking-filters">
                <div className="hotel-voucher-selector">
                  <select className="hotel-voucher-select">
                    <option>HOTEL VOUCHER</option>
                  </select>
                </div>
                <div className="hotel-search-container">
                  <input type="text" placeholder="Enter exact ID" className="hotel-id-search" />
                  <button className="hotel-search-btn">
                    <span className="hotel-search-icon">{HotelIcons.search}</span>
                  </button>
                </div>
              </div>
              
              {/* Table */}
              <div className="hotel-bookings-table-wrapper">
                <table className="hotel-bookings-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>HOTEL VOUCHER</th>
                      <th>HOTEL REFERENCE</th>
                      <th>COVERED DATE</th>
                      <th>GUEST NAME</th>
                      <th>CONTACT NUMBER</th>
                      <th>NO. OF STAY</th>
                      <th>BRANCH</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotelBookingData.map((booking) => (
                      <React.Fragment key={booking.id}>
                        <tr 
                          className={`hotel-booking-row ${expandedRowId === booking.id ? 'expanded' : ''}`}
                          onClick={() => toggleRowExpansion(booking.id)}
                        >
                          <td className="expand-icon">
                            <span>{expandedRowId === booking.id ? '∨' : '>'}</span>
                          </td>
                          <td>{booking.hotelVoucher}</td>
                          <td>{booking.hotelReference}</td>
                          <td style={{ whiteSpace: 'pre-line' }}>{booking.coveredDate}</td>
                          <td>{booking.guestName}</td>
                          <td>{booking.contactNumber}</td>
                          <td>{booking.noOfStay}</td>
                          <td>{booking.branch}</td>
                          <td>
                            <div className={`hotel-status-indicator ${booking.status}`}></div>
                          </td>
                        </tr>
                        {expandedRowId === booking.id && (
                          <tr className="hotel-expanded-details">
                            <td colSpan="9">
                              <div className="hotel-booking-details-form">
                                <div className="hotel-form-sections">
                                  <div className="hotel-form-section">
                                    <div className="hotel-form-group">
                                      <label>CHECK IN</label>
                                      <input type="text" />
                                    </div>
                                    <div className="hotel-form-group">
                                      <label>CHECK OUT</label>
                                      <input type="text" />
                                    </div>
                                    <div className="hotel-form-group">
                                      <label>ROOM CATEGORY</label>
                                      <input type="text" />
                                    </div>
                                    <div className="hotel-form-group">
                                      <label>BREAKFAST</label>
                                      <input type="text" />
                                    </div>
                                  </div>
                                  <div className="hotel-form-section hotel-remarks-section">
                                    <div className="hotel-form-group">
                                      <label>GENERAL REMARKS</label>
                                      <textarea rows="8"></textarea>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      
      case 'notification':
        return (
          <div className="hotel-default-content">
            <div className="hotel-service-header-container">
              <div className="hotel-service-title-container">
                <div className="hotel-service-icon">{HotelIcons.notification}</div>
                <h2 className="hotel-service-title">NOTIFICATIONS</h2>
              </div>
            </div>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Notification Center</h3>
              <p>No new notifications at this time.</p>
            </div>
          </div>
        );

      case 'formSubmission':
        return (
          <div className="hotel-register-content">
            {/* Header */}
            <div className="hotel-register-header">
              <h2 className="hotel-register-title">HOTEL REGISTER</h2>
              <button className="add-branch-btn">
                <span className="add-icon">{HotelIcons.add}</span>
                ADD BRANCH
              </button>
                          </div>
              
              {/* Properties */}
              <div className="property-section">
              <div className="property-header">
                <div className="property-title-container">
                  <h3 className="property-title">PROPERTY</h3>
                  <div className="property-status-indicators">
                    <div className="property-status-item">
                      <div className="status-dot active-status"></div>
                      <span>Active</span>
                    </div>
                    <div className="property-status-item">
                      <div className="status-dot pending-status"></div>
                      <span>Pending</span>
                    </div>
                    <div className="property-status-item">
                      <div className="status-dot inactive-status"></div>
                      <span>In-active</span>
                    </div>
                  </div>
                </div>
                <div className="property-search-container">
                  <select className="hotel-id-dropdown">
                    <option>HOTEL ID</option>
                  </select>
                  <input type="text" placeholder="Enter exact ID" className="property-search-input" />
                  <button className="property-search-btn">
                    <span className="search-icon">{HotelIcons.search}</span>
                  </button>
                </div>
              </div>

                              {/* Table */}
              <div className="property-table-wrapper">
                <table className="property-table">
                  <thead>
                    <tr>
                      <th>HOTEL ID</th>
                      <th>Hotel Name</th>
                      <th>Hotel Address</th>
                      <th>Sales Representative</th>
                      <th>Contact number</th>
                      <th>Frontdesk Representative</th>
                      <th>Contact number</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                                      <tbody>
                      {/* Empty table */}
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'dataRegistration':
        return (
          <div className="hotel-default-content">
            <div className="hotel-service-header-container">
              <div className="hotel-service-title-container">
                <div className="hotel-service-icon">{HotelIcons.formSubmission}</div>
                <h2 className="hotel-service-title">DATA REGISTRATION</h2>
              </div>
            </div>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Data Registration Management</h3>
              <p>Data registration functionality coming soon...</p>
            </div>
          </div>
        );

      case 'enrollmentForm':
        return (
          <div className="hotel-default-content">
            <div className="hotel-service-header-container">
              <div className="hotel-service-title-container">
                <div className="hotel-service-icon">{HotelIcons.documentFiles}</div>
                <h2 className="hotel-service-title">ENROLLMENT FORM</h2>
              </div>
            </div>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>Enrollment Form Management</h3>
              <p>Enrollment form functionality coming soon...</p>
            </div>
          </div>
        );

      case 'roomCategory':
        return (
          <div className="hotel-room-rates-content">
            <div className="hotel-room-rates-header">
              <h2 className="hotel-room-rates-title">HOTEL REGISTER</h2>
              <button className="hotel-room-category-btn">
                <span className="hotel-add-icon">{HotelIcons.add}</span>
                <span>ROOM CATEGORY</span>
              </button>
            </div>

            {/* Room Rates */}
            <div className="hotel-room-rates-section">
              <div className="hotel-room-rates-table-header">
                <h3 className="hotel-table-title">ROOM RATES</h3>
                
                {/* Filters */}
                <div className="hotel-status-filters-row">
                  <div className="hotel-status-filters-new">
                    <button className="hotel-filter-btn-circular hotel-active-filter-circular">
                      <span className="filter-dot"></span>
                      Active
                    </button>
                    <button className="hotel-filter-btn-circular hotel-pending-filter-circular">
                      <span className="filter-dot"></span>
                      Pending
                    </button>
                    <button className="hotel-filter-btn-circular hotel-inactive-filter-circular">
                      <span className="filter-dot"></span>
                      In-active
                    </button>
                </div>
                  
                  <div className="hotel-table-controls-new">
                    <select className="hotel-control-select-new">
                    <option>HOTEL ID</option>
                  </select>
                    <input type="text" placeholder="Enter exact ID" className="hotel-control-input-new" />
                    <button className="hotel-control-btn-new">
                    <span className="hotel-search-icon">{HotelIcons.search}</span>
                  </button>
                  </div>
                </div>
              </div>
              
              <div className="hotel-room-rates-table-wrapper">
                <table className="hotel-room-rates-table">
                  <thead>
                    <tr>
                      <th>HOTEL ID</th>
                      <th>Hotel Name</th>
                      <th>Room Quantity</th>
                      <th>Type of Rates</th>
                      <th>Type of Breakfast</th>
                      <th>Mode of Payment</th>
                      <th>Validity of rates</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="hotel-expand-icon">&gt;</span>
                        HTL01
                      </td>
                      <td>Red Planet BGC</td>
                      <td>165</td>
                      <td>Contracted</td>
                      <td>Plated</td>
                      <td>LOA</td>
                      <td>Dec. 31, 2026</td>
                      <td>
                        <div className="hotel-status-indicator-cell">
                          <div className="hotel-status-dot hotel-active-dot"></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="hotel-expand-icon">&gt;</span>
                        HTL02
                      </td>
                      <td>Red Planet Amorsolo</td>
                      <td>189</td>
                      <td>Contracted</td>
                      <td>Plated</td>
                      <td>GCLINK</td>
                      <td style={{ color: '#dc3545' }}>May 23, 2025</td>
                      <td>
                        <div className="hotel-status-indicator-cell">
                          <div className="hotel-status-dot hotel-inactive-dot"></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        V HTL03
                      </td>
                      <td>Red Planet Clark</td>
                      <td>167</td>
                      <td>Contracted</td>
                      <td>Plated</td>
                      <td>LOA</td>
                      <td>Dec. 31, 2026</td>
                      <td>
                        <div className="hotel-status-indicator-cell">
                          <div className="hotel-status-dot hotel-pending-dot"></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Room Details */}
              <div className="hotel-room-details-section">
                <div className="hotel-room-details-controls">
                  <div className="hotel-seasons-rate">
                    <select className="hotel-seasons-select">
                      <option>SEASONS RATE</option>
                    </select>
                  </div>
                  <button className="hotel-filters-btn">
                    <span className="hotel-filter-icon">{HotelIcons.filter}</span>
                    <span>Filters</span>
                  </button>
                </div>

                <div className="hotel-room-rates-grid">
                  <div className="hotel-room-type-section">
                    <h4>TYPE OF ROOM</h4>
                    <div className="hotel-room-publish-rates">
                      <h5>PUBLISH RATES</h5>
                      <div className="hotel-rate-columns">
                        <div className="hotel-rate-column">
                          <label>Single</label>
                        </div>
                        <div className="hotel-rate-column">
                          <label>Double</label>
                        </div>
                      </div>
                    </div>
                    <div className="hotel-room-contracted-rates">
                      <h5>CONTRACTED RATES</h5>
                      <div className="hotel-rate-columns">
                        <div className="hotel-rate-column">
                          <label>Single</label>
                        </div>
                        <div className="hotel-rate-column">
                          <label>Double</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hotel-room-features-section">
                    <h4>Room Features</h4>
                    <div className="hotel-features-list">
                      <p>➤ Personal Safety Box</p>
                      <p>➤ Airconditioning</p>
                      <p>➤ Flatscreen LED Television</p>
                      <p>➤ Fan</p>
                      <p>➤ Hair Dryer</p>
                      <p>➤ Towels and limited Toiletries</p>
                    </div>
                    
                    <h4>INCLUSIONS:</h4>
                    <div className="hotel-inclusions-list">
                      <p>• Use of Function room</p>
                      <p>• Use of LCD Projector with White Screen**</p>
                      <p>• Use of LED TV</p>
                      <p>• Whiteboard and Markers**</p>
                      <p>• 1 Bottled Water per person (except for Red Planet Ortigas, where the package includes one round of coffee or</p>
                      <p>Iced Tea and Red Planet CDO which provides Hot and Cold-Water Dispenser and disposable cups)</p>
                      <p>• Pencil and Paper</p>
                      <p>• Mints</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="hotel-property-content">
            <div className="hotel-property-header">
              <h2 className="hotel-property-title">HOTEL REGISTER</h2>
              <button className="hotel-add-branch-btn">
                <span className="hotel-add-icon">{HotelIcons.add}</span>
                <span>ADD BRANCH</span>
              </button>
            </div>

            {/* Properties */}
            <div className="hotel-property-section">
              <div className="hotel-property-table-header">
                <h3 className="hotel-table-title">PROPERTY</h3>
                
                {/* Filters */}
                <div className="hotel-status-filters-row">
                  <div className="hotel-status-filters-new">
                    <button className="hotel-filter-btn-circular hotel-active-filter-circular">
                      <span className="filter-dot"></span>
                      Active
                    </button>
                    <button className="hotel-filter-btn-circular hotel-pending-filter-circular">
                      <span className="filter-dot"></span>
                      Pending
                    </button>
                    <button className="hotel-filter-btn-circular hotel-inactive-filter-circular">
                      <span className="filter-dot"></span>
                      In-active
                    </button>
                </div>
                  
                  <div className="hotel-table-controls-new">
                    <select className="hotel-control-select-new">
                    <option>HOTEL ID</option>
                  </select>
                    <input type="text" placeholder="Enter exact ID" className="hotel-control-input-new" />
                    <button className="hotel-control-btn-new">
                    <span className="hotel-search-icon">{HotelIcons.search}</span>
                  </button>
                  </div>
                </div>
              </div>
              
              <div className="hotel-property-table-wrapper">
                <table className="hotel-property-table">
                  <thead>
                    <tr>
                      <th>HOTEL ID</th>
                      <th>Hotel Name</th>
                      <th>Hotel Address</th>
                      <th>Sales Representative</th>
                      <th>Contact number</th>
                      <th>Frontdesk Representative</th>
                      <th>Contact number</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                                      <tbody>
                      {/* Empty table */}
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="hotel-default-content">
            <div className="hotel-service-header-container">
              <div className="hotel-service-title-container">
                <div className="hotel-service-icon">{HotelIcons[currentView] || HotelIcons.hotel}</div>
                <h2 className="hotel-service-title">{currentView.toUpperCase()}</h2>
              </div>
            </div>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h3>{currentView.charAt(0).toUpperCase() + currentView.slice(1)} Management</h3>
              <p>{currentView.charAt(0).toUpperCase() + currentView.slice(1)} functionality coming soon...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* Header */}
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
        {/* Sidebar */}
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
        
                  {/* Content */}
        <div className="hotel-content">
          <div className="hotel-dashboard-content">
            <div className="hotel-dashboard-main-content">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HotelDashboard; 