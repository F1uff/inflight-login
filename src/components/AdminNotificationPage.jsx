import React, { useState, useEffect } from 'react';
import './AdminNotificationPage.css';

const AdminNotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filter notifications based on selected criteria
  useEffect(() => {
    let filtered = notifications;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(notification => notification.category === selectedFilter);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(notification => notification.priority === selectedPriority);
    }

    if (showUnreadOnly) {
      filtered = filtered.filter(notification => !notification.read);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, selectedFilter, selectedPriority, searchQuery, showUnreadOnly]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
    setSelectedNotifications(prev =>
      prev.filter(id => id !== notificationId)
    );
  };

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const deleteSelected = () => {
    setNotifications(prev =>
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    );
    setSelectedNotifications([]);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        );
      case 'renewal':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
          </svg>
        );
      case 'expiry':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        );
      case 'document':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
        );
      case 'system':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        );
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-page">
      <div className="notification-header">
        <div className="notification-title-section">
          <h1 className="notification-page-title">NOTIFICATIONS</h1>
          <div className="notification-stats">
            <span className="total-count">{notifications.length} Total</span>
            <span className="unread-count">{unreadCount} Unread</span>
          </div>
        </div>
        
        <div className="notification-actions">
          <button 
            className="action-btn mark-all-read"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </button>
          {selectedNotifications.length > 0 && (
            <button 
              className="action-btn delete-selected"
              onClick={deleteSelected}
            >
              Delete Selected ({selectedNotifications.length})
            </button>
          )}
        </div>
      </div>

      <div className="notification-filters">
        <div className="filter-section">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="registration">Registration</option>
              <option value="renewal">Renewal</option>
              <option value="expiry">Expiry</option>
              <option value="document">Documents</option>
              <option value="update">Updates</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Priority:</label>
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
              />
              Show Unread Only
            </label>
          </div>
        </div>

        <div className="search-section">
          <div className="search-input-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="notification-list-header">
        <div className="bulk-actions">
          <input
            type="checkbox"
            checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
            onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
            className="select-all-checkbox"
          />
          <span className="bulk-action-text">
            {selectedNotifications.length > 0 
              ? `${selectedNotifications.length} selected`
              : 'Select all'
            }
          </span>
        </div>
        
        <div className="list-info">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
      </div>

      <div className="notification-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
            </div>
            <h3>No notifications found</h3>
            <p>Try adjusting your filters or search criteria.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'} ${selectedNotifications.includes(notification.id) ? 'selected' : ''}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="notification-checkbox">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => toggleNotificationSelection(notification.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="notification-icon" style={{ color: getPriorityColor(notification.priority) }}>
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-avatar">
                {notification.avatar ? (
                  <img src={notification.avatar} alt={notification.company} />
                ) : (
                  <div className="avatar-placeholder">
                    {notification.company.charAt(0)}
                  </div>
                )}
              </div>

              <div className="notification-content">
                <div className="notification-main">
                  <h3 className="notification-title">{notification.title}</h3>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-meta">
                    <span className="notification-company">{notification.company}</span>
                    <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
                  </div>
                </div>
                
                <div className="notification-priority">
                  <span 
                    className={`priority-badge priority-${notification.priority}`}
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  >
                    {notification.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="notification-actions-menu">
                <button 
                  className="action-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  title="Delete notification"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotificationPage;
