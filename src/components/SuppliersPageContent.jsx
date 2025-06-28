import React from 'react';
import { Icons } from '../data/icons.jsx';
import { suppliersStats } from '../data/sampleData';

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
  const _STATUS_COUNTS = getStatusCounts(getCurrentSuppliersList());

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
              <div className="stat-value">{suppliersStats.accredited.value}</div>
            </div>
            <div className="suppliers-stat-card accredited-prepaid">
              <div className="stat-label">
                <span className="status-dot pending"></span>
                ACCREDITED PREPAID
              </div>
              <div className="stat-value">{suppliersStats.accreditedPrepaid.value}</div>
            </div>
            <div className="suppliers-stat-card non-accredited">
              <div className="stat-label">
                <span className="status-dot inactive"></span>
                NON-ACCREDITED
              </div>
              <div className="stat-value">{suppliersStats.nonAccredited.value}</div>
            </div>
          </div>
          
          {/* Regional stats */}
          <div className="suppliers-stats-row">
            <div className="suppliers-stat-card ncr-luzon">
              <div className="stat-label">
                <span className="status-dot ncr"></span>
                NCR & LUZON
              </div>
              <div className="stat-value">{suppliersStats.ncrLuzon.value}</div>
            </div>
            <div className="suppliers-stat-card visayas">
              <div className="stat-label">
                <span className="status-dot visayas"></span>
                VISAYAS
              </div>
              <div className="stat-value">{suppliersStats.visayas.value}</div>
            </div>
            <div className="suppliers-stat-card mindanao">
              <div className="stat-label">
                <span className="status-dot mindanao"></span>
                MINDANAO
              </div>
              <div className="stat-value">{suppliersStats.mindanao.value}</div>
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
              <option value="airlines">Airlines</option>
              <option value="transfer">Transfer</option>
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
                        value={supplierFormData.companyName || ''} 
                        onChange={(e) => handleFormChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                        className="inline-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={supplierFormData.companyAddress || ''} 
                        onChange={(e) => handleFormChange('companyAddress', e.target.value)}
                        placeholder="Enter address"
                        className="inline-input"
                      />
                    </td>
                    <td>N/A</td>
                    <td>N/A</td>
                    <td>New Entry</td>
                    <td className="status-column">
                      <div className="account-status-indicator pending"></div>
                    </td>
                  </tr>
                  <tr className="expanded-details">
                    <td colSpan={getTableHeaders().length}>
                      <div className="contact-details-form">
                        <div className="contact-details-header">
                          <h3>NEW SUPPLIER DETAILS</h3>
                          <div className="form-actions">
                            <button 
                              className="save-btn"
                              onClick={handleSaveSupplier}
                              disabled={savingSupplier}
                            >
                              {savingSupplier ? 'Creating...' : 'Create Supplier'}
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={handleCancelEdit}
                              disabled={savingSupplier}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                        <div className="contact-form-grid">
                          <div className="contact-form-column">
                            <div className="form-group">
                              <label>COMPANY REPRESENTATIVE</label>
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
                              <label>EMAIL ADDRESS</label>
                              <input 
                                type="email" 
                                value={supplierFormData.email || ''}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                placeholder="Enter email address"
                              />
                            </div>
                          </div>
                          <div className="contact-form-column">
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
                            <div className="form-group">
                              <label>COMPANY ADDRESS</label>
                              <input 
                                type="text" 
                                value={supplierFormData.companyAddress || ''}
                                onChange={(e) => handleFormChange('companyAddress', e.target.value)}
                                placeholder="Enter company address"
                              />
                            </div>
                          </div>
                          <div className="contact-form-column">
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
                          </div>
                        </div>

                        <div className="bottom-form-section">
                          <div className="payment-terms-section">
                            <h4>PAYMENT TERMS</h4>
                            <div className="payment-form-row">
                              <div className="form-group">
                                <label>MODE OF PAYMENT</label>
                                <select 
                                  value={supplierFormData.modeOfPayment || ''}
                                  onChange={(e) => handleFormChange('modeOfPayment', e.target.value)}
                                >
                                  <option value="">Select payment mode</option>
                                  <option value="cash">Cash</option>
                                  <option value="credit_card">Credit Card</option>
                                  <option value="bank_transfer">Bank Transfer</option>
                                  <option value="check">Check</option>
                                  <option value="loa">LOA (Letter of Authorization)</option>
                                  <option value="gclink">GCLINK</option>
                                  <option value="company_account">Company Account</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>CREDIT TERMS</label>
                                <select 
                                  value={supplierFormData.creditTerms || ''}
                                  onChange={(e) => handleFormChange('creditTerms', e.target.value)}
                                >
                                  <option value="">Select credit terms</option>
                                  <option value="cod">Cash on Delivery</option>
                                  <option value="net_15">Net 15 days</option>
                                  <option value="net_30">Net 30 days</option>
                                  <option value="net_45">Net 45 days</option>
                                  <option value="net_60">Net 60 days</option>
                                  <option value="advance">Advance Payment</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="remarks-section">
                            <h4>REMARKS</h4>
                            <div className="form-group">
                              <textarea 
                                rows="4"
                                value={supplierFormData.remarks || ''}
                                onChange={(e) => handleFormChange('remarks', e.target.value)}
                                placeholder="Enter remarks"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              )}
              
              {/* Existing Suppliers */}
              {filteredData.suppliers.map((supplier) => (
                <React.Fragment key={supplier.id}>
                  <tr 
                    className={`supplier-row ${expandedRowId === supplier.id ? 'expanded' : ''}`}
                    onClick={() => toggleRowExpansion(supplier.id)}
                  >
                    <td className="expand-icon">
                      <span>{expandedRowId === supplier.id ? '▼' : '▶'}</span>
                    </td>
                    {getTableRowData(supplier).map((data, index) => (
                      <td key={index}>{data}</td>
                    ))}
                    <td className="status-column">
                      <div className={`account-status-indicator ${supplier.status}`}></div>
                    </td>
                  </tr>
                  {expandedRowId === supplier.id && (
                    <tr className="expanded-details">
                      <td colSpan={getTableHeaders().length}>
                        <div className="contact-details-form">
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
                          <div className="contact-form-grid">
                            <div className="contact-form-column">
                              <div className="form-group">
                                <label>COMPANY REPRESENTATIVE</label>
                                <input 
                                  type="text" 
                                  value={editingSupplier === supplier.id ? supplierFormData.companyRepresentative || '' : supplier.company?.representative || ''}
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
                            <div className="contact-form-column">
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
                            <div className="contact-form-column">
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
                            </div>
                          </div>

                          <div className="bottom-form-section">
                            <div className="payment-terms-section">
                              <h4>PAYMENT TERMS</h4>
                              <div className="payment-form-row">
                                <div className="form-group">
                                  <label>MODE OF PAYMENT</label>
                                  <select 
                                    value={editingSupplier === supplier.id ? supplierFormData.modeOfPayment || '' : supplier.modeOfPayment || ''}
                                    onChange={(e) => handleFormChange('modeOfPayment', e.target.value)}
                                    disabled={editingSupplier !== supplier.id}
                                  >
                                    <option value="">Select payment mode</option>
                                    <option value="cash">Cash</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="check">Check</option>
                                    <option value="loa">LOA (Letter of Authorization)</option>
                                    <option value="gclink">GCLINK</option>
                                    <option value="company_account">Company Account</option>
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
                                    <option value="cod">Cash on Delivery</option>
                                    <option value="net_15">Net 15 days</option>
                                    <option value="net_30">Net 30 days</option>
                                    <option value="net_45">Net 45 days</option>
                                    <option value="net_60">Net 60 days</option>
                                    <option value="advance">Advance Payment</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="remarks-section">
                              <h4>REMARKS</h4>
                              <div className="form-group">
                                <textarea 
                                  rows="4"
                                  value={editingSupplier === supplier.id ? supplierFormData.remarks || '' : supplier.remarks || ''}
                                  onChange={(e) => handleFormChange('remarks', e.target.value)}
                                  disabled={editingSupplier !== supplier.id}
                                  placeholder="Enter remarks"
                                />
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
      </section>
    </div>
  );
};

export default SuppliersPageContent;
