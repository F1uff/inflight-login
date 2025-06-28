import React from 'react';

const AddSupplierModal = ({ 
  addSupplierModalVisible, 
  closeAddSupplierModal, 
  uploadedFiles, 
  handleFileUpload 
}) => {
  if (!addSupplierModalVisible) return null;

  return (
    <div className="modal-overlay" onClick={closeAddSupplierModal}>
      <div className="add-supplier-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>ADD SUPPLIER</h2>
          <button className="modal-close" onClick={closeAddSupplierModal}>×</button>
        </div>
        
        <div className="modal-content">
          {/* Company Information Section */}
          <div className="modal-section">
            <h3>Company Information</h3>
            <div className="nature-of-business">
              <label className="section-label">NATURE OF BUSINESS *</label>
              <div className="business-type-grid">
                <div className="radio-group">
                  <input type="radio" id="hotel" name="companyType" value="hotel" />
                  <label htmlFor="hotel">HOTEL</label>
                </div>
                <div className="radio-group">
                  <input type="radio" id="landTransport" name="companyType" value="landTransport" />
                  <label htmlFor="landTransport">LAND TRANSPORT</label>
                </div>
                <div className="radio-group-with-input">
                  <div className="radio-group">
                    <input type="radio" id="others" name="companyType" value="others" />
                    <label htmlFor="others">OTHERS</label>
                  </div>
                  <input type="text" className="others-input-field" placeholder="" />
                </div>
                
                <div className="radio-group">
                  <input type="radio" id="resorts" name="companyType" value="resorts" />
                  <label htmlFor="resorts">RESORTS</label>
                </div>
                <div className="radio-group">
                  <input type="radio" id="airlines" name="companyType" value="airlines" />
                  <label htmlFor="airlines">AIRLINES</label>
                </div>
                <div className="empty-cell"></div>
                
                <div className="radio-group">
                  <input type="radio" id="apartmentHotel" name="companyType" value="apartmentHotel" />
                  <label htmlFor="apartmentHotel">APARTMENT HOTEL</label>
                </div>
                <div className="radio-group">
                  <input type="radio" id="tourOperator" name="companyType" value="tourOperator" />
                  <label htmlFor="tourOperator">TOUR OPERATOR</label>
                </div>
                <div className="empty-cell"></div>
              </div>
            </div>
            
            <div className="establishment-info">
              <div className="form-group">
                <label>NAME OF ESTABLISHMENT *</label>
                <input type="text" />
              </div>
              <div className="form-group">
                <label>YEAR ESTABLISHED</label>
                <input type="text" />
              </div>
            </div>
          </div>

          {/* Business Address Section */}
          <div className="modal-section">
            <h3>BUSINESS ADDRESS</h3>
            <div className="address-grid">
              <div className="form-group">
                <label>Region *</label>
                <select>
                  <option>- Select -</option>
                </select>
              </div>
              <div className="form-group">
                <label>Province *</label>
                <select>
                  <option>- Select -</option>
                </select>
              </div>
              <div className="form-group">
                <label>City/Municipality *</label>
                <select>
                  <option>- Select -</option>
                </select>
              </div>
              <div className="form-group">
                <label>Barangay *</label>
                <select>
                  <option>- Select -</option>
                </select>
              </div>
              <div className="form-group">
                <label>House No./Bldg./ Street</label>
                <input type="text" />
              </div>
              <div className="form-group">
                <label>Zip Code *</label>
                <input type="text" />
              </div>
              <div className="form-group">
                <label>Office Contact No. *</label>
                <div className="contact-split">
                  <input type="text" placeholder="Area Code" className="area-code" />
                  <input type="text" placeholder="Number" className="phone-number" />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Documents Section */}
          <div className="modal-section">
            <h3>PRIMARY DOCUMENTS</h3>
            <div className="documents-grid">
              <div className="document-item">
                <div className="document-status">
                  <div className={`document-check ${uploadedFiles.businessPermit ? 'uploaded' : 'not-uploaded'}`}>
                    {uploadedFiles.businessPermit ? '✓' : '✕'}
                  </div>
                </div>
                <div className="document-upload-area">
                  <input 
                    type="file" 
                    id="business-permit" 
                    className="file-input" 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('businessPermit', e.target.files[0])}
                  />
                  <label htmlFor="business-permit" className="upload-button">
                    <span className="upload-icon">📁</span>
                  </label>
                </div>
                <div className="document-name">Business Permit</div>
              </div>
              
              <div className="document-item">
                <div className="document-status">
                  <div className={`document-check ${uploadedFiles.dtiSec ? 'uploaded' : 'not-uploaded'}`}>
                    {uploadedFiles.dtiSec ? '✓' : '✕'}
                  </div>
                </div>
                <div className="document-upload-area">
                  <input 
                    type="file" 
                    id="dti-sec" 
                    className="file-input" 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('dtiSec', e.target.files[0])}
                  />
                  <label htmlFor="dti-sec" className="upload-button">
                    <span className="upload-icon">📁</span>
                  </label>
                </div>
                <div className="document-name">DTI/SEC</div>
              </div>
              
              <div className="document-item">
                <div className="document-status">
                  <div className={`document-check ${uploadedFiles.dotCertificate ? 'uploaded' : 'not-uploaded'}`}>
                    {uploadedFiles.dotCertificate ? '✓' : '✕'}
                  </div>
                </div>
                <div className="document-upload-area">
                  <input 
                    type="file" 
                    id="dot-certificate" 
                    className="file-input" 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('dotCertificate', e.target.files[0])}
                  />
                  <label htmlFor="dot-certificate" className="upload-button">
                    <span className="upload-icon">📁</span>
                  </label>
                </div>
                <div className="document-name">DOT Certificate</div>
              </div>
              
              <div className="document-item">
                <div className="document-status">
                  <div className={`document-check ${uploadedFiles.bir2303 ? 'uploaded' : 'not-uploaded'}`}>
                    {uploadedFiles.bir2303 ? '✓' : '✕'}
                  </div>
                </div>
                <div className="document-upload-area">
                  <input 
                    type="file" 
                    id="bir-2303" 
                    className="file-input" 
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload('bir2303', e.target.files[0])}
                  />
                  <label htmlFor="bir-2303" className="upload-button">
                    <span className="upload-icon">📁</span>
                  </label>
                </div>
                <div className="document-name">BIR 2303</div>
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="modal-section">
            <div className="section-header">
              <h3>CONTACT DETAILS</h3>
              <h3>REMARKS</h3>
            </div>
            <div className="contact-details-grid">
              <div className="contact-left">
                <div className="contact-form-grid">
                  <div className="form-group">
                    <label>SALE REPRESENTATIVE</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>FRONTDESK</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>CONTACT NUMBER</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>CONTACT NUMBER</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>EMAIL ADDRESS</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>EMAIL ADDRESS</label>
                    <input type="text" />
                  </div>
                </div>
                <div className="payment-terms-row">
                  <div className="form-group">
                    <label>MODE OF PAYMENT</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>TYPE OF BREAKFAST</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>CREDIT TERMS</label>
                    <input type="text" />
                  </div>
                  <div className="form-group">
                    <label>ROOM QUANTITY</label>
                    <input type="text" />
                  </div>
                </div>
              </div>
              <div className="contact-right">
                <div className="form-group">
                  <textarea rows="8" placeholder="Enter remarks..."></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Contracted Rates Section */}
          <div className="modal-section">
            <div className="dropdown-controls">
              <div className="contracted-dropdown">
                <select>
                  <option>CONTRACTED RATES</option>
                  <option>Published Rate</option>
                  <option>Corporate Rate</option>
                  <option>Contracted Rate</option>
                </select>
              </div>
              <div className="seasons-dropdown">
                <select>
                  <option>SEASONS</option>
                  <option>REGULAR</option>
                  <option>LEAN</option>
                  <option>PEAK</option>
                  <option>HIGH / SUPER</option>
                  <option>WEEKDAYS</option>
                  <option>WEEKEND</option>
                  <option>HOLIDAY</option>
                  <option>FIT</option>
                  <option>GIT</option>
                  <option>LOCAL</option>
                  <option>INTERNATIONAL</option>
                </select>
              </div>
            </div>
            
            <div className="rates-table">
              <table>
                <thead>
                  <tr>
                    <th>TYPE OF ROOM</th>
                    <th>REGULAR</th>
                    <th>LEAN</th>
                    <th>PEAK</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="room-indicator red">−</span> Standard Room</td>
                    <td>Php 1,000.00</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td><span className="room-indicator red">−</span> Economy</td>
                    <td>Php 1,500.00</td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td><span className="room-indicator blue">+</span> Deluxe Room</td>
                    <td>Php 2,500.00</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="upload-section">
              <div className="form-group">
                <label>UPLOAD CONTRACT RATES</label>
                <div className="file-upload">
                  <span className="upload-icon">📁</span>
                  <span>Signed Documents.pdf</span>
                </div>
              </div>
              <div className="form-group">
                <label>SELLING</label>
                <input type="text" />
              </div>
              <div className="form-group">
                <label>VALIDITY</label>
                <input type="text" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-update">UPDATE</button>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierModal;