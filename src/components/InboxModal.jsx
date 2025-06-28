import React from 'react';

const InboxModal = ({ 
  inboxModalVisible, 
  closeInboxModal, 
  openNotificationPage 
}) => {
  if (!inboxModalVisible) return null;

  return (
    <div className="modal-overlay" onClick={closeInboxModal}>
      <div className="inbox-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>INBOX</h2>
          <button className="modal-close" onClick={closeInboxModal}>×</button>
        </div>
        
        <div className="inbox-modal-content">
          <div className="inbox-item">
            <div className="company-logo">
              <img src="/api/placeholder/40/40" alt="CRZTY MCLLN" />
            </div>
            <div className="inbox-item-details">
              <div className="company-name">CRZTY MCLLN TRANSPORT SERVICES INC.</div>
              <div className="company-message">Requesting link for confirmation</div>
              <div className="message-time">07/03/24 05:39PM</div>
            </div>
          </div>
          
          <div className="inbox-item">
            <div className="company-logo">
              <img src="/api/placeholder/40/40" alt="Grab Transportation" />
            </div>
            <div className="inbox-item-details">
              <div className="company-name">GRAB TRANSPORTATION</div>
              <div className="company-message">Re-New Accreditation</div>
              <div className="message-time">10-15-2022</div>
            </div>
          </div>
          
          <div className="inbox-item">
            <div className="company-logo">
              <img src="/api/placeholder/40/40" alt="Inflight Menu" />
            </div>
            <div className="inbox-item-details">
              <div className="company-name">INFLIGHT MENU TRAVEL MANAGEMENT CORP.</div>
              <div className="company-message">Accreditation Expiry</div>
              <div className="message-time">09-22-2022</div>
            </div>
          </div>
        </div>
        
        <div className="inbox-modal-footer">
          <button 
            className="view-all-notifications-btn" 
            onClick={() => {
              closeInboxModal();
              openNotificationPage();
            }}
          >
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default InboxModal; 