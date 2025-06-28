import React from 'react';

const SupplierPortfolioSection = ({ portfolioCounts, portfolioLoading }) => {
  return (
    <div className="supplier-portfolio-section">
      <h1 className="portfolio-title">SUPPLIER PORTFOLIO COUNT</h1>
      <div className="portfolio-cards-grid">
        <div className="portfolio-card hotel">
          <div className="card-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V6H1V4h18v3z"/>
              <path d="M1 18v-2h22v2H1z"/>
            </svg>
          </div>
          <div className="card-content">
            <div className="card-label">HOTEL</div>
            <div className="card-count">{portfolioLoading ? '...' : portfolioCounts.hotel.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="portfolio-card transfer">
          <div className="card-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <div className="card-content">
            <div className="card-label">TRANSFER</div>
            <div className="card-count">{portfolioLoading ? '...' : portfolioCounts.transfer.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="portfolio-card airline">
          <div className="card-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <div className="card-content">
            <div className="card-label">AIRLINE</div>
            <div className="card-count">{portfolioLoading ? '...' : portfolioCounts.airline.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="portfolio-card travel-operator">
          <div className="card-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="card-content">
            <div className="card-label">TRAVEL OPERATOR</div>
            <div className="card-count">{portfolioLoading ? '...' : portfolioCounts.travelOperator.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPortfolioSection; 