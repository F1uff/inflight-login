import React from 'react';
import { Icons } from '../data/icons.jsx';

const IncidentPage = () => {
  return (
    <div className="incident-page-content">
      <div className="page-header">
        <h2 className="page-title">INCIDENT REPORT</h2>
      </div>
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">{Icons.incident}</div>
          <h3>No incident reports</h3>
          <p>Incident reporting features will be available here.</p>
        </div>
      </div>
    </div>
  );
};

export default IncidentPage; 