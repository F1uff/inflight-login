import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import ErrorDisplay from './ErrorDisplay';
import { getDocumentPath, getPathFromDocument } from '../utils/paths';
import { preloadDocument, getDocumentFromCache, preloadDocuments } from '../utils/documentCache';
import './DocumentStyles.css';

// Initialize PDF.js worker
const setupPdfWorker = () => {
  if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  }
};

// Call the setup function
setupPdfWorker();

const DocumentViewer = ({ documents, selectedDocument, onSelectDocument }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [fallbackAttempt, setFallbackAttempt] = useState(0);
  
  // Reference to current document path for preloading
  const documentPathRef = useRef('');
  
  // Get current document path based on fallback attempt
  const getCurrentPath = useCallback(() => {
    const paths = getPdfPaths();
    if (paths.length === 0) return null;
    
    if (fallbackAttempt === 0) return paths[0];
    if (fallbackAttempt === 1) return paths[1];
    if (fallbackAttempt === 2) return paths[2];
    return paths[3]; // Last fallback
  }, [fallbackAttempt, getPdfPaths]);
  
  // Get document data, checking cache first
  const getDocumentData = async (path) => {
    if (!path) return null;
    
    // Check if document is already in cache
    const cachedData = getDocumentFromCache(path);
    if (cachedData) {
      console.log(`Using cached document: ${path}`);
      return cachedData;
    }
    
    try {
      // If not in cache, preload it now
      return await preloadDocument(path);
    } catch (error) {
      console.error(`Error loading document from ${path}:`, error);
      return null;
    }
  };
  
  // Reset state when document changes and attempt to load from cache
  useEffect(() => {
    if (selectedDocument) {
      setPageNumber(1);
      setNumPages(null);
      setError(null);
      setScale(1.0);
      setRotation(0);
      setFallbackAttempt(0);
      setLoading(true);
      
      // Try to load document from cache
      const path = getCurrentPath();
      documentPathRef.current = path;
      getDocumentData(path);
    }
    
    return () => {
      // Cleanup function when component unmounts
      setLoading(false);
    };
  }, [selectedDocument?.id, getCurrentPath, selectedDocument]);
  
  // Preload other documents when the current document is successfully loaded
  useEffect(() => {
    if (numPages && documents && documents.length > 0 && selectedDocument) {
      // Don't preload if there was an error loading the current document
      if (!error) {
        // Preload other documents in the collection
        const otherDocs = documents.filter(doc => doc.id !== selectedDocument.id);
        if (otherDocs.length > 0) {
          console.log('Preloading other documents in background...');
          preloadDocuments(otherDocs, doc => getDocumentPath(doc.fileName));
        }
      }
    }
  }, [numPages, selectedDocument, documents, error]);
  
  // Generate possible PDF paths with standardized location using utility functions
  const getPdfPaths = useCallback(() => {
    if (!selectedDocument) return [];
    
    // Get file name from the document data
    const fileUrl = selectedDocument.fileUrl;
    const fileName = selectedDocument.fileName;
    const baseFileName = fileUrl ? fileUrl.split('/').pop() : fileName.replace(/\s+/g, '-').toLowerCase() + '.pdf';
    
    // Create standardized paths with fallback for backward compatibility
    return [
      // Primary path - using utility function
      getDocumentPath(fileName),
      
      // Fallbacks for backward compatibility
      fileUrl, // Original URL if specified
      getPathFromDocument(selectedDocument),
      
      // Legacy paths - will be removed after migration is complete
      `/docs/${baseFileName}`,
      `/sample-pdfs/${baseFileName}`
    ].filter(Boolean); // Remove any undefined/null paths
  }, [selectedDocument]);
  
  // Handle successful document loading
  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
    setError(null);
    setLoading(false);
    setIsRetrying(false);
    setFallbackAttempt(0); // Reset fallback counter on success
    
    // If we successfully loaded a document, cache its current path for future use
    const currentPath = getCurrentPath();
    if (currentPath) {
      console.log(`Document loaded successfully from: ${currentPath}`);
    }
  }
  
  // Handle document loading error
  function onDocumentLoadError(error) {
    // Log the error with path information for debugging
    console.error("PDF loading error:", {
      error,
      document: selectedDocument,
      attemptedPath: getPdfPaths()[fallbackAttempt]
    });

    // Try next fallback path if available
    if (fallbackAttempt < getPdfPaths().length - 1) {
      const newAttempt = fallbackAttempt + 1;
      setFallbackAttempt(newAttempt);
      setIsRetrying(true);
      
      // Get the current path being tried
      const currentPath = getPdfPaths()[newAttempt];
      console.log(`Trying fallback PDF path ${newAttempt}: ${currentPath}`);
      
      // Force re-render with fallback path after a short delay
      setTimeout(() => {
        setIsRetrying(false);
      }, 100);
      
      return;
    }
    
    // Show more specific error message after all attempts failed
    const errorMessage = error.message || "Failed to load the document after multiple attempts.";
    setError(errorMessage);
    setLoading(false);
    setIsRetrying(false);
    
    // Log all attempted paths for debugging
    console.log("All attempted paths:", getPdfPaths());
  }

  // Go to previous page
  const goToPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  }
  
  // Go to next page
  const goToNextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  }
  
  // Zoom in
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  }
  
  // Zoom out
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.4));
  }
  
  // Reset zoom
  const resetZoom = () => {
    setScale(1.0);
  }
  
  // Rotate document
  const rotateDocument = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  }
  
  // Retry loading
  const retryLoading = () => {
    setIsRetrying(true);
    setError(null);
    setLoading(true);
    setFallbackAttempt(0);
    
    // Re-mount the Document component by forcing a re-render
    setTimeout(() => {
      setIsRetrying(false);
    }, 100);
  }

  return (
    <div className="document-viewer-container">
      <div className="document-viewer-sidebar" data-testid="document-sidebar">
        <h3 className="sidebar-title">DOCUMENTS</h3>
        <div className="document-list">
          {documents.map(doc => (
            <div 
              key={doc.id} 
              className={`document-list-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
              onClick={() => onSelectDocument(doc)}
            >
              <div className="document-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#E9ECF6"/>
                  <path d="M14 2V8H20L14 2Z" fill="#B7BDC7"/>
                </svg>
              </div>
              <div className="document-info">
                <div className="document-name">{doc.fileName}</div>
                <div className="document-date">{doc.modifiedDate}</div>
              </div>
              <div className={`document-status-indicator ${doc.status}`}></div>
            </div>
          ))}
        </div>
      </div>
      <div className="document-viewer-content">
        {selectedDocument ? (
          <>
            <div className="document-viewer-header">
              <h2>{selectedDocument.fileName}</h2>
              <div className="document-meta">
                <span className="meta-item">Modified: {selectedDocument.modifiedDate}</span>
                {selectedDocument.signedDate && <span className="meta-item">Signed: {selectedDocument.signedDate}</span>}
                {selectedDocument.validity && <span className="meta-item">Valid until: {selectedDocument.validity}</span>}
              </div>
              <div className="document-actions">
                <button className="document-action-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                  Download
                </button>
                <button className="document-action-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>
            <div className="document-viewer-pdf">
              {loading && <div className="document-loading">Loading PDF...</div>}
              {error && <div className="document-error">{error}</div>}
              
              {!isRetrying && (
                <Document
                  file={getCurrentPath()}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={<div className="document-loading">Loading PDF...</div>}
                  error={<div className="document-error">Unable to load PDF document.</div>}
                  noData={<div className="document-error">No PDF file specified.</div>}
                  onSourceSuccess={() => setLoading(true)}
                  cMapUrl="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/"
                  cMapPacked={true}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    renderTextLayer={false} 
                    renderAnnotationLayer={false}
                    width={Math.min(window.innerWidth * 0.6, 800)}
                    scale={scale}
                    rotate={rotation}
                  />
                </Document>
              )}
              {error && (
                <ErrorDisplay 
                  error={error}
                  onRetry={retryLoading}
                />
              )}
              
              {numPages && (
                <div className="document-controls-container">
                  <div className="document-pagination">
                    <button 
                      className="pagination-button" 
                      disabled={pageNumber <= 1} 
                      onClick={goToPrevPage}
                      title="Previous Page"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                      </svg>
                    </button>
                    <span>
                      Page {pageNumber} of {numPages}
                    </span>
                    <button 
                      className="pagination-button" 
                      disabled={pageNumber >= numPages} 
                      onClick={goToNextPage}
                      title="Next Page"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="document-zoom-controls">
                    <button 
                      className="pagination-button" 
                      onClick={zoomOut}
                      disabled={scale <= 0.4}
                      title="Zoom Out"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/>
                      </svg>
                    </button>
                    <button 
                      className="pagination-button" 
                      onClick={resetZoom}
                      title="Reset Zoom"
                    >
                      <span>{Math.round(scale * 100)}%</span>
                    </button>
                    <button 
                      className="pagination-button" 
                      onClick={zoomIn}
                      disabled={scale >= 3.0}
                      title="Zoom In"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm-2-5h2V7h2v2h2v2h-2v2h-2v-2H7z"/>
                      </svg>
                    </button>
                    
                    <button 
                      className="pagination-button" 
                      onClick={rotateDocument}
                      title="Rotate Document"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.34 6.41L.86 12.9l6.49 6.48 6.49-6.48-6.5-6.49zM3.69 12.9l3.66-3.66L11 12.9l-3.66 3.66-3.65-3.66zm15.67-6.26C17.61 4.88 15.3 4 13 4V.76L8.76 5 13 9.24V6c1.79 0 3.58.68 4.95 2.05 2.73 2.73 2.73 7.17 0 9.9C16.58 19.32 14.79 20 13 20c-.97 0-1.94-.21-2.84-.61l-1.49 1.49C10.02 21.62 11.51 22 13 22c2.3 0 4.61-.88 6.36-2.64 3.52-3.51 3.52-9.21 0-12.72z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="document-empty-state">
            <div className="empty-icon">📄</div>
            <h3>No Document Selected</h3>
            <p>Please select a document from the sidebar to view it.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
