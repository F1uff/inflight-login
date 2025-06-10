import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import inflightLogo from '../assets/inflight-menu-logo.png';

// Navigation and UI icons
const Icons = {
  dashboard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4v-4h-4v4zm0 6h4v-4h-4v4zm-8 0h4v-4H4v4zm8 6h4v-4h-4v4z"/>
    </svg>
  ),
  notification: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
    </svg>
  ),
  monitoring: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ),
  suppliers: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 11V3H7v8H3v10h18V11h-4zm-8-6h2v2H9V5zm0 4h2v2H9V9zm4-4h2v2h-2V5zm0 4h2v2h-2V9zm4 0h2v2h-2V9zm0 4h2v2h-2v-2zm-8 0h2v2H9v-2zm4 0h2v2h-2v-2z"/>
    </svg>
  ),
  accounts: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  ),
  documents: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  dir: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>
    </svg>
  ),
  shems: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
    </svg>
  ),
  incident: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4zm0-6h-2v-4h2v4z"/>
    </svg>
  ),
  portfolioHotel: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  ),
  portfolioTransfer: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  ),
  portfolioAirline: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>
  ),
  portfolioTravelOperator: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
      <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49 1c-.23-.09-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49-1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
    </svg>
  ),
  filterIcon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </svg>
  ),
  chevronDownIcon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 10l5 5 5-5H7z"/>
    </svg>
  ),
  searchIcon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  ),
  calendarIcon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
    </svg>
  )
};

// User and application data
const userData = {
  name: 'REINER REBAYNO',
  role: 'ADMIN'
};

// Portfolio card counts
const supplierData = {
  hotel: 1970,
  transfer: 45,
  airline: 7,
  travelOperator: 200
};

// Sample supplier lists
const hotelSuppliersList = [
  {
    id: 1,
    location: 'MANILA',
    propertyName: 'RED PLANET MANILA MALATE',
    propertyAddress: '1740 A. Mabini St. Manila',
    contractedRates: 'Jan. 10, 2025',
    corporateRates: 'N/A',
    validity: 'Dec. 31, 2025',
    remarks: 'Accredited',
    status: 'active'
  },
  {
    id: 2,
    location: 'TAGUIG',
    propertyName: 'F1 HOTEL MANILA',
    propertyAddress: '32nd Street, corner Lane A',
    contractedRates: 'Feb. 26, 2025',
    corporateRates: 'March 5, 2025',
    validity: 'Dec. 31, 2025',
    remarks: 'Accredited Prepaid',
    status: 'pending'
  }
];

const landTransferSuppliersList = [
  {
    id: 1,
    location: 'BAGUIO',
    companyName: 'HAT Transport',
    companyAddress: 'Baguio City',
    tariffRate: 'N/A',
    validity: 'N/A',
    remarks: 'Non Accredited',
    status: 'inactive'
  }
];

// Sample accounts data
const accountsData = [
  {
    id: 'TIM001',
    name: 'Mark Reiner Rebayno',
    designation: 'Business Development Assistant',
    company: 'Inflight Menu Travel Corp.',
    email: 'bizdev@inflightmenuph.com',
    group: 'Admin',
    status: 'active'
  },
  {
    id: 'TIM002',
    name: 'Luigi Morales',
    designation: 'IT',
    company: 'Inflight Menu Travel Corp.',
    email: '',
    group: 'Admin',
    status: 'pending'
  },
  {
    id: '',
    name: '',
    designation: '',
    company: '',
    email: '',
    group: 'Travel Desk',
    status: 'inactive'
  },
  {
    id: '',
    name: '',
    designation: '',
    company: '',
    email: '',
    group: 'Supplier',
    status: 'active'
  },
  {
    id: '',
    name: '',
    designation: '',
    company: '',
    email: '',
    group: 'Supplier',
    status: 'active'
  },
  {
    id: '',
    name: '',
    designation: '',
    company: '',
    email: '',
    group: 'Travel Desk',
    status: 'active'
  }
];

const accountsStats = {
  allEmployees: 11,
  active: 8,
  pending: 3
};

// Add a StatusIndicators component for reuse across pages
const StatusIndicators = () => {
  const [selectedStatus, setSelectedStatus] = useState(null);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  return (
    <div className="status-indicators-container">
      <label className="radio-container">
        <input 
          type="radio" 
          name="status" 
          value="active" 
          checked={selectedStatus === 'active'} 
          onChange={() => handleStatusChange('active')}
        />
        <span className="radio-checkmark active"></span>
        Active
      </label>
      
      <label className="radio-container">
        <input 
          type="radio" 
          name="status" 
          value="pending" 
          checked={selectedStatus === 'pending'} 
          onChange={() => handleStatusChange('pending')}
        />
        <span className="radio-checkmark pending"></span>
        Pending
      </label>
      
      <label className="radio-container">
        <input 
          type="radio" 
          name="status" 
          value="inactive" 
          checked={selectedStatus === 'inactive'} 
          onChange={() => handleStatusChange('inactive')}
        />
        <span className="radio-checkmark inactive"></span>
        In-active
      </label>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedSupplierType, setSelectedSupplierType] = useState('hotels');
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const toggleRowExpansion = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const handleSupplierTypeChange = (e) => {
    setSelectedSupplierType(e.target.value);
    setExpandedRowId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    setExpandedRowId(null);
  };

  const getCurrentSuppliersList = () => {
    return selectedSupplierType === 'hotels' ? hotelSuppliersList : landTransferSuppliersList;
  };

  const getTableHeaders = () => {
    if (selectedSupplierType === 'hotels') {
      return ['', 'Location', 'Property Name', 'Property Address', 'Contracted Rates', 'Corporate Rates', 'Validity', 'Remarks', 'Status'];
    } else {
      return ['', 'Location', 'Company Name', 'Company Address', 'Tariff Rate', 'Validity', 'Remarks', 'Status'];
    }
  };

  const getTableRowData = (supplier) => {
    if (selectedSupplierType === 'hotels') {
      return [
        supplier.location,
        supplier.propertyName,
        supplier.propertyAddress,
        supplier.contractedRates,
        supplier.corporateRates,
        supplier.validity,
        supplier.remarks
      ];
    } else {
      return [
        supplier.location,
        supplier.companyName,
        supplier.companyAddress,
        supplier.tariffRate,
        supplier.validity,
        supplier.remarks
      ];
    }
  };

  // Suppliers page statistics
  const suppliersStats = {
    accredited: { value: 1970, color: '#2196F3' },
    accreditedPrepaid: { value: 45, color: '#FF9800' },
    nonAccredited: { value: 7, color: '#F44336' },
    ncrLuzon: { value: 1970, color: '#FFC107' },
    visayas: { value: 45, color: '#4CAF50' },
    mindanao: { value: 7, color: '#2196F3' }
  };

  // Sample suppliers list
  const suppliersListData = [
    {
      id: 1,
      location: 'MANILA',
      propertyName: 'RED PLANET MANILA MALATE',
      propertyAddress: '1740 A. Mabini St. Manila',
      contractedRates: 'Jan. 10, 2025',
      corporateRates: 'N/A',
      validity: 'Dec. 31, 2025',
      remarks: 'Accredited',
      status: 'active'
    },
    {
      id: 2,
      location: 'TAGUIG',
      propertyName: 'P1 HOTEL MANILA',
      propertyAddress: '32nd Street, corner Lane A',
      contractedRates: 'Feb. 26, 2025',
      corporateRates: 'March 5, 2025',
      validity: 'Dec. 31, 2025',
      remarks: 'Accredited Prepaid',
      status: 'pending'
    },
    {
      id: 3,
      location: 'TAGUIG',
      propertyName: 'P1 HOTEL MANILA',
      propertyAddress: '32nd Street, corner Lane A',
      contractedRates: 'N/A',
      corporateRates: 'N/A',
      validity: 'N/A',
      remarks: 'Non Accredited',
      status: 'inactive'
    },
    {
      id: 4,
      location: 'MANILA',
      propertyName: 'RED PLANET MANILA MALATE',
      propertyAddress: '1740 A. Mabini St. Manila',
      contractedRates: 'Jan. 10, 2025',
      corporateRates: 'N/A',
      validity: 'Dec. 31, 2025',
      remarks: 'Accredited',
      status: 'active'
    },
    {
      id: 5,
      location: 'MANILA',
      propertyName: 'RED PLANET MANILA MALATE',
      propertyAddress: '1740 A. Mabini St. Manila',
      contractedRates: 'Jan. 10, 2025',
      corporateRates: 'N/A',
      validity: 'Dec. 31, 2025',
      remarks: 'Accredited',
      status: 'active'
    }
  ];

  // Sample monitoring data
  const monitoringData = [
    {
      id: 1,
      travelDate: 'May 24, 2025',
      pickupTime: '04:12 AM',
      guestName: 'Mr. Mark Reiner Rebayno',
      clientNumber: '0917-152-8222',
      pickupLocation: 'NAC BGC',
      destination: 'BATAAN',
      status: 'active'
    },
    {
      id: 2,
      travelDate: 'May 24, 2025',
      pickupTime: '09:43 PM',
      guestName: 'Mr. Mark Reiner Rebayno',
      clientNumber: '0917-152-8222',
      pickupLocation: 'QUEZON CITY',
      destination: 'LAGUNA',
      status: 'pending'
    },
    {
      id: 3,
      travelDate: 'May 24, 2025',
      pickupTime: '04:12 AM',
      guestName: 'Mr. Mark Reiner Rebayno',
      clientNumber: '0917-152-8222',
      pickupLocation: 'NAC BGC',
      destination: 'BATAAN',
      status: 'active'
    },
    {
      id: 4,
      travelDate: 'May 24, 2025',
      pickupTime: '09:43 PM',
      guestName: 'Mr. Mark Reiner Rebayno',
      clientNumber: '0917-152-8222',
      pickupLocation: 'QUEZON CITY',
      destination: 'LAGUNA',
      status: 'pending'
    }
  ];

  // Main content renderer
  const renderMainContent = () => {
    if (currentView === 'accounts') {
      return (
        <div className="accounts-page-content">
          {/* Header section with stats */}
          <div className="accounts-header-wrapper">
            <h2 className="accounts-main-title">LIST OF ACCOUNTS</h2>
            
            <div className="accounts-header-right">
              <div className="accounts-stats-container">
                <div className="stats-item">
                  <div className="stat-label">ALL EMPLOYEES</div>
                  <div className="stat-number">{accountsStats.allEmployees}</div>
                </div>
                
                <div className="stats-item">
                  <div className="stat-label">ACTIVE</div>
                  <div className="stat-number active">{accountsStats.active}</div>
                </div>
                
                <div className="stats-item">
                  <div className="stat-label">PENDING</div>
                  <div className="stat-number pending">{accountsStats.pending}</div>
                </div>
              </div>
              
              <button className="add-employee-btn">
                <span className="plus-icon">+</span> Add employee
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="accounts-filter-container">
            <div className="accounts-filter-dropdown">
              <select name="department" className="filter-select">
                <option value="travel-desk">Travel Desk</option>
              </select>
            </div>
            
            <StatusIndicators />
            
            <div className="accounts-search">
              <input type="text" placeholder="Search" className="search-input" />
              <button className="search-button">
                {Icons.searchIcon}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="accounts-table-section">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th className="checkbox-column"></th>
                  <th>ID Number</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Company</th>
                  <th>Email Address</th>
                  <th>Group</th>
                  <th>Edit Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {accountsData.map((account, index) => (
                  <tr key={index} className={`account-row ${index === 1 || index === 3 || index === 5 ? 'row-alternate' : ''}`}>
                    <td className="checkbox-column">
                      <input type="checkbox" className="account-checkbox" />
                    </td>
                    <td className="id-column">{account.id}</td>
                    <td>{account.name}</td>
                    <td>{account.designation}</td>
                    <td>{account.company}</td>
                    <td>{account.email}</td>
                    <td>{account.group}</td>
                    <td className="edit-column">
                      <button className="edit-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                    </td>
                    <td className="status-column">
                      <div className={`account-status-indicator ${account.status}`}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="accounts-table-footer">
              <span className="table-info">Showing 1 to 22 of 22 entries</span>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentView === 'suppliers') {
      return (
        <div className="suppliers-page-content">
          {/* Supplier Statistics */}
          <div className="suppliers-stats-section">
            <div className="suppliers-stats-single-row">
              {/* Accreditation stats */}
              <div className="suppliers-stats-row">
                <div className="suppliers-stat-card accredited">
                  <div className="stat-label">
                    <span className="status-dot active"></span>
                    ACCREDITED
                  </div>
                  <div className="stat-value">1970</div>
                </div>
                <div className="suppliers-stat-card accredited-prepaid">
                  <div className="stat-label">
                    <span className="status-dot pending"></span>
                    ACCREDITED PREPAID
                  </div>
                  <div className="stat-value">45</div>
                </div>
                <div className="suppliers-stat-card non-accredited">
                  <div className="stat-label">
                    <span className="status-dot inactive"></span>
                    NON-ACCREDITED
                  </div>
                  <div className="stat-value">7</div>
                </div>
              </div>
              
              {/* Regional stats */}
              <div className="suppliers-stats-row">
                <div className="suppliers-stat-card ncr-luzon">
                  <div className="stat-label">
                    <span className="status-dot ncr"></span>
                    NCR & LUZON
                  </div>
                  <div className="stat-value">{suppliersStats.ncrLuzon.value}</div>
                </div>
                <div className="suppliers-stat-card visayas">
                  <div className="stat-label">
                    <span className="status-dot visayas"></span>
                    VISAYAS
                  </div>
                  <div className="stat-value">{suppliersStats.visayas.value}</div>
                </div>
                <div className="suppliers-stat-card mindanao">
                  <div className="stat-label">
                    <span className="status-dot mindanao"></span>
                    MINDANAO
                  </div>
                  <div className="stat-value">{suppliersStats.mindanao.value}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Suppliers Table */}
          <section className="list-of-suppliers-section">
            <h2 className="section-title">LIST OF SUPPLIERS</h2>
            
            <div className="supplier-controls-bar">
              <div className="controls-bar-left">
                <div className="supplier-type-dropdown">
                  <select 
                    name="supplier-type" 
                    value={selectedSupplierType}
                    onChange={handleSupplierTypeChange}
                  >
                    <option value="hotels">Hotels</option>
                    <option value="land-transfer">Land Transfer</option>
                    <option value="airlines">Airlines</option>
                    <option value="travel-operators">Travel Operators</option>
                  </select>
                </div>
                
                <StatusIndicators />
                
              </div>
              <div className="controls-bar-right">
                <div className="search-container">
                  <input type="text" placeholder="Search suppliers..." />
                  <button className="search-button">
                    {Icons.searchIcon}
                  </button>
                </div>
                <button className="filters-button">
                  {Icons.filterIcon}
                  <span>Filters</span>
                </button>
              </div>
            </div>

            <div className="suppliers-table-container">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    {getTableHeaders().map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suppliersListData.map((supplier) => (
                    <React.Fragment key={supplier.id}>
                      <tr 
                        className={`supplier-row ${expandedRowId === supplier.id ? 'expanded' : ''}`}
                        onClick={() => toggleRowExpansion(supplier.id)}
                      >
                        <td className="expand-icon">
                          <span>{expandedRowId === supplier.id ? 'V' : '>'}</span>
                        </td>
                        {getTableRowData(supplier).map((data, index) => (
                          <td key={index}>{data}</td>
                        ))}
                        <td className="status-column">
                          <div className={`account-status-indicator ${supplier.status}`}></div>
                        </td>
                      </tr>
                      {expandedRowId === supplier.id && (
                        <tr className="expanded-details">
                          <td colSpan={getTableHeaders().length}>
                            <div className="contact-details-form">
                              <div className="contact-details-header">
                                <h3>CONTACT DETAILS</h3>
                              </div>
                              <div className="form-sections">
                                <div className="form-section">
                                  <div className="form-group">
                                    <label>SALES REPRESENTATIVE</label>
                                    <input type="text" />
                                  </div>
                                  <div className="form-group">
                                    <label>CONTACT NUMBER</label>
                                    <input type="text" />
                                  </div>
                                  <div className="form-group">
                                    <label>EMAIL ADDRESS</label>
                                    <input type="text" />
                                  </div>
                                </div>
                                <div className="form-section">
                                  <div className="form-group">
                                    <label>FRONT DESK</label>
                                    <input type="text" />
                                  </div>
                                  <div className="form-group">
                                    <label>CONTACT NUMBER</label>
                                    <input type="text" />
                                  </div>
                                  <div className="form-group">
                                    <label>EMAIL ADDRESS</label>
                                    <input type="text" />
                                  </div>
                                </div>
                                <div className="form-section">
                                  <div className="form-group">
                                    <label>TYPE OF BREAKFAST</label>
                                    <input type="text" />
                                  </div>
                                  <div className="form-group">
                                    <label>ROOM QUANTITY</label>
                                    <input type="text" />
                                  </div>
                                </div>
                              </div>

                              <div className="payment-terms-section">
                                <div className="payment-section">
                                  <h4>PAYMENT TERMS</h4>
                                  <div className="form-group">
                                    <label>MODE OF PAYMENT</label>
                                    <input type="text" />
                                  </div>
                                  <div className="form-group">
                                    <label>CREDIT TERMS</label>
                                    <input type="text" />
                                  </div>
                                </div>
                                <div className="remarks-section">
                                  <h4>REMARKS</h4>
                                  <div className="form-group">
                                    <textarea rows="4"></textarea>
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
          </section>
        </div>
      );
    }

    if (currentView === 'notification') {
      return (
        <div className="notification-page-content">
          <div className="page-header">
            <h2 className="page-title">NOTIFICATIONS</h2>
          </div>
          <div className="page-content">
            <div className="empty-state">
              <div className="empty-icon">{Icons.notification}</div>
              <h3>No notifications available</h3>
              <p>You'll see notifications here when they become available.</p>
            </div>
          </div>
        </div>
      );
    }

    if (currentView === 'documents') {
      return (
        <div className="documents-page-content">
          <div className="page-header">
            <h2 className="page-title">DOCUMENTS</h2>
          </div>
          <div className="page-content">
            <div className="empty-state">
              <div className="empty-icon">{Icons.documents}</div>
              <h3>No documents available</h3>
              <p>Document management features will be available here.</p>
            </div>
          </div>
        </div>
      );
    }

    if (currentView === 'dir') {
      return (
        <div className="dir-page-content">
          <div className="page-header">
            <h2 className="page-title">DIR</h2>
          </div>
          <div className="page-content">
            <div className="empty-state">
              <div className="empty-icon">{Icons.dir}</div>
              <h3>DIR section</h3>
              <p>DIR management features will be available here.</p>
            </div>
          </div>
        </div>
      );
    }

    if (currentView === 'shems') {
      return (
        <div className="shems-page-content">
          <div className="page-header">
            <h2 className="page-title">SHE-MS</h2>
          </div>
          <div className="page-content">
            <div className="empty-state">
              <div className="empty-icon">{Icons.shems}</div>
              <h3>Safety, Health and Environmental Management</h3>
              <p>SHE-MS features will be available here.</p>
            </div>
          </div>
        </div>
      );
    }

    if (currentView === 'incident') {
      return (
        <div className="incident-page-content">
          <div className="page-header">
            <h2 className="page-title">INCIDENT REPORT</h2>
          </div>
          <div className="page-content">
            <div className="empty-state">
              <div className="empty-icon">{Icons.incident}</div>
              <h3>No incident reports</h3>
              <p>Incident reporting features will be available here.</p>
            </div>
          </div>
        </div>
      );
    }

    if (currentView === 'monitoring') {
      return (
        <div className="monitoring-page-content">
          {/* Header */}
          <div className="monitoring-header">
            <div className="monitoring-title-section">
              <div className="monitoring-icon">
                {Icons.portfolioTransfer}
              </div>
              <h1 className="monitoring-title">Transfer Service Monitoring</h1>
            </div>
            <div className="monitoring-controls">
              <div className="date-filter">
                {Icons.calendarIcon}
                <span>25/04/2025 - 24/05/2025</span>
              </div>
              <button className="filters-btn">
                {Icons.filterIcon}
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Bookings */}
          <div className="bookings-section">
            <div className="bookings-header">
              <div className="bookings-title-section">
                <h2 className="bookings-title">BOOKINGS</h2>
              </div>
              <div className="bookings-controls">
                <select className="travel-voucher-dropdown">
                  <option>TRAVEL VOUCHER</option>
                </select>
                <div className="search-container">
                  <input type="text" placeholder="Enter exact ID" />
                  <button className="search-button">
                    {Icons.searchIcon}
                  </button>
                </div>
              </div>
            </div>

            <div className="bookings-table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Travel date</th>
                    <th>Pick-up Time</th>
                    <th>Guest Name/Group Name</th>
                    <th>Client Number</th>
                    <th>Pick-Up Location</th>
                    <th>Destination</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {monitoringData.map((booking) => (
                    <React.Fragment key={booking.id}>
                      <tr 
                        className={`booking-row ${expandedRowId === booking.id ? 'expanded' : ''}`}
                        onClick={() => toggleRowExpansion(booking.id)}
                      >
                        <td className="expand-icon">
                          <span>{expandedRowId === booking.id ? 'V' : '>'}</span>
                        </td>
                        <td>{booking.travelDate}</td>
                        <td>{booking.pickupTime}</td>
                        <td>{booking.guestName}</td>
                        <td>{booking.clientNumber}</td>
                        <td>{booking.pickupLocation}</td>
                        <td>{booking.destination}</td>
                        <td className="status-column">
                          <div className={`account-status-indicator ${booking.status}`}></div>
                        </td>
                        <td>
                          {/* Action buttons placeholder */}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="table-pagination">
              <span>Showing 1 to 22 of 22 entries</span>
            </div>
          </div>
        </div>
      );
    }

    // Default dashboard view
    return (
      <div className="admin-main-content-body">
        <section className="supplier-portfolio-section">
          <h2 className="portfolio-section-title">SUPPLIER PORTFOLIO COUNT</h2>
          <div className="portfolio-cards-container">
            {/* Hotel */}
            <div className="portfolio-card">
              <div className="map-bg"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="icon-box">
                    {Icons.portfolioHotel}
                  </div>
                  <span className="card-label">HOTEL</span>
                </div>
                <div className="card-value">{supplierData.hotel}</div>
              </div>
            </div>
            {/* Transfer */}
            <div className="portfolio-card">
              <div className="map-bg"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="icon-box">
                    {Icons.portfolioTransfer}
                  </div>
                  <span className="card-label">TRANSFER</span>
                </div>
                <div className="card-value">{supplierData.transfer}</div>
              </div>
            </div>
            {/* Airline */}
            <div className="portfolio-card">
              <div className="map-bg"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="icon-box">
                    {Icons.portfolioAirline}
                  </div>
                  <span className="card-label">AIRLINE</span>
                </div>
                <div className="card-value">{supplierData.airline}</div>
              </div>
            </div>
            {/* Travel Operator */}
            <div className="portfolio-card">
              <div className="map-bg"></div>
              <div className="card-content">
                <div className="card-header">
                  <div className="icon-box">
                    {Icons.portfolioTravelOperator}
                  </div>
                  <span className="card-label">TRAVEL OPERATOR</span>
                </div>
                <div className="card-value">{supplierData.travelOperator}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="list-of-suppliers-section">
          <h2 className="section-title">LIST OF SUPPLIERS</h2>
          
          <div className="supplier-controls-bar">
            <div className="controls-bar-left">
              <div className="supplier-type-dropdown">
                <select 
                  name="supplier-type" 
                  value={selectedSupplierType}
                  onChange={handleSupplierTypeChange}
                >
                  <option value="hotels">Hotels</option>
                  <option value="land-transfer">Land Transfer</option>
                  <option value="airlines">Airlines</option>
                  <option value="travel-operators">Travel Operators</option>
                </select>
              </div>
              
              <StatusIndicators />
              
            </div>
            <div className="controls-bar-right">
              <div className="search-container">
                <input type="text" placeholder="Search suppliers..." />
                <button className="search-button">
                  {Icons.searchIcon}
                </button>
              </div>
              <button className="filters-button">
                {Icons.filterIcon}
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="suppliers-table-container">
            <table className="suppliers-table">
              <thead>
                <tr>
                  {getTableHeaders().map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getCurrentSuppliersList().map((supplier) => (
                  <React.Fragment key={supplier.id}>
                    <tr 
                      className={`supplier-row ${expandedRowId === supplier.id ? 'expanded' : ''}`}
                      onClick={() => toggleRowExpansion(supplier.id)}
                    >
                      <td className="expand-icon">
                        <span>{expandedRowId === supplier.id ? 'V' : '>'}</span>
                      </td>
                      {getTableRowData(supplier).map((data, index) => (
                        <td key={index}>{data}</td>
                      ))}
                      <td className="status-column">
                        <div className={`account-status-indicator ${supplier.status}`}></div>
                      </td>
                    </tr>
                    {expandedRowId === supplier.id && (
                      <tr className="expanded-details">
                        <td colSpan={getTableHeaders().length}>
                          <div className="contact-details-form">
                            <div className="contact-details-header">
                              <h3>CONTACT DETAILS</h3>
                            </div>
                            <div className="form-sections">
                              <div className="form-section">
                                <div className="form-group">
                                  <label>SALES REPRESENTATIVE</label>
                                  <input type="text" />
                                </div>
                                <div className="form-group">
                                  <label>CONTACT NUMBER</label>
                                  <input type="text" />
                                </div>
                                <div className="form-group">
                                  <label>EMAIL ADDRESS</label>
                                  <input type="text" />
                                </div>
                              </div>
                              <div className="form-section">
                                <div className="form-group">
                                  <label>FRONT DESK</label>
                                  <input type="text" />
                                </div>
                                <div className="form-group">
                                  <label>CONTACT NUMBER</label>
                                  <input type="text" />
                                </div>
                                <div className="form-group">
                                  <label>EMAIL ADDRESS</label>
                                  <input type="text" />
                                </div>
                              </div>
                              <div className="form-section">
                                <div className="form-group">
                                  <label>TYPE OF BREAKFAST</label>
                                  <input type="text" />
                                </div>
                                <div className="form-group">
                                  <label>ROOM QUANTITY</label>
                                  <input type="text" />
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
        </section>
      </div>
    );
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-content-wrapper">
        <nav className="admin-sidebar">
          <div className="admin-profile">
            <div className="admin-profile-pic">
              <img src="/api/placeholder/100/100" alt={userData.name} />
            </div>
            <div className="admin-name">{userData.name}</div>
            <div className="admin-role">{userData.role}</div>
          </div>
          <ul className="admin-sidebar-nav">
            <li 
              className={`admin-sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              {Icons.dashboard}
              <span>DASHBOARD</span>
            </li>
            <li 
              className={`admin-sidebar-item ${currentView === 'notification' ? 'active' : ''}`}
              onClick={() => handleNavClick('notification')}
            >
              {Icons.notification}
              <span>NOTIFICATION</span>
            </li>
            <li 
              className={`admin-sidebar-item ${currentView === 'monitoring' ? 'active' : ''}`}
              onClick={() => handleNavClick('monitoring')}
            >
              {Icons.monitoring}
              <span>MONITORING</span>
            </li>
            <li 
              className={`admin-sidebar-item ${currentView === 'suppliers' ? 'active' : ''}`}
              onClick={() => handleNavClick('suppliers')}
            >
              {Icons.suppliers}
              <span>SUPPLIERS</span>
            </li>
            <li 
              className={`admin-sidebar-item ${currentView === 'accounts' ? 'active' : ''}`}
              onClick={() => handleNavClick('accounts')}
            >
              {Icons.accounts}
              <span>ACCOUNTS</span>
            </li>
            <li 
              className={`admin-sidebar-item ${currentView === 'documents' ? 'active' : ''}`}
              onClick={() => handleNavClick('documents')}
            >
              {Icons.documents}
              <span>DOCUMENTS</span>
            </li>
            <li 
              className={`admin-sidebar-item ${currentView === 'dir' ? 'active' : ''}`}
              onClick={() => handleNavClick('dir')}
            >
              {Icons.dir}
              <span>DIR</span>
            </li>
            <li 
              className={`admin-sidebar-item ${currentView === 'shems' ? 'active' : ''}`}
              onClick={() => handleNavClick('shems')}
            >
              {Icons.shems}
              <span>SHE-MS</span>
            </li>
            <li 
              className={`admin-sidebar-item ${currentView === 'incident' ? 'active' : ''}`}
              onClick={() => handleNavClick('incident')}
            >
              {Icons.incident}
              <span>INCIDENT REPORT</span>
            </li>
          </ul>
        </nav>
 
        <div className="admin-right-content">
          {/* Header */}
          <div className="admin-dashboard-header">
            <div className="header-left">
              <img src={inflightLogo} alt="Inflight Menu Logo" className="tim-logo" />
              <span className="dashboard-text">DASHBOARD</span>
            </div>
            <div className="header-right">
              <span className="header-item">TIM OFFICIAL WEBSITE</span>
              <span className="header-item">CONTACT</span>
              <span className="header-item">PROFILE</span>
              <span className="header-item" onClick={handleLogout}>LOG OUT</span>
            </div>
          </div>
 
          <div className={`admin-main-and-sidebar-wrapper ${currentView === 'suppliers' || currentView === 'monitoring' ? 'full-width' : ''}`}>
            <main className="admin-main-content">
              {renderMainContent()}
            </main>
 
            {/* Right panel - dashboard only */}
            {currentView === 'dashboard' && (
              <aside className="admin-right-panel">
                <div className="notification-panel">
                  <div className="panel-header">NOTIFICATION</div>
                  <div className="panel-content">
                    {/* Notifications */}
                  </div>
                </div>
                <div className="inbox-panel">
                  <div className="panel-header">INBOX</div>
                  <div className="panel-content">
                    <div className="inbox-item">
                      <div className="company-logo">
                        <img src="/api/placeholder/40/40" alt="CRZTY MCLLN" />
                      </div>
                      <div className="inbox-item-details">
                        <div className="company-name">CRZTY MCLLN TRANSPORT SERVICES INC.</div>
                        <div className="company-message">Requesting link for confirmation</div>
                        <div className="message-time">07/03/24 05:39PM</div>
                      </div>
                    </div>
                    
                    <div className="inbox-item">
                      <div className="company-logo">
                        <img src="/api/placeholder/40/40" alt="Grab Transportation" />
                      </div>
                      <div className="inbox-item-details">
                        <div className="company-name">GRAB TRANSPORTATION</div>
                        <div className="company-message">Re-New Accreditation</div>
                        <div className="message-time">10-15-2022</div>
                      </div>
                    </div>
                    
                    <div className="inbox-item">
                      <div className="company-logo">
                        <img src="/api/placeholder/40/40" alt="Inflight Menu" />
                      </div>
                      <div className="inbox-item-details">
                        <div className="company-name">INFLIGHT MENU TRAVEL MANAGEMENT CORP.</div>
                        <div className="company-message">Accreditation Expiry</div>
                        <div className="message-time">09-22-2022</div>
                      </div>
                    </div>
                    
                    <div className="inbox-item">
                      <div className="company-logo">
                        <img src="/api/placeholder/40/40" alt="IBIS Style Hotel" />
                      </div>
                      <div className="inbox-item-details">
                        <div className="company-name">IBIS STYLE HOTEL CUBAO</div>
                        <div className="company-message">Accreditation Report</div>
                        <div className="message-time">08-15-2022</div>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;