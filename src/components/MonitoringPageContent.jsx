import React, { useState } from 'react';
import { Icons } from '../data/icons.jsx';
import DateRangePicker from './DateRangePicker.jsx';
import './MonitoringPage.css';

const StatusIndicator = ({ status, label, isActive, onClick }) => {
  return (
    <div 
      className={`monitoring-status-pill ${status} ${isActive ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <span className={`monitoring-status-dot ${status}`}></span>
      {label}
    </div>
  );
};

const MonitoringPageContent = ({
  filteredData,
  searchTerms,
  handleSearchChange,
  filterByStatus,
  selectedMonitoringStatus,
  selectedHotelStatus,
  expandedRowId,
  toggleRowExpansion
}) => {
  // Date range state for filtering
  const [dateRange, setDateRange] = useState({
    startDate: new Date(2025, 3, 25), // April 25, 2025
    endDate: new Date(2025, 4, 24)    // May 24, 2025
  });

  // Supplier type filter state
  const [selectedSupplierType, setSelectedSupplierType] = useState("Land Transfer");

  // Handle date range change
  const handleDateRangeChange = (startDate, endDate) => {
    setDateRange({ startDate, endDate });
    console.log('Date range changed:', { startDate, endDate });
  };
  
  // Handle supplier type change
  const handleSupplierTypeChange = (event) => {
    setSelectedSupplierType(event.target.value);
    console.log('Supplier type changed:', event.target.value);
  };

  return (
    <div className="monitoring-page-content">
      {/* Page Title */}
      <h1 className="monitoring-section-title">MONITORING</h1>

      {/* Transfer Service Monitoring Section */}
      <div className="monitoring-service-section">
        <div className="monitoring-service-header">
          <div className="monitoring-service-title">
            <div className="monitoring-service-icon">
              {Icons.portfolioTransfer}
            </div>
            <h2 className="monitoring-service-name">Transfer Service Monitoring</h2>
          </div>
          <div className="monitoring-service-controls">
            <div className="monitoring-supplier-type-dropdown">
              <select value={selectedSupplierType} onChange={handleSupplierTypeChange}>
                <option value="Land Transfer">Land Transfer</option>
                <option value="Hotel">Hotel</option>
              </select>
            </div>
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={handleDateRangeChange}
              placeholder="Select date range"
            />
          </div>
        </div>

        {/* Bookings Section */}
        <div className="monitoring-bookings-section">
          <div className="monitoring-bookings-header">
            <h3 className="monitoring-bookings-title">BOOKINGS</h3>
          </div>
          
          <div className="monitoring-controls-row">
            <div className="monitoring-status-indicators">
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
              <select className="monitoring-voucher-dropdown">
                <option>TRAVEL VOUCHER</option>
              </select>
            </div>
            <div className="monitoring-search-container">
              <input 
                type="text" 
                className="monitoring-search-input"
                placeholder="Search bookings..." 
                value={searchTerms.monitoring}
                onChange={(e) => handleSearchChange('monitoring', e.target.value)}
              />
              <button className="monitoring-search-btn">
                {Icons.searchIcon}
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="monitoring-table-container">
            <table className="monitoring-table">
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
                      className={`monitoring-row ${expandedRowId === booking.id ? 'expanded' : ''}`}
                      onClick={() => toggleRowExpansion(booking.id)}
                    >
                      <td className="monitoring-expand-icon" onClick={(e) => {e.stopPropagation(); toggleRowExpansion(booking.id);}}>
                        <span>{expandedRowId === booking.id ? '▼' : '▶'}</span>
                      </td>
                      <td>{booking.travelDate}</td>
                      <td>{booking.pickupTime}</td>
                      <td>{booking.guestName}</td>
                      <td>{booking.clientNumber}</td>
                      <td>{booking.pickupLocation}</td>
                      <td>{booking.destination}</td>
                      <td className="monitoring-status-column">
                        <div className={`monitoring-account-status-indicator ${booking.status}`}></div>
                      </td>
                      <td className="monitoring-action-buttons">
                        <button 
                          className="monitoring-action-btn blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('View booking:', booking.id);
                          }}
                          title="View Details"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                        </button>
                        <button 
                          className="monitoring-action-btn orange"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Send SMS for booking:', booking.id);
                          }}
                          title="Send SMS"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                          </svg>
                        </button>
                        <button 
                          className="monitoring-action-btn red"
                          onClick={(e) => {
                            e.stopPropagation();
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
                      <tr className="monitoring-expanded-details">
                        <td colSpan="9">
                          <div className="monitoring-details-content">
                            <div className="monitoring-details-section">
                              <h4>Booking Details</h4>
                              <div className="monitoring-details-grid">
                                <div className="monitoring-detail-item">
                                  <label>Travel Date:</label>
                                  <span>{booking.travelDate}</span>
                                </div>
                                <div className="monitoring-detail-item">
                                  <label>Pick-up Time:</label>
                                  <span>{booking.pickupTime}</span>
                                </div>
                                <div className="monitoring-detail-item">
                                  <label>Guest Name:</label>
                                  <span>{booking.guestName}</span>
                                </div>
                                <div className="monitoring-detail-item">
                                  <label>Client Number:</label>
                                  <span>{booking.clientNumber}</span>
                                </div>
                                <div className="monitoring-detail-item">
                                  <label>Pick-up Location:</label>
                                  <span>{booking.pickupLocation}</span>
                                </div>
                                <div className="monitoring-detail-item">
                                  <label>Destination:</label>
                                  <span>{booking.destination}</span>
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
            <div className="monitoring-table-info">
              Showing 1 to {filteredData.monitoring.length} of {filteredData.monitoring.length} entries
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Service Monitoring Section */}
      <div className="monitoring-service-section">
        <div className="monitoring-service-header">
          <div className="monitoring-service-title">
            <div className="monitoring-service-icon">
              {Icons.portfolioHotel}
            </div>
            <h2 className="monitoring-service-name">Hotel Service Monitoring</h2>
          </div>
          <div className="monitoring-service-controls">
            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={handleDateRangeChange}
              placeholder="Select date range"
            />
          </div>
        </div>

        {/* Hotel Monitoring Section */}
        <div className="monitoring-bookings-section">
          <div className="monitoring-bookings-header">
            <h3 className="monitoring-bookings-title">HOTEL MONITORING</h3>
          </div>
          
          <div className="monitoring-controls-row">
            <div className="monitoring-status-indicators">
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
              <select className="monitoring-voucher-dropdown">
                <option>HOTEL VOUCHER</option>
              </select>
            </div>
            <div className="monitoring-search-container">
              <input 
                type="text" 
                className="monitoring-search-input"
                placeholder="Search hotels..." 
                value={searchTerms.hotel}
                onChange={(e) => handleSearchChange('hotel', e.target.value)}
              />
              <button className="monitoring-search-btn">
                {Icons.searchIcon}
              </button>
            </div>
          </div>

          {/* Hotel Table */}
          <div className="monitoring-table-container">
            <table className="monitoring-table">
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
                {filteredData.hotel && filteredData.hotel.map((hotel) => (
                  <React.Fragment key={hotel.id}>
                    <tr 
                      className={`monitoring-row ${expandedRowId === hotel.id ? 'expanded' : ''}`}
                      onClick={() => toggleRowExpansion(hotel.id)}
                    >
                      <td className="monitoring-expand-icon" onClick={(e) => {e.stopPropagation(); toggleRowExpansion(hotel.id);}}>
                        <span>{expandedRowId === hotel.id ? '▼' : '▶'}</span>
                      </td>
                      <td>{hotel.voucher || 'N/A'}</td>
                      <td>{hotel.hotelName || 'N/A'}</td>
                      <td>{hotel.coveredDate || 'N/A'}</td>
                      <td>{hotel.guestName || 'N/A'}</td>
                      <td>{hotel.contactNumber || 'N/A'}</td>
                      <td>{hotel.numberOfStay || 'N/A'}</td>
                      <td className="monitoring-status-column">
                        <div className={`monitoring-account-status-indicator ${hotel.status || 'pending'}`}></div>
                      </td>
                      <td className="monitoring-action-buttons">
                        <button 
                          className="monitoring-action-btn blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('View hotel:', hotel.id);
                          }}
                          title="View Details"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                        </button>
                        <button 
                          className="monitoring-action-btn orange"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Send SMS for hotel:', hotel.id);
                          }}
                          title="Send SMS"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                          </svg>
                        </button>
                        <button 
                          className="monitoring-action-btn red"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Edit hotel:', hotel.id);
                          }}
                          title="Edit Hotel"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {expandedRowId === hotel.id && (
                      <tr className="monitoring-expanded-details">
                        <td colSpan="9">
                          <div className="monitoring-details-content">
                            <div className="monitoring-details-section">
                              <h4>Hotel Details</h4>
                              <div className="monitoring-details-grid">
                                <div className="monitoring-detail-item">
                                  <label>Hotel Voucher:</label>
                                  <span>{hotel.voucher || 'N/A'}</span>
                                </div>
                                <div className="monitoring-detail-item">
                                  <label>Hotel Name:</label>
                                  <span>{hotel.hotelName || 'N/A'}</span>
                                </div>
                                <div className="monitoring-detail-item">
                                  <label>Covered Date:</label>
                                  <span>{hotel.coveredDate || 'N/A'}</span>
                                </div>
                                <div className="monitoring-detail-item">
                                  <label>Guest Name:</label>
                                  <span>{hotel.guestName || 'N/A'}</span>
                                </div>
                                <div className="monitoring-detail-item">
                                  <label>Contact Number:</label>
                                  <span>{hotel.contactNumber || 'N/A'}</span>
                                </div>
                                <div className="monitoring-detail-item">
                                  <label>Number of Stay:</label>
                                  <span>{hotel.numberOfStay || 'N/A'}</span>
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
            <div className="monitoring-table-info">
              Showing 1 to {filteredData.hotel ? filteredData.hotel.length : 0} of {filteredData.hotel ? filteredData.hotel.length : 0} entries
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPageContent;