import React from 'react';
import './BookingPrintView.css';

const BookingPrintView = ({ booking, onClose }) => {
  // Format date and time for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };
  
  // Determine status class for coloring
  const getStatusClass = (status) => {
    if (!status) return 'status-default';
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('done') || statusLower.includes('completed')) return 'status-completed';
    if (statusLower.includes('cancel')) return 'status-cancelled';
    if (statusLower.includes('ongoing') || statusLower.includes('on_going') || statusLower.includes('on-going')) return 'status-ongoing';
    if (statusLower.includes('request') || statusLower.includes('pending')) return 'status-pending';
    
    return 'status-default';
  };
  
  const statusClass = getStatusClass(booking.status || booking.booking_status);
  const bookingId = booking.referenceNo || booking.id || 'N/A';
  const bookingStatus = booking.status || booking.booking_status || 'N/A';

  return (
    <div className="print-view-container">
      <div className="print-view-header">
        <div className="header-branding">
          <div className="company-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
          <div className="company-info">
            <h1>Ronway Cars & Travel</h1>
            <p className="company-tagline">Premium Transportation Services</p>
          </div>
        </div>
        <div className="print-actions">
          <button className="print-button" onClick={() => window.print()}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 8h-2V5H7v3H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zM8 5h8v3H8V5zm8 14H8v-7h8v7zm2-4v-2h2v2h-2z"/>
            </svg>
            Print
          </button>
          <button className="close-button" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            Close
          </button>
        </div>
      </div>
      
      <div className="booking-reference-bar">
        <div className="booking-reference">
          <span className="reference-label">BOOKING REFERENCE</span>
          <h2>{bookingId}</h2>
        </div>
        <div className={`booking-status ${statusClass}`}>
          <span className="status-label">STATUS</span>
          <span className="status-value">{bookingStatus}</span>
        </div>
      </div>

      <div className="print-view-content">
        <div className="print-columns">
          <div className="print-column">
            <div className="print-card">
              <div className="print-card-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
                </svg>
                <h3>Trip Details</h3>
              </div>
              <div className="print-card-content">
                <div className="print-field">
                  <label>Travel Voucher</label>
                  <p>{booking.travelVoucher || 'N/A'}</p>
                </div>
                <div className="print-field">
                  <label>Date of Service</label>
                  <p>{formatDate(booking.serviceDate)}</p>
                </div>
                <div className="print-field">
                  <label>Pick Up Time</label>
                  <p>{formatTime(booking.pickupTime)}</p>
                </div>
              </div>
            </div>
            
            <div className="print-card">
              <div className="print-card-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <h3>Passenger Information</h3>
              </div>
              <div className="print-card-content">
                <div className="print-field">
                  <label>Passenger Name</label>
                  <p>{booking.passengerName || 'N/A'}</p>
                </div>
                <div className="print-field">
                  <label>Vehicle Color</label>
                  <p>{booking.contactNumber || booking.driverContact || 'N/A'}</p>
                </div>
                <div className="print-field">
                  <label>VIP Status</label>
                  <p className="vip-badge">{booking.vipStatus || 'Regular'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="print-column">
            <div className="print-card">
              <div className="print-card-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <h3>Location Details</h3>
              </div>
              <div className="print-card-content">
                <div className="print-field">
                  <label>Pickup Details</label>
                  <p>{booking.pickupAddress || booking.pickupDetails || 'N/A'}</p>
                </div>
                <div className="print-field">
                  <label>Drop-off Details</label>
                  <p>{booking.destinationAddress || booking.dropOffDetails || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="print-card">
              <div className="print-card-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5zM7.5 14.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S6 12.17 6 13s.67 1.5 1.5 1.5zm9 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/>
                </svg>
                <h3>Vehicle & Driver Information</h3>
              </div>
              <div className="print-card-content">
                <div className="print-field">
                  <label>Type of Service</label>
                  <p>{booking.serviceType || booking.typeOfService || 'Standard'}</p>
                </div>
                <div className="print-field">
                  <label>Car Type</label>
                  <p>{booking.vehicleType || booking.plateNumber || 'Sedan'}</p>
                </div>
                <div className="print-field">
                  <label>Plate Number</label>
                  <p>{booking.carType || 'N/A'}</p>
                </div>
                <div className="print-field">
                  <label>Assigned Driver</label>
                  <p>{booking.assignedDriver || 'Unassigned'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="print-card remarks-card">
          <div className="print-card-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17l-.59.59-.58.58V4h16v12zM6 12h2v2H6zm0-3h2v2H6zm0-3h2v2H6zm4 6h5v2h-5zm0-3h8v2h-8zm0-3h8v2h-8z"/>
            </svg>
            <h3>Additional Information</h3>
          </div>
          <div className="print-card-content">
            <div className="print-field full-width">
              <label>Transaction Remarks</label>
              <p className="remarks-text">{booking.transactionRemarks || booking.remarks || 'No remarks provided.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="print-view-footer">
        <div className="footer-info">
          <p>Generated on {new Date().toLocaleString()}</p>
          <p className="contact-info">For assistance, call: +1-800-RONWAY</p>
        </div>
        <div className="qr-code">
          <div className="qr-placeholder"></div>
          <p>Scan for digital copy</p>
        </div>
      </div>
    </div>
  );
};

export default BookingPrintView;
