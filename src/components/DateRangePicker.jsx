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
  const [hoveredDate, setHoveredDate] = useState(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: '0', right: 'auto' });

  // Calculate dropdown position to prevent cutoff
  const calculateDropdownPosition = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const dropdownWidth = 400; // Approximate width of dropdown
      
      // If there's not enough space on the right, align to the right
      if (rect.left + dropdownWidth > windowWidth - 20) {
        setDropdownPosition({ left: 'auto', right: '0' });
      } else {
        setDropdownPosition({ left: '0', right: 'auto' });
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsSelectingEnd(false);
        setHoveredDate(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate position when dropdown opens
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
    }
  }, [isOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

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
    } else if (isSelectingEnd && hoveredDate && date >= selectedStartDate && date <= hoveredDate) {
      return true;
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

  // Quick date selections
  const quickSelect = (type) => {
    const today = new Date();
    let start, end;

    switch (type) {
      case 'today':
        start = new Date(today);
        end = new Date(today);
        break;
      case 'yesterday':
        start = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        end = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'last7days':
        start = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
        end = new Date(today);
        break;
      case 'last30days':
        start = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
        end = new Date(today);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }

    setSelectedStartDate(start);
    setSelectedEndDate(end);
    if (onDateChange) {
      onDateChange(start, end);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsSelectingEnd(false);
    setHoveredDate(null);
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
    setHoveredDate(null);
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
          left: dropdownPosition.left,
          right: dropdownPosition.right,
          zIndex: 9999,
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.12)',
          padding: '8px',
          minWidth: '280px',
          maxWidth: '300px',
          marginTop: '2px'
        }}>
          {/* Quick Selection Buttons */}
          <div className="quick-selection" style={{
            display: 'flex',
            gap: '3px',
            marginBottom: '8px',
            flexWrap: 'wrap',
            justifyContent: 'flex-start'
          }}>
            {[
              { label: 'Today', type: 'today' },
              { label: 'Yesterday', type: 'yesterday' },
              { label: 'Last 7 days', type: 'last7days' },
              { label: 'Last 30 days', type: 'last30days' },
              { label: 'This month', type: 'thisMonth' },
              { label: 'Last month', type: 'lastMonth' }
            ].map(({ label, type }) => (
              <button
                key={type}
                type="button"
                onClick={() => quickSelect(type)}
                style={{
                  padding: '2px 4px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '3px',
                  background: 'white',
                  color: '#333',
                  fontSize: '9px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  flex: '0 0 auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.borderColor = '#007bff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#e0e0e0';
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="calendar-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
            padding: '0 2px'
          }}>
            <button 
              type="button" 
              onClick={previousMonth} 
              className="nav-button"
              style={{
                background: 'none',
                border: 'none',
                padding: '3px',
                borderRadius: '3px',
                cursor: 'pointer',
                color: '#666',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f5f5f5';
                e.target.style.color = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#666';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <h3 className="month-year" style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#333',
              margin: '0'
            }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button 
              type="button" 
              onClick={nextMonth} 
              className="nav-button"
              style={{
                background: 'none',
                border: 'none',
                padding: '3px',
                borderRadius: '3px',
                cursor: 'pointer',
                color: '#666',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f5f5f5';
                e.target.style.color = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#666';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="calendar-grid">
            <div className="day-headers" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px',
              marginBottom: '6px'
            }}>
              {dayNames.map(day => (
                <div 
                  key={day} 
                  className="day-header"
                  style={{
                    textAlign: 'center',
                    fontSize: '9px',
                    fontWeight: '600',
                    color: '#666',
                    padding: '2px 1px'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>
            
            <div className="days-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '1px'
            }}>
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
                  onMouseEnter={() => date && setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  disabled={!date}
                  style={{
                    width: '24px',
                    height: '24px',
                    border: 'none',
                    borderRadius: '3px',
                    background: 'transparent',
                    cursor: date ? 'pointer' : 'default',
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#333',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    ...(date && isDateInRange(date) && {
                      background: '#e3f2fd',
                      color: '#1976d2'
                    }),
                    ...(date && isStartDate(date) && {
                      background: '#007bff',
                      color: 'white',
                      fontWeight: '600'
                    }),
                    ...(date && isEndDate(date) && {
                      background: '#007bff',
                      color: 'white',
                      fontWeight: '600'
                    }),
                    ...(date && date.toDateString() === new Date().toDateString() && {
                      border: '1px solid #007bff',
                      fontWeight: '600'
                    }),
                    ...(date && !isDateInRange(date) && !isStartDate(date) && !isEndDate(date) && {
                      '&:hover': {
                        background: '#f5f5f5'
                      }
                    })
                  }}
                >
                  {date ? date.getDate() : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="calendar-footer" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
            paddingTop: '6px',
            borderTop: '1px solid #e0e0e0'
          }}>
            <button 
              type="button" 
              onClick={clearSelection} 
              className="clear-button"
              style={{
                padding: '3px 6px',
                border: '1px solid #e0e0e0',
                borderRadius: '3px',
                background: 'white',
                color: '#666',
                cursor: 'pointer',
                fontSize: '9px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.borderColor = '#dc3545';
                e.target.style.color = '#dc3545';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.color = '#666';
              }}
            >
              Clear
            </button>
            <div className="action-buttons" style={{
              display: 'flex',
              gap: '4px'
            }}>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="cancel-button"
                style={{
                  padding: '3px 6px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '3px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '9px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={applySelection} 
                className="apply-button"
                disabled={!selectedStartDate}
                style={{
                  padding: '3px 6px',
                  border: 'none',
                  borderRadius: '3px',
                  background: selectedStartDate ? '#007bff' : '#e0e0e0',
                  color: selectedStartDate ? 'white' : '#999',
                  cursor: selectedStartDate ? 'pointer' : 'not-allowed',
                  fontSize: '9px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedStartDate) {
                    e.target.style.background = '#0056b3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStartDate) {
                    e.target.style.background = '#007bff';
                  }
                }}
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
 
 
 