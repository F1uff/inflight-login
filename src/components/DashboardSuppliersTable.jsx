import React, { useState } from 'react';

const DashboardSuppliersTable = ({ 
  expandedDashboardSupplier, 
  toggleDashboardSupplierExpansion,
  selectedStatus,
  searchTerms,
  handleSearchChange,
  filterByStatus,
  getCurrentSuppliersList,
  getTableHeaders,
  getTableRowData,
  selectedSupplierType,
  handleSupplierTypeChange
}) => {
  // Date range state for filtering
  const [dateRange] = useState({
    startDate: new Date(2025, 3, 25), // April 25, 2025
    endDate: new Date(2025, 4, 24)    // May 24, 2025
  });
  
  // Get current suppliers list using shared function
  const currentSuppliersList = getCurrentSuppliersList ? getCurrentSuppliersList() : [];
  
  return (
    <div className="suppliers-list-section">
      <div className="suppliers-header">
        <h2>LIST OF SUPPLIERS</h2>
        <div className="suppliers-controls">
          <div className="date-range-placeholder">
            <span>Date Range: {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}</span>
          </div>
          <button className="filters-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
            </svg>
            Filters
          </button>
        </div>
      </div>
      
      <div className="suppliers-filter-section">
        <div className="supplier-type-dropdown">
          <select value={selectedSupplierType || 'land_transfer'} onChange={handleSupplierTypeChange}>
            <option value="hotels">Hotels</option>
            <option value="land_transfer">Land Transfer</option>
          </select>
        </div>
        
        <div className="status-indicators">
          <div 
            className={`status-indicator active ${selectedStatus === 'active' ? 'selected' : ''}`}
            onClick={() => filterByStatus && filterByStatus('active')}
          >
            <div className="status-dot active"></div>
            <span>Active</span>
          </div>
          <div 
            className={`status-indicator pending ${selectedStatus === 'pending' ? 'selected' : ''}`}
            onClick={() => filterByStatus && filterByStatus('pending')}
          >
            <div className="status-dot pending"></div>
            <span>Pending</span>
          </div>
          <div 
            className={`status-indicator inactive ${selectedStatus === 'inactive' ? 'selected' : ''}`}
            onClick={() => filterByStatus && filterByStatus('inactive')}
          >
            <div className="status-dot inactive"></div>
            <span>In-active</span>
          </div>
        </div>
        
        <div className="search-container">
          <input 
            type="text" 
            id="supplier-search" 
            name="supplierSearch" 
            placeholder="Search suppliers..." 
            value={searchTerms?.suppliers || ''}
            onChange={(e) => handleSearchChange && handleSearchChange('suppliers', e.target.value)}
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
      </div>
      
      <div className="suppliers-table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              {(getTableHeaders ? getTableHeaders() : ['', 'Location', 'Company', 'Address', 'Rate', 'Validity', 'Remarks', 'Status']).map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentSuppliersList.length > 0 ? (
              currentSuppliersList.map((supplier) => {
                const rowData = getTableRowData ? getTableRowData(supplier) : [];
                return (
                  <React.Fragment key={supplier.id}>
                    <tr className="supplier-row" onClick={() => toggleDashboardSupplierExpansion(supplier.id)}>
                      <td className="expand-icon">{expandedDashboardSupplier === supplier.id ? 'V' : '>'}</td>
                      {rowData.map((cellData, index) => (
                        <td key={index}>{cellData}</td>
                      ))}
                    </tr>
                    {expandedDashboardSupplier === supplier.id && (
                      <tr className="contact-details-row">
                        <td colSpan={getTableHeaders ? getTableHeaders().length : 8}>
                          <div className="contact-details-section">
                            <div className="contact-details-header">
                              <h3>CONTACT DETAILS</h3>
                            </div>
                            <div className="contact-form-grid">
                              <div className="contact-form-column">
                                <div className="form-group">
                                  <label>COMPANY REPRESENTATIVE</label>
                                  <input 
                                    type="text" 
                                    value={supplier.company?.representative || 'N/A'}
                                    disabled={true}
                                    className="readonly-input"
                                  />
                                </div>
                                <div className="form-group">
                                  <label>CONTACT NUMBER</label>
                                  <input 
                                    type="text" 
                                    value={supplier.company?.phone || 'N/A'}
                                    disabled={true}
                                    className="readonly-input"
                                  />
                                </div>
                                <div className="form-group">
                                  <label>EMAIL ADDRESS</label>
                                  <input 
                                    type="email" 
                                    value={supplier.company?.email || 'N/A'}
                                    disabled={true}
                                    className="readonly-input"
                                  />
                                </div>
                              </div>
                              <div className="contact-form-column">
                                <div className="form-group">
                                  <label>DESIGNATION</label>
                                  <input 
                                    type="text" 
                                    value={supplier.designation || 'N/A'}
                                    disabled={true}
                                    className="readonly-input"
                                  />
                                </div>
                                <div className="form-group">
                                  <label>TEL NUMBER</label>
                                  <input 
                                    type="text" 
                                    value={supplier.telNumber || 'N/A'}
                                    disabled={true}
                                    className="readonly-input"
                                  />
                                </div>
                                <div className="form-group">
                                  <label>COMPANY ADDRESS</label>
                                  <input 
                                    type="text" 
                                    value={supplier.company?.address || 'N/A'}
                                    disabled={true}
                                    className="readonly-input"
                                  />
                                </div>
                              </div>
                              <div className="contact-form-column">
                                {selectedSupplierType === 'hotels' && (
                                  <>
                                    <div className="form-group">
                                      <label>TYPE OF BREAKFAST</label>
                                      <input 
                                        type="text" 
                                        value={supplier.breakfastType || 'N/A'}
                                        disabled={true}
                                        className="readonly-input"
                                      />
                                    </div>
                                    <div className="form-group">
                                      <label>ROOM QUANTITY</label>
                                      <input 
                                        type="text" 
                                        value={supplier.roomQuantity || 'N/A'}
                                        disabled={true}
                                        className="readonly-input"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="bottom-form-section">
                              <div className="payment-terms-section">
                                <div className="payment-form-row">
                                  <div className="form-group">
                                    <label>CREDIT TERMS</label>
                                    <input 
                                      type="text" 
                                      value={supplier.creditTerms || 'N/A'}
                                      disabled={true}
                                      className="readonly-input"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="remarks-section">
                                <div className="form-group">
                                  <label>REMARKS</label>
                                  <textarea 
                                    value={supplier.remarks || 'N/A'}
                                    disabled={true}
                                    className="readonly-input"
                                    rows="3"
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
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  No suppliers data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardSuppliersTable; 