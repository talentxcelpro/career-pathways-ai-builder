// Chunk Loading Error Handler - Global solution
(function() {
  'use strict';
  
  // Handle chunk loading errors globally
  window.addEventListener('unhandledrejection', function(event) {
    const error = event.reason;
    
    // Check if it's a chunk loading error
    if (error && (
      error.name === 'ChunkLoadError' || 
      (error.message && error.message.includes('Loading chunk')) ||
      (error.message && error.message.includes('Loading CSS chunk'))
    )) {
      console.warn('Chunk loading error detected, attempting recovery...');
      
      // Prevent the error from propagating
      event.preventDefault();
      
      // Clear caches and reload
      if ('caches' in window) {
        caches.keys().then(function(names) {
          names.forEach(function(name) {
            caches.delete(name);
          });
        }).finally(function() {
          // Reload the page after cache cleanup
          window.location.reload();
        });
      } else {
        // Fallback: just reload
        window.location.reload();
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
  
  // Proactive cache management
  if ('caches' in window) {
    // Clean old caches periodically
    setInterval(function() {
      caches.keys().then(function(names) {
        // Keep only the 3 most recent caches
        if (names.length > 3) {
          const oldCaches = names.slice(0, names.length - 3);
          oldCaches.forEach(function(name) {
            caches.delete(name);
          });
        }
      });
    }, 30 * 60 * 1000); // Every 30 minutes
  }
})();
