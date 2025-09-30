// Improved Chunk Loading Error Handler
(function() {
  'use strict';
  
  let reloadAttempted = false;
  
  // Handle chunk loading errors globally
  window.addEventListener('unhandledrejection', function(event) {
    const error = event.reason;
    
    // Check if it's actually a chunk loading error
    if (error && !reloadAttempted && (
      error.name === 'ChunkLoadError' || 
      (error.message && error.message.includes('Loading chunk')) ||
      (error.message && error.message.includes('Loading CSS chunk')) ||
      (error.message && error.message.includes('Failed to fetch dynamically imported module'))
    )) {
      console.warn('Chunk loading error detected, attempting recovery...');
      reloadAttempted = true;
      
      // Prevent the error from propagating
      event.preventDefault();
      
      // Clear caches and reload with a slight delay
      if ('caches' in window) {
        caches.keys().then(function(names) {
          names.forEach(function(name) {
            caches.delete(name);
          });
        }).finally(function() {
          setTimeout(function() {
            window.location.reload();
          }, 500);
        });
      } else {
        setTimeout(function() {
          window.location.reload();
        }, 500);
      }
    }
  });
  
  // Handle script loading errors
  window.addEventListener('error', function(event) {
    const target = event.target;
    
    // Check if it's a script or link tag that failed to load
    if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      console.warn('Resource loading error detected:', target.src || target.href);
      
      // If it's a chunk-related resource, clear cache and reload
      if (target.src && target.src.includes('assets/')) {
        if ('caches' in window) {
          caches.keys().then(function(names) {
            names.forEach(function(name) {
              caches.delete(name);
            });
          }).finally(function() {
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      }
    }
  });
  
  // Simplified cache management - clean very old caches only
  if ('caches' in window) {
    setTimeout(function() {
      caches.keys().then(function(names) {
        // Keep only the 5 most recent caches
        if (names.length > 5) {
          const oldCaches = names.slice(0, names.length - 5);
          oldCaches.forEach(function(name) {
            console.log('Cleaning old cache:', name);
            caches.delete(name);
          });
        }
      });
    }, 5000); // Run after 5 seconds
  }
})();
