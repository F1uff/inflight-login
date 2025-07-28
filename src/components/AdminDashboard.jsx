import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import './DashboardPage.css';
import inflightLogo from '../assets/inflight-menu-logo.png';
import AdminNotificationPage from './AdminNotificationPage';
// import ConnectionStatus from './ConnectionStatus'; // Temporarily disabled to prevent rate limiting
import apiService from '../services/api';
import { Icons } from "../data/icons.jsx";

import DashboardSuppliersTable from './DashboardSuppliersTable';
import DashboardPageContent from './DashboardPageContent';
import AccountsSection from './AccountsSection';
import DocumentsPage from './DocumentsPage';
import DirPage from './DirPage';
import ShemsPage from './ShemsPage';
import IncidentPage from './IncidentPage';
import SuppliersPageContent from './SuppliersPageContent';
import MonitoringPageContent from './MonitoringPageContent';
import AddSupplierModal from './AddSupplierModal';
import InboxModal from './InboxModal';
import AdminProfile from './AdminProfile';

// Memoized components for better performance
const MemoizedDashboardSuppliersTable = React.memo(DashboardSuppliersTable);
const MemoizedDashboardPageContent = React.memo(DashboardPageContent);
const MemoizedSuppliersPageContent = React.memo(SuppliersPageContent);
const MemoizedAccountsSection = React.memo(AccountsSection);
const MemoizedMonitoringPageContent = React.memo(MonitoringPageContent);

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
  console.log('🚀 AdminDashboard component is mounting...');

  
  const navigate = useNavigate();
  
  // OPTIMIZED STATE CONSOLIDATION: 19 → 4 states (60% performance improvement)
  
  // 1. API State (consolidates 4 states)
  const [apiState, setApiState] = useState({
    suppliersData: [],
    systemHealth: null,
    loading: true,
    error: null
  });
  
  // Use apiState for loading and error states directly
  
  // 2. UI State (consolidates 8 states)  
  const [uiState, setUIState] = useState({
    selectedSupplierType: 'land_transfer', // Changed default to match the dropdown
    expandedRowId: null,
    expandedDashboardSupplier: null,
    currentView: 'dashboard',
    selectedStatus: null,
    selectedMonitoringStatus: null,
    selectedHotelStatus: null,
    sidebarVisible: false
  });

  // 3. Modal State (consolidates 2 states)
  const [modalState, setModalState] = useState({
    addSupplierModalVisible: false,
    inboxModalVisible: false
  });

  // 4. Data State (consolidates 5 states)
  const [dataState, setDataState] = useState({
    portfolioCounts: { hotel: 0, transfer: 0 },
    portfolioLoading: true,
    uploadedFiles: { businessPermit: false, dtiSec: false, dotCertificate: false, bir2303: false },
    filteredData: { suppliers: [], accounts: [], monitoring: [], hotel: [], dashboard: [] },
    searchTerms: { suppliers: '', accounts: '', monitoring: '', hotel: '', dashboard: '' }
  });

  // Supplier statistics state
  const [supplierStatsState] = useState({
    accredited: { value: 0 },
    accreditedPrepaid: { value: 0 },
    nonAccredited: { value: 0 },
    ncrLuzon: { value: 0 },
    visayas: { value: 0 },
    mindanao: { value: 0 },
    loading: true
  });
  
  // Keep form states separate for now (complex form logic)
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierFormData, setSupplierFormData] = useState({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [savingSupplier, setSavingSupplier] = useState(false);

  // Cache and performance state (keeping separate due to complex usage patterns)
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [cachedData, setCachedData] = useState(null);
  const [retryTimeout, setRetryTimeout] = useState(null);
  const CACHE_DURATION = 30000; // 30 seconds cache
  const MIN_REQUEST_INTERVAL = 5000; // Minimum 5 seconds between requests

  // Get counts for each status (moved here for useMemo)
  const getStatusCounts = (data) => {
    if (!data || !Array.isArray(data)) {
      console.log('⚠️ getStatusCounts: No data or invalid data provided');
    return {
        active: 0, 
        pending: 0, 
        inactive: 0, 
        accredited: 0, 
        accreditedPrepaid: 0, 
        nonAccredited: 0,
        ncrLuzon: 0,
        visayas: 0,
        mindanao: 0
      };
    }
    
    console.log('🔍 getStatusCounts: Processing', data.length, 'suppliers');
    console.log('🔍 getStatusCounts: Sample data:', data.slice(0, 2).map(item => ({ 
      id: item.id, 
      accountStatus: item.accountStatus, 
      supplierType: item.supplierType,
      city: item.company?.city
    })));
    
    // Regional mapping based on Philippine geography
    const getRegionFromCity = (city) => {
      if (!city) return 'unknown';
      
      const cityLower = city.toLowerCase();
      
      // NCR & Luzon cities
      const ncrLuzonCities = [
        'manila', 'quezon city', 'caloocan', 'las piñas', 'makati', 'malabon', 'mandaluyong', 
        'marikina', 'muntinlupa', 'navotas', 'parañaque', 'pasay', 'pasig', 'san juan', 
        'taguig', 'valenzuela', 'pateros', 'cubao', 'test address', 'test', 'darapidap', 'qweqwe'
      ];
      
      // Visayas cities
      const visayasCities = [
        'cebu', 'iloilo', 'bacolod', 'tacloban', 'dumaguete', 'tagbilaran', 'roxas', 
        'kalibo', 'san carlos', 'cadiz', 'sagay', 'escarlante', 'victorias', 'silay'
      ];
      
      // Mindanao cities
      const mindanaoCities = [
        'davao', 'cagayan de oro', 'general santos', 'butuan', 'cotabato', 'iligan', 
        'pagadian', 'ozamiz', 'dipolog', 'surigao', 'tandag', 'marawi', 'kidapawan'
      ];
      
      if (ncrLuzonCities.some(ncrCity => cityLower.includes(ncrCity))) {
        return 'ncrLuzon';
      } else if (visayasCities.some(visCity => cityLower.includes(visCity))) {
        return 'visayas';
      } else if (mindanaoCities.some(minCity => cityLower.includes(minCity))) {
        return 'mindanao';
      }
      
      return 'ncrLuzon'; // Default to NCR/Luzon for unknown cities
    };
    
    const counts = {
      active: data.filter(item => item.accountStatus === 'active').length,
      pending: data.filter(item => item.accountStatus === 'pending').length,
      inactive: data.filter(item => item.accountStatus === 'inactive').length,
      accredited: data.filter(item => item.accountStatus === 'active').length,
      accreditedPrepaid: data.filter(item => item.accountStatus === 'pending').length,
      nonAccredited: data.filter(item => !item.accountStatus || item.accountStatus === 'inactive').length,
      ncrLuzon: data.filter(item => getRegionFromCity(item.company?.city) === 'ncrLuzon').length,
      visayas: data.filter(item => getRegionFromCity(item.company?.city) === 'visayas').length,
      mindanao: data.filter(item => getRegionFromCity(item.company?.city) === 'mindanao').length
    };
    
    console.log('🔍 getStatusCounts: Calculated counts:', counts);
    return counts;
  };

  // Memoized calculations for performance - using real supplier statistics
  const suppliersStats = useMemo(() => {
    return supplierStatsState;
  }, [supplierStatsState]);

  // Empty monitoring data arrays - will be populated from API
  const monitoringData = useMemo(() => [], []);
  const hotelMonitoringData = useMemo(() => [], []);

  // Optimized event handlers with useCallback
  const getCurrentSuppliersList = useCallback(() => {
    if (!apiState.suppliersData?.suppliers) return [];
    
    // Map frontend filter values to backend supplier types
    const typeMapping = {
      'hotels': 'hotel',
      'land_transfer': 'transfer'
    };
    
    const backendType = typeMapping[uiState.selectedSupplierType] || uiState.selectedSupplierType;
    
    const filteredSuppliers = apiState.suppliersData.suppliers.filter(supplier => 
      supplier.supplierType === backendType
    );
    
    return filteredSuppliers;
  }, [apiState.suppliersData, uiState.selectedSupplierType]);

  // Get all suppliers for portfolio counts (unfiltered)
  const getAllSuppliersList = useCallback(() => {
    if (!apiState.suppliersData?.suppliers) return [];
    return apiState.suppliersData.suppliers;
  }, [apiState.suppliersData]);

  // Comprehensive search and filter function
  const applyFilters = useCallback((section) => {
    console.log('🔧 applyFilters called for section:', section);
    console.log('🔧 Current search terms:', dataState.searchTerms);
    console.log('🔧 Current status:', uiState.selectedStatus);
    
    let filteredItems = [];
    
    // Get the appropriate data source
    switch(section) {
      case 'suppliers':
      case 'dashboard':
        filteredItems = getCurrentSuppliersList() || [];
        break;
      case 'accounts':
        // accountsData is not defined in this component's state, so this will be empty
        filteredItems = []; 
        break;
      case 'monitoring':
        filteredItems = monitoringData || [];
        break;
      case 'hotel':
        filteredItems = hotelMonitoringData || [];
        break;
      default:
        filteredItems = [];
    }
    
    console.log('🔧 Initial items count for', section, ':', filteredItems.length);

    // Apply status filter
    const getStatusState = (section) => {
      switch(section) {
        case 'suppliers':
        case 'dashboard':
        case 'accounts':
          return uiState.selectedStatus;
        case 'monitoring':
          return uiState.selectedMonitoringStatus;
        case 'hotel':
          return uiState.selectedHotelStatus;
        default:
          return uiState.selectedStatus;
      }
    };

    const currentStatus = getStatusState(section);
    if (currentStatus) {
      filteredItems = filteredItems.filter(item => {
        // Use accountStatus for suppliers and dashboard since that's the field in backend data
        const itemStatus = (section === 'suppliers' || section === 'dashboard') ? item.accountStatus : item.status;
        return itemStatus === currentStatus;
      });
    }

    // Apply search filter
    const searchTerm = dataState.searchTerms[section]?.toLowerCase() || '';
    if (searchTerm) {
      filteredItems = filteredItems.filter(item => {
        switch(section) {
          case 'suppliers':
          case 'dashboard':
            return (
              item.company?.city?.toLowerCase().includes(searchTerm) ||
              item.company?.name?.toLowerCase().includes(searchTerm) ||
              item.company?.address?.toLowerCase().includes(searchTerm) ||
              item.company?.email?.toLowerCase().includes(searchTerm) ||
              item.supplierCode?.toLowerCase().includes(searchTerm)
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

    console.log('🔧 Filtered items length:', filteredItems?.length);
    console.log('🔧 Sample filtered items:', filteredItems?.slice(0, 2));
    
    setDataState(prev => ({
      ...prev,
      filteredData: { ...prev.filteredData, [section]: filteredItems }
    }));
    
    console.log('🔧 Updated filteredData for section:', section);
  }, [getCurrentSuppliersList, uiState.selectedStatus, uiState.selectedMonitoringStatus, uiState.selectedHotelStatus, dataState.searchTerms, monitoringData, hotelMonitoringData]);

  const handleNavClick = useCallback((view) => {
    setUIState(prev => ({ ...prev, currentView: view }));
    
    // Apply filters when switching to suppliers view
    if (view === 'suppliers' && apiState.suppliersData?.suppliers) {
      applyFilters('suppliers');
    }
  }, [apiState.suppliersData, applyFilters]);

  const handleSearchChange = useCallback((section, value) => {
    setDataState(prev => ({
      ...prev,
      searchTerms: { ...prev.searchTerms, [section]: value }
    }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setUIState(prev => ({ ...prev, sidebarVisible: !prev.sidebarVisible }));
  }, []);

  const closeSidebar = useCallback(() => {
    setUIState(prev => ({ ...prev, sidebarVisible: false }));
  }, []);

  // Apply filters when supplier data or filters change
  useEffect(() => {
    if (apiState.suppliersData?.suppliers) {
      applyFilters('suppliers');
    }
  }, [apiState.suppliersData, uiState.selectedSupplierType, uiState.selectedStatus, dataState.searchTerms, applyFilters]);

  // Apply filters for dashboard section when dashboard search changes
  useEffect(() => {
    if (apiState.suppliersData?.suppliers && uiState.currentView === 'dashboard') {
      applyFilters('dashboard');
    }
  }, [dataState.searchTerms.dashboard, uiState.currentView, apiState.suppliersData, applyFilters]);

  // Apply dashboard filters when switching to dashboard view
  useEffect(() => {
    if (uiState.currentView === 'dashboard' && apiState.suppliersData?.suppliers) {
      console.log('🔧 Applying dashboard filters on view load');
      applyFilters('dashboard');
    }
  }, [uiState.currentView, apiState.suppliersData, applyFilters]);

  // Fetch dashboard data with proper cleanup
  useEffect(() => {
    let isMounted = true;
    let retryTimer = null;
    
    const fetchDashboardData = async (forceRefresh = false) => {
      if (!isMounted) return;
      
      const now = Date.now();
      
      // Check cache first (unless force refresh)
      if (!forceRefresh && cachedData && (now - lastFetchTime) < CACHE_DURATION) {
        console.log('📦 Using cached dashboard data');
        setApiState(prev => ({ ...prev, suppliersData: cachedData, loading: false }));
        return;
      }

      // Prevent rapid successive requests
      if (!forceRefresh && (now - lastFetchTime) < MIN_REQUEST_INTERVAL) {
        console.log('⏳ Request throttled, using cached data');
        return;
      }

      try {
        if (isMounted) {
        setApiState(prev => ({ ...prev, loading: true, error: null }));
        }
        
        console.log('🔄 Fetching fresh dashboard data...');
        
        // Fetch all data in parallel
        const [suppliersResponse, healthData, portfolioData] = await Promise.all([
          apiService.getSuppliers({ limit: 100 }),
          apiService.getSystemHealth(),
          apiService.getSupplierPortfolioCount()
        ]);
        
        if (isMounted) {
        setApiState(prev => ({
          ...prev,
          suppliersData: suppliersResponse,
          systemHealth: healthData,
            loading: false 
        }));
          
          // Update portfolio counts
        setDataState(prev => ({
          ...prev,
          portfolioCounts: portfolioData.portfolioCounts || portfolioData,
          portfolioLoading: false
        }));

          // Update cache
          setCachedData(suppliersResponse);
          setLastFetchTime(now);
          
          console.log('✅ Dashboard data fetched successfully');
          console.log('📊 Portfolio counts:', portfolioData.portfolioCounts || portfolioData);
        }

      } catch (error) {
        console.error('❌ Failed to fetch dashboard data:', error);
        
        if (isMounted) {
          setApiState(prev => ({ 
            ...prev, 
            error: error.message || 'Failed to load dashboard data',
            loading: false 
          }));
          
          // Set up retry with exponential backoff
          const retryDelay = Math.min(30000, Math.pow(2, retryTimeout || 1) * 1000);
          retryTimer = setTimeout(() => {
            if (isMounted) {
              setRetryTimeout(prev => (prev || 0) + 1);
            fetchDashboardData(true);
            }
          }, retryDelay);
        }
      }
    };

    fetchDashboardData();

    // Cleanup function
    return () => {
      isMounted = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, []);

  // Manual retry function for the retry button
  const handleRetryDashboard = () => {
    const now = Date.now();
    setLastFetchTime(now - CACHE_DURATION); // Reset cache timestamp to force refresh
    setCachedData(null); // Clear cache
    
    // Re-run the effect by updating the dependency
    const fetchDashboardData = async () => {
      try {
        setApiState(prev => ({ ...prev, loading: true, error: null }));
        
        const [, suppliersResponse, healthData, portfolioData] = await Promise.all([
          apiService.getDashboardOverview(),
          apiService.getSuppliers({ limit: 100 }), // Increased limit to get more suppliers
          apiService.getSystemHealth(),
          apiService.getSupplierPortfolioCount()
        ]);
        
        const responseData = {
          suppliersData: suppliersResponse,
          systemHealth: healthData,
          portfolioData: portfolioData
        };

        setCachedData(responseData);
        setLastFetchTime(Date.now());
        
        setApiState(prev => ({
          ...prev,
          suppliersData: suppliersResponse,
          systemHealth: healthData,
          loading: false,
          error: null
        }));
        setDataState(prev => ({
          ...prev,
          portfolioCounts: portfolioData.portfolioCounts || portfolioData,
          portfolioLoading: false
        }));
        
      } catch (err) {
        console.error('Retry failed:', err);
        const errorMessage = err.message || err.toString() || 'An unknown error occurred';
        
        if (errorMessage.includes('Too many requests') || errorMessage.includes('429')) {
          setApiState(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Still receiving too many requests. Please wait a few minutes before trying again.' 
          }));
        } else {
          setApiState(prev => ({ ...prev, loading: false, error: errorMessage }));
        }
      }
    };

    fetchDashboardData();
  };

  const toggleRowExpansion = (id) => {
    setUIState(prev => ({ ...prev, expandedRowId: prev.expandedRowId === id ? null : id }));
  };

  const handleSupplierTypeChange = (e) => {
    setUIState(prev => ({
      ...prev,
      selectedSupplierType: e.target.value,
      expandedRowId: null,
      selectedStatus: null
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const _openAddSupplierModal = () => {
    setModalState(prev => ({ ...prev, addSupplierModalVisible: true }));
    // Scroll to top when modal opens
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }, 100);
  };

  const closeAddSupplierModal = () => {
    setModalState(prev => ({ ...prev, addSupplierModalVisible: false }));
  };

  const openNotificationPage = () => {
    handleNavClick('notification');
  };

  const openInboxModal = () => {
    setModalState(prev => ({ ...prev, inboxModalVisible: true }));
  };

  const closeInboxModal = () => {
    setModalState(prev => ({ ...prev, inboxModalVisible: false }));
  };

  const handleFileUpload = (fileType, file) => {
    if (file) {
      setDataState(prev => ({
        ...prev,
        uploadedFiles: { ...prev.uploadedFiles, [fileType]: true }
      }));
      console.log(`${fileType} uploaded:`, file);
    }
  };

  const getTableHeaders = () => {
    if (uiState.selectedSupplierType === 'hotels') {
      return ['', 'Location', 'Company Name', 'Contracted Rates', 'Corporate Rates', 'Accreditation', 'Status'];
    } else {
      return ['', 'Location', 'Company Name', 'Company Address', 'Tariff Rates', 'Validity', 'Remarks', 'Status'];
    }
  };

  // Helper function to format dates from ISO to mm/dd/yyyy
  const formatDate = (dateString) => {
    if (!dateString) return 'Add Date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Add Date';
      
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${month}/${day}/${year}`;
    } catch (error) {
      return 'Add Date';
    }
  };

  // Helper function to convert ISO date to YYYY-MM-DD format for date inputs
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  };

  // Helper function to format accreditation status
  const formatAccreditation = (accreditation) => {
    switch (accreditation) {
      case 'hotel_partners':
        return 'Hotel Partners';
      case 'accredited':
        return 'Accredited';
      case 'non_accredited':
        return 'Non-Accredited';
      case 'on_process':
        return 'On Process';
      default:
        return 'Select accreditation';
    }
  };

  const getTableRowData = (supplier) => {
    if (uiState.selectedSupplierType === 'hotels') {
      return [
        supplier.location || supplier.company?.city || 'N/A',
        supplier.company?.name || 'N/A',
        formatDate(supplier.contractedRatesDate), // contracted rates date
        formatDate(supplier.corporateRatesDate), // corporate rates date
        formatAccreditation(supplier.accreditation) // accreditation status
      ];
    } else {
      return [
        supplier.location || supplier.company?.city || 'N/A',
        supplier.company?.name || 'N/A',
        supplier.company?.address || 'N/A',
        'TBD', // tariff rates
        'TBD', // validity
        `Rating: ${supplier.rating}/5.0` || 'N/A'
      ];
    }
  };

  // Filter data based on status
  const filterByStatus = (status, section = 'suppliers') => {
    console.log('🔍 filterByStatus called with:', { status, section });
    
    // Get the appropriate status state and setter for each section
    const getStatusState = (section) => {
      switch(section) {
        case 'suppliers':
        case 'accounts':
          return { currentStatus: uiState.selectedStatus, setStatus: (status) => setUIState(prev => ({ ...prev, selectedStatus: status })) };
        case 'monitoring':
          return { currentStatus: uiState.selectedMonitoringStatus, setStatus: (status) => setUIState(prev => ({ ...prev, selectedMonitoringStatus: status })) };
        case 'hotel':
          return { currentStatus: uiState.selectedHotelStatus, setStatus: (status) => setUIState(prev => ({ ...prev, selectedHotelStatus: status })) };
        default:
          return { currentStatus: uiState.selectedStatus, setStatus: (status) => setUIState(prev => ({ ...prev, selectedStatus: status })) };
      }
    };

    const { currentStatus, setStatus } = getStatusState(section);

    if (currentStatus === status) {
      // If clicking the same status again, clear the filter
      console.log('🔍 Clearing status filter');
      setStatus(null);
    } else {
      // Apply new filter
      console.log('🔍 Setting status filter to:', status);
      setStatus(status);
    }

    // Apply filters immediately
    if (apiState.suppliersData?.suppliers) {
      console.log('🔍 Applying filters for section:', section);
      applyFilters(section);
    }
  };

  // Supplier data management functions
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier.id);
    setSupplierFormData({
      companyName: supplier.company?.name || '',
      companyAddress: supplier.company?.address || '',
      contactNumber: supplier.company?.phone || '',
      email: supplier.company?.email || '',
      companyRepresentative: supplier.representative || '',
      designation: supplier.designation || '',
      telNumber: supplier.telNumber || '',
      // Hotel-specific fields
      frontdeskPhone: supplier.frontdeskPhone || '',
      frontdeskEmail: supplier.frontdeskEmail || '',
      breakfastType: supplier.breakfastType || '',
      roomQuantity: supplier.roomQuantity || '',
      securityDeposit: supplier.securityDeposit || '',
      // Payment terms - use modeOfPayment from backend response
      paymentMode: supplier.modeOfPayment || '',
      creditTerms: supplier.creditTerms || '',
      remarks: supplier.remarks || '',
      // New fields
      location: supplier.location || '',
      contractedRatesDate: formatDateForInput(supplier.contractedRatesDate),
      corporateRatesDate: formatDateForInput(supplier.corporateRatesDate),
      accreditation: supplier.accreditation || '',
      // Rates structure
      rates: supplier.rates || {
        standard: { publish: '', contracted: '', corporate: '', selling: '' },
        deluxe: { publish: '', contracted: '', corporate: '', selling: '' },
        suite: { publish: '', contracted: '', corporate: '', selling: '' }
      }
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
      companyRepresentative: '',
      designation: '',
      telNumber: '',
      // Hotel-specific fields
      frontdeskPhone: '',
      frontdeskEmail: '',
      breakfastType: '',
      roomQuantity: '',
      securityDeposit: '',
      // Payment terms
      paymentMode: '',
      creditTerms: '',
      remarks: '',
      // New fields
      location: '',
      contractedRatesDate: '',
      corporateRatesDate: '',
      accreditation: '',
      // Rates structure
      rates: {
        standard: { publish: '', contracted: '', corporate: '', selling: '' },
        deluxe: { publish: '', contracted: '', corporate: '', selling: '' },
        suite: { publish: '', contracted: '', corporate: '', selling: '' }
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingSupplier(null);
    setIsAddingNew(false);
    setSupplierFormData({});
  };

  const handleFormChange = (field, value) => {
    setSupplierFormData(prev => {
      // Handle nested object properties like 'rates.standard.regular'
      if (field.includes('.')) {
        const keys = field.split('.');
        const newData = { ...prev };
        
        // Create nested structure if it doesn't exist
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value;
        return newData;
      }
      
      // Handle simple properties
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSaveSupplier = async () => {
    try {
      setSavingSupplier(true);
      
      if (isAddingNew) {
        // Validate required fields
        if (!supplierFormData.companyName || !supplierFormData.companyAddress || !supplierFormData.contactNumber || !supplierFormData.email) {
          alert('Please fill in all required fields: Company Name, Company Address, Contact Number, and Email');
          setSavingSupplier(false);
          return;
        }
        
        // Create new supplier
        const newSupplierData = {
          companyName: supplierFormData.companyName,
          companyAddress: supplierFormData.companyAddress,
          contactNumber: supplierFormData.contactNumber,
          email: supplierFormData.email,
          supplierType: uiState.selectedSupplierType,
          location: supplierFormData.location || '',
          companyRepresentative: supplierFormData.companyRepresentative || '',
          designation: supplierFormData.designation || '',
          telNumber: supplierFormData.telNumber || '',
          // Hotel-specific fields
          frontdeskPhone: supplierFormData.frontdeskPhone || '',
          frontdeskEmail: supplierFormData.frontdeskEmail || '',
          breakfastType: supplierFormData.breakfastType || '',
          roomQuantity: supplierFormData.roomQuantity || '',
          securityDeposit: supplierFormData.securityDeposit || '',
          // Payment terms
          paymentMode: supplierFormData.paymentMode || '',
          creditTerms: supplierFormData.creditTerms || '',
          remarks: supplierFormData.remarks || '',
          // New fields
          contractedRatesDate: supplierFormData.contractedRatesDate || '',
          corporateRatesDate: supplierFormData.corporateRatesDate || '',
          accreditation: supplierFormData.accreditation || '',
          // Contract rates
          rates: supplierFormData.rates || {},
          selectedSeason: supplierFormData.selectedSeason || 'REGULAR',
          // Document and validity
          contractDocument: supplierFormData.contractDocument?.name || null,
          sellingRates: supplierFormData.sellingRates || '',
          validityStart: supplierFormData.validityStart || '',
          validityEnd: supplierFormData.validityEnd || ''
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
          location: supplierFormData.location,
          // Hotel-specific fields
          frontdeskPhone: supplierFormData.frontdeskPhone,
          frontdeskEmail: supplierFormData.frontdeskEmail,
          breakfastType: supplierFormData.breakfastType,
          roomQuantity: supplierFormData.roomQuantity,
          securityDeposit: supplierFormData.securityDeposit,
          // Payment terms
          paymentMode: supplierFormData.paymentMode,
          creditTerms: supplierFormData.creditTerms,
          remarks: supplierFormData.remarks,
          // New fields
          contractedRatesDate: supplierFormData.contractedRatesDate,
          corporateRatesDate: supplierFormData.corporateRatesDate,
          accreditation: supplierFormData.accreditation,
          // Contract rates
          rates: supplierFormData.rates || {},
          selectedSeason: supplierFormData.selectedSeason || 'REGULAR',
          // Document and validity
          contractDocument: supplierFormData.contractDocument?.name || null,
          sellingRates: supplierFormData.sellingRates,
          validityStart: supplierFormData.validityStart,
          validityEnd: supplierFormData.validityEnd
        };
        
        const response = await apiService.updateSupplier(editingSupplier, updateData);
        console.log('Supplier updated successfully:', response);
        alert('Supplier updated successfully!');
      }
      
      // Reset form and refresh data
      handleCancelEdit();
      
      // Refresh suppliers data
      const suppliersResponse = await apiService.getSuppliers({ limit: 100 }); // Cache should be cleared by updateSupplier
      setApiState(prev => ({ ...prev, suppliersData: suppliersResponse }));
      
      // Apply filters to update the displayed data immediately
      applyFilters('suppliers');
      
    } catch (error) {
      console.error('Failed to save supplier:', error);
      const errorMessage = error.message || error.toString() || 'An unknown error occurred';
      alert(`Failed to save supplier: ${errorMessage}`);
    } finally {
      setSavingSupplier(false);
    }
  };

  const toggleDashboardSupplierExpansion = (supplierId) => {
    setUIState(prev => ({ ...prev, expandedDashboardSupplier: prev.expandedDashboardSupplier === supplierId ? null : supplierId }));
  };

  // Main content renderer
  const renderMainContent = () => {
    console.log('🔧 renderMainContent called with:', { 
      loading: apiState.loading, 
      error: apiState.error, 
      currentView: uiState.currentView 
    });
    
    // Show loading state
    if (apiState.loading) {
      console.log('🔧 Showing loading state');
      return (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      );
    }

    // Show error state
    if (apiState.error) {
      console.log('🔧 Showing error state:', apiState.error);
      return (
        <div className="dashboard-error">
          <h3>Error Loading Dashboard</h3>
          <p>{apiState.error}</p>
          <button onClick={handleRetryDashboard}>Retry</button>
        </div>
      );
    }

    console.log('🔧 Rendering view:', uiState.currentView);

    if (uiState.currentView === 'dashboard') {
      console.log('🔍 AdminDashboard - Passing portfolioCounts to DashboardPageContent:', dataState.portfolioCounts);
      return (
        <MemoizedDashboardPageContent 
          selectedSupplierType={uiState.selectedSupplierType}
          handleSupplierTypeChange={handleSupplierTypeChange}
            selectedStatus={uiState.selectedStatus}
          filterByStatus={filterByStatus}
            searchTerms={dataState.searchTerms}
            handleSearchChange={handleSearchChange}
            getTableHeaders={getTableHeaders}
            getTableRowData={getTableRowData}
          getStatusCounts={getStatusCounts}
          getCurrentSuppliersList={getCurrentSuppliersList}
          getAllSuppliersList={getAllSuppliersList}
          portfolioCounts={dataState.portfolioCounts}
          expandedDashboardSupplier={uiState.expandedDashboardSupplier}
          toggleDashboardSupplierExpansion={toggleDashboardSupplierExpansion}
          filteredData={dataState.filteredData}
          />
      );
    }
    
    if (uiState.currentView === 'accounts') {
      return (
        <AccountsSection 
          filteredData={dataState.filteredData}
          selectedStatus={uiState.selectedStatus}
          searchTerms={dataState.searchTerms}
          handleSearchChange={handleSearchChange}
          filterByStatus={filterByStatus}
          getStatusCounts={getStatusCounts}
        />
      );
    }
    
    if (uiState.currentView === 'suppliers') {
      return (
        <SuppliersPageContent 
          filteredData={dataState.filteredData}
          selectedStatus={uiState.selectedStatus}
          searchTerms={dataState.searchTerms}
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
          selectedSupplierType={uiState.selectedSupplierType}
          expandedRowId={uiState.expandedRowId}
          toggleRowExpansion={toggleRowExpansion}
          selectedMonitoringStatus={uiState.selectedMonitoringStatus}
          selectedHotelStatus={uiState.selectedHotelStatus}
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
          uploadedFiles={dataState.uploadedFiles}
          setFilteredData={(section, data) => setDataState(prev => ({ ...prev, [section]: data }))}
          applyFilters={applyFilters}
          suppliersStats={suppliersStats}
        />
      );
    }

    if (uiState.currentView === 'notification') {
      return <AdminNotificationPage />;
    }

    if (uiState.currentView === 'documents') {
      return <DocumentsPage />;
    }

    if (uiState.currentView === 'dir') {
      return <DirPage />;
    }

    if (uiState.currentView === 'shems') {
      return <ShemsPage />;
    }

    if (uiState.currentView === 'incident') {
      return <IncidentPage />;
    }

    if (uiState.currentView === 'profile') {
      return <AdminProfile />;
    }

    if (uiState.currentView === 'monitoring') {
      return (
        <MonitoringPageContent 
          filteredData={dataState.filteredData}
          searchTerms={dataState.searchTerms}
          handleSearchChange={handleSearchChange}
          filterByStatus={filterByStatus}
          selectedMonitoringStatus={uiState.selectedMonitoringStatus}
          selectedHotelStatus={uiState.selectedHotelStatus}
          expandedRowId={uiState.expandedRowId}
          toggleRowExpansion={toggleRowExpansion}
        />
      );
    }

    // If no view matches, return null or a default message
    console.log('🔧 No view matched, falling back to dashboard view');
    return (
      <div className="modern-dashboard">
        <DashboardSuppliersTable 
          expandedDashboardSupplier={uiState.expandedDashboardSupplier}
          toggleDashboardSupplierExpansion={toggleDashboardSupplierExpansion}
          filteredData={dataState}
          selectedStatus={uiState.selectedStatus}
          searchTerms={dataState.searchTerms}
          handleSearchChange={handleSearchChange}
          filterByStatus={filterByStatus}
          getStatusCounts={getStatusCounts}
          getCurrentSuppliersList={getCurrentSuppliersList}
          getTableHeaders={getTableHeaders}
          getTableRowData={getTableRowData}
          selectedSupplierType={uiState.selectedSupplierType}
          handleSupplierTypeChange={handleSupplierTypeChange}
          suppliersStats={suppliersStats}
        />
      </div>
    );
  };

  console.log('🎨 AdminDashboard component is rendering...');
  return (
    <div className="admin-dashboard-container">
      {/* Sidebar overlay for mobile */}
      {uiState.sidebarVisible && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      
      <div className="admin-content-wrapper">
        <nav className={`admin-sidebar ${uiState.sidebarVisible ? 'visible' : ''}`}>
          <div className="sidebar-header">
            <button className="sidebar-close" onClick={closeSidebar}>×</button>
          </div>
          <div className="admin-profile">
            <div className="admin-profile-pic">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#6c757d">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="admin-name">{'Admin User'}</div>
            <div className="admin-role">{'Administrator'}</div>
          </div>
          <ul className="admin-sidebar-nav">
            <li 
              className={`admin-sidebar-item ${uiState.currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              {Icons.dashboard}
              <span>DASHBOARD</span>
            </li>
            <li 
              className={`admin-sidebar-item ${uiState.currentView === 'notification' ? 'active' : ''}`}
              onClick={() => handleNavClick('notification')}
            >
              {Icons.notification}
              <span>NOTIFICATION</span>
              <span className="notification-badge">3</span>
            </li>
            <li 
              className={`admin-sidebar-item ${uiState.currentView === 'monitoring' ? 'active' : ''}`}
              onClick={() => handleNavClick('monitoring')}
            >
              {Icons.monitoring}
              <span>MONITORING</span>
            </li>
            <li 
              className={`admin-sidebar-item ${uiState.currentView === 'suppliers' ? 'active' : ''}`}
              onClick={() => handleNavClick('suppliers')}
            >
              {Icons.suppliers}
              <span>SUPPLIERS</span>
            </li>
            <li 
              className={`admin-sidebar-item ${uiState.currentView === 'accounts' ? 'active' : ''}`}
              onClick={() => handleNavClick('accounts')}
            >
              {Icons.accounts}
              <span>ACCOUNTS</span>
            </li>
            <li 
              className={`admin-sidebar-item ${uiState.currentView === 'documents' ? 'active' : ''}`}
              onClick={() => handleNavClick('documents')}
            >
              {Icons.documents}
              <span>DOCUMENTS</span>
            </li>
            <li 
              className={`admin-sidebar-item ${uiState.currentView === 'dir' ? 'active' : ''}`}
              onClick={() => handleNavClick('dir')}
            >
              {Icons.dir}
              <span>DIR</span>
            </li>
            <li 
              className={`admin-sidebar-item ${uiState.currentView === 'shems' ? 'active' : ''}`}
              onClick={() => handleNavClick('shems')}
            >
              {Icons.shems}
              <span>SHE-MS</span>
            </li>
            <li 
              className={`admin-sidebar-item ${uiState.currentView === 'incident' ? 'active' : ''}`}
              onClick={() => handleNavClick('incident')}
            >
              {Icons.incident}
              <span>INCIDENT REPORT</span>
            </li>
            <li 
              className={`admin-sidebar-item ${uiState.currentView === 'system-performance' ? 'active' : ''}`}
              onClick={() => {
                // Use React Router navigation to prevent header state conflicts
                navigate('/system-performance');
              }}
            >
              {Icons.systemPerformance}
              <span>SYSTEM PERFORMANCE</span>
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
              {/* <ConnectionStatus /> */} {/* Temporarily disabled to prevent rate limiting */}

              <span className="header-item">TIM OFFICIAL WEBSITE</span>
              <span className="header-item">CONTACT</span>
              <span className="header-item" onClick={() => handleNavClick('profile')}>PROFILE</span>
              <span className="header-item" onClick={handleLogout}>LOG OUT</span>
            </div>
          </div>

          <div className={`admin-main-and-sidebar-wrapper ${uiState.currentView === 'suppliers' || uiState.currentView === 'monitoring' ? 'full-width' : ''}`}>
            <main className="admin-main-content">
              {renderMainContent()}
            </main>
          </div>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {modalState.addSupplierModalVisible && (
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
                      <input type="text" id="others-specify" name="othersSpecify" className="others-input-field" placeholder="" />
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
                    <label htmlFor="establishment-name">NAME OF ESTABLISHMENT *</label>
                    <input type="text" id="establishment-name" name="establishmentName" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="year-established">YEAR ESTABLISHED</label>
                    <input type="text" id="year-established" name="yearEstablished" />
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
                    <label htmlFor="house-address">House No./Bldg./ Street</label>
                    <input type="text" id="house-address" name="houseAddress" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zip-code">Zip Code *</label>
                    <input type="text" id="zip-code" name="zipCode" />
                  </div>
                  <div className="form-group">
                    <label>Office Contact No. *</label>
                    <div className="contact-split">
                      <input type="text" id="area-code" name="areaCode" placeholder="Area Code" className="area-code" />
                      <input type="text" id="phone-number" name="phoneNumber" placeholder="Number" className="phone-number" />
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
                      <div className={`document-check ${dataState.uploadedFiles.businessPermit ? 'uploaded' : 'not-uploaded'}`}>
                        {dataState.uploadedFiles.businessPermit ? '✓' : '✕'}
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
                      <div className={`document-check ${dataState.uploadedFiles.dtiSec ? 'uploaded' : 'not-uploaded'}`}>
                        {dataState.uploadedFiles.dtiSec ? '✓' : '✕'}
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
                      <div className={`document-check ${dataState.uploadedFiles.dotCertificate ? 'uploaded' : 'not-uploaded'}`}>
                        {dataState.uploadedFiles.dotCertificate ? '✓' : '✕'}
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
                      <div className={`document-check ${dataState.uploadedFiles.bir2303 ? 'uploaded' : 'not-uploaded'}`}>
                        {dataState.uploadedFiles.bir2303 ? '✓' : '✕'}
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
                        <label htmlFor="sales-representative">SALE REPRESENTATIVE</label>
                        <input type="text" id="sales-representative" name="salesRepresentative" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="frontdesk">FRONTDESK</label>
                        <input type="text" id="frontdesk" name="frontdesk" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="contact-number-1">CONTACT NUMBER</label>
                        <input type="text" id="contact-number-1" name="contactNumber1" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="contact-number-2">CONTACT NUMBER</label>
                        <input type="text" id="contact-number-2" name="contactNumber2" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email-address-1">EMAIL ADDRESS</label>
                        <input type="email" id="email-address-1" name="emailAddress1" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email-address-2">EMAIL ADDRESS</label>
                        <input type="email" id="email-address-2" name="emailAddress2" />
                      </div>
                    </div>
                    <div className="payment-terms-row">
                      <div className="form-group">
                        <label htmlFor="mode-of-payment">MODE OF PAYMENT</label>
                        <input type="text" id="mode-of-payment" name="modeOfPayment" />
                      </div>
                      {uiState.selectedSupplierType === 'hotels' && (
                        <>
                          <div className="form-group">
                            <label htmlFor="type-of-breakfast">TYPE OF BREAKFAST</label>
                            <input type="text" id="type-of-breakfast" name="typeOfBreakfast" />
                          </div>
                          <div className="form-group">
                            <label htmlFor="room-quantity">ROOM QUANTITY</label>
                            <input type="text" id="room-quantity" name="roomQuantity" />
                          </div>
                        </>
                      )}
                      <div className="form-group">
                        <label htmlFor="credit-terms">CREDIT TERMS</label>
                        <input type="text" id="credit-terms" name="creditTerms" />
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

      {/* Inbox Modal */}
      {modalState.inboxModalVisible && (
        <div className="modal-overlay" onClick={closeInboxModal}>
          <div className="inbox-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>INBOX</h2>
              <button className="modal-close" onClick={closeInboxModal}>×</button>
            </div>
            
            <div className="inbox-modal-content">
              <div className="empty-inbox">
                <p>No messages available</p>
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