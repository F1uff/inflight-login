import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

// Available business types for radio button selection
const businessTypes = [
  { id: 'travel-agency', label: 'Travel and Tour Agency', value: 'Travel and Tour Agency' },
  { id: 'tour-operator', label: 'Tour Operator', value: 'Tour Operator' },
  { id: 'hotel', label: 'Hotel', value: 'Hotel' },
  { id: 'resorts', label: 'Resorts', value: 'Resorts' },
  { id: 'apartment-hotel', label: 'Apartment Hotel', value: 'Apartment Hotel' },
  { id: 'tourist-transport', label: 'Tourist Land Transport Operator', value: 'Tourist Land Transport Operator' },
  { id: 'mice', label: 'MICE', value: 'MICE' },
  { id: 'online-agency', label: 'Online Travel Agency', value: 'Online Travel Agency' },
  { id: 'others', label: 'Others (Museum, Theme Parks, etc.)', value: 'Others' }
];

// Required document uploads with their file type restrictions
const uploadRequirements = [
  { 
    id: 'dot-certificate', 
    label: 'Scanned copy of the Valid and Updated Department of Tourism (DOT) Accreditation Certificate',
    accept: '.pdf,.png,.jpg,.jpeg'
  },
  { 
    id: 'representative-photo', 
    label: 'Clear copy of one (1) ID photo of Permanent Representative (preferably 2x2 size)',
    accept: '.png,.jpg,.jpeg'
  },
  { 
    id: 'employment-certificate', 
    label: 'Scanned and signed Certificate of Employment of authorized representatives / Scanned copy of any Government-issued document indicating the Owner\'s Name (i.e. Mayor\'s Permit, DTI Certificate, etc.)',
    accept: '.pdf,.png,.jpg,.jpeg'
  },
  { 
    id: 'alt-representative-photo', 
    label: 'Clear copy of one (1) ID photo of Alternate Representative (preferably 2x2 size)',
    accept: '.png,.jpg,.jpeg'
  }
];

function CompanyInfoForm() {
  // Form field values and state
  const [businessType, setBusinessType] = useState('Travel and Tour Agency');
  const [establishmentName, setEstablishmentName] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');
  const [files, setFiles] = useState({});
  const [fileNames, setFileNames] = useState({});
  const [errors, setErrors] = useState({});
  
  // References to file input elements for programmatic clicks
  const fileInputRefs = {
    'dot-certificate': useRef(null),
    'representative-photo': useRef(null),
    'employment-certificate': useRef(null),
    'alt-representative-photo': useRef(null)
  };
  
  // Update selected business type when radio button changes
  const handleBusinessTypeChange = (e) => {
    setBusinessType(e.target.value);
  };
  
  // Process file uploads and validate file size
  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is under 2MB size limit
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [id]: 'File size exceeds 2MB limit'
        }));
        return;
      }
      
      // Remove any previous error for this file
      if (errors[id]) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[id];
          return newErrors;
        });
      }
      
      // Store the file object
      setFiles(prev => ({
        ...prev,
        [id]: file
      }));
      
      // Save filename to display to user
      setFileNames(prev => ({
        ...prev,
        [id]: file.name
      }));
    }
  };
  
  // Trigger file browser when upload button is clicked
  const handleUploadClick = (id) => {
    fileInputRefs[id].current.click();
  };
  
  // Check if all required fields and files are provided
  const validateForm = () => {
    const newErrors = {};
    
    // Verify establishment name is filled in
    if (!establishmentName.trim()) {
      newErrors.establishmentName = 'Name of Establishment is required';
    }
    
    // Check all required document uploads
    if (!files['dot-certificate']) {
      newErrors.dotCertificate = 'DOT Certificate is required';
    }
    
    if (!files['representative-photo']) {
      newErrors.representativePhoto = 'Permanent Representative photo is required';
    }
    
    if (!files['employment-certificate']) {
      newErrors.employmentCertificate = 'Certificate of Employment is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };
  
  // Process form submission and handle validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Form passed validation - would submit to server in real app
      console.log('Form data:', {
        businessType,
        establishmentName,
        yearEstablished,
        files
      });
      
      // Show success message
      alert('Registration successful!');
    } else {
      // Scroll to first error to help user fix issues
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  return (
    <div className="form-container">
      <h2 className="section-title">Company Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="info-section">
          <div className="form-group full-width">
            <label>Nature of Business<span className="required">*</span></label>
            <div className="field-note">(as reflected in DOT accreditation certificate)</div>
            
            <div className="radio-group">
              <div className="radio-column">
                {businessTypes.slice(0, 5).map(type => (
                  <div className="radio-option" key={type.id}>
                    <input 
                      type="radio" 
                      id={type.id} 
                      name="business-type" 
                      value={type.value}
                      checked={businessType === type.value}
                      onChange={handleBusinessTypeChange}
                    />
                    <label htmlFor={type.id}>{type.label}</label>
                  </div>
                ))}
              </div>
              
              <div className="radio-column">
                {businessTypes.slice(5).map(type => (
                  <div className="radio-option" key={type.id}>
                    <input 
                      type="radio" 
                      id={type.id} 
                      name="business-type" 
                      value={type.value}
                      checked={businessType === type.value}
                      onChange={handleBusinessTypeChange}
                    />
                    <label htmlFor={type.id}>{type.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Name of Establishment<span className="required">*</span></label>
              <div className="field-note">(as reflected in DOT accreditation certificate)</div>
              <input 
                type="text" 
                className={`form-control ${errors.establishmentName ? 'error-input' : ''}`} 
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                required
              />
              {errors.establishmentName && (
                <div className="error-message">{errors.establishmentName}</div>
              )}
            </div>
            <div className="form-group">
              <label>Year Established</label>
              <input 
                type="text" 
                className="form-control" 
                value={yearEstablished}
                onChange={(e) => setYearEstablished(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <h2 className="section-title upload-title">Upload Requirements</h2>
        
        <div className="info-section">
          <div className="file-types">
            <div className="file-type-allowed">Allowed File Types for ID Photos: .png, .jpg, .jpeg</div>
            <div className="file-type-allowed">Allowed File Types for DOT Accreditation Certificate and COE: .pdf, .png, .jpg, .jpeg</div>
            <div className="file-type-allowed">Max File Size: 2MB</div>
          </div>
          
          {uploadRequirements.map(item => (
            <div className="upload-row" key={item.id}>
              <div className="upload-label">
                {item.label}
                {(item.id === 'dot-certificate' || item.id === 'representative-photo' || item.id === 'employment-certificate') && (
                  <span className="required">*</span>
                )}
              </div>
              <div className="file-upload">
                <input
                  type="file"
                  ref={fileInputRefs[item.id]}
                  style={{ display: 'none' }}
                  accept={item.accept}
                  onChange={(e) => handleFileChange(item.id, e)}
                />
                <button 
                  type="button" 
                  className="upload-button"
                  onClick={() => handleUploadClick(item.id)}
                >
                  Choose File
                </button>
                <span className="file-name">
                  {fileNames[item.id] || 'No file chosen'}
                </span>
                {errors[item.id] && (
                  <div className="error-message">{errors[item.id]}</div>
                )}
              </div>
            </div>
          ))}
          
          <div className="form-footer company-form-footer">
            <button type="submit" className="register-button">REGISTER</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CompanyInfoForm;
