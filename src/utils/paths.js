/**
 * Path utility functions
 * Standardizes path handling throughout the application
 */

/**
 * Gets the base path from environment variables
 * @returns {string} The base path
 */
export const getBasePath = () => import.meta.env.VITE_APP_BASE_PATH || '';

/**
 * Gets the document path with proper base path prefixing
 * @param {string} filename - The document filename
 * @returns {string} The full document path
 */
export const getDocumentPath = (filename) => {
  const base = getBasePath();
  const docsPath = import.meta.env.VITE_APP_DOCUMENTS_PATH || '/documents';
  
  // Handle filename with or without extension
  const normalizedFilename = filename.endsWith('.pdf') 
    ? filename 
    : `${filename.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  
  return `${base}${docsPath}/${normalizedFilename}`;
};

/**
 * Converts a document object to a document path
 * @param {Object} document - Document object with fileName or fileUrl property
 * @returns {string} The full document path
 */
export const getPathFromDocument = (document) => {
  if (!document) return '';
  
  // If fileUrl is provided and is a full URL, use it directly
  if (document.fileUrl && (document.fileUrl.startsWith('http') || document.fileUrl.startsWith('/'))) {
    return document.fileUrl;
  }
  
  // Otherwise, construct path from fileName
  return getDocumentPath(document.fileName);
};
