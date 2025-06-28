import { useState, useCallback } from 'react';

export const useFilterAndSearch = (initialData, getCurrentSuppliersList) => {
  const [searchTerms, setSearchTerms] = useState({
    suppliers: '',
    accounts: '',
    monitoring: '',
    hotel: ''
  });

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedMonitoringStatus, setSelectedMonitoringStatus] = useState(null);
  const [selectedHotelStatus, setSelectedHotelStatus] = useState(null);
  const [filteredData, setFilteredData] = useState(initialData);

  // Comprehensive search and filter function
  const applyFilters = useCallback((section, selectedSupplierType, monitoringData, hotelMonitoringData, accountsData) => {
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
  }, [searchTerms, selectedStatus, selectedMonitoringStatus, selectedHotelStatus, getCurrentSuppliersList]);

  // Handle search input changes
  const handleSearchChange = useCallback((section, value, selectedSupplierType, monitoringData, hotelMonitoringData, accountsData) => {
    setSearchTerms(prev => ({
      ...prev,
      [section]: value
    }));
    
    // Apply filters with debouncing
    setTimeout(() => {
      applyFilters(section, selectedSupplierType, monitoringData, hotelMonitoringData, accountsData);
    }, 300);
  }, [applyFilters]);

  // Filter data based on status
  const filterByStatus = useCallback((status, section) => {
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
  }, [selectedStatus, selectedMonitoringStatus, selectedHotelStatus]);

  // Get counts for each status
  const getStatusCounts = useCallback((data) => {
    return {
      active: data.filter(item => item.status === 'active').length,
      pending: data.filter(item => item.status === 'pending').length,
      inactive: data.filter(item => item.status === 'inactive').length
    };
  }, []);

  return {
    searchTerms,
    setSearchTerms,
    selectedStatus,
    setSelectedStatus,
    selectedMonitoringStatus,
    setSelectedMonitoringStatus,
    selectedHotelStatus,
    setSelectedHotelStatus,
    filteredData,
    setFilteredData,
    applyFilters,
    handleSearchChange,
    filterByStatus,
    getStatusCounts
  };
};