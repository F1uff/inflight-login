import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import inflightLogo from '../assets/inflight-menu-logo.png';
import AdminNotificationPage from './AdminNotificationPage';
import ConnectionStatus from './ConnectionStatus';
import apiService from '../services/api';
import { Icons } from '../data/icons.jsx';
import { hotelSuppliersList, landTransferSuppliersList, accountsData, userData } from '../data/sampleData';
import SupplierPortfolioSection from './SupplierPortfolioSection';
import DashboardSuppliersTable from './DashboardSuppliersTable';
import AccountsSection from './AccountsSection';
import DocumentsPage from './DocumentsPage';
import DirPage from './DirPage';
import ShemsPage from './ShemsPage';
import IncidentPage from './IncidentPage';
import SuppliersPageContent from './SuppliersPageContent';

// Icons imported from ../data/icons.js

// Data imported from ../data/sampleData.js (userData, hotelSuppliersList, landTransferSuppliersList, accountsData, suppliersStats)

// Status Indicators Component
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

const StatusIndicators = ({ selectedStatus, onStatusClick }) => {
  return (
    <div className="status-indicators-container">
      <StatusIndicator 
        status="active" 
        label="ACTIVE" 
        isActive={selectedStatus === 'active'}
        onClick={() => onStatusClick('active', 'suppliers')}
      />
      <StatusIndicator 
        status="pending" 
        label="PENDING" 
        isActive={selectedStatus === 'pending'}
        onClick={() => onStatusClick('pending', 'suppliers')}
      />
      <StatusIndicator 
        status="inactive" 
        label="IN-ACTIVE" 
        isActive={selectedStatus === 'inactive'}
        onClick={() => onStatusClick('inactive', 'suppliers')}
      />
    </div>
  );
};

const MonitoringStatusIndicators = () => {
  return (
    <div className="monitoring-status-indicators">
      <StatusIndicator status="active" label="ACTIVE" />
      <StatusIndicator status="pending" label="PENDING" />
      <StatusIndicator status="inactive" label="IN-ACTIVE" />
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // State for API data
  const [_suppliersData, setSuppliersData] = useState(null);
  const [_systemHealth, setSystemHealth] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  
  // State for supplier editing
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierFormData, setSupplierFormData] = useState({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [savingSupplier, setSavingSupplier] = useState(false);
  
  // Additional state declarations  
  const [selectedSupplierType, setSelectedSupplierType] = useState('hotels');
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [expandedDashboardSupplier, setExpandedDashboardSupplier] = useState(null);

  const [currentView, setCurrentView] = useState('dashboard');
  
  // State for supplier portfolio counts
  const [portfolioCounts, setPortfolioCounts] = useState({
    hotel: 0,
    transfer: 0,
    airline: 0,
    travelOperator: 0
  });
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedMonitoringStatus, setSelectedMonitoringStatus] = useState(null);
  const [selectedHotelStatus, setSelectedHotelStatus] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [addSupplierModalVisible, setAddSupplierModalVisible] = useState(false);
  const [inboxModalVisible, setInboxModalVisible] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    businessPermit: false,
    dtiSec: false,
    dotCertificate: false,
    bir2303: false
  });
  const [filteredData, setFilteredData] = useState({
    suppliers: hotelSuppliersList, // Start with hotels only since default is 'hotels'
    accounts: accountsData,
    monitoring: [],
    hotel: []
  });

  // Search states for each section
  const [searchTerms, setSearchTerms] = useState({
    suppliers: '',
    accounts: '',
    monitoring: '',
    hotel: ''
  });

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Parallel API calls for better performance
        const [, suppliersResponse, healthData, portfolioData] = await Promise.all([
          apiService.getDashboardOverview(),
          apiService.getSuppliers({ limit: 10 }),
          apiService.getSystemHealth(),
          apiService.getSupplierPortfolioCount()
        ]);
        
        setSuppliersData(suppliersResponse);
        setSystemHealth(healthData);
        setPortfolioCounts(portfolioData.portfolioCounts);
        
        console.log('Dashboard data loaded:', { suppliersResponse, healthData, portfolioData });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        setPortfolioLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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
      status: 'inactive'
    },
    {
      id: 4,
      travelDate: 'May 24, 2025',
      pickupTime: '09:43 PM',
      guestName: 'Mr. Mark Reiner Rebayno',
      clientNumber: '0917-152-8222',
      pickupLocation: 'QUEZON CITY',
      destination: 'LAGUNA',
      status: 'request'
    },
    {
      id: 5,
      travelDate: 'May 25, 2025',
      pickupTime: '06:30 AM',
      guestName: 'Ms. Sarah Johnson',
      clientNumber: '0917-123-4567',
      pickupLocation: 'MAKATI CBD',
      destination: 'CLARK',
      status: 'active'
    },
    {
      id: 6,
      travelDate: 'May 25, 2025',
      pickupTime: '02:15 PM',
      guestName: 'Mr. John Smith',
      clientNumber: '0917-987-6543',
      pickupLocation: 'ORTIGAS CENTER',
      destination: 'BAGUIO',
      status: 'request'
    }
  ];

  // Sample hotel monitoring data
  const hotelMonitoringData = [
    {
      id: 1,
      hotelVoucher: 'HV8762GIJ332',
      hotelName: 'F1 HOTEL BGC',
      coveredDate: 'MAY 26, 2025\nMAY 28, 2025',
      guestName: 'Juan Dela Cruz',
      contactNumber: '0917-152-8222',
      noOfStay: '2',
      status: 'pending'
    },
    {
      id: 2,
      hotelVoucher: 'HV9823KLM445',
      hotelName: 'RED PLANET MAKATI',
      coveredDate: 'MAY 27, 2025\nMAY 29, 2025',
      guestName: 'Maria Santos',
      contactNumber: '0917-234-5678',
      noOfStay: '2',
      status: 'active'
    },
    {
      id: 3,
      hotelVoucher: 'HV7456NOP789',
      hotelName: 'DUSIT THANI MANILA',
      coveredDate: 'MAY 28, 2025\nMAY 30, 2025',
      guestName: 'Carlos Rodriguez',
      contactNumber: '0917-345-6789',
      noOfStay: '2',
      status: 'request'
    },
    {
      id: 4,
      hotelVoucher: 'HV5632QRS123',
      hotelName: 'SHANGRI-LA MAKATI',
      coveredDate: 'MAY 29, 2025\nMAY 31, 2025',
      guestName: 'Ana Reyes',
      contactNumber: '0917-456-7890',
      noOfStay: '2',
      status: 'inactive'
    },
    {
      id: 5,
      hotelVoucher: 'HV4789TUV456',
      hotelName: 'PENINSULA MANILA',
      coveredDate: 'MAY 30, 2025\nJUN 01, 2025',
      guestName: 'Roberto Garcia',
      contactNumber: '0917-567-8901',
      noOfStay: '2',
      status: 'active'
    },
    {
      id: 6,
      hotelVoucher: 'HV3456WXY789',
      hotelName: 'OKADA MANILA',
      coveredDate: 'MAY 31, 2025\nJUN 02, 2025',
      guestName: 'Elena Fernandez',
      contactNumber: '0917-678-9012',
      noOfStay: '2',
      status: 'request'
    }
  ];

  const toggleRowExpansion = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const handleSupplierTypeChange = (e) => {
    setSelectedSupplierType(e.target.value);
    setExpandedRowId(null);
    // Reset status filter when changing supplier type
    setSelectedStatus(null);
    // useEffect will handle applying filters when selectedSupplierType or selectedStatus changes
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleNavClick = (view) => {
    setCurrentView(view);
    setExpandedRowId(null);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 1024) {
      setSidebarVisible(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const closeSidebar = () => {
    setSidebarVisible(false);
  };

  const _openAddSupplierModal = () => {
    setAddSupplierModalVisible(true);
    // Scroll to top when modal opens
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }, 100);
  };

  const closeAddSupplierModal = () => {
    setAddSupplierModalVisible(false);
  };

  const openNotificationPage = () => {
    handleNavClick('notification');
  };

  const openInboxModal = () => {
    setInboxModalVisible(true);
  };

  const closeInboxModal = () => {
    setInboxModalVisible(false);
  };

  const handleFileUpload = (fileType, file) => {
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [fileType]: true
      }));
      console.log(`${fileType} uploaded:`, file);
    }
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

  // Comprehensive search and filter function
  const applyFilters = (section) => {
    const originalData = section === 'suppliers' ? getCurrentSuppliersList() : 
                        section === 'accounts' ? accountsData : 
                        section === 'monitoring' ? monitoringData :
                        section === 'hotel' ? hotelMonitoringData : [];

    let filteredItems = [...originalData];

    // Apply status filter
    const getStatusState = (section) => {
      switch(section) {
        case 'suppliers':
        case 'accounts':
          return selectedStatus;
        case 'monitoring':
          return selectedMonitoringStatus;
        case 'hotel':
          return selectedHotelStatus;
        default:
          return selectedStatus;
      }
    };

    const currentStatus = getStatusState(section);
    if (currentStatus) {
      filteredItems = filteredItems.filter(item => item.status === currentStatus);
    }

    // Apply search filter
    const searchTerm = searchTerms[section]?.toLowerCase() || '';
    if (searchTerm) {
      filteredItems = filteredItems.filter(item => {
        switch(section) {
          case 'suppliers':
            return (
              item.location?.toLowerCase().includes(searchTerm) ||
              (selectedSupplierType === 'hotels' ? 
                item.propertyName?.toLowerCase().includes(searchTerm) ||
                item.propertyAddress?.toLowerCase().includes(searchTerm) :
                item.companyName?.toLowerCase().includes(searchTerm) ||
                item.companyAddress?.toLowerCase().includes(searchTerm)) ||
              item.remarks?.toLowerCase().includes(searchTerm)
            );
          case 'accounts':
            return (
              item.name?.toLowerCase().includes(searchTerm) ||
              item.employeeId?.toLowerCase().includes(searchTerm) ||
              item.department?.toLowerCase().includes(searchTerm) ||
              item.position?.toLowerCase().includes(searchTerm) ||
              item.email?.toLowerCase().includes(searchTerm)
            );
          case 'monitoring':
            return (
              item.bookingId?.toLowerCase().includes(searchTerm) ||
              item.clientName?.toLowerCase().includes(searchTerm) ||
              item.pickupLocation?.toLowerCase().includes(searchTerm) ||
              item.destination?.toLowerCase().includes(searchTerm) ||
              item.serviceType?.toLowerCase().includes(searchTerm)
            );
          case 'hotel':
            return (
              item.hotelVoucher?.toLowerCase().includes(searchTerm) ||
              item.hotelName?.toLowerCase().includes(searchTerm) ||
              item.clientName?.toLowerCase().includes(searchTerm) ||
              item.roomCategory?.toLowerCase().includes(searchTerm) ||
              item.location?.toLowerCase().includes(searchTerm)
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
    // Get the appropriate status state and setter for each section
    const getStatusState = (section) => {
      switch(section) {
        case 'suppliers':
        case 'accounts':
          return { currentStatus: selectedStatus, setStatus: setSelectedStatus };
        case 'monitoring':
          return { currentStatus: selectedMonitoringStatus, setStatus: setSelectedMonitoringStatus };
        case 'hotel':
          return { currentStatus: selectedHotelStatus, setStatus: setSelectedHotelStatus };
        default:
          return { currentStatus: selectedStatus, setStatus: setSelectedStatus };
      }
    };

    const { currentStatus, setStatus } = getStatusState(section);

    if (currentStatus === status) {
      // If clicking the same status again, clear the filter
      setStatus(null);
    } else {
      // Apply new filter
      setStatus(status);
    }

    // useEffect will handle applying filters when status state changes
  };

  // Get counts for each status
  const getStatusCounts = (data) => {
    return {
      active: data.filter(item => item.status === 'active').length,
      pending: data.filter(item => item.status === 'pending').length,
      inactive: data.filter(item => item.status === 'inactive').length
    };
  };

  // Supplier data management functions
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier.id);
    setSupplierFormData({
      companyName: supplier.company?.name || '',
      companyAddress: supplier.company?.address || '',
      contactNumber: supplier.company?.phone || '',
      email: supplier.company?.email || '',
      designation: '',
      modeOfPayment: '',
      creditTerms: '',
      remarks: ''
    });
  };

  const handleAddNewSupplier = () => {
    setIsAddingNew(true);
    setEditingSupplier('new');
    setSupplierFormData({
      companyName: '',
      companyAddress: '',
      contactNumber: '',
      email: '',
      designation: '',
      modeOfPayment: '',
      creditTerms: '',
      remarks: ''
    });
  };

  const handleCancelEdit = () => {
    setEditingSupplier(null);
    setIsAddingNew(false);
    setSupplierFormData({});
  };

  const handleFormChange = (field, value) => {
    setSupplierFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSupplier = async () => {
    try {
      setSavingSupplier(true);
      
      if (isAddingNew) {
        // Create new supplier
        const newSupplierData = {
          companyName: supplierFormData.companyName,
          companyAddress: supplierFormData.companyAddress,
          contactNumber: supplierFormData.contactNumber,
          email: supplierFormData.email,
          supplierType: selectedSupplierType === 'hotels' ? 'hotel' : 'transport',
          companyRepresentative: supplierFormData.companyRepresentative,
          designation: supplierFormData.designation,
          telNumber: supplierFormData.telNumber,
          breakfastType: supplierFormData.breakfastType,
          roomQuantity: supplierFormData.roomQuantity,
          modeOfPayment: supplierFormData.modeOfPayment,
          creditTerms: supplierFormData.creditTerms,
          remarks: supplierFormData.remarks
        };
        
        const response = await apiService.createSupplier(newSupplierData);
        console.log('Supplier created successfully:', response);
        alert('Supplier created successfully!');
      } else {
        // Update existing supplier
        const updateData = {
          companyRepresentative: supplierFormData.companyRepresentative,
          contactNumber: supplierFormData.contactNumber,
          email: supplierFormData.email,
          designation: supplierFormData.designation,
          telNumber: supplierFormData.telNumber,
          companyAddress: supplierFormData.companyAddress,
          breakfastType: supplierFormData.breakfastType,
          roomQuantity: supplierFormData.roomQuantity,
          modeOfPayment: supplierFormData.modeOfPayment,
          creditTerms: supplierFormData.creditTerms,
          remarks: supplierFormData.remarks
        };
        
        const response = await apiService.updateSupplier(editingSupplier, updateData);
        console.log('Supplier updated successfully:', response);
        alert('Supplier updated successfully!');
      }
      
      // Reset form and refresh data
      handleCancelEdit();
      
      // Refresh suppliers data
      const suppliersResponse = await apiService.getSuppliers({ limit: 10 });
      setSuppliersData(suppliersResponse);
      
    } catch (error) {
      console.error('Failed to save supplier:', error);
      alert(`Failed to save supplier: ${error.message}`);
    } finally {
      setSavingSupplier(false);
    }
  };

  const toggleDashboardSupplierExpansion = (supplierId) => {
    setExpandedDashboardSupplier(expandedDashboardSupplier === supplierId ? null : supplierId);
  };

  // Main content renderer
  const renderMainContent = () => {
    if (currentView === 'dashboard') {
      return (
        <div className="modern-dashboard">
          <SupplierPortfolioSection 
            portfolioCounts={portfolioCounts}
            portfolioLoading={portfolioLoading}
          />
          <DashboardSuppliersTable 
            expandedDashboardSupplier={expandedDashboardSupplier}
            toggleDashboardSupplierExpansion={toggleDashboardSupplierExpansion}
          />
        </div>
      );
    }
    
    if (currentView === 'accounts') {
      return (
        <AccountsSection 
          filteredData={filteredData}
          selectedStatus={selectedStatus}
          searchTerms={searchTerms}
          handleSearchChange={handleSearchChange}
          filterByStatus={filterByStatus}
          getStatusCounts={getStatusCounts}
        />
      );
    }
    
    if (currentView === 'suppliers') {
      return (
        <SuppliersPageContent 
          filteredData={filteredData}
          selectedStatus={selectedStatus}
          searchTerms={searchTerms}
          handleSearchChange={handleSearchChange}
          filterByStatus={filterByStatus}
          getStatusCounts={getStatusCounts}
          getCurrentSuppliersList={getCurrentSuppliersList}
          getTableHeaders={getTableHeaders}
          getTableRowData={getTableRowData}
          handleEditSupplier={handleEditSupplier}
          handleAddNewSupplier={handleAddNewSupplier}
          handleCancelEdit={handleCancelEdit}
          handleFormChange={handleFormChange}
          handleSaveSupplier={handleSaveSupplier}
          editingSupplier={editingSupplier}
          supplierFormData={supplierFormData}
          isAddingNew={isAddingNew}
          savingSupplier={savingSupplier}
          selectedSupplierType={selectedSupplierType}
          expandedRowId={expandedRowId}
          toggleRowExpansion={toggleRowExpansion}
          selectedStatus={selectedStatus}
          selectedMonitoringStatus={selectedMonitoringStatus}
          selectedHotelStatus={selectedHotelStatus}
          handleSupplierTypeChange={handleSupplierTypeChange}
          handleLogout={handleLogout}
          handleNavClick={handleNavClick}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
          _openAddSupplierModal={_openAddSupplierModal}
          closeAddSupplierModal={closeAddSupplierModal}
          openNotificationPage={openNotificationPage}
          openInboxModal={openInboxModal}
          closeInboxModal={closeInboxModal}
          handleFileUpload={handleFileUpload}
          uploadedFiles={uploadedFiles}
          filteredData={filteredData}
          setFilteredData={setFilteredData}
          handleSearchChange={handleSearchChange}
          applyFilters={applyFilters}
          filterByStatus={filterByStatus}
          getStatusCounts={getStatusCounts}
          suppliersStats={suppliersStats}
        />
      );
    }

    if (currentView === 'notification') {
      return <AdminNotificationPage />;
    }

    if (currentView === 'documents') {
      return <DocumentsPage />;
    }

    if (currentView === 'dir') {
      return <DirPage />;
    }

    if (currentView === 'shems') {
      return <ShemsPage />;
    }

    if (currentView === 'incident') {
      return <IncidentPage />;
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
                <div className="bookings-status-legend">
                  <StatusIndicator 
                    status="active" 
                    label="CHECK-OUT" 
                    isActive={selectedMonitoringStatus === 'active'}
                    onClick={() => filterByStatus('active', 'monitoring')}
                  />
                  <StatusIndicator 
                    status="pending" 
                    label="CHECK-IN" 
                    isActive={selectedMonitoringStatus === 'pending'}
                    onClick={() => filterByStatus('pending', 'monitoring')}
                  />
                  <StatusIndicator 
                    status="inactive" 
                    label="CANCELLED" 
                    isActive={selectedMonitoringStatus === 'inactive'}
                    onClick={() => filterByStatus('inactive', 'monitoring')}
                  />
                  <StatusIndicator 
                    status="request" 
                    label="REQUEST / PENCIL BOOK" 
                    isActive={selectedMonitoringStatus === 'request'}
                    onClick={() => filterByStatus('request', 'monitoring')}
                  />
                </div>
              </div>
              <div className="bookings-controls">
                <select className="travel-voucher-dropdown">
                  <option>TRAVEL VOUCHER</option>
                </select>
                <div className="search-container-enhanced">
                  <input 
                    type="text" 
                    placeholder="Search bookings..." 
                    value={searchTerms.monitoring}
                    onChange={(e) => handleSearchChange('monitoring', e.target.value)}
                  />
                  <button className="search-btn-enhanced">
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
                    <th>TRAVEL DATE</th>
                    <th>PICK-UP TIME</th>
                    <th>GUEST NAME/GROUP NAME</th>
                    <th>CLIENT NUMBER</th>
                    <th>PICK-UP LOCATION</th>
                    <th>DESTINATION</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.monitoring.map((booking) => (
                    <React.Fragment key={booking.id}>
                      <tr 
                        className={`booking-row ${expandedRowId === booking.id ? 'expanded' : ''}`}
                        onClick={() => toggleRowExpansion(booking.id)}
                      >
                        <td className="expand-icon" onClick={(e) => {e.stopPropagation(); toggleRowExpansion(booking.id);}}>
                          <span></span>
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
                        <td className="action-buttons">
                          <button 
                            className="action-btn blue"
                            onClick={(e) => {
                              e.stopPropagation();
                              // View function to be implemented later
                              console.log('View booking:', booking.id);
                            }}
                            title="View Details"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                          </button>
                          <button 
                            className="action-btn orange"
                            onClick={(e) => {
                              e.stopPropagation();
                              // SMS function to be implemented later
                              console.log('Send SMS for booking:', booking.id);
                            }}
                            title="Send SMS"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                            </svg>
                          </button>
                          <button 
                            className="action-btn red"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit function to be implemented later
                              console.log('Edit booking:', booking.id);
                            }}
                            title="Edit Booking"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {expandedRowId === booking.id && (
                        <tr className="expanded-details">
                          <td colSpan="9">
                            <div className="booking-details-form">
                              <div className="booking-form-sections">
                                <div className="booking-form-section">
                                  <div className="form-group">
                                    <label>PICKUP DETAILS</label>
                                    <input type="text" placeholder="Pickup location details" />
                                  </div>
                                  <div className="form-group">
                                    <label>DROP-OFF DETAILS</label>
                                    <input type="text" placeholder="Drop-off location details" />
                                  </div>
                                  <div className="form-group">
                                    <label>VIP STATUS</label>
                                    <input type="text" placeholder="VIP status" />
                                  </div>
                                  <div className="form-group">
                                    <label>TYPE OF SERVICE</label>
                                    <input type="text" placeholder="Service type" />
                                  </div>
                                  <div className="form-group">
                                    <label>CAR TYPE</label>
                                    <input type="text" placeholder="Vehicle type" />
                                  </div>
                                  <div className="form-group">
                                    <label>DRIVER CONTACT</label>
                                    <input type="text" placeholder="Driver contact number" />
                                  </div>
                                  <div className="form-group">
                                    <label>PLATE NUMBER</label>
                                    <input type="text" placeholder="Vehicle plate number" />
                                  </div>
                                </div>
                                <div className="booking-form-section transaction-remarks">
                                  <div className="form-group">
                                    <label>TRANSACTION REMARKS</label>
                                    <textarea placeholder="Add transaction remarks here..." rows="10"></textarea>
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
            
            <div className="table-pagination">
              <span>Showing 1 to 22 of 22 entries</span>
            </div>
          </div>

          {/* Hotel Monitoring Section */}
          <div className="hotel-monitoring-section" style={{ marginTop: '40px' }}>
            {/* Hotel Monitoring Header */}
            <div className="monitoring-header">
              <div className="monitoring-title-section">
                <div className="monitoring-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 14c1.66 0 3-1.34 3-3S8.66 8 7 8s-3 1.34-3 3 1.34 3 3 3zm0-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm12-3h-8v8H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                  </svg>
                </div>
                <h1 className="monitoring-title">Hotel Service Monitoring</h1>
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

            <div className="bookings-section">
              <div className="bookings-header">
                <div className="bookings-title-section">
                  <h2 className="bookings-title">HOTEL MONITORING</h2>
                <div className="bookings-status-legend">
                  <StatusIndicator 
                    status="active" 
                    label="CHECK-OUT" 
                    isActive={selectedHotelStatus === 'active'}
                    onClick={() => filterByStatus('active', 'hotel')}
                  />
                  <StatusIndicator 
                    status="pending" 
                    label="CHECK-IN" 
                    isActive={selectedHotelStatus === 'pending'}
                    onClick={() => filterByStatus('pending', 'hotel')}
                  />
                  <StatusIndicator 
                    status="inactive" 
                    label="CANCELLED" 
                    isActive={selectedHotelStatus === 'inactive'}
                    onClick={() => filterByStatus('inactive', 'hotel')}
                  />
                  <StatusIndicator 
                    status="request" 
                    label="REQUEST / PENCIL BOOK" 
                    isActive={selectedHotelStatus === 'request'}
                    onClick={() => filterByStatus('request', 'hotel')}
                  />
                </div>
              </div>
              <div className="bookings-controls">
                <select className="travel-voucher-dropdown">
                  <option>HOTEL VOUCHER</option>
                </select>
                <div className="search-container-enhanced">
                  <input 
                    type="text" 
                    placeholder="Search hotels..." 
                    value={searchTerms.hotel}
                    onChange={(e) => handleSearchChange('hotel', e.target.value)}
                  />
                  <button className="search-btn-enhanced">
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
                    <th>HOTEL VOUCHER</th>
                    <th>HOTEL NAME</th>
                    <th>COVERED DATE</th>
                    <th>GUEST NAME</th>
                    <th>CONTACT NUMBER</th>
                    <th>NO. OF STAY</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.hotel.map((booking) => (
                    <React.Fragment key={booking.id}>
                      <tr 
                        className={`booking-row ${expandedRowId === booking.id ? 'expanded' : ''}`}
                        onClick={() => toggleRowExpansion(booking.id)}
                      >
                        <td className="expand-icon" onClick={(e) => {e.stopPropagation(); toggleRowExpansion(booking.id);}}>
                          <span></span>
                        </td>
                        <td>{booking.hotelVoucher}</td>
                        <td>{booking.hotelName}</td>
                        <td style={{ whiteSpace: 'pre-line' }}>{booking.coveredDate}</td>
                        <td>{booking.guestName}</td>
                        <td>{booking.contactNumber}</td>
                        <td>{booking.noOfStay}</td>
                        <td className="status-column">
                          <div className={`account-status-indicator ${booking.status}`}></div>
                        </td>
                        <td className="action-buttons">
                          <button 
                            className="action-btn blue"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('View hotel booking:', booking.id);
                            }}
                            title="View Details"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                          </button>
                          <button 
                            className="action-btn orange"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Send SMS for hotel booking:', booking.id);
                            }}
                            title="Send SMS"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                            </svg>
                          </button>
                          <button 
                            className="action-btn red"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Edit hotel booking:', booking.id);
                            }}
                            title="Edit Booking"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {expandedRowId === booking.id && (
                        <tr className="expanded-details">
                          <td colSpan="9">
                            <div className="booking-details-form">
                              <div className="booking-form-sections">
                                <div className="booking-form-section">
                                  <div className="form-group">
                                    <label>CHECK IN</label>
                                    <input type="text" placeholder="Check-in date and time" />
                                  </div>
                                  <div className="form-group">
                                    <label>CHECK OUT</label>
                                    <input type="text" placeholder="Check-out date and time" />
                                  </div>
                                  <div className="form-group">
                                    <label>ROOM CATEGORY</label>
                                    <input type="text" placeholder="Room type/category" />
                                  </div>
                                  <div className="form-group">
                                    <label>BREAKFAST</label>
                                    <input type="text" placeholder="Breakfast inclusion" />
                                  </div>
                                  <div className="form-group">
                                    <label>HOTEL REFERENCE</label>
                                    <input type="text" placeholder="Hotel reference number" />
                                  </div>
                                  <div className="form-group">
                                    <label>BRANCH</label>
                                    <input type="text" placeholder="Hotel branch location" />
                                  </div>
                                </div>
                                <div className="booking-form-section transaction-remarks">
                                  <div className="form-group">
                                    <label>GENERAL REMARKS</label>
                                    <textarea placeholder="Add general remarks here..." rows="12"></textarea>
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
            
            <div className="table-pagination">
              <span>Showing 1 to 6 of 6 entries</span>
            </div>
            </div>
          </div>
        </div>
      );
    }

    // Dashboard view - explicitly handle when currentView === 'dashboard' or as default
    if (currentView === 'dashboard' || !currentView) {
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
                  <div className="card-value">{portfolioCounts.hotel || 0}</div>
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
                  <div className="card-value">{portfolioCounts.transfer || 0}</div>
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
                  <div className="card-value">{portfolioCounts.airline || 0}</div>
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
                  <div className="card-value">{portfolioCounts.travelOperator || 0}</div>
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
              
              <StatusIndicators 
                selectedStatus={selectedStatus}
                onStatusClick={(status) => filterByStatus(status, 'suppliers')}
              />
              
                </div>
              <div className="controls-bar-right">
              <div className="search-container">
                <input 
                  type="text" 
                  placeholder="Search suppliers..." 
                  value={searchTerms.suppliers}
                  onChange={(e) => handleSearchChange('suppliers', e.target.value)}
                />
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
                {filteredData.suppliers.map((supplier) => (
                    <React.Fragment key={supplier.id}>
                    <tr 
                      className={`supplier-row ${expandedRowId === supplier.id ? 'expanded' : ''}`}
                      onClick={() => toggleRowExpansion(supplier.id)}
                    >
                      <td className="expand-icon" onClick={(e) => {e.stopPropagation(); toggleRowExpansion(supplier.id);}}>
                          <span></span>
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
                            <div className="contact-form-grid">
                              <div className="contact-form-column">
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
                              <div className="contact-form-column">
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
                              <div className="contact-form-column">
                                          <div className="form-group">
                                  <label>TYPE OF BREAKFAST</label>
                                  <select>
                                    <option>Select breakfast type</option>
                                    <option>Continental</option>
                                    <option>American</option>
                                    <option>Buffet</option>
                                    <option>Plated</option>
                                    <option>Room Service</option>
                                    <option>No Breakfast</option>
                                  </select>
                                          </div>
                                          <div className="form-group">
                                  <label>ROOM QUANTITY</label>
                                  <input type="number" min="1" placeholder="Enter quantity" />
                                          </div>
                                        </div>
                                      </div>

                              <div className="bottom-form-section">
                                <div className="payment-terms-section">
                                  <h4>PAYMENT TERMS</h4>
                                  <div className="payment-form-row">
                                    <div className="form-group">
                                      <label>MODE OF PAYMENT</label>
                                      <select>
                                        <option>Select payment mode</option>
                                        <option>Cash</option>
                                        <option>Credit Card</option>
                                        <option>Bank Transfer</option>
                                        <option>Check</option>
                                        <option>LOA (Letter of Authorization)</option>
                                        <option>GCLINK</option>
                                        <option>Company Account</option>
                                      </select>
                            </div>
                                    <div className="form-group">
                                      <label>CREDIT TERMS</label>
                                      <select>
                                        <option>Select credit terms</option>
                                        <option>Cash on Delivery</option>
                                        <option>Net 15 days</option>
                                        <option>Net 30 days</option>
                                        <option>Net 45 days</option>
                                        <option>Net 60 days</option>
                                        <option>Advance Payment</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div className="remarks-section">
                                  <h4>REMARKS</h4>
                                  <div className="form-group">
                                    <textarea rows="4"></textarea>
                                  </div>
                                </div>
                              </div>

                              {/* Room Rates Section */}
                              {selectedSupplierType === 'hotels' && (
                                <div className="room-rates-section">
                                  <div className="room-rates-header">
                                    <div className="seasons-rate-filter">
                                      <select>
                                        <option>SEASONS RATE</option>
                                        <option>REGULAR</option>
                                        <option>LEAN</option>
                                        <option>PEAK</option>
                                        <option>HIGH / SUPER</option>
                                        <option>WEEKDAYS</option>
                                        <option>WEEKEND</option>
                                        <option>HOLIDAY</option>
                                        <option>FIT</option>
                                        <option>GIT</option>
                                        <option>LOCAL</option>
                                        <option>INTERNATIONAL</option>
                                      </select>
                                    </div>
                                    <button className="filters-button">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
                                      </svg>
                                      <span>Filters</span>
                                    </button>
                                  </div>
                                  
                                  <div className="room-rates-body">
                                    <div className="room-rates-table-container">
                                      <table className="room-rates-table-nested">
                                        <thead>
                                          <tr>
                                            <th>TYPE OF ROOM</th>
                                            <th>PUBLISH RATES</th>
                                            <th>CONTRACTED RATES</th>
                                            <th>CORPORATE RATES</th>
                                            <th>SELLING</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr>
                                            <td>
                                              <select className="room-type-select">
                                                <option>Standard Room</option>
                                                <option>Deluxe Room</option>
                                                <option>Superior Room</option>
                                                <option>Executive Room</option>
                                                <option>Junior Suite</option>
                                                <option>Executive Suite</option>
                                                <option>Presidential Suite</option>
                                                <option>Family Room</option>
                                                <option>Twin Room</option>
                                                <option>Single Room</option>
                                              </select>
                          </td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                          </tr>
                                          <tr>
                                            <td>
                                              <select className="room-type-select">
                                                <option>Deluxe Room</option>
                                                <option>Standard Room</option>
                                                <option>Superior Room</option>
                                                <option>Executive Room</option>
                                                <option>Junior Suite</option>
                                                <option>Executive Suite</option>
                                                <option>Presidential Suite</option>
                                                <option>Family Room</option>
                                                <option>Twin Room</option>
                                                <option>Single Room</option>
                                              </select>
                                            </td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                          </tr>
                                          <tr>
                                            <td>
                                              <select className="room-type-select">
                                                <option>Junior Suite</option>
                                                <option>Standard Room</option>
                                                <option>Deluxe Room</option>
                                                <option>Superior Room</option>
                                                <option>Executive Room</option>
                                                <option>Executive Suite</option>
                                                <option>Presidential Suite</option>
                                                <option>Family Room</option>
                                                <option>Twin Room</option>
                                                <option>Single Room</option>
                                              </select>
                                            </td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                            <td><input type="number" placeholder="0.00" step="0.01" min="0" /></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                    
                                    <div className="room-features-inclusions">
                                      <h4>ROOM FEATURES</h4>
                                      <ul>
                                        <li>Air conditioning</li>
                                        <li>Free WiFi</li>
                                        <li>Cable TV</li>
                                        <li>Mini refrigerator</li>
                                        <li>Private bathroom</li>
                                      </ul>
                                      
                                                                             <h4>INCLUSIONS</h4>
                                       <ul>
                                         <li>Daily housekeeping</li>
                                         <li>Complimentary breakfast</li>
                                         <li>Airport transfer</li>
                                         <li>24-hour front desk</li>
                                       </ul>
                                    </div>
                                  </div>
                                </div>
                              )}
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

    // If no view matches, return null or a default message
    return null;
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar overlay for mobile */}
      {sidebarVisible && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      
      <div className="admin-content-wrapper">
        <nav className={`admin-sidebar ${sidebarVisible ? 'visible' : ''}`}>
          <div className="sidebar-header">
            <button className="sidebar-close" onClick={closeSidebar}>×</button>
          </div>
          <div className="admin-profile">
            <div className="admin-profile-pic">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#6c757d">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
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
              <span className="notification-badge">3</span>
            </li>
            <li 
              className={`admin-sidebar-item ${currentView === 'monitoring' ? 'active' : ''}`}
              onClick={() => handleNavClick('monitoring')}
            >
              {Icons.monitoring}
              <span>MONITORING</span>
            </li>
            <li className="admin-sidebar-item">
              <Link 
                to="/system-performance" 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'inherit', textDecoration: 'none', width: '100%' }}
              >
                {Icons.systemPerformance}
                <span>SYSTEM PERFORMANCE</span>
              </Link>
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
              <button className="sidebar-toggle" onClick={toggleSidebar}>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
              </button>
              <img src={inflightLogo} alt="Dashboard" className="service-portal-logo" />
              <span className="service-portal-text">DASHBOARD</span>
            </div>
            <div className="header-right">
              <ConnectionStatus />

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
          </div>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {addSupplierModalVisible && (
        <div className="modal-overlay" onClick={closeAddSupplierModal}>
          <div className="add-supplier-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>ADD SUPPLIER</h2>
              <button className="modal-close" onClick={closeAddSupplierModal}>×</button>
                  </div>
            
            <div className="modal-content">
              {/* Company Information Section */}
              <div className="modal-section">
                <h3>Company Information</h3>
                <div className="nature-of-business">
                  <label className="section-label">NATURE OF BUSINESS *</label>
                  <div className="business-type-grid">
                    <div className="radio-group">
                      <input type="radio" id="hotel" name="companyType" value="hotel" />
                      <label htmlFor="hotel">HOTEL</label>
                </div>
                    <div className="radio-group">
                      <input type="radio" id="landTransport" name="companyType" value="landTransport" />
                      <label htmlFor="landTransport">LAND TRANSPORT</label>
                    </div>
                    <div className="radio-group-with-input">
                      <div className="radio-group">
                        <input type="radio" id="others" name="companyType" value="others" />
                        <label htmlFor="others">OTHERS</label>
                      </div>
                      <input type="text" className="others-input-field" placeholder="" />
                    </div>
                    
                    <div className="radio-group">
                      <input type="radio" id="resorts" name="companyType" value="resorts" />
                      <label htmlFor="resorts">RESORTS</label>
                    </div>
                    <div className="radio-group">
                      <input type="radio" id="airlines" name="companyType" value="airlines" />
                      <label htmlFor="airlines">AIRLINES</label>
                    </div>
                    <div className="empty-cell"></div>
                    
                    <div className="radio-group">
                      <input type="radio" id="apartmentHotel" name="companyType" value="apartmentHotel" />
                      <label htmlFor="apartmentHotel">APARTMENT HOTEL</label>
                    </div>
                    <div className="radio-group">
                      <input type="radio" id="tourOperator" name="companyType" value="tourOperator" />
                      <label htmlFor="tourOperator">TOUR OPERATOR</label>
                    </div>
                    <div className="empty-cell"></div>
                  </div>
                </div>
                
                <div className="establishment-info">
                  <div className="form-group">
                    <label>NAME OF ESTABLISHMENT *</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>YEAR ESTABLISHED</label>
                    <input type="text" />
                  </div>
                </div>
              </div>

              {/* Business Address Section */}
              <div className="modal-section">
                <h3>BUSINESS ADDRESS</h3>
                <div className="address-grid">
                  <div className="form-group">
                    <label>Region *</label>
                    <select>
                      <option>- Select -</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Province *</label>
                    <select>
                      <option>- Select -</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>City/Municipality *</label>
                    <select>
                      <option>- Select -</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Barangay *</label>
                    <select>
                      <option>- Select -</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>House No./Bldg./ Street</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>Zip Code *</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>Office Contact No. *</label>
                    <div className="contact-split">
                      <input type="text" placeholder="Area Code" className="area-code" />
                      <input type="text" placeholder="Number" className="phone-number" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Documents Section */}
              <div className="modal-section">
                <h3>PRIMARY DOCUMENTS</h3>
                <div className="documents-grid">
                  <div className="document-item">
                    <div className="document-status">
                      <div className={`document-check ${uploadedFiles.businessPermit ? 'uploaded' : 'not-uploaded'}`}>
                        {uploadedFiles.businessPermit ? '✓' : '✕'}
                      </div>
                    </div>
                    <div className="document-upload-area">
                      <input 
                        type="file" 
                        id="business-permit" 
                        className="file-input" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('businessPermit', e.target.files[0])}
                      />
                      <label htmlFor="business-permit" className="upload-button">
                        <span className="upload-icon">📁</span>
                      </label>
                    </div>
                    <div className="document-name">Business Permit</div>
                  </div>
                  
                  <div className="document-item">
                    <div className="document-status">
                      <div className={`document-check ${uploadedFiles.dtiSec ? 'uploaded' : 'not-uploaded'}`}>
                        {uploadedFiles.dtiSec ? '✓' : '✕'}
                      </div>
                    </div>
                    <div className="document-upload-area">
                      <input 
                        type="file" 
                        id="dti-sec" 
                        className="file-input" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('dtiSec', e.target.files[0])}
                      />
                      <label htmlFor="dti-sec" className="upload-button">
                        <span className="upload-icon">📁</span>
                      </label>
                    </div>
                    <div className="document-name">DTI/SEC</div>
                  </div>
                  
                  <div className="document-item">
                    <div className="document-status">
                      <div className={`document-check ${uploadedFiles.dotCertificate ? 'uploaded' : 'not-uploaded'}`}>
                        {uploadedFiles.dotCertificate ? '✓' : '✕'}
                      </div>
                    </div>
                    <div className="document-upload-area">
                      <input 
                        type="file" 
                        id="dot-certificate" 
                        className="file-input" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('dotCertificate', e.target.files[0])}
                      />
                      <label htmlFor="dot-certificate" className="upload-button">
                        <span className="upload-icon">📁</span>
                      </label>
                    </div>
                    <div className="document-name">DOT Certificate</div>
                  </div>
                  
                  <div className="document-item">
                    <div className="document-status">
                      <div className={`document-check ${uploadedFiles.bir2303 ? 'uploaded' : 'not-uploaded'}`}>
                        {uploadedFiles.bir2303 ? '✓' : '✕'}
                      </div>
                    </div>
                    <div className="document-upload-area">
                      <input 
                        type="file" 
                        id="bir-2303" 
                        className="file-input" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('bir2303', e.target.files[0])}
                      />
                      <label htmlFor="bir-2303" className="upload-button">
                        <span className="upload-icon">📁</span>
                      </label>
                    </div>
                    <div className="document-name">BIR 2303</div>
                  </div>
                </div>
              </div>

              {/* Contact Details Section */}
              <div className="modal-section">
                <div className="section-header">
                  <h3>CONTACT DETAILS</h3>
                  <h3>REMARKS</h3>
                </div>
                <div className="contact-details-grid">
                  <div className="contact-left">
                    <div className="contact-form-grid">
                      <div className="form-group">
                        <label>SALE REPRESENTATIVE</label>
                        <input type="text" />
                      </div>
                      <div className="form-group">
                        <label>FRONTDESK</label>
                        <input type="text" />
                      </div>
                      <div className="form-group">
                        <label>CONTACT NUMBER</label>
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
                      <div className="form-group">
                        <label>EMAIL ADDRESS</label>
                        <input type="text" />
                      </div>
                    </div>
                    <div className="payment-terms-row">
                      <div className="form-group">
                        <label>MODE OF PAYMENT</label>
                        <input type="text" />
                      </div>
                      <div className="form-group">
                        <label>TYPE OF BREAKFAST</label>
                        <input type="text" />
                      </div>
                      <div className="form-group">
                        <label>CREDIT TERMS</label>
                        <input type="text" />
                      </div>
                      <div className="form-group">
                        <label>ROOM QUANTITY</label>
                        <input type="text" />
                      </div>
                    </div>
                  </div>
                  <div className="contact-right">
                    <div className="form-group">
                      <textarea rows="8" placeholder="Enter remarks..."></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contracted Rates Section */}
              <div className="modal-section">
                <div className="dropdown-controls">
                  <div className="contracted-dropdown">
                    <select>
                      <option>CONTRACTED RATES</option>
                      <option>Published Rate</option>
                      <option>Corporate Rate</option>
                      <option>Contracted Rate</option>
                    </select>
                  </div>
                  <div className="seasons-dropdown">
                    <select>
                      <option>SEASONS</option>
                      <option>REGULAR</option>
                      <option>LEAN</option>
                      <option>PEAK</option>
                      <option>HIGH / SUPER</option>
                      <option>WEEKDAYS</option>
                      <option>WEEKEND</option>
                      <option>HOLIDAY</option>
                      <option>FIT</option>
                      <option>GIT</option>
                      <option>LOCAL</option>
                      <option>INTERNATIONAL</option>
                    </select>
                  </div>
                </div>
                
                <div className="rates-table">
                  <table>
                    <thead>
                      <tr>
                        <th>TYPE OF ROOM</th>
                        <th>REGULAR</th>
                        <th>LEAN</th>
                        <th>PEAK</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="room-indicator red">−</span> Standard Room</td>
                        <td>Php 1,000.00</td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td><span className="room-indicator red">−</span> Economy</td>
                        <td>Php 1,500.00</td>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr>
                        <td><span className="room-indicator blue">+</span> Deluxe Room</td>
                        <td>Php 2,500.00</td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="upload-section">
                  <div className="form-group">
                    <label>UPLOAD CONTRACT RATES</label>
                    <div className="file-upload">
                      <span className="upload-icon">📁</span>
                      <span>Signed Documents.pdf</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>SELLING</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>VALIDITY</label>
                    <input type="text" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-update">UPDATE</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Inbox Button */}
      <button className="floating-inbox-btn" onClick={openInboxModal}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 6H10V7h4v2z"/>
        </svg>
        <span className="inbox-badge">3</span>
      </button>

      {/* Inbox Modal */}
      {inboxModalVisible && (
        <div className="modal-overlay" onClick={closeInboxModal}>
          <div className="inbox-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>INBOX</h2>
              <button className="modal-close" onClick={closeInboxModal}>×</button>
            </div>
            
            <div className="inbox-modal-content">
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
                    </div>
                    
            <div className="inbox-modal-footer">
              <button 
                className="view-all-notifications-btn" 
                onClick={() => {
                  closeInboxModal();
                  openNotificationPage();
                }}
              >
                View All Notifications
              </button>
                      </div>
                      </div>
                    </div>
            )}


    </div>
  );
};

export default AdminDashboard;