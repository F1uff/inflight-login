import React from 'react';
import { Icons } from '../data/icons.jsx';

const DirPage = () => {
  return (
    <div className="dir-page-content">
      <div className="page-header">
        <h2 className="page-title">DIR</h2>
      </div>
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">{Icons.dir}</div>
          <h3>DIR section</h3>
          <p>DIR management features will be available here.</p>
        </div>
      </div>
    </div>
  );
};

export default DirPage; 