import React, { useState, useEffect, useCallback } from 'react';
import DocumentViewer from './DocumentViewer';
import DocumentUploadButton from './DocumentUploadButton';
import BookingPrintView from './BookingPrintView';
import './DocumentStyles.css';
import { Link } from 'react-router-dom';
import './UserDashboard.css';
import DateRangePicker from './DateRangePicker.jsx';
import apiService from '../services/api';
import pollingService from '../services/websocket';
import PollingStatus from './WebSocketStatus';
import BookingStatusDropdown from './BookingStatusDropdown';

import ronwayLogo from '../assets/ronway.png';
import { Icons } from '../data/icons.jsx';


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
  const [enrollmentFormExpanded, setEnrollmentFormExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [documents] = useState([
    { 
      id: 1, 
      fileName: 'Tariff Rates 2025', 
      modifiedDate: 'Jan 17, 2025',
      modifiedBy: 'Jason',
      signedDate: 'Jan 25, 2025',
      validity: 'Dec 31, 2025',
      status: 'active',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    { 
      id: 2, 
      fileName: 'Safety Regulations 2025', 
      modifiedDate: 'Jan 22, 2025',
      modifiedBy: 'Maria',
      signedDate: '',
      validity: '',
      status: 'inactive',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    { 
      id: 3, 
      fileName: 'Ronway Transport Manual', 
      modifiedDate: 'Dec 15, 2024',
      modifiedBy: 'Robert',
      signedDate: 'Dec 20, 2024',
      validity: 'Dec 31, 2025',
      status: 'active',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    { 
      id: 4, 
      fileName: 'Driver Guidelines 2025', 
      modifiedDate: 'Jan 05, 2025',
      modifiedBy: 'Sarah',
      signedDate: 'Jan 10, 2025',
      validity: 'Dec 31, 2025',
      status: 'active',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Form states for driver/vehicle registration pages
  const [driverForm, setDriverForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    address: '',
    ndaStatus: 'Pending',
    driverType: 'regular'
  });
  
  const [vehicleForm, setVehicleForm] = useState({
    plateNumber: '',
    make: '',
    model: '',
    year: '',
    color: '',
    vehicleType: 'sedan',
    features: [],
    ownership: 'company'
  });
  
  // Form submission states
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Date range states for different sections
  const [dashboardDateRange, setDashboardDateRange] = useState({
    startDate: '25/04/2025',
    endDate: '24/05/2025'
  });
  
  const [_registrationDateRange, _setRegistrationDateRange] = useState({
    startDate: '25/04/2025',
    endDate: '24/05/2025'
  });
  
  // API-driven data states
  const [driverData, setDriverData] = useState([]);
  const [vehicleData, setVehicleData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  
  // Summary data from API
  const [driverSummary, setDriverSummary] = useState({ regular: 0, subcon: 0, total: 0 });
  const [vehicleSummary, setVehicleSummary] = useState({ company: 0, subcon: 0, total: 0 });
  // Note: bookingSummary removed - now calculated dynamically with calculateBookingStats()
  
  // Expandable booking details state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    pickupDetails: '',
    dropOffDetails: '',
    vipStatus: '',
    typeOfService: '',
    carType: '',
    driverContact: '',
    plateNumber: '',
    transactionRemarks: ''
  });

  // Assignment and status update loading states
  const [assignmentLoading, setAssignmentLoading] = useState({});
  const [statusUpdateLoading, setStatusUpdateLoading] = useState({});
  
  const [_loading, _setLoading] = useState({
    drivers: true,
    vehicles: true,
    bookings: true,
    activities: true
  });
  
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
    bookings: ''
  });

  // Calculate dynamic booking stats from current data
  const calculateBookingStats = useCallback((dataToCalculate = null) => {
    const data = dataToCalculate || (selectedStatus ? filteredData.bookings : bookingData);
    
    const stats = {
      request: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
      total: 0
    };

    data.forEach(booking => {
      const actualStatus = booking.booking_status || booking.status;
      stats.total++;

      // Map status values to our stat categories
      if (['request', 'pending'].includes(actualStatus)) {
        stats.request++;
      } else if (['on_going', 'in_progress', 'assigned', 'driver_en_route', 'arrived'].includes(actualStatus)) {
        stats.ongoing++;
      } else if (['done_service', 'completed'].includes(actualStatus)) {
        stats.completed++;
      } else if (['cancelled', 'no_show'].includes(actualStatus)) {
        stats.cancelled++;
      }
    });

    return stats;
  }, [bookingData, filteredData.bookings, selectedStatus]);


  
  // Restore view from session storage and fetch data
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
    
    // Fetch initial data
    fetchAllData();
    
    // Initialize polling service
    pollingService.connect();
    
    // Set up update listeners for polling service
    const handleDriversUpdated = (drivers) => {
      console.log('🔄 Polling: Drivers data updated', drivers);
      // Replace driver data with updated list from server
      setDriverData(drivers);
      // Update summary data based on new drivers list
      const regular = drivers.filter(d => d.type !== 'subcon').length;
      const subcon = drivers.filter(d => d.type === 'subcon').length;
      setDriverSummary({
        regular: regular,
        subcon: subcon,
        total: drivers.length
      });
    };
    
    const handleVehiclesUpdated = (vehicles) => {
      console.log('🔄 Polling: Vehicles data updated', vehicles);
      // Replace vehicle data with updated list from server
      setVehicleData(vehicles);
      // Update summary data based on new vehicles list
      const companyOwn = vehicles.filter(v => v.ownership === 'company').length;
      const subcon = vehicles.filter(v => v.ownership === 'subcon').length;
      setVehicleSummary({
        companyOwn: companyOwn,
        subcon: subcon,
        total: vehicles.length
      });
    };
    
    // Subscribe to polling updates
    pollingService.subscribe('drivers-updated', handleDriversUpdated);
    pollingService.subscribe('vehicles-updated', handleVehiclesUpdated);
    
    // Cleanup function
    return () => {
      pollingService.unsubscribe('drivers-updated', handleDriversUpdated);
      pollingService.unsubscribe('vehicles-updated', handleVehiclesUpdated);
      pollingService.disconnect();
    };
  }, []);
  
  // Comprehensive search and filter function
  const applyFilters = useCallback((section, statusFilter = selectedStatus) => {
    const originalData = section === 'drivers' ? driverData : 
                        section === 'vehicles' ? vehicleData : 
                        section === 'bookings' ? bookingData :
                        section === 'activities' ? activityData : [];

    let filteredItems = [...originalData];

    // Debug: Log booking data statuses
    if (section === 'bookings') {
      console.log('🔍 DEBUG: Booking filtering started');
      console.log('🔍 Filter requested:', statusFilter);
      console.log('🔍 Total bookings in data:', bookingData.length);
      console.log('🔍 Available booking statuses in data:', 
        bookingData.map(b => ({ 
          id: b.id,
          voucher: b.voucher, 
          status: b.status, 
          booking_status: b.booking_status 
        }))
      );
      
      // Show unique statuses
      const uniqueStatuses = [...new Set(bookingData.map(b => b.status))];
      const uniqueBookingStatuses = [...new Set(bookingData.map(b => b.booking_status))];
      console.log(' Unique status values:', uniqueStatuses);
      console.log(' Unique booking_status values:', uniqueBookingStatuses);
    }

    // Apply status filter with mapping for bookings
    if (statusFilter) {
      if (section === 'bookings') {
        console.log(' DEBUG: Filtering bookings by status:', statusFilter);
        
        filteredItems = filteredItems.filter(item => {
          // Use the primary status field for filtering
          let actualStatus = item.booking_status || item.status;
          
          // Map frontend status values to backend values
          const statusMap = {
            'request': ['request', 'pending'],
            'on_going': ['on_going', 'in_progress', 'assigned', 'driver_en_route', 'arrived'],
            'done_service': ['done_service', 'completed'],
            'cancelled': ['cancelled', 'no_show']
          };
          
          const validStatuses = statusMap[statusFilter] || [statusFilter];
          const matches = validStatuses.includes(actualStatus);
          
          console.log(` Booking ${item.voucher || item.id}:`, {
            status: item.status,
            booking_status: item.booking_status,
            actualStatus,
            statusFilter,
            validStatuses,
            finalMatch: matches
          });
          
          return matches;
        });
        
        console.log(' DEBUG: After filtering:', filteredItems.length, 'bookings found');
        console.log(' DEBUG: Filtered booking statuses:', 
          filteredItems.map(b => ({ 
            id: b.id,
            voucher: b.voucher, 
            status: b.status, 
            booking_status: b.booking_status 
          }))
        );
      } else {
        filteredItems = filteredItems.filter(item => item.status === statusFilter);
      }
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
              item.voucher?.toLowerCase().includes(searchTerm) ||
              item.passenger?.toLowerCase().includes(searchTerm) ||
              item.driver?.toLowerCase().includes(searchTerm) ||
              item.passengerContact?.toLowerCase().includes(searchTerm) ||
              item.driverContact?.toLowerCase().includes(searchTerm)
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
  }, [driverData, vehicleData, bookingData, activityData, searchTerms, selectedStatus]);
  
  // Apply filters whenever data changes
  useEffect(() => {
    console.log(` Data changed, reapplying filters with selectedStatus: ${selectedStatus}`);
    applyFilters('drivers', selectedStatus);
    applyFilters('vehicles', selectedStatus);
    applyFilters('bookings', selectedStatus);
    applyFilters('activities', selectedStatus);
  }, [driverData, vehicleData, bookingData, activityData, selectedStatus, applyFilters]);
  
  // Fetch all dashboard data
  const fetchAllData = async () => {
    try {
      // Fetch drivers data
      const driversResponse = await apiService.getUserDashboardDrivers();
      if (driversResponse.success) {
        setDriverData(driversResponse.data.drivers);
        setDriverSummary(driversResponse.data.summary);
        _setLoading(prev => ({ ...prev, drivers: false }));
      }
      
      // Fetch vehicles data
      const vehiclesResponse = await apiService.getUserDashboardVehicles();
      if (vehiclesResponse.success) {
        setVehicleData(vehiclesResponse.data.vehicles);
        setVehicleSummary(vehiclesResponse.data.summary);
        _setLoading(prev => ({ ...prev, vehicles: false }));
      }
      
      // Fetch bookings data
      const bookingsResponse = await apiService.getUserDashboardBookings();
      if (bookingsResponse.success) {
        console.log('📊 Bookings data received:', bookingsResponse.data);
        console.log('📊 Sample booking objects:', bookingsResponse.data.bookings.slice(0, 3));
        console.log('📊 Booking ID analysis:', 
          bookingsResponse.data.bookings.slice(0, 5).map(b => ({
            voucher: b.voucher,
            id: b.id,
            hasId: !!b.id,
            hasVoucher: !!b.voucher,
            status: b.status,
            booking_status: b.booking_status
          }))
        );
        
        setBookingData(bookingsResponse.data.bookings);
        // Note: Booking summary is now calculated dynamically using calculateBookingStats()
        _setLoading(prev => ({ ...prev, bookings: false }));
      }
      
      // Fetch activities data
      const activitiesResponse = await apiService.getUserDashboardActivities();
      if (activitiesResponse.success) {
        setActivityData(activitiesResponse.data.activities);
        _setLoading(prev => ({ ...prev, activities: false }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set loading to false even on error
      _setLoading({ drivers: false, vehicles: false, bookings: false, activities: false });
    }
  };
  
  


  const handleNavClick = (view) => {
    // Handle dropdown toggles without changing the current view
    if (view === 'dataRegistration') {
      // Just toggle the dropdown, don't change the current view
      setDataRegistrationExpanded(!dataRegistrationExpanded);
      return; // Don't change currentView for dataRegistration
    } else if (view === 'enrollmentForm') {
      // Just toggle the dropdown, don't change the current view
      setEnrollmentFormExpanded(!enrollmentFormExpanded);
      setDataRegistrationExpanded(true); // Keep parent expanded
      return; // Don't change currentView for enrollmentForm
    }
    
    // For actual page navigation, set the current view
    setCurrentView(view);
    
    if (view === 'addDriver') {
      // Navigate to Add Driver page
      setDataRegistrationExpanded(true);
      setEnrollmentFormExpanded(true);
    } else if (view === 'addVehicle') {
      // Navigate to Add Vehicle page
      setDataRegistrationExpanded(true);
      setEnrollmentFormExpanded(true);
    } else {
      // Collapse dropdowns for non-data registration views
      if (!["dataTable", "documentFiles"].includes(view)) {
        setDataRegistrationExpanded(false);
        setEnrollmentFormExpanded(false);
      } else {
        // Keep expanded for sub-items
        setDataRegistrationExpanded(true);
      }
    }
  };

  const closeModal = () => {
    // Reset forms when navigating away from registration pages
    setEditingItem(null);
    setDriverForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      licenseNumber: '',
      address: '',
      ndaStatus: 'Pending',
      driverType: 'regular'
    });
    setVehicleForm({
      plateNumber: '',
      make: '',
      model: '',
      year: '',
      color: '',
      vehicleType: 'sedan',
      features: [],
      ownership: 'company'
    });
  };

  // Form handlers
  const handleDriverFormChange = (field, value) => {
    setDriverForm(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleFormChange = (field, value) => {
    setVehicleForm(prev => ({ ...prev, [field]: value }));
  };

  // CRUD operations
  const handleSubmitDriver = async () => {
    if (!driverForm.firstName || !driverForm.lastName || !driverForm.email || !driverForm.licenseNumber) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
          if (editingItem) {
      // Update existing driver
      await apiService.updateDriver(editingItem.license_number, driverForm);
      alert('Driver updated successfully!');
    } else {
        // Create new driver
        await apiService.createDriver(driverForm);
        alert('Driver created successfully!');
      }
      
      // Real-time sync will handle UI updates, no need for full refresh
      closeModal();
    } catch (error) {
      console.error('Error submitting driver:', error);
      alert('Error: ' + (error.message || 'Failed to save driver'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitVehicle = async () => {
    if (!vehicleForm.plateNumber || !vehicleForm.make || !vehicleForm.model || !vehicleForm.vehicleType) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
          if (editingItem) {
      // Update existing vehicle
      await apiService.updateVehicle(editingItem.plate_number, vehicleForm);
      alert('Vehicle updated successfully!');
    } else {
        // Create new vehicle
        await apiService.createVehicle(vehicleForm);
        alert('Vehicle created successfully!');
      }
      
      // Real-time sync will handle UI updates, no need for full refresh
      closeModal();
    } catch (error) {
      console.error('Error submitting vehicle:', error);
      alert('Error: ' + (error.message || 'Failed to save vehicle'));
    } finally {
      setSubmitting(false);
    }
  };

  const _handleDeleteDriver = async (driverId) => {
    if (!confirm('Are you sure you want to delete this driver?')) {
      return;
    }

    try {
      await apiService.deleteDriver(driverId);
      alert('Driver deleted successfully!');
      // Real-time sync will handle UI updates, no need for full refresh
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Error: ' + (error.message || 'Failed to delete driver'));
    }
  };

  const _handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await apiService.deleteVehicle(vehicleId);
      alert('Vehicle deleted successfully!');
      await fetchAllData();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Error: ' + (error.message || 'Failed to delete vehicle'));
    }
  };

  const _handleEditDriver = (driver) => {
    setEditingItem(driver);
    setDriverForm({
      firstName: driver.name.split(' ')[0] || '',
      lastName: driver.name.split(' ').slice(1).join(' ') || '',
      email: driver.email || '',
      phone: driver.contact,
      licenseNumber: driver.license_number,
      address: driver.area,
      ndaStatus: driver.nda,
      driverType: driver.type
    });
    // Navigate to edit driver page
    setCurrentView('addDriver');
  };

  const _handleEditVehicle = (vehicle) => {
    setEditingItem(vehicle);
    setVehicleForm({
      plateNumber: vehicle.plate_number,
      make: vehicle.model.split(' ')[0] || '',
      model: vehicle.model.split(' ').slice(1).join(' ') || vehicle.model,
      year: vehicle.year,
      color: vehicle.color || '',
      vehicleType: vehicle.type,
      features: [],
      ownership: vehicle.ownership
    });
    // Navigate to edit vehicle page
    setCurrentView('addVehicle');
  };

  // Date range change handlers
  const handleDashboardDateChange = (startDate, endDate) => {
    setDashboardDateRange({ startDate, endDate });
    console.log('Dashboard date range changed:', { startDate, endDate });
  };
  
  const _handleRegistrationDateChange = (startDate, endDate) => {
    _setRegistrationDateRange({ startDate, endDate });
    console.log('Registration date range changed:', { startDate, endDate });
  };

  // Handle search input changes
  const handleSearchChange = (section, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [section]: value
    }));
    
    // Apply filters with debouncing
    setTimeout(() => {
      applyFilters(section, selectedStatus);
    }, 300);
  };

  // Filter data based on status
  const filterByStatus = (status, section) => {
    console.log('🔵 STATUS INDICATOR CLICKED:', { status, section, currentSelectedStatus: selectedStatus });
    console.log('🔵 Current booking data count:', bookingData.length);
    console.log('🔵 Sample booking statuses:', 
      bookingData.slice(0, 3).map(b => ({ 
        id: b.id, 
        voucher: b.voucher, 
        status: b.status, 
        booking_status: b.booking_status 
      }))
    );
    
    let newStatus;
    if (selectedStatus === status) {
      // If clicking the same status again, clear the filter
      console.log('🔵 Clearing filter - same status clicked');
      setSelectedStatus(null);
      newStatus = null;
    } else {
      // Apply new filter
      console.log('🔵 Applying new filter:', status);
      setSelectedStatus(status);
      newStatus = status;
    }

    // Apply all filters after status change with the correct status
    setTimeout(() => {
      applyFilters(section, newStatus);
    }, 0);
  };

  // Booking details handlers
  const toggleBookingDetails = (booking) => {
    if (selectedBooking && selectedBooking.voucher === booking.voucher) {
      // Close if same booking clicked
      setSelectedBooking(null);
    } else {
      // Open details for new booking
      setSelectedBooking(booking);
      // You could fetch more detailed data here from API
      setBookingDetails({
        pickupDetails: booking.pickupAddress || '',
        dropOffDetails: booking.destinationAddress || '',
        vipStatus: booking.vipStatus || 'Regular',
        typeOfService: booking.serviceType || 'Standard',
        carType: booking.vehicleType || 'Sedan',
        driverContact: booking.driverContact || '',
        plateNumber: booking.plateNumber || '',
        transactionRemarks: booking.remarks || ''
      });
    }
  };

  const handleBookingDetailChange = (field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };



  // Helper function to get available drivers (prevent double booking)
  const getAvailableDrivers = (currentBookingId = null) => {
    const activeBookings = bookingData.filter(booking => 
      ['request', 'on_going'].includes(booking.status || booking.booking_status) &&
      booking.id !== currentBookingId
    );
    
    const assignedDriverIds = activeBookings
      .filter(booking => booking.driver_id)
      .map(booking => booking.driver_id);
    
    return driverData.filter(driver => 
      ['active', 'pending'].includes(driver.status) && 
      !assignedDriverIds.includes(driver.id)
    );
  };

  // Helper function to get available vehicles (prevent double booking)
  const getAvailableVehicles = (currentBookingId = null) => {
    const activeBookings = bookingData.filter(booking => 
      ['request', 'on_going'].includes(booking.status || booking.booking_status) &&
      booking.id !== currentBookingId
    );
    
    const assignedVehicleIds = activeBookings
      .filter(booking => booking.vehicle_id)
      .map(booking => booking.vehicle_id);
    
    return vehicleData.filter(vehicle => 
      ['active', 'pending'].includes(vehicle.status) && 
      !assignedVehicleIds.includes(vehicle.id)
    );
  };

  // Driver assignment handler
  const handleDriverAssignment = async (bookingId, driverId) => {
    const loadingKey = `driver-${bookingId}`;
    
    if (assignmentLoading[loadingKey]) {
      console.log('⚠️ Driver assignment already in progress');
      return;
    }
    
    setAssignmentLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      let response;
      if (driverId === '' || driverId === null) {
        // Unassign driver
        response = await apiService.unassignDriverFromBooking(bookingId);
      } else {
        // Assign driver
        response = await apiService.assignDriverToBooking(bookingId, driverId);
      }
      
      if (response.success) {
        // Update local booking data
        setBookingData(prevBookings => 
          prevBookings.map(booking => {
            if (booking.id === bookingId) {
              const assignedDriver = driverId ? 
                driverData.find(d => d.id === parseInt(driverId)) : null;
              
              return {
                ...booking,
                driver_id: driverId || null,
                driver: assignedDriver ? assignedDriver.name : 'Unassigned',
                driverContact: assignedDriver ? assignedDriver.contact : 'N/A'
              };
            }
            return booking;
          })
        );
        console.log('✅ Driver assignment updated successfully');
      }
    } catch (error) {
      console.error('❌ Failed to assign driver:', error);
      alert(`Failed to assign driver: ${error.message}`);
    } finally {
      setAssignmentLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Vehicle assignment handler
  const handleVehicleAssignment = async (bookingId, vehicleId) => {
    const loadingKey = `vehicle-${bookingId}`;
    
    if (assignmentLoading[loadingKey]) {
      console.log('⚠️ Vehicle assignment already in progress');
      return;
    }
    
    setAssignmentLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      let response;
      if (vehicleId === '' || vehicleId === null) {
        // Unassign vehicle
        response = await apiService.unassignVehicleFromBooking(bookingId);
      } else {
        // Assign vehicle
        response = await apiService.assignVehicleToBooking(bookingId, vehicleId);
      }
      
      if (response.success) {
        // Update local booking data
        setBookingData(prevBookings => 
          prevBookings.map(booking => {
            if (booking.id === bookingId) {
              const assignedVehicle = vehicleId ? 
                vehicleData.find(v => v.id === parseInt(vehicleId)) : null;
              
              return {
                ...booking,
                vehicle_id: vehicleId || null,
                plateNumber: assignedVehicle ? assignedVehicle.plate_number : 'Unassigned',
                vehicleInfo: assignedVehicle ? `${assignedVehicle.model} (${assignedVehicle.plate_number})` : 'No vehicle assigned'
              };
            }
            return booking;
          })
        );
        console.log('✅ Vehicle assignment updated successfully');
      }
    } catch (error) {
      console.error('❌ Failed to assign vehicle:', error);
      alert(`Failed to assign vehicle: ${error.message}`);
    } finally {
      setAssignmentLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Handle booking status change
  const handleBookingStatusChange = async (booking, newStatus) => {
    console.log('🔄 ========== BOOKING STATUS CHANGE STARTED ==========');
    console.log('🔄 Function called with:', { booking, newStatus });
    console.log('🔄 Booking object details:', {
      id: booking.id,
      voucher: booking.voucher,
      currentStatus: booking.status,
      currentBookingStatus: booking.booking_status,
      newStatus: newStatus
    });
    
    const bookingId = booking.id || booking.voucher;
    console.log('🔄 Using booking ID:', bookingId);
    
    // Prevent multiple concurrent requests
    if (statusUpdateLoading[bookingId]) {
      console.log('⚠️ Status update already in progress for booking:', bookingId);
      return;
    }
    
    setStatusUpdateLoading(prev => ({ ...prev, [bookingId]: true }));
    console.log('🔄 Set loading state for booking:', bookingId);
    
    try {
      console.log('🔄 Calling API to update booking status...');
      console.log('🔄 API call parameters:', { bookingId, newStatus });
      
      const response = await apiService.updateBookingStatus(bookingId, newStatus);
      console.log('🔄 API response received:', response);
      
      if (response && response.success) {
        console.log('✅ API call successful, updating local data');
        
        // Update the booking data locally
        setBookingData(prev => {
          const updated = prev.map(b => 
            (b.id === bookingId || b.voucher === bookingId) 
              ? { ...b, booking_status: newStatus, status: newStatus }
              : b
          );
          console.log('🔄 Updated booking data:', updated.filter(b => b.id === bookingId || b.voucher === bookingId));
          return updated;
        });
        
        // Also update filtered data
        setFilteredData(prev => ({
          ...prev,
          bookings: prev.bookings.map(b => 
            (b.id === bookingId || b.voucher === bookingId)
              ? { ...b, booking_status: newStatus, status: newStatus }
              : b
          )
        }));
        
        console.log('✅ Booking status updated successfully to:', newStatus);
        console.log('🔄 ========== BOOKING STATUS CHANGE COMPLETED ==========');
      } else {
        console.error('❌ API response indicates failure:', response);
        throw new Error(response?.error || response?.message || 'API call failed');
      }
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      console.log('🔄 ========== BOOKING STATUS CHANGE FAILED ==========');
      throw error; // Re-throw to let BookingStatusDropdown handle the error
    } finally {
      console.log('🔄 Cleaning up loading state for booking:', bookingId);
      setStatusUpdateLoading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  // Main content renderer
  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
              <>
                {/* Service Header */}
                <div 
                  className="service-header-container"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    visibility: 'visible',
                    opacity: 1,
                    position: 'relative',
                    zIndex: 10,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '24px 40px',
                    margin: '0 0 32px 0',
                    minHeight: '80px',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div 
                    className="service-title-container"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}
                  >
                    <div 
                      className="service-icon transport-icon"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '24px',
                        color: '#3498db'
                      }}
                    >
                      {Icons.transport}
                    </div>
                    <h2 
                      className="service-title"
                      style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        margin: 0,
                        color: '#2c3e50',
                        letterSpacing: '0.8px',
                        display: 'block',
                        visibility: 'visible',
                        opacity: 1
                      }}
                    >
                      LAND TRANSPORTATION
                    </h2>
                  </div>
                  <div 
                    className="service-controls"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px'
                    }}
                  >
                    <DateRangePicker
                      startDate={dashboardDateRange.startDate}
                      endDate={dashboardDateRange.endDate}
                      onDateChange={handleDashboardDateChange}
                    />
                    <button 
                      className="filters-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#2980b9';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#3498db';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <span className="filter-icon" style={{ fontSize: '16px' }}>{Icons.filter}</span>
                      <span>Filters</span>
                    </button>
                  </div>
                </div>
                
                {/* Service Stats */}
                <div className="service-stats-container">
                  {(() => {
                    const currentStats = calculateBookingStats();
                    return (
                      <>
                        <div 
                          className={`stat-box request-box ${selectedStatus === 'request' ? 'active-stat' : ''}`}
                          onClick={() => filterByStatus('request', 'bookings')}
                          style={{ cursor: 'pointer' }}
                        >
                          <h3 className="stat-title">Request</h3>
                          <div className="stat-value">{currentStats.request}</div>
                        </div>
                        <div 
                          className={`stat-box ongoing-box ${selectedStatus === 'on_going' ? 'active-stat' : ''}`}
                          onClick={() => filterByStatus('on_going', 'bookings')}
                          style={{ cursor: 'pointer' }}
                        >
                          <h3 className="stat-title">Ongoing</h3>
                          <div className="stat-value">{currentStats.ongoing}</div>
                        </div>
                        <div 
                          className={`stat-box completed-box ${selectedStatus === 'done_service' ? 'active-stat' : ''}`}
                          onClick={() => filterByStatus('done_service', 'bookings')}
                          style={{ cursor: 'pointer' }}
                        >
                          <h3 className="stat-title">Completed</h3>
                          <div className="stat-value">{currentStats.completed}</div>
                        </div>
                        <div 
                          className={`stat-box total-box ${selectedStatus === null ? 'active-stat' : ''}`}
                          onClick={() => {
                            setSelectedStatus(null);
                            setTimeout(() => applyFilters('bookings', null), 0);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <h3 className="stat-title">Total Service</h3>
                          <div className="stat-value">{currentStats.total}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                {/* Bookings Section */}
                <div className="bookings-container">
                  <div className="bookings-header-layout">
                    <div className="bookings-header-left">
                      <h2 className="bookings-title">BOOKINGS</h2>
                    </div>
                    
                    <div className="bookings-header-center">
                      <div className="booking-status-indicators">
                        <div 
                          className={`booking-status-item ${selectedStatus === 'done_service' ? 'active' : ''}`}
                          onClick={() => filterByStatus('done_service', 'bookings')}
                        >
                          <span className="status-dot done-service"></span>
                          <span className="status-label">Done Service</span>
                        </div>
                        <div 
                          className={`booking-status-item ${selectedStatus === 'on_going' ? 'active' : ''}`}
                          onClick={() => filterByStatus('on_going', 'bookings')}
                        >
                          <span className="status-dot on-going"></span>
                          <span className="status-label">On Going</span>
                        </div>
                        <div 
                          className={`booking-status-item ${selectedStatus === 'cancelled' ? 'active' : ''}`}
                          onClick={() => filterByStatus('cancelled', 'bookings')}
                        >
                          <span className="status-dot cancelled"></span>
                          <span className="status-label">Cancelled</span>
                        </div>
                        <div 
                          className={`booking-status-item ${selectedStatus === 'request' ? 'active' : ''}`}
                          onClick={() => filterByStatus('request', 'bookings')}
                        >
                          <span className="status-dot request"></span>
                          <span className="status-label">Request</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bookings-header-right">
                      <select className="travel-voucher-dropdown" id="travel-voucher-filter" name="travelVoucherFilter" aria-label="Select travel voucher">
                        <option>TRAVEL VOUCHER</option>
                      </select>
                      <div className="booking-search-container">
                        <input 
                          type="text" 
                          id="booking-search-input"
                          name="bookingSearch"
                          placeholder="Enter exact ID" 
                          className="booking-search-input" 
                          value={searchTerms.bookings}
                          onChange={(e) => handleSearchChange('bookings', e.target.value)}
                          aria-label="Search bookings"
                        />
                        <button className="booking-search-btn" type="button" aria-label="Search">
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
                          <th style={{width: '10%'}}>TRAVEL VOUCHER</th>
                          <th style={{width: '10%'}}>DATE OF SERVICE</th>
                          <th style={{width: '8%'}}>PICK UP TIME</th>
                          <th style={{width: '12%'}}>PASSENGER NAME</th>
                          <th style={{width: '10%'}}>CONTACT NUMBER</th>
                          <th style={{width: '15%'}}>ASSIGNED DRIVER</th>
                          <th style={{width: '15%'}}>ASSIGNED VEHICLE</th>
                          <th style={{width: '10%'}}>CONTACT NUMBER</th>
                          <th style={{width: '10%'}}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.bookings && filteredData.bookings.length > 0 ? (
                          filteredData.bookings.map((booking, index) => {
                                                          const availableDrivers = getAvailableDrivers(booking.id);
                              const availableVehicles = getAvailableVehicles(booking.id);
                            const isAssignmentActive = assignmentLoading[`driver-${booking.id}`] || assignmentLoading[`vehicle-${booking.id}`];
                            
                            return (
                              <React.Fragment key={booking.voucher || `booking-${index}`}>
                                <tr 
                                  onClick={(e) => {
                                    // Prevent row click when interacting with dropdowns
                                    if (e.target.tagName === 'SELECT' || e.target.closest('.assignment-dropdown-container')) {
                                      e.stopPropagation();
                                      return;
                                    }
                                    toggleBookingDetails(booking);
                                  }}
                                  style={{ cursor: 'pointer' }}
                                  className={`${selectedBooking && selectedBooking.voucher === booking.voucher ? 'selected-row' : ''} ${isAssignmentActive ? 'assignment-loading' : ''}`}
                                >
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <span style={{ marginRight: '8px', fontSize: '12px' }}>
                                        {selectedBooking && selectedBooking.voucher === booking.voucher ? '▼' : '▶'}
                                      </span>
                                      {booking.voucher}
                                    </div>
                                  </td>
                                  <td>{booking.date}</td>
                                  <td>{booking.time}</td>
                                  <td>{booking.passenger}</td>
                                  <td>{booking.passengerContact}</td>
                                  
                                  {/* Driver Assignment Dropdown */}
                                  <td>
                                    <div className="assignment-dropdown-container">
                                      <select 
                                        className="assignment-dropdown driver-assignment"
                                        id={`driver-assignment-${booking.id}`}
                                        name={`driverAssignment_${booking.id}`}
                                        value={booking.driver_id || ''}
                                        onChange={(e) => handleDriverAssignment(booking.id, e.target.value)}
                                        disabled={assignmentLoading[`driver-${booking.id}`]}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label={`Assign driver to booking ${booking.voucher}`}
                                      >
                                        <option value="">Unassigned</option>
                                        {/* Show currently assigned driver even if not in available list */}
                                        {booking.driver_id && !availableDrivers.find(d => d.id === booking.driver_id) && (
                                          <option value={booking.driver_id} disabled>
                                            {booking.driver} (Currently Assigned)
                                          </option>
                                        )}
                                        {availableDrivers.map(driver => (
                                          <option key={driver.id} value={driver.id}>
                                            {driver.name} - {driver.contact}
                                          </option>
                                        ))}
                                      </select>
                                      {assignmentLoading[`driver-${booking.id}`] && (
                                        <div className="assignment-loading-indicator">⟳</div>
                                      )}
                                    </div>
                                  </td>
                                  
                                  {/* Vehicle Assignment Dropdown */}
                                  <td>
                                    <div className="assignment-dropdown-container">
                                      <select 
                                        className="assignment-dropdown vehicle-assignment"
                                        id={`vehicle-assignment-${booking.id}`}
                                        name={`vehicleAssignment_${booking.id}`}
                                        value={booking.vehicle_id || ''}
                                        onChange={(e) => handleVehicleAssignment(booking.id, e.target.value)}
                                        disabled={assignmentLoading[`vehicle-${booking.id}`]}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label={`Assign vehicle to booking ${booking.voucher}`}
                                      >
                                        <option value="">Unassigned</option>
                                        {/* Show currently assigned vehicle even if not in available list */}
                                        {booking.vehicle_id && !availableVehicles.find(v => v.id === booking.vehicle_id) && (
                                          <option value={booking.vehicle_id} disabled>
                                            {booking.plateNumber} (Currently Assigned)
                                          </option>
                                        )}
                                        {availableVehicles.map(vehicle => (
                                          <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.id} - {vehicle.model}
                                          </option>
                                        ))}
                                      </select>
                                      {assignmentLoading[`vehicle-${booking.id}`] && (
                                        <div className="assignment-loading-indicator">⟳</div>
                                      )}
                                    </div>
                                  </td>
                                  
                                  <td>{booking.driverContact}</td>
                                  <td>
                                    <div className="status-indicator-cell">
                                      <BookingStatusDropdown 
                                        booking={booking}
                                        currentStatus={booking.booking_status || booking.status}
                                        onStatusChange={handleBookingStatusChange}
                                        disabled={statusUpdateLoading[booking.id]}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              {selectedBooking && selectedBooking.voucher === booking.voucher && (
                                <tr>
                                  <td colSpan="9" style={{ padding: '0', backgroundColor: '#f8f9fa' }}>
                                    <div className="booking-details-panel">
                                      <div className="booking-details-actions">
                                        <button 
                                          className="print-view-button" 
                                          onClick={() => setShowPrintView(true)}
                                        >
                                          <i className="fa fa-print"></i> Print View
                                        </button>
                                      </div>
                                      <div className="booking-details-layout">
                                        <div className="booking-details-left">
                                          <div className="booking-form-row">
                                            <div className="booking-field">
                                              <label htmlFor="booking-pickup-details">PICKUP DETAILS</label>
                                              <input 
                                                type="text" 
                                                id="booking-pickup-details"
                                                name="bookingPickupDetails"
                                                value={bookingDetails.pickupDetails}
                                                onChange={(e) => handleBookingDetailChange('pickupDetails', e.target.value)}
                                                placeholder="Enter pickup location details"
                                              />
                                            </div>
                                          </div>
                                          
                                          <div className="booking-form-row">
                                            <div className="booking-field">
                                              <label htmlFor="booking-dropoff-details">DROP-OFF DETAILS</label>
                                              <input 
                                                type="text" 
                                                id="booking-dropoff-details"
                                                name="bookingDropoffDetails"
                                                value={bookingDetails.dropOffDetails}
                                                onChange={(e) => handleBookingDetailChange('dropOffDetails', e.target.value)}
                                                placeholder="Enter drop-off location details"
                                              />
                                            </div>
                                          </div>
                                          
                                          <div className="vip-service-car-fields">
                                            <div className="booking-form-row vip-status-field">
                                              <div className="booking-field">
                                                <label htmlFor="booking-vip-status">VIP STATUS</label>
                                                <input 
                                                  type="text" 
                                                  id="booking-vip-status"
                                                  name="bookingVipStatus"
                                                  value={bookingDetails.vipStatus}
                                                  onChange={(e) => handleBookingDetailChange('vipStatus', e.target.value)}
                                                  placeholder=""
                                                />
                                              </div>
                                            </div>
                                            
                                            <div className="booking-form-row service-type-field">
                                              <div className="booking-field">
                                                <label htmlFor="booking-service-type">TYPE OF SERVICE</label>
                                                <input 
                                                  type="text" 
                                                  id="booking-service-type"
                                                  name="bookingServiceType"
                                                  value={bookingDetails.typeOfService}
                                                  onChange={(e) => handleBookingDetailChange('typeOfService', e.target.value)}
                                                  placeholder=""
                                                />
                                              </div>
                                            </div>
                                            
                                            <div className="booking-form-row car-type-field">
                                              <div className="booking-field">
                                                <label htmlFor="booking-car-type">PLATE NUMBER</label>
                                                <input 
                                                  type="text" 
                                                  id="booking-car-type"
                                                  name="bookingCarType"
                                                  value={bookingDetails.plateNumber}
                                                  onChange={(e) => handleBookingDetailChange('plateNumber', e.target.value)}
                                                  placeholder=""
                                                />
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="driver-plate-fields">
                                            <div className="booking-form-row driver-contact-field">
                                              <div className="booking-field">
                                                <label htmlFor="booking-driver-contact">VEHICLE COLOR</label>
                                                <input 
                                                  type="text" 
                                                  id="booking-driver-contact"
                                                  name="bookingDriverContact"
                                                  value={bookingDetails.driverContact}
                                                  onChange={(e) => handleBookingDetailChange('driverContact', e.target.value)}
                                                  placeholder=""
                                                />
                                              </div>
                                            </div>
                                            
                                            <div className="booking-form-row plate-number-field">
                                              <div className="booking-field">
                                                <label htmlFor="booking-plate-number">CAR TYPE</label>
                                                <input 
                                                  type="text" 
                                                  id="booking-plate-number"
                                                  name="bookingPlateNumber"
                                                  value={bookingDetails.carType}
                                                  onChange={(e) => handleBookingDetailChange('carType', e.target.value)}
                                                  placeholder=""
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="booking-details-right">
                                          <div className="booking-field transaction-remarks-field">
                                            <label htmlFor="booking-transaction-remarks">TRANSACTION REMARKS</label>
                                            <textarea 
                                              id="booking-transaction-remarks"
                                              name="bookingTransactionRemarks"
                                              value={bookingDetails.transactionRemarks}
                                              onChange={(e) => handleBookingDetailChange('transactionRemarks', e.target.value)}
                                              placeholder="Enter transaction remarks"
                                              rows="10"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="9" className="empty-table-row">
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
      

      
      case 'notification':
        return (
          <div className="enrollment-content">
            <div className="data-section">
              <div className="section-header">
                <h2 className="section-title">NOTIFICATIONS</h2>
                <div className="section-actions">
                  <button type="button" className="action-btn">
                    <span className="btn-icon">🔔</span>
                    MARK ALL READ
                  </button>
                </div>
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown" id="notification-filter" name="notificationFilter" aria-label="Filter notifications">
                    <option>ALL NOTIFICATIONS</option>
                    <option>UNREAD</option>
                    <option>READ</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      id="notification-search"
                      name="notificationSearch"
                      placeholder="Search notifications..." 
                      className="id-search" 
                      aria-label="Search notifications"
                    />
                    <button className="search-btn" type="button" aria-label="Search">
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

      case 'dataTable':
        return (
          <div className="enrollment-content">
            {/* DRIVER REGISTERED SECTION */}
            <div className="data-section">
              <div className="drivers-header-layout">
                <div className="drivers-header-left">
                  <h2 className="section-title">DRIVER REGISTERED</h2>
                </div>
                
                <div className="drivers-header-center">
                  <div className="driver-status-indicators">
                    <div 
                      className={`driver-status-item ${selectedStatus === 'active' ? 'active' : ''}`}
                      onClick={() => filterByStatus('active', 'drivers')}
                    >
                      <span className="status-dot active-status"></span>
                      <span className="status-label">Active</span>
                    </div>
                    <div 
                      className={`driver-status-item ${selectedStatus === 'pending' ? 'active' : ''}`}
                      onClick={() => filterByStatus('pending', 'drivers')}
                    >
                      <span className="status-dot pending-status"></span>
                      <span className="status-label">Pending</span>
                    </div>
                    <div 
                      className={`driver-status-item ${selectedStatus === 'inactive' ? 'active' : ''}`}
                      onClick={() => filterByStatus('inactive', 'drivers')}
                    >
                      <span className="status-dot inactive-status"></span>
                      <span className="status-label">In-active</span>
                    </div>
                  </div>
                </div>
                
                <div className="drivers-header-right">
                  <div className="summary-cards">
                    <div className="summary-card">
                      <div className="summary-label">Regular Drivers</div>
                      <div className="summary-value">{driverSummary.regular}</div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-label">Subcon Drivers</div>
                      <div className="summary-value">{driverSummary.subcon}</div>
                    </div>
                    <div className="summary-card total-card">
                      <div className="summary-label">Total Driver Handled</div>
                      <div className="summary-value">{driverSummary.total}</div>
                    </div>
                  </div>
                  <div className="header-controls">
                    <select className="filter-dropdown" id="driver-id-filter" name="driverIdFilter" aria-label="Filter by driver ID">
                      <option>DRIVER ID</option>
                    </select>
                    <div className="search-container">
                      <input 
                        type="text" 
                        id="driver-search-input"
                        name="driverSearch"
                        placeholder="Enter exact ID" 
                        className="id-search" 
                        value={searchTerms.drivers}
                        onChange={(e) => handleSearchChange('drivers', e.target.value)}
                        aria-label="Search drivers"
                      />
                      <button className="search-btn" type="button" aria-label="Search">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="data-table-wrapper">
                <table className="data-table drivers-table">
                    <thead>
                      <tr>
                      <th style={{width: '18%'}}>DRIVER ID (DRIVER LICENSE)</th>
                      <th style={{width: '16%'}}>FULL NAME</th>
                      <th style={{width: '16%'}}>DESIGNATION AREA</th>
                      <th style={{width: '14%'}}>CONTACT NUMBER</th>
                      <th style={{width: '15%'}}>DRIVER'S NDA</th>
                      <th style={{width: '11%'}}>STATUS</th>
                      <th style={{width: '10%'}}>EDIT DETAILS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.drivers && filteredData.drivers.length > 0 ? (
                        filteredData.drivers.map((driver, index) => (
                          <tr key={driver.id || `driver-${index}`}>
                            <td>{driver.license_number}</td>
                            <td>{driver.name}</td>
                            <td>{driver.area}</td>
                            <td>{driver.contact}</td>
                            <td>{driver.nda}</td>
                            <td>
                              <div className="status-indicator-cell">
                                <div className={`account-status-indicator ${driver.status}`}></div>
                              </div>
                            </td>
                            <td>
                              <div className="status-indicator-cell">
                                <button 
                                  type="button"
                                  className="action-btn edit-btn"
                                  onClick={() => _handleEditDriver(driver)}
                                  title="Edit Driver"
                                  aria-label={`Edit driver ${driver.name}`}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="empty-table-row">
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
              <div className="vehicles-header-layout">
                <div className="vehicles-header-left">
                  <h2 className="section-title">VEHICLE REGISTERED</h2>
                </div>
                
                <div className="vehicles-header-center">
                  <div className="vehicle-status-indicators">
                    <div 
                      className={`vehicle-status-item ${selectedStatus === 'active' ? 'active' : ''}`}
                      onClick={() => filterByStatus('active', 'vehicles')}
                    >
                      <span className="status-dot active-status"></span>
                      <span className="status-label">Active</span>
                    </div>
                    <div 
                      className={`vehicle-status-item ${selectedStatus === 'pending' ? 'active' : ''}`}
                      onClick={() => filterByStatus('pending', 'vehicles')}
                    >
                      <span className="status-dot pending-status"></span>
                      <span className="status-label">Pending</span>
                    </div>
                    <div 
                      className={`vehicle-status-item ${selectedStatus === 'inactive' ? 'active' : ''}`}
                      onClick={() => filterByStatus('inactive', 'vehicles')}
                    >
                      <span className="status-dot inactive-status"></span>
                      <span className="status-label">In-active</span>
                    </div>
                  </div>
                </div>
                
                <div className="vehicles-header-right">
                  <div className="summary-cards">
                    <div className="summary-card">
                      <div className="summary-label">Company Own</div>
                      <div className="summary-value">{vehicleSummary.company}</div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-label">Subcon Vehicle</div>
                      <div className="summary-value">{vehicleSummary.subcon}</div>
                    </div>
                    <div className="summary-card total-card">
                      <div className="summary-label">Total Vehicle Handled</div>
                      <div className="summary-value">{vehicleSummary.total}</div>
                    </div>
                  </div>
                  <div className="header-controls">
                    <select className="filter-dropdown" id="vehicle-plate-filter" name="vehiclePlateFilter" aria-label="Filter by plate number">
                      <option>PLATE NUMBER</option>
                    </select>
                    <div className="search-container">
                      <input 
                        type="text" 
                        id="vehicle-search-input"
                        name="vehicleSearch"
                        placeholder="Enter exact ID" 
                        className="id-search" 
                        value={searchTerms.vehicles}
                        onChange={(e) => handleSearchChange('vehicles', e.target.value)}
                        aria-label="Search vehicles"
                      />
                      <button className="search-btn" type="button" aria-label="Search">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table vehicles-table">
                    <thead>
                      <tr>
                      <th style={{width: '16%'}}>VEHICLE ID (PLATE NUMBER)</th>
                      <th style={{width: '10%'}}>CAR TYPE</th>
                      <th style={{width: '16%'}}>CAR MODEL</th>
                      <th style={{width: '10%'}}>YEAR MODEL</th>
                      <th style={{width: '8%'}}>COLOR</th>
                      <th style={{width: '16%'}}>SAFETY FEATURES</th>
                      <th style={{width: '10%'}}>STATUS</th>
                      <th style={{width: '10%'}}>EDIT DETAILS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.vehicles && filteredData.vehicles.length > 0 ? (
                        filteredData.vehicles.map((vehicle, index) => (
                          <tr key={vehicle.id || `vehicle-${index}`}>
                            <td>{vehicle.plate_number}</td>
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
                            <td>
                              <div className="status-indicator-cell">
                                <button 
                                  type="button"
                                  className="action-btn edit-btn"
                                  onClick={() => _handleEditVehicle(vehicle)}
                                  title="Edit Vehicle"
                                  aria-label={`Edit vehicle ${vehicle.plate_number}`}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="empty-table-row">
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
              {/* Document Files Header Section */}
              <div className="section-header">
                <h2 className="section-title">DOCUMENT FILES</h2>
                <div className="section-actions">
                  <DocumentUploadButton
                    documentType="user-document"
                    onUploadComplete={(result) => {
                      console.log('Document uploaded successfully:', result);
                      // Here you would typically update the documents list
                      // or trigger a notification
                      alert(`Document "${result.fileName}" uploaded successfully!`);
                    }}
                    onUploadError={(error) => {
                      console.error('Document upload failed:', error);
                    }}
                  />
                  <button className="action-btn generate-report-btn">
                    <span className="btn-icon">📊</span>
                    GENERATE REPORT
                  </button>
                </div>
              </div>
              
              {/* Folder Section */}
              <div className="sub-section">
                <div className="filter-bar">
                  <h3 className="filter-title">FOLDER</h3>
                  <div className="filter-controls">
                    <select className="filter-dropdown">
                      <option>All Categories</option>
                    </select>
                    <div className="search-container">
                      <input 
                        type="text"
                        className="id-search"
                        placeholder="Search folders..."
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
                
                <div className="folder-cards-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
                  <div 
                    className="folder-card" 
                    style={{ width: '120px', height: '120px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                    onClick={() => setSelectedDocument(documents[0])}
                  >
                    <div style={{ backgroundColor: "#34C759", color: 'white', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>
                      TARIFF RATES 2025
                    </div>
                    <div style={{ padding: '8px 4px', fontSize: '11px', fontWeight: '600', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      TARIFF RATES 2025
                    </div>
                  </div>
                  <div className="folder-card" style={{ width: '120px', height: '120px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ backgroundColor: "#1D4ED8", color: 'white', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>
                      ADVISORY
                    </div>
                    <div style={{ padding: '8px 4px', fontSize: '11px', fontWeight: '600', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ADVISORY
                    </div>
                  </div>
                  <div className="folder-card" style={{ width: '120px', height: '120px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ backgroundColor: "#1D4ED8", color: 'white', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>
                      SHE-MS FILES
                    </div>
                    <div style={{ padding: '8px 4px', fontSize: '11px', fontWeight: '600', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      SHE-MS FILES
                    </div>
                  </div>
                  <div className="folder-card" style={{ width: '120px', height: '120px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ backgroundColor: "#1D4ED8", color: 'white', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', fontSize: '12px', fontWeight: '600', textAlign: 'center' }}>
                      LAND TRANSPORT MANUAL
                    </div>
                    <div style={{ padding: '8px 4px', fontSize: '11px', fontWeight: '600', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      LAND TRANSPORT MANUAL
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Document Viewer Section */}
              <div className="sub-section" style={{marginTop: '24px'}}>
                <DocumentViewer 
                  documents={documents} 
                  selectedDocument={selectedDocument} 
                  onSelectDocument={setSelectedDocument} 
                />              
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
                  <button type="button" className="action-btn">
                    <span className="btn-icon">📊</span>
                    GENERATE REPORT
                  </button>
                  <button type="button" className="action-btn">
                    <span className="btn-icon">🔍</span>
                    RUN AUDIT
                  </button>
                </div>
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown" id="dir-filter" name="dirFilter" aria-label="Filter reports">
                    <option>ALL REPORTS</option>
                    <option>DATA INTEGRITY</option>
                    <option>AUDIT LOGS</option>
                    <option>ANALYTICS</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      id="dir-search"
                      name="dirSearch"
                      placeholder="Search reports..." 
                      className="id-search" 
                      aria-label="Search reports"
                    />
                    <button className="search-btn" type="button" aria-label="Search">
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
                  <button type="button" className="action-btn">
                    <span className="btn-icon">🛡️</span>
                    SAFETY AUDIT
                  </button>
                  <button type="button" className="action-btn">
                    <span className="btn-icon">📋</span>
                    COMPLIANCE CHECK
                  </button>
                </div>
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown" id="safety-filter" name="safetyFilter" aria-label="Filter safety records">
                    <option>ALL RECORDS</option>
                    <option>SAFETY INCIDENTS</option>
                    <option>HEALTH RECORDS</option>
                    <option>ENVIRONMENT</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      id="safety-search"
                      name="safetySearch"
                      placeholder="Search safety records..." 
                      className="id-search" 
                      aria-label="Search safety records"
                    />
                    <button className="search-btn" type="button" aria-label="Search">
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
                  <button type="button" className="action-btn">
                    <span className="btn-icon">⚠️</span>
                    REPORT INCIDENT
                  </button>
                  <button type="button" className="action-btn">
                    <span className="btn-icon">📊</span>
                    VIEW ANALYTICS
                  </button>
                </div>
              </div>
              
              <div className="filter-bar">
                <div className="filter-controls">
                  <select className="filter-dropdown" id="incident-filter" name="incidentFilter" aria-label="Filter incidents">
                    <option>ALL INCIDENTS</option>
                    <option>ACCIDENTS</option>
                    <option>NEAR MISSES</option>
                    <option>RESOLVED</option>
                  </select>
                  <div className="search-container">
                    <input 
                      type="text" 
                      id="incident-search"
                      name="incidentSearch"
                      placeholder="Search incidents..." 
                      className="id-search" 
                      aria-label="Search incidents"
                    />
                    <button className="search-btn" type="button" aria-label="Search">
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
      

      
      case 'addDriver':
        return (
          <div className="premium-enrollment-page">
            {/* Header Section */}
            <div className="premium-header">
              <div className="premium-header-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h1 className="premium-header-title">Driver Registration</h1>
              <p className="premium-header-subtitle">Complete your driver profile with accurate information and required documentation</p>
            </div>

            {/* Main Content */}
            <div className="premium-content-container">
              <div className="premium-content-card">
                <div className="premium-form-layout">
                  
                  {/* Left Side - License Documentation */}
                  <div className="premium-left-section">
                    <div className="premium-section-header">
                      <h3 className="premium-section-title">License Documentation</h3>
                      <div className="premium-section-divider"></div>
                    </div>
                    
                    {/* Driver License Upload */}
                    <div className="premium-form-group">
                      <label className="premium-form-label">
                        Driver License <span className="premium-required">*</span>
                      </label>
                      <p className="premium-form-description">Upload a clear scan or photo of your driver's license</p>
                      
                      <div className="premium-upload-area">
                        <div className="premium-upload-zone">
                          <div className="premium-upload-icon">
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                            </svg>
                          </div>
                          <div className="premium-upload-content">
                            <p className="premium-upload-title">Upload License</p>
                            <p className="premium-upload-subtitle">Drag & drop or click to browse</p>
                            <p className="premium-upload-info">Supports JPG, PNG, PDF up to 10MB</p>
                          </div>
                          <input type="file" id="driver-profile-photo" name="driverProfilePhoto" className="premium-file-input" accept=".jpg,.jpeg,.png,.pdf" />
                        </div>
                      </div>
                    </div>
                    
                    {/* License Type */}
                    <div className="premium-form-group">
                      <label className="premium-form-label">License Type</label>
                      <div className="premium-button-group">
                        <button 
                          type="button" 
                          className={`premium-option-btn ${driverForm.driverType === 'regular' ? 'premium-option-active' : ''}`}
                          onClick={() => handleDriverFormChange('driverType', 'regular')}
                        >
                          <span className="premium-option-icon">👤</span>
                          Regular
                        </button>
                        <button 
                          type="button" 
                          className={`premium-option-btn ${driverForm.driverType === 'subcon' ? 'premium-option-active' : ''}`}
                          onClick={() => handleDriverFormChange('driverType', 'subcon')}
                        >
                          <span className="premium-option-icon">🏢</span>
                          Subcon
                        </button>
                      </div>
                    </div>
                    
                                        {/* NDA Section */}
                    <div className="premium-form-group">
                       <div className="premium-nda-section">
                         <div className="premium-nda-header">
                           <span className="premium-nda-title">Non-Disclosure Agreement <span className="premium-required">*</span></span>
                           <span className="premium-nda-subtitle">Upload your signed NDA document (required for all drivers)</span>
                         </div>
                         
                         <div className="premium-nda-upload">
                           <div 
                             className="premium-nda-upload-zone" 
                             onDragOver={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               e.currentTarget.classList.add('dragging');
                             }}
                             onDragLeave={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               e.currentTarget.classList.remove('dragging');
                             }}
                             onDrop={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               e.currentTarget.classList.remove('dragging');
                               
                               const file = e.dataTransfer.files[0];
                               if (file) {
                                 // Check file type
                                 const validTypes = ['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                                 const isValidType = validTypes.some(type => 
                                   file.name.toLowerCase().endsWith(type) || file.type === type
                                 );
                                 
                                 if (!isValidType) {
                                   alert('Please upload a PDF or Word document');
                                   return;
                                 }
                                 
                                 // Check file size (5MB)
                                 if (file.size > 5 * 1024 * 1024) {
                                   alert('File size exceeds 5MB limit');
                                   return;
                                 }
                                 
                                 console.log('NDA file dropped:', file.name);
                                 // Handle the file here
                                 document.getElementById('nda-document-upload').files = e.dataTransfer.files;
                               }
                             }}
                             onClick={() => document.getElementById('nda-document-upload').click()}
                           >
                             <input 
                               type="file" 
                               id="nda-document-upload" 
                               className="premium-nda-file-input" 
                               accept=".pdf,.doc,.docx" 
                               onChange={(e) => {
                                 const file = e.target.files[0];
                                 if (file) {
                                   // Check file size (5MB)
                                   if (file.size > 5 * 1024 * 1024) {
                                     alert('File size exceeds 5MB limit');
                                     e.target.value = '';
                                     return;
                                   }
                                   
                                   console.log('NDA file selected:', file.name);
                                   // You would typically update state here to show the selected file
                                   // For example:
                                   // setSelectedNdaFile(file);
                                 }
                               }}
                               style={{ display: 'none' }} /* Hide the actual file input */
                             />
                             <div className="premium-nda-icon">
                               <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                               </svg>
                             </div>
                             <div className="premium-nda-content">
                               <span className="premium-nda-text">Click to upload or drop PDF document here</span>
                               <span className="premium-nda-info">Max 5MB</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                  </div>
                  
                  {/* Right Side - Driver Information */}
                  <div className="premium-right-section">
                    <div className="premium-section-header">
                      <h3 className="premium-section-title">Driver Information</h3>
                      <div className="premium-section-divider"></div>
                    </div>
                    
                    <div className="premium-form-row">
                      <div className="premium-form-group">
                        <label className="premium-form-label" htmlFor="driver-first-name">First Name <span className="premium-required">*</span></label>
                        <input 
                          type="text" 
                          id="driver-first-name" 
                          name="driverFirstName"
                          className="premium-form-input" 
                          placeholder="e.g. John"
                          value={driverForm.firstName}
                          onChange={(e) => handleDriverFormChange('firstName', e.target.value)}
                        />
                      </div>
                      <div className="premium-form-group">
                        <label className="premium-form-label" htmlFor="driver-last-name">Last Name <span className="premium-required">*</span></label>
                        <input 
                          type="text" 
                          id="driver-last-name" 
                          name="driverLastName"
                          className="premium-form-input" 
                          placeholder="e.g. Doe"
                          value={driverForm.lastName}
                          onChange={(e) => handleDriverFormChange('lastName', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="premium-form-group">
                      <label className="premium-form-label" htmlFor="driver-email">Email Address <span className="premium-required">*</span></label>
                      <input 
                        type="email" 
                        id="driver-email" 
                        name="driverEmail"
                        className="premium-form-input" 
                        placeholder="e.g. john.doe@example.com"
                        value={driverForm.email}
                        onChange={(e) => handleDriverFormChange('email', e.target.value)}
                      />
                    </div>
                    
                    <div className="premium-form-group">
                      <label className="premium-form-label" htmlFor="driver-phone">Phone Number <span className="premium-required">*</span></label>
                      <input 
                        type="tel" 
                        id="driver-phone" 
                        name="driverPhone"
                        className="premium-form-input" 
                        placeholder="e.g. +1234567890"
                        value={driverForm.phone}
                        onChange={(e) => handleDriverFormChange('phone', e.target.value)}
                      />
                    </div>
                    
                    <div className="premium-form-group">
                      <label className="premium-form-label" htmlFor="driver-address">Full Address</label>
                      <textarea 
                        id="driver-address" 
                        name="driverAddress"
                        className="premium-form-textarea" 
                        placeholder="Enter full address"
                        rows="3"
                        value={driverForm.address}
                        onChange={(e) => handleDriverFormChange('address', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="premium-form-actions">
                  <button type="button" className="premium-cancel-btn" onClick={closeModal}>Cancel</button>
                  <button type="button" className="premium-submit-btn" onClick={handleSubmitDriver} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Registration'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'addVehicle':
        return (
          <div className="premium-enrollment-page">
            {/* Header Section */}
            <div className="premium-header">
              <div className="premium-header-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z"/>
                </svg>
              </div>
              <h1 className="premium-header-title">Vehicle Registration</h1>
              <p className="premium-header-subtitle">Provide detailed information about your vehicle for our records</p>
            </div>

            {/* Main Content */}
            <div className="premium-content-container">
              <div className="premium-content-card">
                <div className="premium-form-layout">
                  
                  {/* Left Side - Vehicle Photos */}
                  <div className="premium-left-section">
                    <div className="premium-section-header">
                      <h3 className="premium-section-title">Vehicle Photos</h3>
                      <div className="premium-section-divider"></div>
                    </div>
                    
                    {/* Exterior Photo Upload */}
                    <div className="premium-form-group">
                      <label className="premium-form-label">Exterior Photo <span className="premium-required">*</span></label>
                      <p className="premium-form-description">Upload a photo of the vehicle's exterior</p>
                      <div className="premium-upload-area">
                        <div className="premium-upload-zone">
                          <div className="premium-upload-icon">
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                            </svg>
                          </div>
                          <div className="premium-upload-content">
                            <p className="premium-upload-title">Upload Exterior Photo</p>
                            <p className="premium-upload-subtitle">Drag & drop or click to browse</p>
                            <p className="premium-upload-info">Supports JPG, PNG up to 10MB</p>
                          </div>
                          <input type="file" id="vehicle-exterior-photo" name="vehicleExteriorPhoto" className="premium-file-input" accept=".jpg,.jpeg,.png" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Interior Photo Upload */}
                    <div className="premium-form-group">
                      <label className="premium-form-label">Interior Photo <span className="premium-required">*</span></label>
                      <p className="premium-form-description">Upload a photo of the vehicle's interior</p>
                      <div className="premium-upload-area">
                        <div className="premium-upload-zone">
                          <div className="premium-upload-icon">
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                            </svg>
                          </div>
                          <div className="premium-upload-content">
                            <p className="premium-upload-title">Upload Interior Photo</p>
                            <p className="premium-upload-subtitle">Drag & drop or click to browse</p>
                            <p className="premium-upload-info">Supports JPG, PNG up to 10MB</p>
                          </div>
                          <input type="file" id="vehicle-interior-photo" name="vehicleInteriorPhoto" className="premium-file-input" accept=".jpg,.jpeg,.png" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Side - Vehicle Details */}
                  <div className="premium-right-section">
                    <div className="premium-section-header">
                      <h3 className="premium-section-title">Vehicle Details</h3>
                      <div className="premium-section-divider"></div>
                    </div>
                    
                    <div className="premium-form-group">
                      <label className="premium-form-label" htmlFor="vehicle-plate-number">Plate Number <span className="premium-required">*</span></label>
                      <input 
                        type="text" 
                        id="vehicle-plate-number" 
                        name="vehiclePlateNumber"
                        className="premium-form-input" 
                        placeholder="e.g. ABC-1234"
                        value={vehicleForm.plateNumber}
                        onChange={(e) => handleVehicleFormChange('plateNumber', e.target.value)}
                      />
                    </div>
                    
                    <div className="premium-form-row">
                      <div className="premium-form-group">
                        <label className="premium-form-label" htmlFor="vehicle-make">Make <span className="premium-required">*</span></label>
                        <input 
                          type="text" 
                          id="vehicle-make" 
                          name="vehicleMake"
                          className="premium-form-input" 
                          placeholder="e.g. Toyota"
                          value={vehicleForm.make}
                          onChange={(e) => handleVehicleFormChange('make', e.target.value)}
                        />
                      </div>
                      <div className="premium-form-group">
                        <label className="premium-form-label" htmlFor="vehicle-model">Model <span className="premium-required">*</span></label>
                        <input 
                          type="text" 
                          id="vehicle-model" 
                          name="vehicleModel"
                          className="premium-form-input" 
                          placeholder="e.g. Vios"
                          value={vehicleForm.model}
                          onChange={(e) => handleVehicleFormChange('model', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="premium-form-row">
                      <div className="premium-form-group">
                        <label className="premium-form-label" htmlFor="vehicle-year">Year</label>
                        <input 
                          type="number" 
                          id="vehicle-year" 
                          name="vehicleYear"
                          className="premium-form-input" 
                          placeholder="e.g. 2023"
                          value={vehicleForm.year}
                          onChange={(e) => handleVehicleFormChange('year', e.target.value)}
                        />
                      </div>
                      <div className="premium-form-group">
                        <label className="premium-form-label" htmlFor="vehicle-color">Color</label>
                        <input 
                          type="text" 
                          id="vehicle-color" 
                          name="vehicleColor"
                          className="premium-form-input" 
                          placeholder="e.g. Silver"
                          value={vehicleForm.color}
                          onChange={(e) => handleVehicleFormChange('color', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="premium-form-group">
                      <label className="premium-form-label">Vehicle Type</label>
                      <select 
                        id="vehicle-type" 
                        name="vehicleType"
                        className="premium-form-select"
                        value={vehicleForm.vehicleType}
                        onChange={(e) => handleVehicleFormChange('vehicleType', e.target.value)}
                      >
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="van">Van</option>
                        <option value="pickup">Pickup</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="premium-form-actions">
                  <button type="button" className="premium-cancel-btn" onClick={closeModal}>Cancel</button>
                  <button type="button" className="premium-submit-btn" onClick={handleSubmitVehicle} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Registration'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="default-content">
            <h2>Welcome to your dashboard</h2>
            <p>Select a section from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <React.Fragment>
      {/* Print View Modal Overlay */}
      {showPrintView && selectedBooking && (
        <div className="print-view-overlay">
          <div className="print-view-modal">
            <BookingPrintView 
              booking={{
                ...selectedBooking, 
                ...bookingDetails,
                // Ensure transaction remarks are properly passed
                remarks: selectedBooking.remarks || '',
                transactionRemarks: bookingDetails.transactionRemarks || selectedBooking.remarks || ''
              }} 
              onClose={() => setShowPrintView(false)} 
            />
          </div>
        </div>
      )}
      
      <div className={`user-dashboard-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className={`user-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="user-company-logo-container">
            <div className="user-ronway-logo">
              <img src={ronwayLogo} alt="Ronway Logo" />
            </div>
          </div>
          <div className="user-company-info-section">
            <div className="user-company-name">Ronway Cars & Travels</div>
            <div className="user-company-id">ID: 2024-8899</div>
          </div>
          <nav className="user-nav">
            <a href="#" className={`user-nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavClick('dashboard')}>
              <span className="user-nav-icon">{Icons.dashboard}</span>
              <span className="user-nav-text">DASHBOARD</span>
          </a>
          <a href="#" className={`user-nav-item ${currentView === 'notification' ? 'active' : ''}`} onClick={() => handleNavClick('notification')}>
            <span className="user-nav-icon">{Icons.notification}</span>
            <span className="user-nav-text">NOTIFICATIONS</span>
          </a>
          <div className={`user-nav-item ${dataRegistrationExpanded ? 'expanded' : ''}`} onClick={() => handleNavClick('dataRegistration')}>
            <span className="user-nav-icon">{Icons.dataRegistration}</span>
            <span className="user-nav-text">DATA REGISTRATION</span>
          </div>
          {dataRegistrationExpanded && (
            <div className="nav-submenu">
              <a href="#" className={`transport-nav-subitem ${currentView === 'enrollmentForm' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleNavClick('enrollmentForm'); }}>
                <span className="nav-icon">{Icons.enrollmentForm}</span>
                <span className="nav-text">ENROLLMENT FORM</span>
              </a>
              {enrollmentFormExpanded && (
                <div className="nav-submenu">
                  <a href="#" className={`transport-nav-subitem ${currentView === 'addDriver' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleNavClick('addDriver'); }}>
                    <span className="nav-icon">{Icons.driver}</span>
                    <span className="nav-text">ADD DRIVER</span>
                  </a>
                  <a href="#" className={`transport-nav-subitem ${currentView === 'addVehicle' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleNavClick('addVehicle'); }}>
                    <span className="nav-icon">{Icons.transport}</span>
                    <span className="nav-text">ADD VEHICLE</span>
                  </a>
                </div>
              )}
              <a href="#" className={`transport-nav-subitem ${currentView === 'dataTable' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleNavClick('dataTable'); }}>
                <span className="nav-icon">{Icons.database}</span>
                <span className="nav-text">DATA TABLE</span>
              </a>
              <a href="#" className={`transport-nav-subitem ${currentView === 'documentFiles' ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleNavClick('documentFiles'); }}>
                <span className="nav-icon">{Icons.documentFiles}</span>
                <span className="nav-text">DOCUMENT FILES</span>
              </a>
            </div>
          )}
          <a href="#" className={`user-nav-item ${currentView === 'dir' ? 'active' : ''}`} onClick={() => handleNavClick('dir')}>
            <span className="user-nav-icon">{Icons.dir}</span>
            <span className="user-nav-text">D.I.R</span>
          </a>
          <a href="#" className={`user-nav-item ${currentView === 'safety' ? 'active' : ''}`} onClick={() => handleNavClick('safety')}>
            <span className="user-nav-icon">{Icons.safety}</span>
            <span className="user-nav-text">S.H.E-M.S</span>
          </a>
          <a href="#" className={`user-nav-item ${currentView === 'incident' ? 'active' : ''}`} onClick={() => handleNavClick('incident')}>
            <span className="user-nav-icon">{Icons.incident}</span>
            <span className="user-nav-text">INCIDENT REPORT</span>
          </a>
        </nav>
        <div className="user-sidebar-footer">
        </div>
      </div>
      <div className="user-content">
        <div className="user-header">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          <div className="user-header-right">
            <PollingStatus />
          </div>
        </div>
        <main className="user-dashboard-main-content">
          {renderMainContent()}
        </main>
      </div>
    </div>
  </React.Fragment>
  );
};

export default UserDashboard;