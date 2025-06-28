import React from 'react';
import { Icons } from '../data/icons.jsx';

const DocumentsPage = () => {
  return (
    <div className="documents-page-content">
      <div className="page-header">
        <h2 className="page-title">DOCUMENTS</h2>
      </div>
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">{Icons.documents}</div>
          <h3>No documents available</h3>
          <p>Document management features will be available here.</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage; 