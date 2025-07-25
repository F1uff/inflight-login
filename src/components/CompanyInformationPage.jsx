import React, { useState, useRef } from 'react';
import './Dashboard.css';
import './UserDashboard.css';
import './CompanyInformationPage.css';

// SVG Icons
const Icons = {
  info: (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="#2196F3">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>
  ),
  camera: (
    <svg width="100" height="100" viewBox="0 0 24 24" fill="#333">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>
  ),
  documentIcon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#666">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#4CAF50">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  )
};

function CompanyInformationPage() {
  // File upload states
  const [companyLogo, setCompanyLogo] = useState(null);
  const [documents, setDocuments] = useState({
    'business-permit': null,
    'dtsec': null,
    'bir2303': null,
    'sample-soa': null,
    'sample-invoice': null,
    'service-agreement': null
  });
  
  // Form field states
  const [formFields, setFormFields] = useState({
    userId: 'ID-18 (Generated Automatically Based on Registration)',
    companyName: '',
    lastName: '',
    firstName: '',
    designation: '',
    contactNumber: '',
    emailAddress: '',
    nameOfBank: '',
    accountName: '',
    accountNumber: '',
    creditTerms: ''
  });
  
  // Refs for file inputs
  const logoInputRef = useRef(null);
  const documentInputRefs = {
    'business-permit': useRef(null),
    'dtsec': useRef(null),
    'bir2303': useRef(null),
    'sample-soa': useRef(null),
    'sample-invoice': useRef(null),
    'service-agreement': useRef(null)
  };
  
  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogo(file);
    }
  };
  
  // Handle document upload
  const handleDocumentUpload = (docId, e) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docId]: file
      }));
    }
  };
  
  // Handle form field change
  const handleInputChange = (field, value) => {
    setFormFields(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic would go here
    // Form submitted with formFields, documents, and companyLogo
    alert('Information saved successfully!');
  };
  
  return (
    <div className="dashboard-content">
      <div className="info-banner">
        <div className="info-icon">{Icons.info}</div>
        <div className="info-text">
          <div>To register an account, please fill out the following fields and we will e-mail your login information.</div>
          <div>For any questions or concerns about the account registration, please email bizdev@inflightmenuph.com</div>
        </div>
      </div>
      
      <div className="section-title">COMPANY INFORMATION</div>
      
      <form onSubmit={handleSubmit}>
        {/* Company Logo Section */}
        <div className="company-section">
          <div className="form-row">
            <div className="company-profile-section">
              <div className="section-label">COMPANY PROFILE LOGO</div>
              <div className="logo-upload-container">
                <div className="logo-upload-box">
                  {companyLogo ? (
                    <img 
                      src={URL.createObjectURL(companyLogo)} 
                      alt="Company Logo" 
                      className="uploaded-logo"
                    />
                  ) : (
                    <div className="logo-placeholder">
                      {Icons.camera}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={logoInputRef}
                  style={{ display: 'none' }}
                  onChange={handleLogoUpload}
                />
                <button 
                  type="button" 
                  className="upload-btn"
                  onClick={() => logoInputRef.current.click()}
                >
                  UPLOAD
                </button>
              </div>
            </div>
            
            <div className="company-form-fields">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="user-id">USER ID <span className="field-note">(Generated Automatically Based in Registration)</span></label>
                  <input 
                    type="text" 
                    id="user-id"
                    name="userId"
                    className="form-control" 
                    value={formFields.userId}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company-name">COMPANY NAME</label>
                  <input 
                    type="text" 
                    id="company-name"
                    name="companyName"
                    className="form-control" 
                    value={formFields.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="last-name">LAST NAME <span className="field-note">(Company Representative)</span></label>
                  <input 
                    type="text" 
                    id="last-name"
                    name="lastName"
                    className="form-control" 
                    value={formFields.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="first-name">FIRST NAME <span className="field-note">(Company Representative)</span></label>
                  <input 
                    type="text" 
                    id="first-name"
                    name="firstName"
                    className="form-control" 
                    value={formFields.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="designation">DESIGNATION</label>
                  <input 
                    type="text" 
                    id="designation"
                    name="designation"
                    className="form-control" 
                    value={formFields.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact-number">CONTACT #</label>
                  <input 
                    type="text" 
                    id="contact-number"
                    name="contactNumber"
                    className="form-control" 
                    value={formFields.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  />
                  <div className="phone-format">Phone must be +63 format</div>
                </div>
                <div className="form-group">
                  <label htmlFor="email-address">EMAIL ADDRESS</label>
                  <input 
                    type="email" 
                    id="email-address"
                    name="emailAddress"
                    className="form-control" 
                    value={formFields.emailAddress}
                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Primary Documents Section */}
        <div className="section-title">PRIMARY DOCUMENTS</div>
        <div className="documents-section">
          <div className="document-row">
            <div className="document-item">
              <div className="document-status">
                {documents['business-permit'] ? Icons.check : <span className="status-circle"></span>}
              </div>
              <div className="document-icon">
                {Icons.documentIcon}
              </div>
              <input
                type="file"
                ref={documentInputRefs['business-permit']}
                style={{ display: 'none' }}
                onChange={(e) => handleDocumentUpload('business-permit', e)}
              />
              <div className="document-input-container">
                <input 
                  type="text" 
                  className="document-input" 
                  value={documents['business-permit'] ? documents['business-permit'].name : ''}
                  placeholder="Business Permit"
                  readOnly
                  onClick={() => documentInputRefs['business-permit'].current.click()}
                />
              </div>
            </div>
            <div className="document-item">
              <div className="document-status">
                {documents['sample-soa'] ? Icons.check : <span className="status-circle"></span>}
              </div>
              <div className="document-icon">
                {Icons.documentIcon}
              </div>
              <input
                type="file"
                ref={documentInputRefs['sample-soa']}
                style={{ display: 'none' }}
                onChange={(e) => handleDocumentUpload('sample-soa', e)}
              />
              <div className="document-input-container">
                <input 
                  type="text" 
                  className="document-input" 
                  value={documents['sample-soa'] ? documents['sample-soa'].name : ''}
                  placeholder="Sample of SOA"
                  readOnly
                  onClick={() => documentInputRefs['sample-soa'].current.click()}
                />
              </div>
            </div>
          </div>
          
          <div className="document-row">
            <div className="document-item">
              <div className="document-status">
                {documents['dtsec'] ? Icons.check : <span className="status-circle"></span>}
              </div>
              <div className="document-icon">
                {Icons.documentIcon}
              </div>
              <input
                type="file"
                ref={documentInputRefs['dtsec']}
                style={{ display: 'none' }}
                onChange={(e) => handleDocumentUpload('dtsec', e)}
              />
              <div className="document-input-container">
                <input 
                  type="text" 
                  className="document-input" 
                  value={documents['dtsec'] ? documents['dtsec'].name : ''}
                  placeholder="DTI/SEC"
                  readOnly
                  onClick={() => documentInputRefs['dtsec'].current.click()}
                />
              </div>
            </div>
            <div className="document-item">
              <div className="document-status">
                {documents['sample-invoice'] ? Icons.check : <span className="status-circle"></span>}
              </div>
              <div className="document-icon">
                {Icons.documentIcon}
              </div>
              <input
                type="file"
                ref={documentInputRefs['sample-invoice']}
                style={{ display: 'none' }}
                onChange={(e) => handleDocumentUpload('sample-invoice', e)}
              />
              <div className="document-input-container">
                <input 
                  type="text" 
                  className="document-input" 
                  value={documents['sample-invoice'] ? documents['sample-invoice'].name : ''}
                  placeholder="Sample of Service Invoice"
                  readOnly
                  onClick={() => documentInputRefs['sample-invoice'].current.click()}
                />
              </div>
            </div>
          </div>
          
          <div className="document-row">
            <div className="document-item">
              <div className="document-status">
                {documents['bir2303'] ? Icons.check : <span className="status-circle"></span>}
              </div>
              <div className="document-icon">
                {Icons.documentIcon}
              </div>
              <input
                type="file"
                ref={documentInputRefs['bir2303']}
                style={{ display: 'none' }}
                onChange={(e) => handleDocumentUpload('bir2303', e)}
              />
              <div className="document-input-container">
                <input 
                  type="text" 
                  className="document-input" 
                  value={documents['bir2303'] ? documents['bir2303'].name : ''}
                  placeholder="BIR 2303"
                  readOnly
                  onClick={() => documentInputRefs['bir2303'].current.click()}
                />
              </div>
            </div>
            <div className="document-item">
              <div className="document-status">
                {documents['service-agreement'] ? Icons.check : <span className="status-circle"></span>}
              </div>
              <div className="document-icon">
                {Icons.documentIcon}
              </div>
              <input
                type="file"
                ref={documentInputRefs['service-agreement']}
                style={{ display: 'none' }}
                onChange={(e) => handleDocumentUpload('service-agreement', e)}
              />
              <div className="document-input-container">
                <input 
                  type="text" 
                  className="document-input" 
                  value={documents['service-agreement'] ? documents['service-agreement'].name : ''}
                  placeholder="Service Agreement"
                  readOnly
                  onClick={() => documentInputRefs['service-agreement'].current.click()}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Terms Section */}
        <div className="section-title">PAYMENT TERMS</div>
        <div className="payment-section">
          <div className="form-row">
            <div className="form-group">
              <label>NAME OF BANK</label>
              <div className="select-wrapper">
                <select 
                  className="form-control" 
                  value={formFields.nameOfBank}
                  onChange={(e) => handleInputChange('nameOfBank', e.target.value)}
                >
                  <option value="">Select Bank</option>
                  <option value="BDO">BDO</option>
                  <option value="BPI">BPI</option>
                  <option value="Metrobank">Metrobank</option>
                  <option value="Security Bank">Security Bank</option>
                  <option value="UnionBank">UnionBank</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>ACCOUNT NAME</label>
              <input 
                type="text" 
                className="form-control" 
                value={formFields.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>ACCOUNT NUMBER</label>
              <input 
                type="text" 
                className="form-control" 
                value={formFields.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>CREDIT TERMS</label>
              <div className="select-wrapper">
                <select 
                  className="form-control" 
                  value={formFields.creditTerms}
                  onChange={(e) => handleInputChange('creditTerms', e.target.value)}
                >
                  <option value="">Select Credit Terms</option>
                  <option value="COD">COD</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="45 Days">45 Days</option>
                  <option value="60 Days">60 Days</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-footer">
            <button type="submit" className="submit-btn">SUBMIT</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CompanyInformationPage;
