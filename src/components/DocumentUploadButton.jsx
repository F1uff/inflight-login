import React, { useState, useRef } from 'react';
import { uploadFile, validateFile } from '../utils/fileUpload';
import './DocumentStyles.css';

/**
 * Document Upload Button Component
 * @param {Object} props - Component props
 * @param {string} props.documentType - Type of document being uploaded (license, nda, etc)
 * @param {Function} props.onUploadComplete - Callback function executed after successful upload
 * @param {Function} props.onUploadError - Callback function executed if upload fails
 * @param {string} props.buttonText - Text to display on the button
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.acceptTypes - Accepted file types (e.g. ".pdf,.jpg,.png")
 * @param {number} props.maxSizeMB - Maximum file size in MB
 */
const DocumentUploadButton = ({
  documentType = 'document',
  onUploadComplete = () => {},
  onUploadError = () => {},
  buttonText = 'UPLOAD DOCUMENT',
  className = '',
  acceptTypes = '.pdf,.jpg,.jpeg,.png',
  maxSizeMB = 10
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // File constraints for validation
  const fileConstraints = {
    maxSizeMB,
    allowedTypes: acceptTypes.split(',').map(type => {
      // Convert file extensions to MIME types
      switch(type.trim().toLowerCase()) {
        case '.pdf': return 'application/pdf';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.png': return 'image/png';
        default: return type.trim();
      }
    })
  };

  // Handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset state
    setError(null);
    setUploadProgress(0);
    
    // Validate file
    const validation = validateFile(file, fileConstraints);
    if (!validation.valid) {
      setError(validation.error);
      onUploadError(validation.error);
      return;
    }

    // Start upload process
    setIsUploading(true);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          return newProgress >= 95 ? 95 : newProgress;
        });
      }, 200);
      
      // Upload the file
      const result = await uploadFile(file, { documentType });
      
      // Upload complete
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Notify parent component
      onUploadComplete(result);
      
      // Reset form after a short delay to show 100% completion
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 800);
      
    } catch (err) {
      setError(err.message || 'Upload failed');
      onUploadError(err.message || 'Upload failed');
      setIsUploading(false);
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="document-upload-container">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptTypes}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
      
      {/* Visible upload button */}
      <button 
        className={`action-btn upload-document-btn ${className} ${isUploading ? 'uploading' : ''}`}
        onClick={handleButtonClick}
        disabled={isUploading}
      >
        <span className="btn-icon">📁</span>
        {isUploading ? 'UPLOADING...' : buttonText}
      </button>
      
      {/* Progress bar (shown only during upload) */}
      {isUploading && (
        <div className="upload-progress-container">
          <div 
            className="upload-progress-bar" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <span className="upload-progress-text">{Math.round(uploadProgress)}%</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="upload-error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default DocumentUploadButton;
