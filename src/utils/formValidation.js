// Centralized form validation utilities to eliminate duplicate validation logic

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number validation regex (Philippine format)
const PHONE_REGEX = /^(\+63|0)?[0-9]{10}$/;

// Common validation rules
export const validationRules = {
  required: (value, fieldName) => {
    if (!value || !value.toString().trim()) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null; // Let required rule handle empty values
    if (!EMAIL_REGEX.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    if (!PHONE_REGEX.test(value.replace(/[-\s]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  minLength: (value, minLength) => {
    if (!value) return null;
    if (value.toString().length < minLength) {
      return `Must be at least ${minLength} characters long`;
    }
    return null;
  },

  maxLength: (value, maxLength) => {
    if (!value) return null;
    if (value.toString().length > maxLength) {
      return `Must be no more than ${maxLength} characters long`;
    }
    return null;
  },

  fileSize: (file, maxSizeMB = 2) => {
    if (!file) return null;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    return null;
  },

  fileType: (file, allowedTypes) => {
    if (!file) return null;
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }
    return null;
  }
};

// Field validation configurations
export const fieldConfigs = {
  // Account Information fields
  email: {
    rules: [
      (value) => validationRules.required(value, 'Email'),
      validationRules.email
    ]
  },
  
  region: {
    rules: [(value) => validationRules.required(value, 'Region')]
  },
  
  province: {
    rules: [(value) => validationRules.required(value, 'Province')]
  },
  
  city: {
    rules: [(value) => validationRules.required(value, 'City/Municipality')]
  },
  
  barangay: {
    rules: [(value) => validationRules.required(value, 'Barangay')]
  },
  
  zipCode: {
    rules: [(value) => validationRules.required(value, 'Zip Code')]
  },
  
  areaCode: {
    rules: [(value) => validationRules.required(value, 'Area Code')]
  },
  
  phoneNumber: {
    rules: [
      (value) => validationRules.required(value, 'Phone Number'),
      validationRules.phone
    ]
  },
  
  contactNumber: {
    rules: [
      (value) => validationRules.required(value, 'Contact Number'),
      validationRules.phone
    ]
  },
  
  // Company Information fields
  establishmentName: {
    rules: [(value) => validationRules.required(value, 'Name of Establishment')]
  },
  
  // File upload fields
  'business-permit': {
    rules: [
      (file) => validationRules.required(file, 'Business Permit'),
      (file) => validationRules.fileSize(file, 2),
      (file) => validationRules.fileType(file, ['pdf', 'png', 'jpg', 'jpeg'])
    ]
  },
  
  'bir-2303': {
    rules: [
      (file) => validationRules.required(file, 'BIR 2303'),
      (file) => validationRules.fileSize(file, 2),
      (file) => validationRules.fileType(file, ['pdf', 'png', 'jpg', 'jpeg'])
    ]
  },
  
  'dti-certificate': {
    rules: [
      (file) => validationRules.required(file, 'DTI Certificate'),
      (file) => validationRules.fileSize(file, 2),
      (file) => validationRules.fileType(file, ['pdf', 'png', 'jpg', 'jpeg'])
    ]
  },
  
  'dot-applicable': {
    rules: [
      (file) => validationRules.fileSize(file, 2),
      (file) => validationRules.fileType(file, ['pdf', 'png', 'jpg', 'jpeg'])
    ]
  }
};

// Validate a single field
export const validateField = (fieldName, value) => {
  const config = fieldConfigs[fieldName];
  if (!config) return null;
  
  for (const rule of config.rules) {
    const error = rule(value);
    if (error) return error;
  }
  
  return null;
};

// Validate multiple fields
export const validateFields = (fieldsData) => {
  const errors = {};
  
  Object.entries(fieldsData).forEach(([fieldName, value]) => {
    const error = validateField(fieldName, value);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};

// Validate complete phone number (area code + number)
export const validateCompletePhone = (areaCode, phoneNumber) => {
  if (!areaCode?.trim() || !phoneNumber?.trim()) {
    return 'Complete phone number is required';
  }
  
  const completeNumber = `${areaCode}${phoneNumber}`;
  const phoneError = validationRules.phone(completeNumber);
  if (phoneError) {
    return 'Please enter a valid phone number';
  }
  
  return null;
};

// Validate form sections
export const validateAccountInfo = (accountInfo) => {
  const fieldsToValidate = {
    email: accountInfo.email,
    region: accountInfo.selectedRegion,
    province: accountInfo.selectedProvince,
    city: accountInfo.selectedCity,
    barangay: accountInfo.selectedBarangay,
    zipCode: accountInfo.zipCode,
    contactNumber: accountInfo.contactNumber
  };
  
  const errors = validateFields(fieldsToValidate);
  
  // Special validation for complete phone number
  const phoneError = validateCompletePhone(accountInfo.areaCode, accountInfo.phoneNumber);
  if (phoneError) {
    errors.phone = phoneError;
  }
  
  return errors;
};

export const validateCompanyInfo = (companyInfo) => {
  const fieldsToValidate = {
    establishmentName: companyInfo.establishmentName
  };
  
  return validateFields(fieldsToValidate);
};

export const validateFiles = (files) => {
  const requiredFiles = ['business-permit', 'bir-2303', 'dti-certificate'];
  const errors = {};
  
  // Validate required files
  requiredFiles.forEach(fileId => {
    const file = files[fileId];
    const error = validateField(fileId, file);
    if (error) {
      errors[fileId] = error;
    }
  });
  
  // Validate optional DOT file if present
  if (files['dot-applicable']) {
    const error = validateField('dot-applicable', files['dot-applicable']);
    if (error) {
      errors['dot-applicable'] = error;
    }
  }
  
  return errors;
};

// Complete form validation
export const validateRegistrationForm = (accountInfo, companyInfo, files) => {
  const accountErrors = validateAccountInfo(accountInfo);
  const companyErrors = validateCompanyInfo(companyInfo);
  const fileErrors = validateFiles(files);
  
  return {
    ...accountErrors,
    ...companyErrors,
    ...fileErrors
  };
};

// Utility to check if form has errors
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

// Utility to get first error message
export const getFirstError = (errors) => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
};

// Utility to scroll to first error
export const scrollToFirstError = () => {
  const firstErrorElement = document.querySelector('.error-message-base, .error-message');
  if (firstErrorElement) {
    firstErrorElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }
}; 