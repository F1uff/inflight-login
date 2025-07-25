import React from 'react';
import { Icons } from '../data/icons.jsx';

const StatusIndicator = ({ status, label, isActive, onClick }) => {
  return (
    <div 
      className={`status-pill ${status} ${isActive ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <span className="status-dot"></span>
      {label}
    </div>
  );
};

const AccountsSection = ({ 
  filteredData, 
  selectedStatus, 
  searchTerms, 
  handleSearchChange, 
  filterByStatus, 
  getStatusCounts 
}) => {
  const statusCounts = getStatusCounts(filteredData.accounts);

  return (
    <div className="accounts-page-content">
      {/* Header section with stats */}
      <div className="accounts-header-wrapper">
        <h2 className="accounts-main-title">LIST OF ACCOUNTS</h2>
        
        <div className="accounts-header-right">
          <div className="accounts-stats-container">
            <div className="stats-item">
              <div className="stat-label">ALL EMPLOYEES</div>
              <div className="stat-number">{filteredData.accounts.length}</div>
            </div>
            
            <div className="stats-item">
              <div className="stat-label">ACTIVE</div>
              <div className="stat-number active">{statusCounts.active}</div>
            </div>
            
            <div className="stats-item">
              <div className="stat-label">PENDING</div>
              <div className="stat-number pending">{statusCounts.pending}</div>
            </div>
          </div>
          
          <button className="add-employee-btn">
            <span className="plus-icon">+</span> Add employee
          </button>
        </div>
      </div>

      {/* Filter section */}
      <div className="accounts-filter-section">
        <div className="title-status-group">
          <select className="travel-desk-dropdown">
            <option>Travel Desk</option>
          </select>
          <div className="status-indicators">
            <StatusIndicator 
              status="active" 
              label="ACTIVE"
              isActive={selectedStatus === 'active'}
              onClick={() => filterByStatus('active', 'accounts')}
            />
            <StatusIndicator 
              status="pending" 
              label="PENDING"
              isActive={selectedStatus === 'pending'}
              onClick={() => filterByStatus('pending', 'accounts')}
            />
            <StatusIndicator 
              status="inactive" 
              label="IN-ACTIVE"
              isActive={selectedStatus === 'inactive'}
              onClick={() => filterByStatus('inactive', 'accounts')}
            />
          </div>
        </div>
        <div className="search-container-enhanced">
          <input 
            type="text" 
            placeholder="Search accounts..." 
            value={searchTerms.accounts}
            onChange={(e) => handleSearchChange('accounts', e.target.value)}
          />
          <button className="search-btn-enhanced">
            {Icons.searchIcon}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="accounts-table-section">
        <table className="accounts-table">
          <thead>
            <tr>
              <th className="checkbox-column"></th>
              <th>ID Number</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Company</th>
              <th>Email Address</th>
              <th>Group</th>
              <th>Edit Details</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.accounts.map((account, index) => (
              <tr key={account.id || `account-${index}`} className={`account-row ${index === 1 || index === 3 || index === 5 ? 'row-alternate' : ''}`}>
                <td className="checkbox-column">
                  <input type="checkbox" className="account-checkbox" />
                </td>
                <td className="id-column">{account.id}</td>
                <td>{account.name}</td>
                <td>{account.designation}</td>
                <td>{account.company}</td>
                <td>{account.email}</td>
                <td>{account.group}</td>
                <td className="edit-column">
                  <button className="edit-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                </td>
                <td className="status-column">
                  <div className={`account-status-indicator ${account.status}`}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="accounts-table-footer">
          <span className="table-info">Showing 1 to 22 of 22 entries</span>
        </div>
      </div>
    </div>
  );
};

export default AccountsSection; 