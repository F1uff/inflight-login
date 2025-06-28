import { useState, useCallback } from 'react';

// Consolidated form state hook to replace 20+ individual useState calls
export const useFormState = () => {
  // Account Information state object
  const [accountInfo, setAccountInfo] = useState({
    email: '',
    selectedRegion: '',
    selectedProvince: '',
    selectedCity: '',
    selectedBarangay: '',
    street: '',
    zipCode: '',
    areaCode: '',
    phoneNumber: '',
    contactNumber: ''
  });

  // Company Information state object
  const [companyInfo, setCompanyInfo] = useState({
    businessType: 'Travel and Tour Agency',
    establishmentName: '',
    yearEstablished: '',
    othersValue: ''
  });

  // File and UI state object
  const [formState, setFormState] = useState({
    files: {},
    fileNames: {},
    errors: {},
    showVerificationModal: false
  });

  // Location options state object
  const [locationOptions, setLocationOptions] = useState({
    regions: [],
    availableProvinces: [],
    availableCities: [],
    availableBarangays: []
  });

  // Optimized update functions using useCallback for performance
  const updateAccountInfo = useCallback((field, value) => {
    setAccountInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateCompanyInfo = useCallback((field, value) => {
    setCompanyInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateFormState = useCallback((field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateLocationOptions = useCallback((field, value) => {
    setLocationOptions(prev => ({ ...prev, [field]: value }));
  }, []);

  // Batch update function for multiple fields
  const batchUpdateAccountInfo = useCallback((updates) => {
    setAccountInfo(prev => ({ ...prev, ...updates }));
  }, []);

  const batchUpdateLocationOptions = useCallback((updates) => {
    setLocationOptions(prev => ({ ...prev, ...updates }));
  }, []);

  // Error management
  const setError = useCallback((field, message) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: message }
    }));
  }, []);

  const clearError = useCallback((field) => {
    setFormState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      return { ...prev, errors: newErrors };
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFormState(prev => ({ ...prev, errors: {} }));
  }, []);

  return {
    // State objects
    accountInfo,
    companyInfo,
    formState,
    locationOptions,
    
    // Update functions
    updateAccountInfo,
    updateCompanyInfo,
    updateFormState,
    updateLocationOptions,
    batchUpdateAccountInfo,
    batchUpdateLocationOptions,
    
    // Error management
    setError,
    clearError,
    clearAllErrors
  };
};

// Location cascade hook to eliminate duplicate logic
export const useLocationCascade = (locationOptions, updateLocationOptions, batchUpdateAccountInfo) => {
  const handleRegionChange = useCallback((regionId) => {
    if (regionId) {
      // Import location service here to avoid circular dependencies
      import('../data/philippineLocationsService').then(({ getProvincesByRegion }) => {
        updateLocationOptions('availableProvinces', getProvincesByRegion(regionId));
      });
      
      // Reset dependent fields
      batchUpdateAccountInfo({
        selectedRegion: regionId,
        selectedProvince: '',
        selectedCity: '',
        selectedBarangay: '',
        zipCode: ''
      });
    } else {
      updateLocationOptions('availableProvinces', []);
    }
  }, [updateLocationOptions, batchUpdateAccountInfo]);

  const handleProvinceChange = useCallback((provinceId, regionId) => {
    if (regionId && provinceId) {
      import('../data/philippineLocationsService').then(({ getCitiesByProvince }) => {
        updateLocationOptions('availableCities', getCitiesByProvince(regionId, provinceId));
      });
      
      batchUpdateAccountInfo({
        selectedProvince: provinceId,
        selectedCity: '',
        selectedBarangay: '',
        zipCode: ''
      });
    } else {
      updateLocationOptions('availableCities', []);
    }
  }, [updateLocationOptions, batchUpdateAccountInfo]);

  const handleCityChange = useCallback((cityId, regionId, provinceId) => {
    if (regionId && provinceId && cityId) {
      import('../data/philippineLocationsService').then(({ getBarangaysByCity, getZipCode }) => {
        updateLocationOptions('availableBarangays', getBarangaysByCity(regionId, provinceId, cityId));
        
        // Auto-fill zip code
        const cityZipCode = getZipCode(cityId);
        batchUpdateAccountInfo({
          selectedCity: cityId,
          selectedBarangay: '',
          zipCode: cityZipCode || ''
        });
      });
    } else {
      updateLocationOptions('availableBarangays', []);
    }
  }, [updateLocationOptions, batchUpdateAccountInfo]);

  return {
    handleRegionChange,
    handleProvinceChange,
    handleCityChange
  };
};

// File upload hook to eliminate repetitive file handling
export const useFileUpload = (updateFormState, setError, clearError) => {
  const handleFileChange = useCallback((id, file) => {
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError(id, 'File size exceeds 2MB limit');
      return;
    }
    
    // Clear any previous errors
    clearError(id);
    
    // Update files and fileNames in batch
    updateFormState('files', (prevFiles) => ({ ...prevFiles, [id]: file }));
    updateFormState('fileNames', (prevNames) => ({ ...prevNames, [id]: file.name }));
  }, [updateFormState, setError, clearError]);

  return { handleFileChange };
}; 