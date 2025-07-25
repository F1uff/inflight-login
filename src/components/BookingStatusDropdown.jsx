import React, { useState, useEffect } from 'react';
import './BookingStatusDropdown.css';

const BookingStatusDropdown = ({ booking, currentStatus, onStatusChange, disabled = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);



  useEffect(() => {
    console.log('🔄 BookingStatusDropdown status changed:', {
      bookingId: booking.id,
      voucher: booking.voucher,
      newCurrentStatus: currentStatus
    });
    setLocalStatus(currentStatus);
  }, [booking.id, booking.voucher, currentStatus]);

  // Define status options to match user requirements
  const statusOptions = [
    { value: 'request', label: 'Request', color: '#007bff' },
    { value: 'confirmed', label: 'Confirmed', color: '#007bff' },
    { value: 'on_going', label: 'On Going', color: '#ffc107' },
    { value: 'in_progress', label: 'In Progress', color: '#ffc107' },
    { value: 'done_service', label: 'Done Service', color: '#28a745' },
    { value: 'completed', label: 'Completed', color: '#28a745' },
    { value: 'cancelled', label: 'Cancelled', color: '#dc3545' }
  ];

  console.log('🔄 Available status options:', statusOptions);

  // Map similar statuses for consistent display
  const getUnifiedStatus = (status) => {
    const statusMap = {
      'request': 'request',
      'confirmed': 'confirmed',
      'on_going': 'on_going',
      'in_progress': 'on_going',  // Map in_progress to on_going for display
      'done_service': 'done_service',
      'completed': 'done_service',  // Map completed to done_service for display
      'cancelled': 'cancelled'
    };
    return statusMap[status] || status;
  };

  // Define valid transitions - simplified workflow
  const validTransitions = {
    'request': ['confirmed', 'on_going', 'cancelled'],
    'confirmed': ['on_going', 'cancelled'],
    'on_going': ['done_service', 'cancelled'],
    'in_progress': ['done_service', 'cancelled'],
    'done_service': [],
    'completed': [],
    'cancelled': []
  };

  const getCurrentStatusOption = () => {
    // First try to find exact match
    let found = statusOptions.find(option => option.value === localStatus);
    
    // If no exact match, try the unified status mapping
    if (!found) {
      const unifiedStatus = getUnifiedStatus(localStatus);
      found = statusOptions.find(option => option.value === unifiedStatus);
    }
    
    console.log('🔄 getCurrentStatusOption:', {
      localStatus,
      unifiedStatus: getUnifiedStatus(localStatus),
      found,
      fallback: statusOptions[0]
    });
    return found || statusOptions[0];
  };

  const getAvailableOptions = () => {
    // Get valid transitions for current status
    let validNext = validTransitions[localStatus] || [];
    
    // If current status is not in our transition map, try unified status
    if (validNext.length === 0 && !validTransitions[localStatus]) {
      const unifiedStatus = getUnifiedStatus(localStatus);
      validNext = validTransitions[unifiedStatus] || [];
    }
    
    // Always include current status + valid next statuses
    const availableStatuses = [localStatus, ...validNext];
    let available = statusOptions.filter(option => 
      availableStatuses.includes(option.value)
    );
    
    // If no options found, show all primary statuses as fallback
    if (available.length === 0) {
      available = statusOptions.filter(option => 
        ['request', 'confirmed', 'on_going', 'done_service', 'cancelled'].includes(option.value)
      );
    }
    
    console.log('🔄 getAvailableOptions:', {
      localStatus,
      unifiedStatus: getUnifiedStatus(localStatus),
      validNext,
      availableStatuses,
      available
    });
    
    return available;
  };

  const handleStatusSelect = async (newStatus) => {
    console.log('🔄 handleStatusSelect called:', {
      bookingId: booking.id,
      voucher: booking.voucher,
      newStatus,
      localStatus,
      disabled,
      isEditing
    });
    
    if (newStatus === localStatus || disabled) {
      console.log('🔄 Status select cancelled - no change or disabled');
      return;
    }
    
    try {
      console.log('🔄 Calling onStatusChange callback...');
      await onStatusChange(booking, newStatus);
      console.log('🔄 Status change successful, updating local state');
      setLocalStatus(newStatus);
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      console.log('🔄 Reverting to current status:', currentStatus);
      setLocalStatus(currentStatus);
    }
  };

  const handleCancel = () => {
    console.log('🔄 handleCancel called, reverting to:', currentStatus);
    setLocalStatus(currentStatus);
    setIsEditing(false);
  };

  if (isEditing && !disabled) {
    console.log('🔄 Rendering editing mode');
    return (
      <div className="booking-status-dropdown-simple editing">
        <select 
          className="status-select-simple"
          value={localStatus}
          onChange={(e) => {
            console.log('🔄 Select onChange:', e.target.value);
            handleStatusSelect(e.target.value);
          }}
          onBlur={() => {
            console.log('🔄 Select onBlur');
            handleCancel();
          }}
          autoFocus
          disabled={disabled}
        >
          {getAvailableOptions().map(option => (
            <option 
              key={option.value} 
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const currentOption = getCurrentStatusOption();
  console.log('🔄 Rendering button mode:', {
    currentOption,
    disabled,
    isEditing
  });
  
  return (
    <div 
      className={`booking-status-button ${disabled ? 'disabled' : 'clickable'}`}
      onClick={() => {
        console.log('🔄 Status button clicked:', {
          disabled,
          currentOption,
          localStatus
        });
        if (!disabled) {
          setIsEditing(true);
        }
      }}
      style={{ backgroundColor: currentOption.color }}
      title={currentOption.label}
    >
      {disabled && <div className="loading-spinner">⏳</div>}
    </div>
  );
};

export default BookingStatusDropdown; 