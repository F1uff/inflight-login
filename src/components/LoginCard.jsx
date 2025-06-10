import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Email input field icon
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
    <path fill="#999" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

// Password input field icon
const PasswordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
    <path fill="#999" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);

function LoginCard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create auth token based on email (admin or regular user)
    let token;
    
    if (email.includes('admin')) {
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4ifQ.hZi5GSEClUGdAALOBWp4XfqW9s-CMiW_DP7K74GgPGE';
    } else {
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlJlZ3VsYXIgVXNlciIsInJvbGUiOiJ1c2VyIn0.Gi3JBnD1ZGYlkxMD1tGAj0E7fDO1NC3VRIz-aX7xnyw';
    }
    
    localStorage.setItem('token', token);
    navigate('/dashboard');
  };

  return (
    <div className="login-card">
      <h2>LOG IN</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="email"
            id="email" 
            name="email" 
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="input-icon email-icon">
            <EmailIcon />
          </div>
        </div>
        <div className="input-group">
          <input
            type="password"
            id="password" 
            name="password" 
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="input-icon password-icon">
            <PasswordIcon />
        </div>
        </div>
        <div className="form-footer">
          <Link to="/register" className="create-account">Create Account</Link>
          <button type="submit" className="sign-in-button">Sign in</button>
        </div>
      </form>
    </div>
  );
}

export default LoginCard;