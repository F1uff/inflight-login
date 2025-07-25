import React from 'react';
import { Icons } from '../data/icons.jsx';
import './DashboardPage.css';

const StatusIndicator = ({ status, label, isActive, onClick }) => {
  return (
    <div 
      className={`dashboard-status-pill ${status} ${isActive ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <span className={`dashboard-status-dot ${status}`}></span>
      {label}
    </div>
  );
};

const DashboardPageContent = ({
  selectedSupplierType,
  handleSupplierTypeChange,
  selectedStatus,
  filterByStatus,
  searchTerms,
  handleSearchChange,
  getTableHeaders,
  getTableRowData,
  getStatusCounts,
  getCurrentSuppliersList,
  getAllSuppliersList,
  portfolioCounts,
  expandedDashboardSupplier,
  toggleDashboardSupplierExpansion,
  filteredData
}) => {
  // Use filtered data for both table and status counts to ensure search and filters work
  const suppliersList = filteredData?.dashboard || getCurrentSuppliersList() || [];
  const _STATUS_COUNTS = getStatusCounts(suppliersList);
  const currentSuppliersList = suppliersList;
  const allSuppliersList = getAllSuppliersList();

  // Calculate supplier counts by type from all suppliers (fallback if API data not available)
  const getSupplierTypeCounts = () => {
    // First try to use API portfolio data
    if (portfolioCounts && typeof portfolioCounts === 'object') {
      return {
        hotel: portfolioCounts.hotel || portfolioCounts.hotels || 0,
        transfer: portfolioCounts.transfer || portfolioCounts.landTransfer || portfolioCounts.land_transfer || 0,
        airline: portfolioCounts.airline || portfolioCounts.airlines || 0,
        travelOperator: portfolioCounts.travelOperator || portfolioCounts.travel_operator || portfolioCounts.travelOperators || 0
      };
    }

    // Fallback to calculating from suppliers list
    if (!allSuppliersList || allSuppliersList.length === 0) {
      return {
        hotel: 0,
        transfer: 0,
        airline: 0,
        travelOperator: 0
      };
    }

    const counts = {
      hotel: 0,
      transfer: 0,
      airline: 0,
      travelOperator: 0
    };

    allSuppliersList.forEach(supplier => {
      const supplierType = supplier.supplierType?.toLowerCase();
      if (supplierType === 'hotel') {
        counts.hotel++;
      } else if (supplierType === 'transfer' || supplierType === 'land_transfer') {
        counts.transfer++;
      } else if (supplierType === 'airline') {
        counts.airline++;
      } else if (supplierType === 'travel_operator' || supplierType === 'traveloperator') {
        counts.travelOperator++;
      }
    });

    return counts;
  };

  const supplierTypeCounts = getSupplierTypeCounts();

  // Format numbers with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  // Debug logging
  console.log('🔍 DashboardPageContent - portfolioCounts:', portfolioCounts);
  console.log('🔍 DashboardPageContent - allSuppliersList length:', allSuppliersList?.length);
  console.log('🔍 DashboardPageContent - supplierTypeCounts:', supplierTypeCounts);
  console.log('🔍 DashboardPageContent - searchTerms:', searchTerms);
  console.log('🔍 DashboardPageContent - dashboard search:', searchTerms?.dashboard);
  console.log('🔍 DashboardPageContent - suppliersList length:', suppliersList.length);
  console.log('🔍 DashboardPageContent - filteredData.dashboard length:', filteredData?.dashboard?.length);

  // Check if data is loading (only check for portfolio counts, not suppliers list)
  const isDataLoading = (!portfolioCounts && !allSuppliersList);

  return (
    <div className="dashboard-page-content">
      {/* Dashboard Statistics */}
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
              {isDataLoading ? '...' : formatNumber(supplierTypeCounts.hotel)}
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
              {isDataLoading ? '...' : formatNumber(supplierTypeCounts.transfer)}
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
              {isDataLoading ? '...' : formatNumber(supplierTypeCounts.airline)}
            </div>
          </div>
          
          <div className="portfolio-card travel-operator-card">
            <div className="card-header">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
              </div>
              <div className="card-label">TRAVEL OPERATOR</div>
            </div>
            <div className="card-value">
              {isDataLoading ? '...' : formatNumber(supplierTypeCounts.travelOperator)}
            </div>
          </div>
        </div>
      </div>

      {/* List of Suppliers Section */}
      <div className="list-of-suppliers-section">
        <div className="section-title">LIST OF SUPPLIERS</div>
        
        {/* Filter bar */}
        <div className="dashboard-filter-bar">
          <div className="filter-left-section">
            <div className="dashboard-supplier-type-dropdown">
              <select 
                value={selectedSupplierType || 'land_transfer'} 
                onChange={handleSupplierTypeChange}
              >
                <option value="hotels">Hotels</option>
                <option value="land_transfer">Land Transfer</option>
              </select>
            </div>
            
            <div className="dashboard-status-indicators">
              <StatusIndicator 
                status="active" 
                label="ACTIVE" 
                isActive={selectedStatus === 'active'}
                onClick={() => filterByStatus && filterByStatus('active')}
              />
              <StatusIndicator 
                status="pending" 
                label="PENDING" 
                isActive={selectedStatus === 'pending'}
                onClick={() => filterByStatus && filterByStatus('pending')}
              />
              <StatusIndicator 
                status="inactive" 
                label="IN-ACTIVE" 
                isActive={selectedStatus === 'inactive'}
                onClick={() => filterByStatus && filterByStatus('inactive')}
              />
            </div>
          </div>
          
          <div className="filter-right-section">
            <div className="dashboard-search-container">
              <input 
                type="text" 
                placeholder="Search suppliers..." 
                value={searchTerms?.dashboard || ''}
                onChange={(e) => handleSearchChange && handleSearchChange('dashboard', e.target.value)}
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Suppliers Table */}
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                {(getTableHeaders ? getTableHeaders() : ['', 'LOCATION', 'COMPANY NAME', 'COMPANY ADDRESS', 'TARIFF RATES', 'VALIDITY', 'REMARKS', 'STATUS']).map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentSuppliersList.length > 0 ? (
                currentSuppliersList.map((supplier) => {
                  const rowData = getTableRowData ? getTableRowData(supplier) : [];
                  const isExpanded = expandedDashboardSupplier === supplier.id;
                  
                  return (
                    <React.Fragment key={supplier.id}>
                      <tr>
                        <td>
                          <span 
                            className="dashboard-expand-icon"
                            onClick={() => toggleDashboardSupplierExpansion(supplier.id)}
                          >
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </td>
                        {rowData.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                      {isExpanded && (
                        <tr className="expanded-details">
                          <td colSpan={rowData.length + 1}>
                            {selectedSupplierType === 'hotels' ? (
                              <div className="hotel-details-form">
                                <div className="hotel-details-header">
                                  <h3>HOTEL DETAILS</h3>
                                </div>
                                
                                <div className="hotel-details-grid">
                                  <div className="hotel-details-section">
                                    <div className="contact-details-column">
                                      <h4>CONTACT DETAILS</h4>
                                      <div className="form-group">
                                        <label>SALE REPRESENTATIVE</label>
                                        <input 
                                          type="text" 
                                          defaultValue={supplier.representative || ''}
                                          placeholder="Enter representative name"
                                          disabled
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>CONTACT NUMBER</label>
                                        <input 
                                          type="text" 
                                          defaultValue={supplier.company?.phone || ''}
                                          placeholder="Enter contact number"
                                          disabled
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>EMAIL ADDRESS</label>
                                        <input 
                                          type="email" 
                                          defaultValue={supplier.company?.email || ''}
                                          placeholder="Enter email address"
                                          disabled
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="frontdesk-column">
                                      <h4>FRONTDESK</h4>
                                      <div className="form-group">
                                        <label>CONTACT NUMBER</label>
                                        <input 
                                          type="text" 
                                          defaultValue={supplier.frontdeskPhone || ''}
                                          placeholder="Enter frontdesk number"
                                          disabled
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>EMAIL ADDRESS</label>
                                        <input 
                                          type="email" 
                                          defaultValue={supplier.frontdeskEmail || ''}
                                          placeholder="Enter frontdesk email"
                                          disabled
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="hotel-info-column">
                                      <div className="form-group">
                                        <label>TYPE OF BREAKFAST</label>
                                        <select defaultValue={supplier.breakfastType || ''} disabled>
                                          <option value="">Select breakfast type</option>
                                          <option value="continental">Continental</option>
                                          <option value="american">American</option>
                                          <option value="buffet">Buffet</option>
                                          <option value="plated">Plated</option>
                                          <option value="room_service">Room Service</option>
                                          <option value="no_breakfast">No Breakfast</option>
                                        </select>
                                      </div>
                                      <div className="form-group">
                                        <label>ROOM QUANTITY</label>
                                        <input 
                                          type="number" 
                                          min="1" 
                                          defaultValue={supplier.roomQuantity || ''}
                                          placeholder="Enter quantity" 
                                          disabled
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>SECURITY DEPOSIT</label>
                                        <input 
                                          type="text" 
                                          defaultValue={supplier.securityDeposit || ''}
                                          placeholder="Enter security deposit"
                                          disabled
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="payment-remarks-section">
                                    <div className="payment-terms-column">
                                      <h4>PAYMENT TERMS</h4>
                                      <div className="form-group">
                                        <label>MODE OF PAYMENT</label>
                                        <select defaultValue={supplier.modeOfPayment || ''} disabled>
                                          <option value="">Select payment mode</option>
                                          <option value="cash">Cash</option>
                                          <option value="check">Check</option>
                                          <option value="bank_transfer">Bank Transfer</option>
                                          <option value="credit_card">Credit Card</option>
                                        </select>
                                      </div>
                                      <div className="form-group">
                                        <label>CREDIT TERMS</label>
                                        <select defaultValue={supplier.creditTerms || ''} disabled>
                                          <option value="">Select credit terms</option>
                                          <option value="immediate">Immediate</option>
                                          <option value="7_days">7 Days</option>
                                          <option value="15_days">15 Days</option>
                                          <option value="30_days">30 Days</option>
                                          <option value="60_days">60 Days</option>
                                        </select>
                                      </div>
                                    </div>
                                    
                                    <div className="remarks-column">
                                      <h4>REMARKS</h4>
                                      <div className="form-group">
                                        <textarea 
                                          defaultValue={supplier.remarks || ''}
                                          placeholder="Enter remarks"
                                          rows="4"
                                          disabled
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Rates Table Section */}
                                <div className="rates-section">
                                  <div className="rates-controls">
                                    <div className="seasons-dropdown">
                                      <select>
                                        <option>SEASONS RATE</option>
                                        <option>Regular Season</option>
                                        <option>Peak Season</option>
                                        <option>Lean Season</option>
                                      </select>
                                    </div>
                                    <button className="filters-btn">
                                      <span>Filters</span>
                                    </button>
                                  </div>
                                  
                                  <div className="rates-table-container">
                                    <table className="rates-table">
                                      <thead>
                                        <tr>
                                          <th>TYPE OF ROOM</th>
                                          <th>PUBLISH RATES</th>
                                          <th>CONTRACTED RATES</th>
                                          <th>CORPORATE RATES</th>
                                          <th>SELLING</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td>Standard Room</td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.standard?.publish || ''}
                                              disabled
                                            />
                                          </td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.standard?.contracted || ''}
                                              disabled
                                            />
                                          </td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.standard?.corporate || ''}
                                              disabled
                                            />
                                          </td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.standard?.selling || ''}
                                              disabled
                                            />
                                          </td>
                                        </tr>
                                        <tr>
                                          <td>Deluxe Room</td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.deluxe?.publish || ''}
                                              disabled
                                            />
                                          </td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.deluxe?.contracted || ''}
                                              disabled
                                            />
                                          </td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.deluxe?.corporate || ''}
                                              disabled
                                            />
                                          </td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.deluxe?.selling || ''}
                                              disabled
                                            />
                                          </td>
                                        </tr>
                                        <tr>
                                          <td>Suite</td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.suite?.publish || ''}
                                              disabled
                                            />
                                          </td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.suite?.contracted || ''}
                                              disabled
                                            />
                                          </td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.suite?.corporate || ''}
                                              disabled
                                            />
                                          </td>
                                          <td>
                                            <input 
                                              type="text" 
                                              placeholder="Php 0.00"
                                              defaultValue={supplier.rates?.suite?.selling || ''}
                                              disabled
                                            />
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="contact-details-simple">
                                <div className="contact-details-header">
                                  <h3>CONTACT DETAILS</h3>
                                </div>
                                
                                <div className="contact-details-grid">
                                  <div className="contact-details-section">
                                    <div className="form-row">
                                      <div className="form-group">
                                        <label>COMPANY REPRESENTATIVE</label>
                                        <input 
                                          type="text" 
                                          defaultValue={supplier.representative || ''}
                                          placeholder="Enter representative name"
                                          disabled
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>DESIGNATION</label>
                                        <input 
                                          type="text" 
                                          defaultValue={supplier.designation || ''}
                                          placeholder="Enter designation"
                                          disabled
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="form-row">
                                      <div className="form-group">
                                        <label>CONTACT NUMBER</label>
                                        <input 
                                          type="text" 
                                          defaultValue={supplier.company?.phone || ''}
                                          placeholder="Enter contact number"
                                          disabled
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>EMAIL ADDRESS</label>
                                        <input 
                                          type="email" 
                                          defaultValue={supplier.company?.email || ''}
                                          placeholder="Enter email address"
                                          disabled
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="form-row">
                                      <div className="form-group">
                                        <label>TEL NUMBER</label>
                                        <input 
                                          type="text" 
                                          defaultValue={supplier.telNumber || ''}
                                          placeholder="Enter telephone number"
                                          disabled
                                        />
                                      </div>
                                      <div className="form-group">
                                        <label>COMPANY ADDRESS</label>
                                        <input 
                                          type="text" 
                                          defaultValue={supplier.company?.address || ''}
                                          placeholder="Enter company address"
                                          disabled
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="payment-terms-section">
                                    <h4>PAYMENT TERMS</h4>
                                    <div className="form-row">
                                      <div className="form-group">
                                        <label>MODE OF PAYMENT</label>
                                        <select defaultValue={supplier.modeOfPayment || ''} disabled>
                                          <option value="">Select payment mode</option>
                                          <option value="cash">Cash</option>
                                          <option value="check">Check</option>
                                          <option value="bank_transfer">Bank Transfer</option>
                                          <option value="credit_card">Credit Card</option>
                                        </select>
                                      </div>
                                      <div className="form-group">
                                        <label>CREDIT TERMS</label>
                                        <select defaultValue={supplier.creditTerms || ''} disabled>
                                          <option value="">Select credit terms</option>
                                          <option value="immediate">Immediate</option>
                                          <option value="7_days">7 Days</option>
                                          <option value="15_days">15 Days</option>
                                          <option value="30_days">30 Days</option>
                                          <option value="60_days">60 Days</option>
                                        </select>
                                      </div>
                                    </div>
                                    
                                    <div className="form-group">
                                      <label>REMARKS</label>
                                      <textarea 
                                        defaultValue={supplier.remarks || ''}
                                        placeholder="Enter remarks"
                                        rows="3"
                                        disabled
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={(getTableHeaders ? getTableHeaders() : ['', 'LOCATION', 'COMPANY NAME', 'COMPANY ADDRESS', 'TARIFF RATES', 'VALIDITY', 'REMARKS', 'STATUS']).length} className="no-data-message">
                    <div className="no-data-content">
                      <span>No suppliers data available</span>
                      {(selectedStatus || searchTerms?.dashboard) && (
                        <span className="filter-info">
                          {selectedStatus && ` (filtered by: ${selectedStatus})`}
                          {searchTerms?.dashboard && ` (search: "${searchTerms.dashboard}")`}
                        </span>
                      )}
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
};

export default DashboardPageContent; 