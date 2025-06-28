import React from 'react';

const DashboardSuppliersTable = ({ expandedDashboardSupplier, toggleDashboardSupplierExpansion }) => {
  return (
    <div className="suppliers-list-section">
      <div className="suppliers-header">
        <h2>LIST OF SUPPLIERS</h2>
        <div className="suppliers-controls">
          <div className="date-range-picker">
            <span>25/04/2025 - 24/05/2025</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5H7z"/>
            </svg>
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
          <select value="Land Transfer">
            <option>Land Transfer</option>
            <option>Air Transfer</option>
            <option>Sea Transfer</option>
          </select>
        </div>
        <div className="status-indicators">
          <div className="status-indicator active">
            <div className="status-dot active"></div>
            <span>Active</span>
          </div>
          <div className="status-indicator pending">
            <div className="status-dot pending"></div>
            <span>Pending</span>
          </div>
          <div className="status-indicator inactive">
            <div className="status-dot inactive"></div>
            <span>In-active</span>
          </div>
        </div>
        <div className="search-container">
          <input type="text" placeholder="Search suppliers..." />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </div>
      </div>
      
      <div className="suppliers-table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th></th>
              <th>Location</th>
              <th>Company Name</th>
              <th>Company Address</th>
              <th>Tariff Rate</th>
              <th>Validity</th>
              <th>Remarks</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="supplier-row" onClick={() => toggleDashboardSupplierExpansion('supplier-1')}>
              <td className="expand-icon">{expandedDashboardSupplier === 'supplier-1' ? 'V' : '>'}</td>
              <td>QUEZON CITY</td>
              <td>RONWAY CAR & TRAVEL INC.</td>
              <td>Regalia Park Tower C.</td>
              <td>N/A</td>
              <td>Dec. 31, 2026</td>
              <td>Accredited</td>
              <td><div className="status-dot active"></div></td>
            </tr>
            {expandedDashboardSupplier === 'supplier-1' && (
              <tr className="contact-details-row">
                <td colSpan="8">
                  <div className="contact-details-section">
                    <h3>CONTACT DETAILS</h3>
                    <div className="contact-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>COMPANY REPRESENTATIVE</label>
                          <input type="text" defaultValue="John Doe" />
                        </div>
                        <div className="form-group">
                          <label>CONTACT NUMBER</label>
                          <input type="text" defaultValue="0917-123-4567" />
                        </div>
                        <div className="form-group">
                          <label>TEL. NUMBER</label>
                          <input type="text" defaultValue="(02) 8123-4567" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>DESIGNATION</label>
                          <input type="text" defaultValue="Operations Manager" />
                        </div>
                        <div className="form-group">
                          <label>EMAIL ADDRESS</label>
                          <input type="email" defaultValue="john.doe@ronway.com" />
                        </div>
                      </div>
                      <div className="payment-section">
                        <h4>PAYMENT TERMS</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>MODE OF PAYMENT</label>
                            <input type="text" defaultValue="Bank Transfer" />
                          </div>
                          <div className="form-group">
                            <label>CREDIT TERMS</label>
                            <input type="text" defaultValue="Net 30 days" />
                          </div>
                        </div>
                      </div>
                      <div className="remarks-section">
                        <label>REMARKS</label>
                        <textarea defaultValue="Preferred supplier for Quezon City routes. Excellent service record."></textarea>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            
            <tr className="supplier-row" onClick={() => toggleDashboardSupplierExpansion('supplier-2')}>
              <td className="expand-icon">{expandedDashboardSupplier === 'supplier-2' ? 'V' : '>'}</td>
              <td>CEBU CITY</td>
              <td>FAST TRANSIT CORP.</td>
              <td>IT Park, Lahug</td>
              <td>₱2,500/day</td>
              <td>Mar. 15, 2026</td>
              <td>Contracted</td>
              <td><div className="status-dot pending"></div></td>
            </tr>
            {expandedDashboardSupplier === 'supplier-2' && (
              <tr className="contact-details-row">
                <td colSpan="8">
                  <div className="contact-details-section">
                    <h3>CONTACT DETAILS</h3>
                    <div className="contact-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>COMPANY REPRESENTATIVE</label>
                          <input type="text" defaultValue="Maria Santos" />
                        </div>
                        <div className="form-group">
                          <label>CONTACT NUMBER</label>
                          <input type="text" defaultValue="0932-456-7890" />
                        </div>
                        <div className="form-group">
                          <label>TEL. NUMBER</label>
                          <input type="text" defaultValue="(032) 234-5678" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>DESIGNATION</label>
                          <input type="text" defaultValue="Fleet Manager" />
                        </div>
                        <div className="form-group">
                          <label>EMAIL ADDRESS</label>
                          <input type="email" defaultValue="maria.santos@fasttransit.com" />
                        </div>
                      </div>
                      <div className="payment-section">
                        <h4>PAYMENT TERMS</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>MODE OF PAYMENT</label>
                            <input type="text" defaultValue="Check Payment" />
                          </div>
                          <div className="form-group">
                            <label>CREDIT TERMS</label>
                            <input type="text" defaultValue="Net 15 days" />
                          </div>
                        </div>
                      </div>
                      <div className="remarks-section">
                        <label>REMARKS</label>
                        <textarea defaultValue="Reliable partner for Cebu operations. Pending contract renewal."></textarea>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            
            <tr className="supplier-row" onClick={() => toggleDashboardSupplierExpansion('supplier-3')}>
              <td className="expand-icon">{expandedDashboardSupplier === 'supplier-3' ? 'V' : '>'}</td>
              <td>DAVAO CITY</td>
              <td>MINDANAO EXPRESS</td>
              <td>Poblacion District</td>
              <td>₱3,000/day</td>
              <td>Jun. 30, 2026</td>
              <td>Active</td>
              <td><div className="status-dot active"></div></td>
            </tr>
            {expandedDashboardSupplier === 'supplier-3' && (
              <tr className="contact-details-row">
                <td colSpan="8">
                  <div className="contact-details-section">
                    <h3>CONTACT DETAILS</h3>
                    <div className="contact-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>COMPANY REPRESENTATIVE</label>
                          <input type="text" defaultValue="Roberto Cruz" />
                        </div>
                        <div className="form-group">
                          <label>CONTACT NUMBER</label>
                          <input type="text" defaultValue="0945-678-9012" />
                        </div>
                        <div className="form-group">
                          <label>TEL. NUMBER</label>
                          <input type="text" defaultValue="(082) 345-6789" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>DESIGNATION</label>
                          <input type="text" defaultValue="General Manager" />
                        </div>
                        <div className="form-group">
                          <label>EMAIL ADDRESS</label>
                          <input type="email" defaultValue="roberto.cruz@mindanaoexpress.com" />
                        </div>
                      </div>
                      <div className="payment-section">
                        <h4>PAYMENT TERMS</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>MODE OF PAYMENT</label>
                            <input type="text" defaultValue="Online Transfer" />
                          </div>
                          <div className="form-group">
                            <label>CREDIT TERMS</label>
                            <input type="text" defaultValue="Net 45 days" />
                          </div>
                        </div>
                      </div>
                      <div className="remarks-section">
                        <label>REMARKS</label>
                        <textarea defaultValue="Top-rated supplier for Mindanao region. Excellent customer feedback."></textarea>
                      </div>
                    </div>
                  </div>
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