/**
 * Utility functions for file uploads
 */

/**
 * Upload a file to the server
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @param {string} options.documentType - Type of document (e.g., 'license', 'nda')
 * @param {string} options.userId - ID of the user uploading the document
 * @returns {Promise<Object>} - Promise resolving to upload result
 */
export const uploadFile = async (file, options = {}) => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  // Create FormData to send the file to the server
  const formData = new FormData();
  formData.append('file', file);
  
  // Add any additional options as form data
  Object.keys(options).forEach(key => {
    formData.append(key, options[key]);
  });
  
  try {
    // Log the upload attempt
    console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Make actual API call to upload endpoint
    const response = await fetch('/api/v1/upload', { 
      method: 'POST', 
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      fileName: file.name,
      fileUrl: result.fileUrl || URL.createObjectURL(file),
      fileSize: file.size,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      message: 'File uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Validate a file before upload
 * @param {File} file - The file to validate
 * @param {Object} constraints - Validation constraints
 * @param {number} constraints.maxSizeMB - Maximum file size in MB
 * @param {Array<string>} constraints.allowedTypes - Array of allowed MIME types
 * @returns {Object} - Validation result { valid: boolean, error: string }
 */
export const validateFile = (file, constraints = {}) => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  
  const { maxSizeMB = 10, allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'] } = constraints;
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `File size exceeds the maximum limit of ${maxSizeMB} MB` 
    };
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  return { valid: true };
};

/**
 * Format bytes to a human-readable string
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted string
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
