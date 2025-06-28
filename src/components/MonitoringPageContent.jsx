import React from 'react';
import { Icons } from '../data/icons.jsx';

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
                                <label>HOTEL DETAILS</label>
                                <input type="text" placeholder="Hotel details" />
                              </div>
                              <div className="form-group">
                                <label>ROOM TYPE</label>
                                <input type="text" placeholder="Room type" />
                              </div>
                              <div className="form-group">
                                <label>CHECK-IN TIME</label>
                                <input type="text" placeholder="Check-in time" />
                              </div>
                              <div className="form-group">
                                <label>CHECK-OUT TIME</label>
                                <input type="text" placeholder="Check-out time" />
                              </div>
                              <div className="form-group">
                                <label>SPECIAL REQUESTS</label>
                                <input type="text" placeholder="Special requests" />
                              </div>
                              <div className="form-group">
                                <label>PAYMENT STATUS</label>
                                <input type="text" placeholder="Payment status" />
                              </div>
                              <div className="form-group">
                                <label>CONFIRMATION NUMBER</label>
                                <input type="text" placeholder="Confirmation number" />
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
          <span>Showing 1 to 10 of 10 entries</span>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPageContent;