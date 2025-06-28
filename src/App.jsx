import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Images/logos used in the app
import logo from './assets/inflight-menu-logo.png';
import timLogo from './assets/tim-logo.svg';
import corporateLogo from './assets/corporate-emblem.png';

// Page and component imports
import CombinedRegistrationForm from './components/CombinedRegistrationForm';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import HotelDashboard from './components/HotelDashboard';
import UserProfile from './components/UserProfile';
import RedPlanetProfile from './components/RedPlanetProfile';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import CompanyInformationPage from './components/CompanyInformationPage';
import LoginCard from './components/LoginCard';
import SystemPerformancePage from './components/SystemPerformancePage';

// Email icon for login form
const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
    <path fill="#999" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

// Password icon for login form
const PasswordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15">
    <path fill="#999" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);

// Header Component - Displays different layouts based on page type
export const Header = ({ isDashboard = false, isUserDashboard = false, isRedPlanetProfile = false, isRedPlanetDashboard = false, isLoginOrRegister = false }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };
  
  // Red Planet (Hotel) Dashboard header
  if (isRedPlanetDashboard) {
    return (
      <header className="user-dashboard-header">
        <div className="user-dashboard-logo">
          <img src={timLogo} alt="TIM Logo" className="service-portal-logo" />
          <span className="service-portal-text">DASHBOARD</span>
        </div>
        <nav className="user-dashboard-nav">
          <a href="#" className="user-header-link">TIM OFFICIAL WEBSITE</a>
          <a href="#" className="user-header-link">CONTACT</a>
          <Link to="/dashboard/user2/profile" className="user-header-link profile-link">PROFILE</Link>
          <a href="#" className="user-header-link logout-link" onClick={handleLogout}>LOG OUT</a>
        </nav>
      </header>
    );
  }
  
  // Red Planet Profile header with PROFILE text
  if (isRedPlanetProfile) {
    return (
      <header className="user-dashboard-header">
        <div className="user-dashboard-logo">
          <img src={timLogo} alt="TIM Logo" className="service-portal-logo" />
          <span className="service-portal-text">PROFILE</span>
        </div>
        <nav className="user-dashboard-nav">
          <a href="#" className="user-header-link">TIM OFFICIAL WEBSITE</a>
          <a href="#" className="user-header-link">CONTACT</a>
          <Link to="/dashboard/user2/profile" className="user-header-link profile-link">PROFILE</Link>
          <a href="#" className="user-header-link logout-link" onClick={handleLogout}>LOG OUT</a>
        </nav>
      </header>
    );
  }
  
  // User Dashboard header (blue SERVICE PORTAL)
  if (isUserDashboard) {
    return (
      <header className="user-dashboard-header">
        <div className="user-dashboard-logo">
          <img src={timLogo} alt="TIM Logo" className="service-portal-logo" />
          <span className="service-portal-text">DASHBOARD</span>
        </div>
        <nav className="user-dashboard-nav">
          <a href="#" className="user-header-link">TIM OFFICIAL WEBSITE</a>
          <a href="#" className="user-header-link">CONTACT</a>
          <Link to="/dashboard/user/profile" className="user-header-link profile-link">PROFILE</Link>
          <a href="#" className="user-header-link logout-link" onClick={handleLogout}>LOG OUT</a>
        </nav>
      </header>
    );
  }
  
  // Default header for login and other pages
  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Inflight Menu Logo" />
        <span>THE INFLIGHT MENU</span>
      </div>
      <nav className="nav-links">
        <a href="#" className="header-link">TIM OFFICIAL WEBSITE</a>
        <a href="#" className="header-link">CONTACT</a>
        {!isLoginOrRegister && (
          <>
        {isDashboard ? (
          <>
            <Link to="/dashboard/user/profile" className="header-link profile-link">PROFILE</Link>
            <a href="#" className="header-link logout-link" onClick={handleLogout}>LOG OUT</a>
          </>
        ) : (
          <>
            <a href="#" className="header-link profile-link">PROFILE</a>
            <a href="#" className="header-link logout-link" onClick={handleLogout}>LOG OUT</a>
              </>
            )}
          </>
        )}
      </nav>
    </header>
  );
};

// Footer with help, privacy, and terms links
const Footer = () => (
  <footer className="footer">
    <div className="footer-links">
      <a href="#">HELP</a>
      <a href="#">PRIVACY</a>
      <a href="#">TERMS</a>
    </div>
  </footer>
);

// Login Page showing corporate logo, title and login form
const LoginPage = () => {
  return (
    <>
      <img src={corporateLogo} alt="Corporate Travel Management" className="corporate-logo" />
      <h1 className="portal-title">Inflight Service Portal</h1>
      <LoginCard />
      <div className="login-options">
        <div className="remember-me">
          <input type="checkbox" id="remember" name="remember" />
          <label htmlFor="remember">Remember user name</label>
        </div>
        <a href="#" className="forgot-password">Forgot password?</a>
      </div>
    </>
  );
};

// Main content with routes and header/footer logic
const AppContent = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check token in localStorage to determine login status
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };
  
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Get current path to determine which header to show
  const currentPath = location.pathname;
  const isDashboard = currentPath.includes('/dashboard');
  const isAdminDashboard = currentPath.includes('/dashboard/admin');
  const isUserDashboard = currentPath.includes('/dashboard/user');
  const isRedPlanetProfile = currentPath.includes('/dashboard/user2/profile');
  const isRedPlanetDashboard = currentPath.includes('/dashboard/user2') && !currentPath.includes('/dashboard/user2/profile');
  const isSystemPerformance = currentPath.includes('/system-performance');
  const isCompanyInfoView = currentPath.includes('/company-info');
  const isLoginOrRegister = currentPath === '/' || currentPath.includes('/register');
  
  return (
    <div className="app-container">
      {!isAdminDashboard && !isUserDashboard && !isRedPlanetProfile && !isRedPlanetDashboard && !isSystemPerformance && (
        <Header 
          isDashboard={isDashboard} 
          isCompanyInfoView={isCompanyInfoView} 
          isLoggedIn={isLoggedIn} 
          isUserDashboard={isUserDashboard}
          isRedPlanetProfile={isRedPlanetProfile}
          isRedPlanetDashboard={isRedPlanetDashboard}
          isLoginOrRegister={isLoginOrRegister}
        />
      )}
      
      {isUserDashboard && (
        <Header 
          isDashboard={isDashboard} 
          isCompanyInfoView={isCompanyInfoView} 
          isLoggedIn={isLoggedIn} 
          isUserDashboard={isUserDashboard}
          isRedPlanetProfile={isRedPlanetProfile}
          isRedPlanetDashboard={isRedPlanetDashboard}
          isLoginOrRegister={isLoginOrRegister}
        />
      )}

      {isRedPlanetDashboard && !isRedPlanetProfile && (
        <Header 
          isDashboard={isDashboard} 
          isCompanyInfoView={isCompanyInfoView} 
          isLoggedIn={isLoggedIn} 
          isUserDashboard={isUserDashboard}
          isRedPlanetProfile={isRedPlanetProfile}
          isRedPlanetDashboard={isRedPlanetDashboard}
          isLoginOrRegister={isLoginOrRegister}
        />
      )}

      {isRedPlanetProfile && (
        <Header 
          isDashboard={isDashboard} 
          isCompanyInfoView={isCompanyInfoView} 
          isLoggedIn={isLoggedIn} 
          isUserDashboard={isUserDashboard}
          isRedPlanetProfile={isRedPlanetProfile}
          isRedPlanetDashboard={isRedPlanetDashboard}
          isLoginOrRegister={isLoginOrRegister}
        />
      )}

      <main className={isAdminDashboard || isUserDashboard || isRedPlanetProfile || isRedPlanetDashboard || isSystemPerformance ? "dashboard-main" : `main-content ${currentPath.includes('/register') ? 'registration-page' : ''}`}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<CombinedRegistrationForm />} />
          <Route path="/dashboard" element={<RoleBasedRedirect />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/user2" element={<HotelDashboard />} />
          <Route path="/dashboard/user2/profile" element={<RedPlanetProfile />} />
          <Route path="/dashboard/user/profile" element={<UserProfile />} />
          <Route path="/dashboard/user/company-info" element={<UserDashboard companyInfoView={true} />} />
          <Route path="/system-performance" element={<SystemPerformancePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {!isAdminDashboard && !isUserDashboard && !isRedPlanetProfile && !isRedPlanetDashboard && !isSystemPerformance && <Footer />}
    </div>
  );
};

// Main app with router setup
const App = () => {
  return (
    <Router basename="/serviceportal/static/inflight-login">
      <AppContent />
    </Router>
  );
};

export default App;