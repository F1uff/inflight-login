import React, { useState, useRef } from 'react';
import './AdminProfile.css';
import inflightLogo from '../assets/inflight-menu-logo.png';

// Enhanced Icons
const Icons = {
  camera: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>
  ),
  save: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
    </svg>
  ),
  user: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  lock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  )
};

const AdminProfile = () => {
  const [formFields, setFormFields] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@inflight.com',
    phone: '+63 912 345 6789',
    position: 'System Administrator',
    department: 'Information Technology',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormFields(prev => ({ ...prev, [field]: value }));
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-profile-container">
      {/* Success Message */}
      {showSuccess && (
        <div className="admin-profile-success-banner">
          <div className="admin-profile-success-content">
            {Icons.check}
            <span>Profile updated successfully!</span>
          </div>
        </div>
      )}

      <div className="admin-profile-content">
        {/* Header Section */}
        <div className="admin-profile-header">
          <div className="admin-profile-header-content">
            <div className="admin-profile-logo">
              <img src={inflightLogo} alt="Inflight Logo" />
            </div>
            <div className="admin-profile-title-section">
              <h1 className="admin-profile-main-title">ADMIN PROFILE</h1>
              <p className="admin-profile-subtitle">Manage your account settings and personal information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-profile-form">
          
          {/* Profile Image Section */}
          <div className="admin-profile-image-section">
            <div className="admin-profile-image-container">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="admin-profile-image" />
              ) : (
                <div className="admin-profile-image-placeholder">
                  {Icons.user}
                </div>
              )}
              <div className="admin-profile-image-overlay">
                <button 
                  type="button" 
                  className="admin-profile-image-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {Icons.camera}
                  <span>Change Photo</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            <div className="admin-profile-image-info">
              <h3>{formFields.firstName} {formFields.lastName}</h3>
              <p>{formFields.position} • {formFields.department}</p>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="admin-profile-section">
            <div className="admin-profile-section-header">
              <h2 className="admin-profile-section-title">
                {Icons.user}
                Personal Information
              </h2>
              <p className="admin-profile-section-description">
                Update your basic profile information
              </p>
            </div>
            
            <div className="admin-profile-form-grid">
              <div className="admin-profile-form-group">
                <label className="admin-profile-label">First Name</label>
                <input 
                  type="text" 
                  className="admin-profile-input"
                  value={formFields.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              
              <div className="admin-profile-form-group">
                <label className="admin-profile-label">Last Name</label>
                <input 
                  type="text" 
                  className="admin-profile-input"
                  value={formFields.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
              
              <div className="admin-profile-form-group">
                <label className="admin-profile-label">Email Address</label>
                <input 
                  type="email" 
                  className="admin-profile-input"
                  value={formFields.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="admin-profile-form-group">
                <label className="admin-profile-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="admin-profile-input"
                  value={formFields.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="admin-profile-form-group">
                <label className="admin-profile-label">Position</label>
                <input 
                  type="text" 
                  className="admin-profile-input"
                  value={formFields.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Enter your position/title"
                />
              </div>
              
              <div className="admin-profile-form-group">
                <label className="admin-profile-label">Department</label>
                <input 
                  type="text" 
                  className="admin-profile-input"
                  value={formFields.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Enter your department"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="admin-profile-section">
            <div className="admin-profile-section-header">
              <h2 className="admin-profile-section-title">
                {Icons.lock}
                Security Settings
              </h2>
              <p className="admin-profile-section-description">
                Update your password to keep your account secure
              </p>
            </div>
            
            <div className="admin-profile-form-grid">
              <div className="admin-profile-form-group">
                <label className="admin-profile-label">Current Password</label>
                <input 
                  type="password" 
                  className="admin-profile-input"
                  value={formFields.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              
              <div className="admin-profile-form-group">
                <label className="admin-profile-label">New Password</label>
                <input 
                  type="password" 
                  className="admin-profile-input"
                  value={formFields.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="admin-profile-form-group">
                <label className="admin-profile-label">Confirm Password</label>
                <input 
                  type="password" 
                  className="admin-profile-input"
                  value={formFields.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="admin-profile-submit-section">
            <button 
              type="submit" 
              className="admin-profile-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="admin-profile-spinner"></div>
                  Updating Profile...
                </>
              ) : (
                <>
                  {Icons.save}
                  Update Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
