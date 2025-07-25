import React, { useState } from 'react';
import ProfileCard from './ProfileCard';
import './ProfileCardDemo.css';

const ProfileCardDemo = () => {
  const [selectedCard, setSelectedCard] = useState('default');

  // Sample company data configurations
  const companyConfigs = {
    default: {
      companyName: "Ronway Cars & Travels",
      companyId: "2024-8899",
      email: "info@redplanetlogistics.com",
      phone: "+63 2 8123 4567",
      address: "Manila, Philippines",
      status: "active",
      verificationStatus: "verified",
      memberSince: "2024",
      industry: "Logistics & Transportation",
      logo: null
    },
    withLogo: {
      companyName: "RONWAY CARS AND TRAVEL",
      companyId: "LTP00789",
      email: "info@ronway.com",
      phone: "+63 2 8555 0123",
      address: "Quezon City, Philippines",
      status: "active",
      verificationStatus: "verified",
      memberSince: "2023",
      industry: "Transportation & Travel",
      logo: "/assets/ronway.png" // This would be an actual logo URL
    },
    pending: {
      companyName: "SWIFT DELIVERY SOLUTIONS",
      companyId: "2024-9912",
      email: "contact@swiftdelivery.ph",
      phone: "+63 2 8456 7890",
      address: "Makati City, Philippines",
      status: "pending",
      verificationStatus: "pending",
      memberSince: "2024",
      industry: "Courier & Delivery",
      logo: null
    },
    unverified: {
      companyName: "METRO CARGO EXPRESS",
      companyId: "2024-7734",
      email: "info@metrocargo.com",
      phone: "+63 2 8789 0123",
      address: "Pasig City, Philippines",
      status: "active",
      verificationStatus: "unverified",
      memberSince: "2024",
      industry: "Freight & Cargo",
      logo: null
    }
  };

  const handleEditProfile = () => {
    alert('Edit Profile clicked!');
  };

  const handleSettings = () => {
    alert('Settings clicked!');
  };

  const handleCardSelect = (cardType) => {
    setSelectedCard(cardType);
  };

  return (
    <div className="profile-card-demo">
      <div className="demo-header">
        <h1>ProfileCard Component Demo</h1>
        <p>Interactive demonstration of the ProfileCard component with various configurations.</p>
      </div>

      {/* Configuration Selector */}
      <div className="demo-controls">
        <h3>Select Configuration:</h3>
        <div className="demo-buttons">
          <button 
            className={`demo-btn ${selectedCard === 'default' ? 'active' : ''}`}
            onClick={() => handleCardSelect('default')}
          >
            Default (No Logo)
          </button>
          <button 
            className={`demo-btn ${selectedCard === 'withLogo' ? 'active' : ''}`}
            onClick={() => handleCardSelect('withLogo')}
          >
            With Logo
          </button>
          <button 
            className={`demo-btn ${selectedCard === 'pending' ? 'active' : ''}`}
            onClick={() => handleCardSelect('pending')}
          >
            Pending Status
          </button>
          <button 
            className={`demo-btn ${selectedCard === 'unverified' ? 'active' : ''}`}
            onClick={() => handleCardSelect('unverified')}
          >
            Unverified
          </button>
        </div>
      </div>

      {/* Card Display */}
      <div className="demo-content">
        <div className="demo-card-container">
          <ProfileCard 
            companyData={companyConfigs[selectedCard]}
            onEdit={handleEditProfile}
            onSettings={handleSettings}
            isEditable={true}
            size="default"
          />
        </div>
      </div>

      {/* Size Variations */}
      <div className="demo-sizes">
        <h3>Size Variations:</h3>
        <div className="demo-sizes-grid">
          <div className="demo-size-item">
            <h4>Compact Size</h4>
            <ProfileCard 
              companyData={companyConfigs.default}
              onEdit={handleEditProfile}
              onSettings={handleSettings}
              isEditable={true}
              size="compact"
            />
          </div>
          <div className="demo-size-item">
            <h4>Default Size</h4>
            <ProfileCard 
              companyData={companyConfigs.default}
              onEdit={handleEditProfile}
              onSettings={handleSettings}
              isEditable={true}
              size="default"
            />
          </div>
          <div className="demo-size-item">
            <h4>Expanded Size</h4>
            <ProfileCard 
              companyData={companyConfigs.default}
              onEdit={handleEditProfile}
              onSettings={handleSettings}
              isEditable={true}
              size="expanded"
            />
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="demo-usage">
        <h3>Usage Examples:</h3>
        <div className="demo-code-section">
          <h4>Basic Usage:</h4>
          <pre className="demo-code">
{`import ProfileCard from './ProfileCard';

// Basic usage with default data
<ProfileCard />

// With custom company data
<ProfileCard 
  companyData={{
    companyName: "YOUR COMPANY NAME",
    companyId: "YOUR-ID",
    email: "your@email.com",
    phone: "+63 2 8123 4567",
    address: "Your Address",
    status: "active",
    verificationStatus: "verified",
    logo: "/path/to/logo.png"
  }}
  onEdit={() => console.log('Edit clicked')}
  onSettings={() => console.log('Settings clicked')}
  isEditable={true}
  size="default"
/>`}
          </pre>
        </div>
        
        <div className="demo-code-section">
          <h4>Read-only Card:</h4>
          <pre className="demo-code">
{`<ProfileCard 
  companyData={yourCompanyData}
  isEditable={false}
  size="compact"
/>`}
          </pre>
        </div>

        <div className="demo-code-section">
          <h4>Different Status Examples:</h4>
          <pre className="demo-code">
{`// Active & Verified
status: "active",
verificationStatus: "verified"

// Pending approval
status: "pending",
verificationStatus: "pending"

// Active but unverified
status: "active",
verificationStatus: "unverified"

// Inactive
status: "inactive",
verificationStatus: "verified"`}
          </pre>
        </div>
      </div>

      {/* Features List */}
      <div className="demo-features">
        <h3>Component Features:</h3>
        <ul className="demo-features-list">
          <li>✅ <strong>Responsive Design</strong> - Works on all screen sizes</li>
          <li>✅ <strong>Logo Support</strong> - Shows company logo or generated initials</li>
          <li>✅ <strong>Status Indicators</strong> - Visual status and verification badges</li>
          <li>✅ <strong>Interactive Actions</strong> - Edit and settings buttons</li>
          <li>✅ <strong>Contact Information</strong> - Email, phone, and address display</li>
          <li>✅ <strong>Customizable Sizes</strong> - Compact, default, and expanded sizes</li>
          <li>✅ <strong>Hover Effects</strong> - Smooth animations and transitions</li>
          <li>✅ <strong>Accessibility</strong> - Screen reader friendly and keyboard navigable</li>
          <li>✅ <strong>Print Support</strong> - Optimized for printing</li>
          <li>✅ <strong>Loading States</strong> - Built-in loading animation support</li>
        </ul>
      </div>

      {/* Integration Notes */}
      <div className="demo-integration">
        <h3>Integration Notes:</h3>
        <div className="demo-info-box">
          <p><strong>Perfect for:</strong></p>
          <ul>
            <li>User dashboard sidebars</li>
            <li>Company profile pages</li>
            <li>Account settings sections</li>
            <li>Admin panels</li>
            <li>Directory listings</li>
          </ul>
          
          <p><strong>Easy to integrate:</strong></p>
          <ul>
            <li>Just import the component and CSS</li>
            <li>Pass your company data as props</li>
            <li>Customize with size and behavior props</li>
            <li>Style with CSS custom properties if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileCardDemo; 