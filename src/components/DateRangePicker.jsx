import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../data/icons.jsx';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onDateChange, 
  placeholder = "Select date range",
  className = ""
}) => {
  // Helper function to parse date strings in DD/MM/YYYY format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    
    // Handle DD/MM/YYYY format
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    }
    
    // Fallback to standard Date parsing
    return new Date(dateStr);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(parseDate(startDate));
  const [selectedEndDate, setSelectedEndDate] = useState(parseDate(endDate));
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsSelectingEnd(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get display text for the date range
  const getDisplayText = () => {
    if (selectedStartDate && selectedEndDate) {
      return `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`;
    } else if (selectedStartDate) {
      return `${formatDate(selectedStartDate)} - Select end date`;
    }
    return placeholder;
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Handle date selection
  const handleDateClick = (date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate) || date < selectedStartDate) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      setIsSelectingEnd(true);
    } else if (selectedStartDate && !selectedEndDate) {
      // Select end date
      setSelectedEndDate(date);
      setIsSelectingEnd(false);
      
      // Call the callback with the complete range
      if (onDateChange) {
        onDateChange(selectedStartDate, date);
      }
      
      // Close the picker after a short delay
      setTimeout(() => {
        setIsOpen(false);
      }, 300);
    }
  };

  // Check if date is in selected range
  const isDateInRange = (date) => {
    if (!selectedStartDate || !date) return false;
    if (!(selectedStartDate instanceof Date) || !(date instanceof Date)) return false;
    
    if (selectedEndDate && selectedEndDate instanceof Date) {
      return date >= selectedStartDate && date <= selectedEndDate;
    } else if (isSelectingEnd) {
      return date >= selectedStartDate;
    }
    
    return date.getTime() === selectedStartDate.getTime();
  };

  // Check if date is start or end of range
  const isStartDate = (date) => {
    return selectedStartDate && date && 
           selectedStartDate instanceof Date && date instanceof Date &&
           date.getTime() === selectedStartDate.getTime();
  };

  const isEndDate = (date) => {
    return selectedEndDate && date && 
           selectedEndDate instanceof Date && date instanceof Date &&
           date.getTime() === selectedEndDate.getTime();
  };

  // Navigate months
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsSelectingEnd(false);
    if (onDateChange) {
      onDateChange(null, null);
    }
  };

  // Apply current selection
  const applySelection = () => {
    if (onDateChange && selectedStartDate) {
      onDateChange(selectedStartDate, selectedEndDate);
    }
    setIsOpen(false);
    setIsSelectingEnd(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div 
      className={`date-range-picker ${className}`} 
      ref={dropdownRef} 
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <div 
        className={`date-filter ${isOpen ? 'active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            setIsOpen(!isOpen);
          } catch (error) {
            console.error('- Error updating state:', error);
          }
        }}
        style={{ 
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1000,
          userSelect: 'none',
          pointerEvents: 'auto'
        }}
      >
        {Icons.calendarIcon}
        <span>{getDisplayText()}</span>
        <svg 
          width="12" 
          height="8" 
          viewBox="0 0 12 8" 
          fill="none" 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
        >
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {isOpen && (
        <div className="date-picker-dropdown" style={{ 
          position: 'absolute',
          top: '100%',
          left: '0',
          zIndex: 9999,
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          padding: '16px',
          minWidth: '320px',
          marginTop: '4px'
        }}>
          <div className="calendar-header">
            <button type="button" onClick={previousMonth} className="nav-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h3 className="month-year">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button type="button" onClick={nextMonth} className="nav-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="calendar-grid">
            <div className="day-headers">
              {dayNames.map(day => (
                <div key={day} className="day-header">{day}</div>
              ))}
            </div>
            
            <div className="days-grid">
              {getDaysInMonth(currentMonth).map((date, index) => (
                <button
                  key={index}
                  type="button"
                  className={`day-cell ${!date ? 'empty' : ''} ${
                    date && isDateInRange(date) ? 'in-range' : ''
                  } ${
                    date && isStartDate(date) ? 'start-date' : ''
                  } ${
                    date && isEndDate(date) ? 'end-date' : ''
                  } ${
                    date && date.toDateString() === new Date().toDateString() ? 'today' : ''
                  }`}
                  onClick={() => date && handleDateClick(date)}
                  disabled={!date}
                >
                  {date ? date.getDate() : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="calendar-footer">
            <button type="button" onClick={clearSelection} className="clear-button">
              Clear
            </button>
            <div className="action-buttons">
              <button type="button" onClick={() => setIsOpen(false)} className="cancel-button">
                Cancel
              </button>
              <button 
                type="button" 
                onClick={applySelection} 
                className="apply-button"
                disabled={!selectedStartDate}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker; 
 
 
 