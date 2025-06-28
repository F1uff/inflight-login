import React from 'react';
import { Icons } from '../data/icons.jsx';

const ShemsPage = () => {
  return (
    <div className="shems-page-content">
      <div className="page-header">
        <h2 className="page-title">SHE-MS</h2>
      </div>
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">{Icons.shems}</div>
          <h3>Safety, Health and Environmental Management</h3>
          <p>SHE-MS features will be available here.</p>
        </div>
      </div>
    </div>
  );
};

export default ShemsPage; 