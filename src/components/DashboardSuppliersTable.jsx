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
  handleSupplierTypeChange,
  suppliersStats,
  filteredData
}) => {
  // Date range state for filtering
  const [dateRange] = useState({
    startDate: new Date(2025, 3, 25), // April 25, 2025
    endDate: new Date(2025, 4, 24)    // May 24, 2025
  });
  
  // Get current suppliers list using shared function
  const currentSuppliersList = getCurrentSuppliersList ? getCurrentSuppliersList() : [];
  
  // Format numbers with commas
  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString();
  };

  // Get portfolio counts for display
  const getPortfolioCount = (type) => {
    if (!filteredData?.portfolioCounts) return 0;
    
    const counts = filteredData.portfolioCounts;
    switch(type) {
      case 'hotel':
        return counts.hotel || counts.hotels || 0;
      case 'transfer':
        return counts.transfer || counts.landTransfer || counts.land_transfer || 0;
      case 'airline':
        return counts.airline || counts.airlines || 0;
      case 'travelOperator':
        return counts.travelOperator || counts.travel_operator || counts.travelOperators || 0;
      default:
        return 0;
    }
  };

  // Get supplier statistics for display
  const getStatValue = (statKey) => {
    if (!suppliersStats || suppliersStats.loading) return 0;
    const stat = suppliersStats[statKey];
    return stat ? stat.value || 0 : 0;
  };
  
  return (
    <div className="dashboard-suppliers-container">
      {/* Supplier Portfolio Statistics */}
      <div className="dashboard-stats-section">
        <h2 className="supplier-portfolio-title">SUPPLIER PORTFOLIO COUNT</h2>
        <div className="supplier-portfolio-cards">
          <div className="portfolio-card hotel-card">
            <div className="card-header">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                </svg>
              </div>
              <div className="card-label">HOTEL</div>
            </div>
            <div className="card-value">
              {suppliersStats?.loading ? '...' : formatNumber(getPortfolioCount('hotel'))}
            </div>
          </div>
          
          <div className="portfolio-card transfer-card">
            <div className="card-header">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <div className="card-label">TRANSFER</div>
            </div>
            <div className="card-value">
              {suppliersStats?.loading ? '...' : formatNumber(getPortfolioCount('transfer'))}
            </div>
          </div>
          
          <div className="portfolio-card airline-card">
            <div className="card-header">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div className="card-label">AIRLINE</div>
            </div>
            <div className="card-value">
              {suppliersStats?.loading ? '...' : formatNumber(getPortfolioCount('airline'))}
            </div>
          </div>
          
          <div className="portfolio-card travel-operator-card">
            <div className="card-header">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="card-label">TRAVEL OPERATOR</div>
            </div>
            <div className="card-value">
              {suppliersStats?.loading ? '...' : formatNumber(getPortfolioCount('travelOperator'))}
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Statistics */}
      <div className="suppliers-stats-section">
        <div className="suppliers-stats-single-row">
          {/* Accreditation stats */}
          <div className="suppliers-stats-row">
            <div className="suppliers-stat-card accredited">
              <div className="stat-label">
                <span className="status-dot active"></span>
                ACCREDITED
              </div>
              <div className="stat-value">{formatNumber(getStatValue('accredited'))}</div>
            </div>
            <div className="suppliers-stat-card accredited-prepaid">
              <div className="stat-label">
                <span className="status-dot pending"></span>
                ACCREDITED PREPAID
              </div>
              <div className="stat-value">{formatNumber(getStatValue('accreditedPrepaid'))}</div>
            </div>
            <div className="suppliers-stat-card non-accredited">
              <div className="stat-label">
                <span className="status-dot inactive"></span>
                NON-ACCREDITED
              </div>
              <div className="stat-value">{formatNumber(getStatValue('nonAccredited'))}</div>
            </div>
          </div>
          
          {/* Regional stats */}
          <div className="suppliers-stats-row">
            <div className="suppliers-stat-card ncr-luzon">
              <div className="stat-label">
                <span className="status-dot ncr"></span>
                NCR & LUZON
              </div>
              <div className="stat-value">{formatNumber(getStatValue('ncrLuzon'))}</div>
            </div>
            <div className="suppliers-stat-card visayas">
              <div className="stat-label">
                <span className="status-dot visayas"></span>
                VISAYAS
              </div>
              <div className="stat-value">{formatNumber(getStatValue('visayas'))}</div>
            </div>
            <div className="suppliers-stat-card mindanao">
              <div className="stat-label">
                <span className="status-dot mindanao"></span>
                MINDANAO
              </div>
              <div className="stat-value">{formatNumber(getStatValue('mindanao'))}</div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default DashboardSuppliersTable; 