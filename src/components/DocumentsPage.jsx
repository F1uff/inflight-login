import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../data/icons.jsx';
import DocumentViewer from './DocumentViewer';
import { getDocumentPath } from '../utils/paths';
import { preloadDocuments } from '../utils/documentCache';
import './DocumentsPage.css';

// Status indicator component for consistency
const StatusIndicator = ({ status, label, isActive, onClick }) => {
  return (
    <div 
      className={`status-indicator ${status}${isActive ? ' active' : ''}`}
      onClick={onClick}
    >
      <span className="status-dot"></span>
      <span className="status-label">{label}</span>
    </div>
  );
};

const DocumentsPage = () => {
  const [searchTerms, setSearchTerms] = useState({
    folders: '',
    documents: ''
  });
  
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'viewer'
  const [docsLoaded, setDocsLoaded] = useState(false);
  
  // Demo folder categories
  const folderCategories = [
    { id: 1, title: 'TARIFF RATES 2025', color: '#34C759', icon: 'TARIFF RATES 2025' },
    { id: 2, title: 'ADVISORY', color: '#1D4ED8', icon: 'ADVISORY' },
    { id: 3, title: 'SHE-MS FILES', color: '#1D4ED8', icon: 'SHE-MS FILES' },
    { id: 4, title: 'LAND TRANSPORT MANUAL', color: '#1D4ED8', icon: 'LAND TRANSPORT MANUAL' },
  ];
  
  // Demo documents with PDF paths
  const documents = useMemo(() => [
    { 
      id: 1, 
      fileName: 'Tariff Rates 2025', 
      modifiedDate: 'Jan 17, 2025',
      modifiedBy: 'Jason',
      signedDate: 'Jan 25, 2025',
      validity: 'Dec 31, 2025',
      status: 'active',
      fileUrl: getDocumentPath('tariff-rates-2025.pdf')
    },
    { 
      id: 2, 
      fileName: 'Safety Regulations 2025', 
      modifiedDate: 'Jan 22, 2025',
      modifiedBy: 'Maria',
      signedDate: '',
      validity: '',
      status: 'inactive',
      fileUrl: getDocumentPath('safety-regulations-2025.pdf')
    },
    { 
      id: 3, 
      fileName: 'Ronway Transport Manual', 
      modifiedDate: 'Jan 22, 2025',
      modifiedBy: 'Timothy',
      signedDate: 'Jan 28, 2025',
      validity: 'Dec 31, 2025',
      status: 'active',
      fileUrl: getDocumentPath('transport-manual.pdf')
    },
    { 
      id: 4, 
      fileName: 'Driver Guidelines 2025', 
      modifiedDate: 'Dec 15, 2024',
      modifiedBy: 'Amanda',
      signedDate: 'Dec 20, 2024',
      validity: 'Dec 31, 2025',
      status: 'active',
      fileUrl: getDocumentPath('driver-guidelines.pdf')
    },
    { 
      id: 5, 
      fileName: 'Advisory Document 2025', 
      modifiedDate: 'Jan 05, 2025',
      modifiedBy: 'Robert',
      signedDate: 'Jan 10, 2025',
      validity: 'Feb 28, 2025',
      status: 'expired',
      fileUrl: getDocumentPath('advisory-2025.pdf')
    },
  ], []);
  
  const handleSearchChange = (section, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [section]: value
    }));
  };
  
  const filterByStatus = (status) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  };
  
  // Preload document files in background for better UX
  useEffect(() => {
    if (!docsLoaded && documents.length > 0) {
      console.log('Preloading document PDFs in the background...');
      // Start preloading documents in the background
      preloadDocuments(documents, doc => doc.fileUrl);
      setDocsLoaded(true);
    }
  }, [documents, docsLoaded]);
  
  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
    setViewMode('viewer');
    
    // Preload the next few documents for smoother navigation
    const currentIndex = documents.findIndex(doc => doc.id === document.id);
    if (currentIndex >= 0) {
      const nextDocs = [];
      // Get next 2 documents (or wrap around)
      for (let i = 1; i <= 2; i++) {
        const nextIndex = (currentIndex + i) % documents.length;
        nextDocs.push(documents[nextIndex]);
      }
      // Preload them with higher priority
      if (nextDocs.length > 0) {
        console.log('Preloading next documents for quick navigation...');
        nextDocs.forEach(doc => {
          const url = doc.fileUrl;
          if (url) {
            // Use setTimeout to not block the UI while the main document loads
            setTimeout(() => preloadDocuments([doc], d => d.fileUrl), 1000);
          }
        });
      }
    }
  };
  
  const returnToList = () => {
    setViewMode('list');
  };
  
  // Filter documents based on selected status and search term
  const filteredDocuments = documents.filter(doc => {
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    const matchesSearch = !searchTerms.documents || 
      doc.fileName.toLowerCase().includes(searchTerms.documents.toLowerCase()) ||
      doc.modifiedBy.toLowerCase().includes(searchTerms.documents.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="documents-page-content">
      {viewMode === 'viewer' ? (
        <>
          <div className="return-to-list">
            <button className="return-button" onClick={returnToList}>
              <span className="return-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </span>
              Back to Documents
            </button>
          </div>
          <DocumentViewer 
            documents={documents} 
            selectedDocument={selectedDocument} 
            onSelectDocument={handleSelectDocument} 
          />
        </>
      ) : (
        <>
      {/* Document Files Header Section */}
      <div className="single-line-header documents-main-header">
        <h2 className="section-title">DOCUMENT FILES</h2>
        <div className="flex-spacer"></div>
        <div className="document-action-buttons">
          <button className="document-action-button upload-btn">
            <span className="btn-icon">{Icons.upload}</span>
            UPLOAD DOCUMENT
          </button>
          <button className="document-action-button generate-btn">
            <span className="btn-icon">{Icons.report}</span>
            GENERATE REPORT
          </button>
        </div>
      </div>
      
      {/* Folder Section */}
      <div className="document-section">
        <div className="single-line-header">
          <h3 className="section-subtitle">FOLDER</h3>
          <div className="flex-spacer"></div>
          <div className="search-controls-group">
            <select className="travel-voucher-dropdown">
              <option>All Categories</option>
            </select>
            <div className="standardized-search-container">
              <input 
                type="text"
                className="standardized-search-input"
                placeholder="Search folders..."
                value={searchTerms.folders}
                onChange={(e) => handleSearchChange('folders', e.target.value)}
              />
              <button className="standardized-search-btn">
                {Icons.searchIcon}
              </button>
            </div>
          </div>
        </div>
        
        <div className="document-cards-container">
          {folderCategories.map(category => (
            <div className="document-category-card" key={category.id}>
              <div 
                className="document-category-icon" 
                style={{backgroundColor: category.color}}
              >
                {category.icon}
              </div>
              <div className="document-category-title">{category.title}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Documents List Section */}
      <div className="document-section">
        <div className="single-line-header">
          <h3 className="section-subtitle">DOCUMENTS</h3>
          <div className="document-status-legend">
            <StatusIndicator 
              status="active" 
              label="SIGNED" 
              isActive={selectedStatus === 'active'}
              onClick={() => filterByStatus('active')}
            />
            <StatusIndicator 
              status="pending" 
              label="REVIEW" 
              isActive={selectedStatus === 'pending'}
              onClick={() => filterByStatus('pending')}
            />
            <StatusIndicator 
              status="inactive" 
              label="INVALID" 
              isActive={selectedStatus === 'inactive'}
              onClick={() => filterByStatus('inactive')}
            />
          </div>
          <div className="flex-spacer"></div>
          <div className="standardized-search-container">
            <input 
              type="text"
              className="standardized-search-input"
              placeholder="Search documents..."
              value={searchTerms.documents}
              onChange={(e) => handleSearchChange('documents', e.target.value)}
            />
            <button className="standardized-search-btn">
              {Icons.searchIcon}
            </button>
          </div>
        </div>
        
        <div className="document-table-container">
          <table className="standardized-table">
            <thead>
              <tr>
                <th>Modified</th>
                <th>File Name</th>
                <th>Modified by</th>
                <th>Date of Signed</th>
                <th>Validity</th>
                <th>Edit Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map(doc => (
                <tr 
                  key={doc.id} 
                  className="document-row"
                  onClick={() => handleSelectDocument(doc)}
                >
                  <td>{doc.modifiedDate}</td>
                  <td className="document-name-cell">{doc.fileName}</td>
                  <td>{doc.modifiedBy}</td>
                  <td>{doc.signedDate}</td>
                  <td>{doc.validity}</td>
                  <td>
                    <button className="edit-details-btn">
                      {Icons.edit}
                    </button>
                  </td>
                  <td>
                    <div className={`document-status ${doc.status}`}>
                      <span className="status-dot"></span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Empty state only shown when no documents are present */}
      {documents.length === 0 && (
        <div className="empty-state document-empty-state">
          <div className="empty-icon">{Icons.folderOpen}</div>
          <h3>Document Management</h3>
          <p>Access and manage all uploaded documents.</p>
          <p className="empty-state-note">Document management functionality coming soon...</p>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default DocumentsPage;