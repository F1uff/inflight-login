import React from 'react';
import { useNavigate } from 'react-router-dom';
import verificationImage from '../assets/Verification.jpg';

const EmailVerificationModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose && onClose();
    navigate('/'); // Go to login form
  };

  return (
    <div className="modal-overlay">
      <div className="account-created-modal" style={{ width: '430px', maxWidth: '90%' }}>
        <div className="modal-icon" style={{ border: 'none' }}>
          <img 
            src={verificationImage} 
            alt="Verification Badge" 
            style={{ 
              display: 'block', 
              margin: '0 auto', 
              width: '144px', 
              height: '144px',
              border: 'none',
              boxShadow: 'none'
            }} 
          />
        </div>
        <h2 className="modal-title">Your account was created!</h2>
        <p className="modal-message">Congratulations!<br/>You just created an account.</p>
        <button className="modal-login-btn" onClick={handleLogin}>Log in</button>
      </div>
    </div>
  );
};

// EmailVerificationModal displays a success message when a user creates an account
// onClose: Function that closes the modal when called
export default EmailVerificationModal;
