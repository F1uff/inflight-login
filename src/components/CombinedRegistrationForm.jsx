import React, { useState, useEffect, useRef } from 'react';
import './CombinedRegistrationForm.css';
import EmailVerificationModal from './EmailVerificationModal';
import { 
  getRegions, 
  getProvincesByRegion, 
  getCitiesByProvince, 
  getBarangaysByCity,
  getZipCode 
} from '../data/philippineLocationsService';

// Required document uploads for registration
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

function CombinedRegistrationForm() {
  // const navigate = useNavigate(); // Uncomment when navigation is needed
  
  // Account Information state
  const [email, setEmail] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [street, setStreet] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Company Information state
  const [businessType, setBusinessType] = useState('Travel and Tour Agency');
  const [establishmentName, setEstablishmentName] = useState('');
  const [yearEstablished, setYearEstablished] = useState('');
  const [files, setFiles] = useState({});
  const [fileNames, setFileNames] = useState({});
  
  // Common state
  const [errors, setErrors] = useState({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  // State for available location options
  const [regions, setRegions] = useState([]);
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);
  
  // Refs for file inputs
  const fileInputRefs = {
    'dot-certificate': useRef(null),
    'representative-photo': useRef(null),
    'employment-certificate': useRef(null),
    'alt-representative-photo': useRef(null)
  };
  
  // Additional state
  const [othersValue, setOthersValue] = useState('');
  
  // Load regions on component mount
  useEffect(() => {
    setRegions(getRegions());
  }, []);
  
  // Update available provinces when region changes
  useEffect(() => {
    if (selectedRegion) {
      setAvailableProvinces(getProvincesByRegion(selectedRegion));
      setSelectedProvince('');
      setSelectedCity('');
      setSelectedBarangay('');
      setZipCode('');
    } else {
      setAvailableProvinces([]);
    }
  }, [selectedRegion]);
  
  // Update available cities when province changes
  useEffect(() => {
    if (selectedRegion && selectedProvince) {
      setAvailableCities(getCitiesByProvince(selectedRegion, selectedProvince));
      setSelectedCity('');
      setSelectedBarangay('');
      setZipCode('');
    } else {
      setAvailableCities([]);
    }
  }, [selectedRegion, selectedProvince]);
  
  // Update available barangays when city changes
  useEffect(() => {
    if (selectedRegion && selectedProvince && selectedCity) {
      setAvailableBarangays(getBarangaysByCity(selectedRegion, selectedProvince, selectedCity));
      setSelectedBarangay('');
      
      // Auto-fill zip code if available
      const cityZipCode = getZipCode(selectedCity);
      if (cityZipCode) {
        setZipCode(cityZipCode);
      } else {
        setZipCode('');
      }
    } else {
      setAvailableBarangays([]);
    }
  }, [selectedRegion, selectedProvince, selectedCity]);
  
  // Handle business type change
  const handleBusinessTypeChange = (e) => {
    setBusinessType(e.target.value);
  };
  
  // Handle file selection
  const handleFileChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [id]: 'File size exceeds 2MB limit'
        }));
        return;
      }
      
      // Clear any previous errors
      if (errors[id]) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors[id];
          return newErrors;
        });
      }
      
      // Update files state
      setFiles(prev => ({
        ...prev,
        [id]: file
      }));
      
      // Update file names for display
      setFileNames(prev => ({
        ...prev,
        [id]: file.name
      }));
    }
  };
  
  // Handle file upload button click
  const handleUploadClick = (id) => {
    fileInputRefs[id].current.click();
  };
  
  // Handle Others input change
  const handleOthersInputChange = (e) => {
    setOthersValue(e.target.value);
    // You might want to combine the "Others" with the specific value
    if (businessType === "Others") {
      setBusinessType(`Others - ${e.target.value}`);
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Validate Account Information
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Valid email is required';
    }
    
    if (!selectedRegion) {
      newErrors.region = 'Region is required';
    }
    
    if (!selectedProvince) {
      newErrors.province = 'Province is required';
    }
    
    if (!selectedCity) {
      newErrors.city = 'City/Municipality is required';
    }
    
    if (!selectedBarangay) {
      newErrors.barangay = 'Barangay is required';
    }
    
    if (!zipCode.trim()) {
      newErrors.zipCode = 'Zip Code is required';
    }
    
    if (!areaCode.trim() || !phoneNumber.trim()) {
      newErrors.phone = 'Complete contact number is required';
    }
    
    // Validate Company Information
    if (!establishmentName.trim()) {
      newErrors.establishmentName = 'Name of Establishment is required';
    }
    
    // Check required files
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
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Form data is valid, proceed with submission
      console.log('Form data:', {
        email,
        address: {
          region: selectedRegion,
          province: selectedProvince,
          city: selectedCity,
          barangay: selectedBarangay,
          street,
          zipCode
        },
        contactNumber: `${areaCode}-${phoneNumber}`,
        businessType,
        establishmentName,
        yearEstablished,
        files
      });
      
      // In a real application, you would send this data to your backend
      // Show the email verification modal instead of an alert
      setShowVerificationModal(true);
    } else {
      // Scroll to the first error
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  // Handle closing the verification modal
  const handleCloseModal = () => {
    setShowVerificationModal(false);
    // In a real application, you might want to redirect the user
    // navigate('/login');
  };

  return (
    <div className="combined-form-container">
      {showVerificationModal && (
        <EmailVerificationModal 
          email={email} 
          onClose={handleCloseModal} 
        />
      )}
      <form onSubmit={handleSubmit} className="registration-page">
        {/* Account Information Section */}
        <div className="form-container">
          <h2 className="form-section-header">Account Information</h2>
          
          <div className="info-section">
            <div className="form-group full-width">
              <label>Email Address<span className="required">*</span></label>
              {/* <div className="field-note">(Nominate generic and permanent company email address only)</div> */}
              <input 
                type="email" 
                className={`form-control ${errors.email ? 'error-input' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label>Business Address </label>
            </div>

            {/* Region, Province, City Row */}
            <div className="form-row">
              <div className="form-group region-field">
                <label>Region<span className="required">*</span></label>
                <select 
                  className={`form-control location-select ${errors.region ? 'error-input' : ''}`}
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  required
                >
                  <option value="">- Select -</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
                {errors.region && (
                  <div className="error-message">{errors.region}</div>
                )}
              </div>
              
              <div className="form-group">
                <label>Province<span className="required">*</span></label>
                <select 
                  className={`form-control location-select ${errors.province ? 'error-input' : ''}`}
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  disabled={!selectedRegion}
                  required
                >
                  <option value="">- Select -</option>
                  {availableProvinces.map(province => (
                    <option key={province.id} value={province.id}>{province.name}</option>
                  ))}
                </select>
                {errors.province && (
                  <div className="error-message">{errors.province}</div>
                )}
              </div>
              
              <div className="form-group">
                <label>City/Municipality<span className="required">*</span></label>
                <select 
                  className={`form-control location-select ${errors.city ? 'error-input' : ''}`}
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedProvince}
                  required
                >
                  <option value="">- Select -</option>
                  {availableCities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                {errors.city && (
                  <div className="error-message">{errors.city}</div>
                )}
              </div>
            </div>

            {/* Barangay, House No., and Zip Code Row */}
            <div className="form-row">
              <div className="form-group barangay-field">
                <label>Barangay<span className="required">*</span></label>
                <select 
                  className={`form-control location-select ${errors.barangay ? 'error-input' : ''}`}
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                  disabled={!selectedCity}
                  required
                >
                  <option value="">- Select -</option>
                  {availableBarangays.map(barangay => (
                    <option key={barangay.id} value={barangay.id}>{barangay.name}</option>
                  ))}
                </select>
                {errors.barangay && (
                  <div className="error-message">{errors.barangay}</div>
                )}
              </div>
              
              <div className="form-group house-no-field">
                <label>House No./Bldg./ Street</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>

              <div className="form-group zip-field">
                <label>Zip Code<span className="required">*</span></label>
                <input 
                  type="text" 
                  className={`form-control zip-input ${errors.zipCode ? 'error-input' : ''}`}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                  maxLength="4"
                  pattern="[0-9]{4}"
                  placeholder="0000"
                />
                {errors.zipCode && (
                  <div className="error-message">{errors.zipCode}</div>
                )}
              </div>
            </div>

            {/* Contact Numbers Row */}
            <div className="form-row">
              <div className="form-group tel-field">
                <label>Office Tel. No.<span className="required">*</span></label>
                <div className={`phone-inputs ${errors.phone ? 'error-input' : ''}`}>
                  <input 
                    type="text" 
                    className="form-control area-code" 
                    placeholder="Area Code" 
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                    required
                  />
                  <input 
                    type="text" 
                    className="form-control phone-number" 
                    placeholder="Number" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
                {errors.phone && (
                  <div className="error-message">{errors.phone}</div>
                )}
              </div>

              <div className="form-group tel-field">
                <label>Office Contact No.<span className="required">*</span></label>
                <input 
                  type="text" 
                  className={`form-control ${errors.contactNumber ? 'error-input' : ''}`}
                  placeholder="Contact Number" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
                {errors.contactNumber && (
                  <div className="error-message">{errors.contactNumber}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Company Information Section */}
        <div className="form-container">
          <h2 className="form-section-header">Company Information</h2>
          
          <div className="info-section">
            <div className="form-group full-width">
              <label>Nature of Business<span className="required">*</span></label>
              
              <div className="business-type-container">
                <div className="business-column">
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="hotel" 
                      name="business-type" 
                      value="Hotel"
                      checked={businessType === "Hotel"}
                      onChange={handleBusinessTypeChange}
                    />
                    <label htmlFor="hotel">Hotel</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="resorts" 
                      name="business-type" 
                      value="Resorts"
                      checked={businessType === "Resorts"}
                      onChange={handleBusinessTypeChange}
                    />
                    <label htmlFor="resorts">Resorts</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="apartment-hotel" 
                      name="business-type" 
                      value="Apartment Hotel"
                      checked={businessType === "Apartment Hotel"}
                      onChange={handleBusinessTypeChange}
                    />
                    <label htmlFor="apartment-hotel">Apartment Hotel</label>
                  </div>
                </div>
                
                <div className="business-column">
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="land-transport" 
                      name="business-type" 
                      value="Land Transport"
                      checked={businessType === "Land Transport"}
                      onChange={handleBusinessTypeChange}
                    />
                    <label htmlFor="land-transport">Land Transport</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="airlines" 
                      name="business-type" 
                      value="Airlines"
                      checked={businessType === "Airlines"}
                      onChange={handleBusinessTypeChange}
                    />
                    <label htmlFor="airlines">Airlines</label>
                  </div>
                  <div className="radio-option">
                    <input 
                      type="radio" 
                      id="tour-operator" 
                      name="business-type" 
                      value="Tour Operator"
                      checked={businessType === "Tour Operator"}
                      onChange={handleBusinessTypeChange}
                    />
                    <label htmlFor="tour-operator">Tour Operator</label>
                  </div>
                </div>

                <div className="business-column">
                  <div className="others-line">
                    <div className="radio-option">
                      <input 
                        type="radio" 
                        id="others" 
                        name="business-type" 
                        value="Others"
                        checked={businessType === "Others"}
                        onChange={handleBusinessTypeChange}
                      />
                      <label htmlFor="others">OTHERS</label>
                    </div>
                    <div className="others-input-wrapper">
                      <input 
                        type="text" 
                        className="others-input"
                        placeholder=""
                        value={othersValue}
                        onChange={handleOthersInputChange}
                        disabled={businessType !== "Others"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Name of Establishment<span className="required">*</span></label>
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
          
          <h2 className="form-section-header">Upload Requirements</h2>
          
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
        </div>
      </form>
    </div>
  );
}

export default CombinedRegistrationForm;
