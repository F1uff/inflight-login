import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getRegions, 
  getProvincesByRegion, 
  getCitiesByProvince, 
  getBarangaysByCity,
  getZipCode 
} from '../data/philippineLocationsService';

function AccountInfoForm() {
  // Form field values
  const [email, setEmail] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [street, setStreet] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Location dropdown options
  const [regions, setRegions] = useState([]);
  const [availableProvinces, setAvailableProvinces] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableBarangays, setAvailableBarangays] = useState([]);
  
  // Load all regions when component first renders
  useEffect(() => {
    setRegions(getRegions());
  }, []);
  
  // When region changes, get provinces for that region and reset other fields
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
  
  // When province changes, get cities for that province and reset city/barangay
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
  
  // When city changes, get barangays and set zip code if available
  useEffect(() => {
    if (selectedRegion && selectedProvince && selectedCity) {
      setAvailableBarangays(getBarangaysByCity(selectedRegion, selectedProvince, selectedCity));
      setSelectedBarangay('');
      
      // Try to automatically fill zip code based on city
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
  
  // Process form submission (currently just prevents default form behavior)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form would be submitted here in the future
  };

  return (
    <div className="form-container">
      <h2 className="section-title">Account Information</h2>
      
      <div className="info-section">
        <form onSubmit={handleSubmit}>
          <div className="form-group full-width">
            <label>Email Address<span className="required">*</span></label>

            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Business Address <span className="note">(as reflected in the DOT Certificate)</span></label>
          </div>

          {/* Region, Province, City selection row */}
          <div className="form-row">
            <div className="form-group">
              <label>Region<span className="required">*</span></label>
              <select 
                className="form-control" 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                required
              >
                <option value="">- Select -</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Province<span className="required">*</span></label>
              <select 
                className="form-control" 
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
            </div>
            
            <div className="form-group">
              <label>City/Municipality<span className="required">*</span></label>
              <select 
                className="form-control" 
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
            </div>
          </div>

          {/* Barangay and street address row */}
          <div className="form-row">
            <div className="form-group">
              <label>Barangay<span className="required">*</span></label>
              <select 
                className="form-control" 
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
            </div>
            
            <div className="form-group">
              <label>House No./Bldg./ Street</label>
              <input 
                type="text" 
                className="form-control" 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
          </div>

          {/* Zip code and phone number row */}
          <div className="form-row">
            <div className="form-group">
              <label>Zip Code<span className="required">*</span></label>
              <input 
                type="text" 
                className="form-control" 
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Office Contact No.<span className="required">*</span></label>
              <div className="phone-inputs">
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
            </div>
          </div>
          
          <div className="button-row">
            <button type="button" className="btn-next">
              <Link to="/company-info">Next</Link>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AccountInfoForm;