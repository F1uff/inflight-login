/**
 * Document caching utility
 * Provides caching mechanism for PDF documents to improve loading performance
 */

// Cache for storing preloaded PDF documents
const documentCache = new Map();

/**
 * Preload a PDF document and store it in cache
 * @param {string} url - The URL of the document to preload
 * @returns {Promise} - Promise that resolves when document is loaded
 */
export const preloadDocument = async (url) => {
  if (!url) return null;
  
  try {
    // Skip if already cached
    if (documentCache.has(url)) {
      return documentCache.get(url);
    }
    
    console.log(`Preloading document: ${url}`);
    
    // Fetch the document
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to preload document: ${response.status} ${response.statusText}`);
    }
    
    // Get document as array buffer for PDF.js
    const buffer = await response.arrayBuffer();
    documentCache.set(url, buffer);
    
    console.log(`Document cached: ${url}`);
    return buffer;
  } catch (error) {
    console.error('Error preloading document:', error);
    return null;
  }
};

/**
 * Get a document from cache
 * @param {string} url - The URL of the document to retrieve
 * @returns {ArrayBuffer|null} - The cached document or null if not found
 */
export const getDocumentFromCache = (url) => {
  if (!url) return null;
  return documentCache.get(url) || null;
};

/**
 * Preload a set of documents in the background
 * @param {Array} documents - Array of document objects with URLs to preload
 * @param {Function} getUrl - Function to extract URL from a document object
 */
export const preloadDocuments = (documents, getUrl) => {
  if (!documents || !Array.isArray(documents) || !getUrl) return;
  
  // Use requestIdleCallback for non-blocking preloading when browser is idle
  const preloader = (deadline) => {
    // Check if we have time to work
    while (deadline.timeRemaining() > 0 && documents.length > 0) {
      const doc = documents.shift();
      const url = getUrl(doc);
      if (url && !documentCache.has(url)) {
        preloadDocument(url);
      }
    }
    
    // If documents remain, schedule more work
    if (documents.length > 0) {
      requestIdleCallback(preloader);
    }
  };
  
  // Start preloading when browser is idle
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(preloader);
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      documents.slice(0, 3).forEach(doc => {
        const url = getUrl(doc);
        if (url) preloadDocument(url);
      });
    }, 1000);
  }
};
