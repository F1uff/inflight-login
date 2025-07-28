import React from 'react';
import { Icons } from '../data/icons.jsx';
import './SuppliersPage.css';

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

const SuppliersPageContent = ({
  selectedSupplierType,
  handleSupplierTypeChange,
  selectedStatus,
  filterByStatus,
  searchTerms,
  handleSearchChange,
  handleAddNewSupplier,
  getTableHeaders,
  isAddingNew,
  supplierFormData,
  handleFormChange,
  handleSaveSupplier,
  savingSupplier,
  handleCancelEdit,
  filteredData,
  expandedRowId,
  toggleRowExpansion,
  editingSupplier,
  handleEditSupplier,
  getTableRowData,
  getStatusCounts,
  getCurrentSuppliersList
}) => {
  // Use filtered data for status counts to ensure filtering works correctly
  const suppliersList = filteredData?.suppliers || getCurrentSuppliersList() || [];
  const _STATUS_COUNTS = getStatusCounts(suppliersList);

  // Debug logging
  console.log('🔍 SuppliersPageContent - isAddingNew:', isAddingNew);
  console.log('🔍 SuppliersPageContent - selectedSupplierType:', selectedSupplierType);
  console.log('🔍 SuppliersPageContent - supplierFormData:', supplierFormData);
  console.log('🔍 SuppliersPageContent - suppliersList length:', suppliersList.length);
  console.log('🔍 SuppliersPageContent - filteredData.suppliers length:', filteredData?.suppliers?.length);
  console.log('🔍 SuppliersPageContent - _STATUS_COUNTS:', _STATUS_COUNTS);

  return (
    <div className="suppliers-page-content">
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
              <div className="stat-value">{_STATUS_COUNTS.accredited || 0}</div>
            </div>
            <div className="suppliers-stat-card accredited-prepaid">
              <div className="stat-label">
                <span className="status-dot pending"></span>
                ACCREDITED PREPAID
              </div>
              <div className="stat-value">{_STATUS_COUNTS.pending || 0}</div>
            </div>
            <div className="suppliers-stat-card non-accredited">
              <div className="stat-label">
                <span className="status-dot inactive"></span>
                NON-ACCREDITED
              </div>
              <div className="stat-value">{_STATUS_COUNTS.inactive || 0}</div>
            </div>
          </div>
          
          {/* Regional stats */}
          <div className="suppliers-stats-row">
            <div className="suppliers-stat-card ncr-luzon">
              <div className="stat-label">
                <span className="status-dot ncr"></span>
                NCR & LUZON
              </div>
              <div className="stat-value">{_STATUS_COUNTS.ncrLuzon || 0}</div>
            </div>
            <div className="suppliers-stat-card visayas">
              <div className="stat-label">
                <span className="status-dot visayas"></span>
                VISAYAS
              </div>
              <div className="stat-value">{_STATUS_COUNTS.visayas || 0}</div>
            </div>
            <div className="suppliers-stat-card mindanao">
              <div className="stat-label">
                <span className="status-dot mindanao"></span>
                MINDANAO
              </div>
              <div className="stat-value">{_STATUS_COUNTS.mindanao || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <section className="list-of-suppliers-section">
        <h2 className="section-title">LIST OF SUPPLIERS</h2>
        
        {/* Enhanced Filter section */}
        <div className="suppliers-filter-bar">
          <div className="filter-left-section">
            <select className="supplier-type-dropdown-enhanced" value={selectedSupplierType} onChange={handleSupplierTypeChange}>
              <option value="hotels">Hotels</option>
              <option value="land_transfer">Land Transfer</option>
            </select>
            <div className="status-indicators-enhanced">
              <StatusIndicator 
                status="active" 
                label="ACTIVE"
                isActive={selectedStatus === 'active'}
                onClick={() => filterByStatus('active', 'suppliers')}
              />
              <StatusIndicator 
                status="pending" 
                label="PENDING"
                isActive={selectedStatus === 'pending'}
                onClick={() => filterByStatus('pending', 'suppliers')}
              />
              <StatusIndicator 
                status="inactive" 
                label="IN-ACTIVE"
                isActive={selectedStatus === 'inactive'}
                onClick={() => filterByStatus('inactive', 'suppliers')}
              />
            </div>
          </div>
          
          <div className="filter-right-section">
            <div className="date-range-picker">
              {Icons.calendarIcon}
              <span>Jan 1, 2025 - Dec 31, 2025</span>
            </div>
            <div className="search-container-enhanced">
              <input 
                type="text" 
                placeholder="Search suppliers..." 
                value={searchTerms.suppliers}
                onChange={(e) => handleSearchChange('suppliers', e.target.value)}
              />
              <button className="search-btn-enhanced">
                {Icons.searchIcon}
              </button>
            </div>
            <button className="add-supplier-btn" onClick={handleAddNewSupplier}>
              <span className="plus-icon">+</span>
              ADD NEW SUPPLIER
            </button>
          </div>
        </div>

        <div className="suppliers-table-container">
          <table className="suppliers-table">
            <thead>
              <tr>
                {getTableHeaders().map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* New Supplier Entry Row */}
              {isAddingNew && (
                <React.Fragment>
                  <tr className="supplier-row new-supplier-row expanded">
                    <td className="expand-icon">
                      <span>▼</span>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={supplierFormData.location || ''} 
                        onChange={(e) => handleFormChange('location', e.target.value)}
                        placeholder="Enter location"
                        className="inline-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={supplierFormData.companyName || ''} 
                        onChange={(e) => handleFormChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                        className="inline-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="date" 
                        value={supplierFormData.contractedRatesDate || ''}
                        onChange={(e) => handleFormChange('contractedRatesDate', e.target.value)}
                        className="date-input"
                        placeholder="Add Date"
                      />
                    </td>
                    <td>
                      <input 
                        type="date" 
                        value={supplierFormData.corporateRatesDate || ''}
                        onChange={(e) => handleFormChange('corporateRatesDate', e.target.value)}
                        className="date-input"
                        placeholder="Add Date"
                      />
                    </td>
                    <td>
                      <select 
                        value={supplierFormData.accreditation || ''}
                        onChange={(e) => handleFormChange('accreditation', e.target.value)}
                        className="accreditation-dropdown"
                      >
                        <option value="">Select accreditation</option>
                        <option value="hotel_partners">Hotel Partners</option>
                        <option value="accredited">Accredited</option>
                        <option value="non_accredited">Non-Accredited</option>
                        <option value="on_process">On Process</option>
                      </select>
                    </td>
                    <td className="status-column">
                      <div className="account-status-indicator pending"></div>
                    </td>
                  </tr>
                  <tr className="expanded-details">
                    <td colSpan={getTableHeaders().length}>
                      {selectedSupplierType === 'hotels' ? (
                        <div className="hotel-details-form">
                          <div className="hotel-details-header">
                            <h3>NEW HOTEL SUPPLIER</h3>
                            <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button 
                              className="save-btn"
                              onClick={() => handleSaveSupplier(selectedSupplierType)}
                              disabled={savingSupplier}
                                style={{ 
                                  backgroundColor: '#28a745', 
                                  color: 'white', 
                                  padding: '8px 16px', 
                                  border: 'none', 
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                            >
                                {savingSupplier ? 'Creating...' : 'Create Hotel'}
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={handleCancelEdit}
                              disabled={savingSupplier}
                                style={{ 
                                  backgroundColor: '#6c757d', 
                                  color: 'white', 
                                  padding: '8px 16px', 
                                  border: 'none', 
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                          
                          <div className="hotel-details-grid">
                            <div className="hotel-details-section">
                              <div className="contact-details-column">
                                <h4>CONTACT DETAILS</h4>
                            <div className="form-group">
                              <label>COMPANY NAME</label>
                              <input 
                                type="text" 
                                value={supplierFormData.companyName || ''}
                                onChange={(e) => handleFormChange('companyName', e.target.value)}
                                placeholder="Enter company name"
                              />
                            </div>
                            <div className="form-group">
                                  <label>SALE REPRESENTATIVE</label>
                              <input 
                                type="text" 
                                value={supplierFormData.companyRepresentative || ''}
                                onChange={(e) => handleFormChange('companyRepresentative', e.target.value)}
                                placeholder="Enter representative name"
                              />
                            </div>
                            <div className="form-group">
                              <label>CONTACT NUMBER</label>
                              <input 
                                type="text" 
                                value={supplierFormData.contactNumber || ''}
                                onChange={(e) => handleFormChange('contactNumber', e.target.value)}
                                placeholder="Enter contact number"
                              />
                            </div>
                            <div className="form-group">
                              <label>COMPANY ADDRESS</label>
                              <input 
                                type="text" 
                                value={supplierFormData.companyAddress || ''}
                                onChange={(e) => handleFormChange('companyAddress', e.target.value)}
                                placeholder="Enter company address"
                              />
                            </div>
                            <div className="form-group">
                              <label>EMAIL ADDRESS</label>
                              <input 
                                type="email" 
                                value={supplierFormData.email || ''}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                placeholder="Enter email address"
                              />
                            </div>

                          </div>
                              
                              <div className="frontdesk-column">
                                <h4>FRONTDESK</h4>
                            <div className="form-group">
                                  <label>CONTACT NUMBER</label>
                              <input 
                                type="text" 
                                    value={supplierFormData.frontdeskPhone || ''}
                                    onChange={(e) => handleFormChange('frontdeskPhone', e.target.value)}
                                    placeholder="Enter frontdesk number"
                              />
                            </div>
                            <div className="form-group">
                                  <label>EMAIL ADDRESS</label>
                              <input 
                                    type="email" 
                                    value={supplierFormData.frontdeskEmail || ''}
                                    onChange={(e) => handleFormChange('frontdeskEmail', e.target.value)}
                                    placeholder="Enter frontdesk email"
                              />
                            </div>
                            </div>
                              
                              <div className="hotel-info-column">
                                <div className="form-group">
                                  <label>TYPE OF BREAKFAST</label>
                                  <select 
                                    value={supplierFormData.breakfastType || ''}
                                    onChange={(e) => handleFormChange('breakfastType', e.target.value)}
                                  >
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
                                    value={supplierFormData.roomQuantity || ''}
                                    onChange={(e) => handleFormChange('roomQuantity', e.target.value)}
                                    placeholder="Enter quantity" 
                                  />
                                </div>
                                <div className="form-group">
                                  <label>SECURITY DEPOSIT</label>
                                  <input 
                                    type="text" 
                                    value={supplierFormData.securityDeposit || ''}
                                    onChange={(e) => handleFormChange('securityDeposit', e.target.value)}
                                    placeholder="Enter security deposit"
                                  />
                                </div>
                                <div className="form-group">
                                  <label>CONTRACTED RATES DATE</label>
                                  <input 
                                    type="date" 
                                    value={supplierFormData.contractedRatesDate || ''}
                                    onChange={(e) => handleFormChange('contractedRatesDate', e.target.value)}
                                    placeholder="Select date"
                                  />
                                </div>
                                <div className="form-group">
                                  <label>CORPORATE RATES DATE</label>
                                  <input 
                                    type="date" 
                                    value={supplierFormData.corporateRatesDate || ''}
                                    onChange={(e) => handleFormChange('corporateRatesDate', e.target.value)}
                                    placeholder="Select date"
                                  />
                                </div>
                                <div className="form-group">
                                  <label>ACCREDITATION</label>
                                  <select 
                                    value={supplierFormData.accreditation || ''}
                                    onChange={(e) => handleFormChange('accreditation', e.target.value)}
                                  >
                                    <option value="">Select accreditation</option>
                                    <option value="hotel_partners">Hotel Partners</option>
                                    <option value="accredited">Accredited</option>
                                    <option value="non_accredited">Non-Accredited</option>
                                    <option value="on_process">On Process</option>
                                  </select>
                                </div>
                          </div>
                        </div>

                            <div className="payment-remarks-section">
                              <div className="payment-terms-column">
                            <h4>PAYMENT TERMS</h4>
                              <div className="form-group">
                                <label>MODE OF PAYMENT</label>
                                <select 
                                    value={supplierFormData.paymentMode || ''}
                                    onChange={(e) => handleFormChange('paymentMode', e.target.value)}
                                >
                                  <option value="">Select payment mode</option>
                                  <option value="cash">Cash</option>
                                  <option value="check">Check</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="credit_card">Credit Card</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>CREDIT TERMS</label>
                                <select 
                                  value={supplierFormData.creditTerms || ''}
                                  onChange={(e) => handleFormChange('creditTerms', e.target.value)}
                                >
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
                                value={supplierFormData.remarks || ''}
                                onChange={(e) => handleFormChange('remarks', e.target.value)}
                                placeholder="Enter remarks"
                                    rows="4"
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
                                        value={supplierFormData.rates?.standard?.publish || ''}
                                        onChange={(e) => handleFormChange('rates.standard.publish', e.target.value)}
                                  />
                                    </td>
                                    <td>
                                  <input 
                                    type="text" 
                                    placeholder="Php 0.00"
                                        value={supplierFormData.rates?.standard?.contracted || ''}
                                        onChange={(e) => handleFormChange('rates.standard.contracted', e.target.value)}
                                  />
                                    </td>
                                    <td>
                                  <input 
                                    type="text" 
                                    placeholder="Php 0.00"
                                        value={supplierFormData.rates?.standard?.corporate || ''}
                                        onChange={(e) => handleFormChange('rates.standard.corporate', e.target.value)}
                                  />
                                    </td>
                                    <td>
                                  <input 
                                    type="text" 
                                    placeholder="Php 0.00"
                                        value={supplierFormData.rates?.standard?.selling || ''}
                                        onChange={(e) => handleFormChange('rates.standard.selling', e.target.value)}
                                  />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Deluxe Room</td>
                                    <td>
                                  <input 
                                    type="text" 
                                    placeholder="Php 0.00"
                                        value={supplierFormData.rates?.deluxe?.publish || ''}
                                        onChange={(e) => handleFormChange('rates.deluxe.publish', e.target.value)}
                                  />
                                    </td>
                                    <td>
                                  <input 
                                    type="text" 
                                    placeholder="Php 0.00"
                                        value={supplierFormData.rates?.deluxe?.contracted || ''}
                                        onChange={(e) => handleFormChange('rates.deluxe.contracted', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                  <input 
                                    type="text" 
                                    placeholder="Php 0.00"
                                        value={supplierFormData.rates?.deluxe?.corporate || ''}
                                        onChange={(e) => handleFormChange('rates.deluxe.corporate', e.target.value)}
                                  />
                                    </td>
                                    <td>
                                  <input 
                                    type="text" 
                                    placeholder="Php 0.00"
                                        value={supplierFormData.rates?.deluxe?.selling || ''}
                                        onChange={(e) => handleFormChange('rates.deluxe.selling', e.target.value)}
                                  />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Suite</td>
                                    <td>
                                  <input 
                                    type="text" 
                                    placeholder="Php 0.00"
                                        value={supplierFormData.rates?.suite?.publish || ''}
                                        onChange={(e) => handleFormChange('rates.suite.publish', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="text" 
                                        placeholder="Php 0.00"
                                        value={supplierFormData.rates?.suite?.contracted || ''}
                                        onChange={(e) => handleFormChange('rates.suite.contracted', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="text" 
                                        placeholder="Php 0.00"
                                        value={supplierFormData.rates?.suite?.corporate || ''}
                                        onChange={(e) => handleFormChange('rates.suite.corporate', e.target.value)}
                                      />
                                    </td>
                                    <td>
                                      <input 
                                        type="text" 
                                        placeholder="Php 0.00"
                                        value={supplierFormData.rates?.suite?.selling || ''}
                                        onChange={(e) => handleFormChange('rates.suite.selling', e.target.value)}
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
                            <h3>NEW SUPPLIER DETAILS</h3>
                            <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                              <button 
                                className="save-btn"
                                onClick={handleSaveSupplier}
                                disabled={savingSupplier}
                                style={{ 
                                  backgroundColor: '#28a745', 
                                  color: 'white', 
                                  padding: '8px 16px', 
                                  border: 'none', 
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                {savingSupplier ? 'Creating...' : 'Create Supplier'}
                              </button>
                              <button 
                                className="cancel-btn"
                                onClick={handleCancelEdit}
                                disabled={savingSupplier}
                                style={{ 
                                  backgroundColor: '#6c757d', 
                                  color: 'white', 
                                  padding: '8px 16px', 
                                  border: 'none', 
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                Cancel
                              </button>
                          </div>
                        </div>

                          <div className="contact-details-grid">
                            <div className="contact-details-section">
                              <div className="form-row">
                                <div className="form-group">
                                  <label>COMPANY NAME</label>
                                <input 
                                    type="text" 
                                    value={supplierFormData.companyName || ''}
                                    onChange={(e) => handleFormChange('companyName', e.target.value)}
                                    placeholder="Enter company name"
                                  />
                              </div>
                                <div className="form-group">
                                  <label>COMPANY REPRESENTATIVE</label>
                                  <input 
                                    type="text" 
                                    value={supplierFormData.companyRepresentative || ''}
                                    onChange={(e) => handleFormChange('companyRepresentative', e.target.value)}
                                    placeholder="Enter representative name"
                                  />
                            </div>
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label>CONTACT NUMBER</label>
                              <input 
                                type="text" 
                                    value={supplierFormData.contactNumber || ''}
                                    onChange={(e) => handleFormChange('contactNumber', e.target.value)}
                                    placeholder="Enter contact number"
                              />
                            </div>
                                <div className="form-group">
                                  <label>EMAIL ADDRESS</label>
                                <input 
                                    type="email" 
                                    value={supplierFormData.email || ''}
                                    onChange={(e) => handleFormChange('email', e.target.value)}
                                    placeholder="Enter email address"
                                />
                                </div>
                              </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label>DESIGNATION</label>
                                <input 
                                    type="text" 
                                    value={supplierFormData.designation || ''}
                                    onChange={(e) => handleFormChange('designation', e.target.value)}
                                    placeholder="Enter designation"
                                />
                              </div>
                                <div className="form-group">
                                  <label>TEL NUMBER</label>
                                  <input 
                                    type="text" 
                                    value={supplierFormData.telNumber || ''}
                                    onChange={(e) => handleFormChange('telNumber', e.target.value)}
                                    placeholder="Enter telephone number"
                                  />
                            </div>
                          </div>
                              
                              <div className="form-row">
                                <div className="form-group">
                                  <label>ADDRESS</label>
                                  <input 
                                    type="text" 
                                    value={supplierFormData.companyAddress || ''}
                                    onChange={(e) => handleFormChange('companyAddress', e.target.value)}
                                    placeholder="Enter company address"
                                  />
                        </div>
                      </div>
                            </div>
                            
                            <div className="payment-terms-section">
                              <h4>PAYMENT TERMS</h4>
                              <div className="form-row">
                                <div className="form-group">
                                  <label>MODE OF PAYMENT</label>
                                  <select 
                                    value={supplierFormData.paymentMode || ''}
                                    onChange={(e) => handleFormChange('paymentMode', e.target.value)}
                                  >
                                    <option value="">Select payment mode</option>
                                    <option value="cash">Cash</option>
                                    <option value="check">Check</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="credit_card">Credit Card</option>
                                  </select>
                                </div>
                                                                 <div className="form-group">
                                   <label>CREDIT TERMS</label>
                                   <select 
                                     value={supplierFormData.creditTerms || ''}
                                     onChange={(e) => handleFormChange('creditTerms', e.target.value)}
                                   >
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
                                  value={supplierFormData.remarks || ''}
                                  onChange={(e) => handleFormChange('remarks', e.target.value)}
                                  placeholder="Enter remarks"
                                  rows="3"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              )}
              
              {/* Existing Suppliers */}
              {(filteredData?.suppliers || []).map((supplier) => (
                <React.Fragment key={supplier.id}>
                  <tr 
                    className={`supplier-row ${expandedRowId === supplier.id ? 'expanded' : ''}`}
                    onClick={() => toggleRowExpansion(supplier.id)}
                  >
                    <td className="expand-icon">
                      <span>{expandedRowId === supplier.id ? '▼' : '▶'}</span>
                    </td>
                    {getTableRowData(supplier).map((data, index) => {
                      // Check if this is a rates column for hotels and we're editing
                      if (selectedSupplierType === 'hotels' && editingSupplier === supplier.id) {
                        if (index === 2) { // Contracted Rates column
                          return (
                            <td key={index}>
                              <input 
                                type="date" 
                                value={supplierFormData.contractedRatesDate || ''}
                                onChange={(e) => handleFormChange('contractedRatesDate', e.target.value)}
                                className="date-input"
                              />
                            </td>
                          );
                        } else if (index === 3) { // Corporate Rates column
                          return (
                            <td key={index}>
                              <input 
                                type="date" 
                                value={supplierFormData.corporateRatesDate || ''}
                                onChange={(e) => handleFormChange('corporateRatesDate', e.target.value)}
                                className="date-input"
                              />
                            </td>
                          );
                        } else if (index === 4) { // Accreditation column
                          return (
                            <td key={index}>
                              <select 
                                value={supplierFormData.accreditation || ''}
                                onChange={(e) => handleFormChange('accreditation', e.target.value)}
                                className="accreditation-dropdown"
                              >
                                <option value="">Select accreditation</option>
                                <option value="hotel_partners">Hotel Partners</option>
                                <option value="accredited">Accredited</option>
                                <option value="non_accredited">Non-Accredited</option>
                                <option value="on_process">On Process</option>
                              </select>
                            </td>
                          );
                        }
                      }
                      return <td key={index}>{data}</td>;
                    })}
                    <td className="status-column">
                      <div className={`account-status-indicator ${supplier.accountStatus || 'pending'}`}></div>
                    </td>
                  </tr>
                  {expandedRowId === supplier.id && (
                    <tr className="expanded-details">
                      <td colSpan={getTableHeaders().length}>
                        {selectedSupplierType === 'hotels' ? (
                          <div className="hotel-details-form">
                            <div className="hotel-details-header">
                              <h3>HOTEL DETAILS</h3>
                            <div className="form-actions">
                              {editingSupplier === supplier.id ? (
                                <>
                                  <button 
                                    className="save-btn"
                                    onClick={handleSaveSupplier}
                                    disabled={savingSupplier}
                                  >
                                    {savingSupplier ? 'Saving...' : 'Save'}
                                  </button>
                                  <button 
                                    className="cancel-btn"
                                    onClick={handleCancelEdit}
                                    disabled={savingSupplier}
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button 
                                  className="edit-btn"
                                  onClick={() => handleEditSupplier(supplier)}
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </div>
                            
                            <div className="hotel-details-grid">
                              <div className="hotel-details-section">
                                <div className="contact-details-column">
                                  <h4>CONTACT DETAILS</h4>
                              <div className="form-group">
                                    <label>SALE REPRESENTATIVE</label>
                                <input 
                                  type="text" 
                                  value={editingSupplier === supplier.id ? supplierFormData.companyRepresentative || '' : supplier.representative || ''}
                                  onChange={(e) => handleFormChange('companyRepresentative', e.target.value)}
                                  disabled={editingSupplier !== supplier.id}
                                  placeholder="Enter representative name"
                                />
                              </div>
                              <div className="form-group">
                                <label>CONTACT NUMBER</label>
                                <input 
                                  type="text" 
                                  value={editingSupplier === supplier.id ? supplierFormData.contactNumber || '' : supplier.company?.phone || ''}
                                  onChange={(e) => handleFormChange('contactNumber', e.target.value)}
                                  disabled={editingSupplier !== supplier.id}
                                  placeholder="Enter contact number"
                                />
                              </div>
                              <div className="form-group">
                                <label>EMAIL ADDRESS</label>
                                <input 
                                  type="email" 
                                  value={editingSupplier === supplier.id ? supplierFormData.email || '' : supplier.company?.email || ''}
                                  onChange={(e) => handleFormChange('email', e.target.value)}
                                  disabled={editingSupplier !== supplier.id}
                                  placeholder="Enter email address"
                                />
                              </div>
                            </div>
                                
                                <div className="frontdesk-column">
                                  <h4>FRONTDESK</h4>
                              <div className="form-group">
                                    <label>CONTACT NUMBER</label>
                                <input 
                                  type="text" 
                                      value={editingSupplier === supplier.id ? supplierFormData.frontdeskPhone || '' : supplier.frontdeskPhone || ''}
                                      onChange={(e) => handleFormChange('frontdeskPhone', e.target.value)}
                                  disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter frontdesk number"
                                />
                              </div>
                              <div className="form-group">
                                    <label>EMAIL ADDRESS</label>
                                <input 
                                      type="email" 
                                      value={editingSupplier === supplier.id ? supplierFormData.frontdeskEmail || '' : supplier.frontdeskEmail || ''}
                                      onChange={(e) => handleFormChange('frontdeskEmail', e.target.value)}
                                  disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter frontdesk email"
                                />
                              </div>
                              </div>
                                
                                <div className="hotel-info-column">
                                  <div className="form-group">
                                    <label>TYPE OF BREAKFAST</label>
                                    <select 
                                      value={editingSupplier === supplier.id ? supplierFormData.breakfastType || '' : supplier.breakfastType || ''}
                                      onChange={(e) => handleFormChange('breakfastType', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                    >
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
                                      value={editingSupplier === supplier.id ? supplierFormData.roomQuantity || '' : supplier.roomQuantity || ''}
                                      onChange={(e) => handleFormChange('roomQuantity', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter quantity" 
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>SECURITY DEPOSIT</label>
                                    <input 
                                      type="text" 
                                      value={editingSupplier === supplier.id ? supplierFormData.securityDeposit || '' : supplier.securityDeposit || ''}
                                      onChange={(e) => handleFormChange('securityDeposit', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter security deposit"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="payment-remarks-section">
                                <div className="payment-terms-column">
                                  <h4>PAYMENT TERMS</h4>
                                  <div className="form-group">
                                    <label>MODE OF PAYMENT</label>
                                    <select 
                                      value={editingSupplier === supplier.id ? supplierFormData.paymentMode || '' : supplier.modeOfPayment || ''}
                                      onChange={(e) => handleFormChange('paymentMode', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                    >
                                      <option value="">Select payment mode</option>
                                      <option value="cash">Cash</option>
                                      <option value="check">Check</option>
                                      <option value="bank_transfer">Bank Transfer</option>
                                      <option value="credit_card">Credit Card</option>
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <label>CREDIT TERMS</label>
                                    <select 
                                      value={editingSupplier === supplier.id ? supplierFormData.creditTerms || '' : supplier.creditTerms || ''}
                                      onChange={(e) => handleFormChange('creditTerms', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                    >
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
                                      value={editingSupplier === supplier.id ? supplierFormData.remarks || '' : supplier.remarks || ''}
                                      onChange={(e) => handleFormChange('remarks', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter remarks"
                                      rows="4"
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
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.standard?.publish || '' : ''}
                                          onChange={(e) => handleFormChange('rates.standard.publish', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.standard?.contracted || '' : ''}
                                          onChange={(e) => handleFormChange('rates.standard.contracted', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.standard?.corporate || '' : ''}
                                          onChange={(e) => handleFormChange('rates.standard.corporate', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.standard?.selling || '' : ''}
                                          onChange={(e) => handleFormChange('rates.standard.selling', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Deluxe Room</td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.deluxe?.publish || '' : ''}
                                          onChange={(e) => handleFormChange('rates.deluxe.publish', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.deluxe?.contracted || '' : ''}
                                          onChange={(e) => handleFormChange('rates.deluxe.contracted', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.deluxe?.corporate || '' : ''}
                                          onChange={(e) => handleFormChange('rates.deluxe.corporate', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.deluxe?.selling || '' : ''}
                                          onChange={(e) => handleFormChange('rates.deluxe.selling', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                    </tr>
                                    <tr>
                                      <td>Suite</td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.suite?.publish || '' : ''}
                                          onChange={(e) => handleFormChange('rates.suite.publish', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.suite?.contracted || '' : ''}
                                          onChange={(e) => handleFormChange('rates.suite.contracted', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.suite?.corporate || '' : ''}
                                          onChange={(e) => handleFormChange('rates.suite.corporate', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
                                        />
                                      </td>
                                      <td>
                                        <input 
                                          type="text" 
                                          placeholder="Php 0.00"
                                          value={editingSupplier === supplier.id ? supplierFormData.rates?.suite?.selling || '' : ''}
                                          onChange={(e) => handleFormChange('rates.suite.selling', e.target.value)}
                                          disabled={editingSupplier !== supplier.id}
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
                              <div className="form-actions">
                                {editingSupplier === supplier.id ? (
                                  <>
                                    <button 
                                      className="save-btn"
                                      onClick={handleSaveSupplier}
                                      disabled={savingSupplier}
                                    >
                                      {savingSupplier ? 'Saving...' : 'Save'}
                                    </button>
                                    <button 
                                      className="cancel-btn"
                                      onClick={handleCancelEdit}
                                      disabled={savingSupplier}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button 
                                    className="edit-btn"
                                    onClick={() => handleEditSupplier(supplier)}
                                  >
                                    Edit
                                  </button>
                              )}
                            </div>
                          </div>

                            <div className="contact-details-grid">
                              <div className="contact-details-section">
                                <div className="form-row">
                                  <div className="form-group">
                                    <label>COMPANY REPRESENTATIVE</label>
                                    <input 
                                      type="text" 
                                      value={editingSupplier === supplier.id ? supplierFormData.companyRepresentative || '' : supplier.representative || ''}
                                      onChange={(e) => handleFormChange('companyRepresentative', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter representative name"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>DESIGNATION</label>
                                    <input 
                                      type="text" 
                                      value={editingSupplier === supplier.id ? supplierFormData.designation || '' : supplier.designation || ''}
                                      onChange={(e) => handleFormChange('designation', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter designation"
                                    />
                                  </div>
                                </div>
                                
                                <div className="form-row">
                                  <div className="form-group">
                                    <label>CONTACT NUMBER</label>
                                    <input 
                                      type="text" 
                                      value={editingSupplier === supplier.id ? supplierFormData.contactNumber || '' : supplier.company?.phone || ''}
                                      onChange={(e) => handleFormChange('contactNumber', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter contact number"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>EMAIL ADDRESS</label>
                                    <input 
                                      type="email" 
                                      value={editingSupplier === supplier.id ? supplierFormData.email || '' : supplier.company?.email || ''}
                                      onChange={(e) => handleFormChange('email', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter email address"
                                    />
                                  </div>
                                </div>
                                
                                <div className="form-row">
                                  <div className="form-group">
                                    <label>TEL NUMBER</label>
                                    <input 
                                      type="text" 
                                      value={editingSupplier === supplier.id ? supplierFormData.telNumber || '' : supplier.telNumber || ''}
                                      onChange={(e) => handleFormChange('telNumber', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter telephone number"
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>COMPANY ADDRESS</label>
                                    <input 
                                      type="text" 
                                      value={editingSupplier === supplier.id ? supplierFormData.companyAddress || '' : supplier.company?.address || ''}
                                      onChange={(e) => handleFormChange('companyAddress', e.target.value)}
                                      disabled={editingSupplier !== supplier.id}
                                      placeholder="Enter company address"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                            <div className="payment-terms-section">
                              <h4>PAYMENT TERMS</h4>
                                <div className="form-row">
                                <div className="form-group">
                                  <label>MODE OF PAYMENT</label>
                                  <select 
                                      value={editingSupplier === supplier.id ? supplierFormData.paymentMode || '' : supplier.modeOfPayment || ''}
                                      onChange={(e) => handleFormChange('paymentMode', e.target.value)}
                                    disabled={editingSupplier !== supplier.id}
                                  >
                                    <option value="">Select payment mode</option>
                                    <option value="cash">Cash</option>
                                    <option value="check">Check</option>
                                      <option value="bank_transfer">Bank Transfer</option>
                                      <option value="credit_card">Credit Card</option>
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label>CREDIT TERMS</label>
                                  <select 
                                    value={editingSupplier === supplier.id ? supplierFormData.creditTerms || '' : supplier.creditTerms || ''}
                                    onChange={(e) => handleFormChange('creditTerms', e.target.value)}
                                    disabled={editingSupplier !== supplier.id}
                                  >
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
                                  value={editingSupplier === supplier.id ? supplierFormData.remarks || '' : supplier.remarks || ''}
                                  onChange={(e) => handleFormChange('remarks', e.target.value)}
                                  disabled={editingSupplier !== supplier.id}
                                  placeholder="Enter remarks"
                                    rows="3"
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
              ))}
              
              {/* No data message */}
              {(!filteredData?.suppliers || filteredData.suppliers.length === 0) && (
                <tr>
                  <td colSpan={getTableHeaders().length} className="no-data-message">
                    <div className="no-data-content">
                      <span>No suppliers data available</span>
                      {selectedStatus && (
                        <span className="filter-info"> (filtered by: {selectedStatus})</span>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default SuppliersPageContent;
