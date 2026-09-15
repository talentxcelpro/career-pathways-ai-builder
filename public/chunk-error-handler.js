// Improved Chunk Loading Error Handler
(function() {
  'use strict';
  
  let reloadAttempted = false;
  
  function recoverFromError(reason) {
    if (reloadAttempted) return;
    reloadAttempted = true;
    
    console.error('Critical loading error detected:', reason);
    
    const cleanup = [];
    
    // Clear all caches
    if ('caches' in window) {
      cleanup.push(
        caches.keys().then(function(names) {
          return Promise.all(names.map(function(name) {
            return caches.delete(name);
          }));
        }).catch(function(err) {
          console.error('Cache cleanup failed:', err);
        })
      );
    }
    
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      cleanup.push(
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          return Promise.all(registrations.map(function(registration) {
            return registration.unregister();
          }));
        }).catch(function(err) {
          console.error('SW unregistration failed:', err);
        })
      );
    }
    
    // Perform cleanup then reload
    Promise.all(cleanup).finally(function() {
      console.log('Cleanup complete, reloading application...');
      setTimeout(function() {
        window.location.reload();
      }, 500);
    });
  }

  // Handle chunk loading errors globally - ONLY catch actual chunk/module loading failures
  window.addEventListener('unhandledrejection', function(event) {
    const error = event.reason;
    if (error && (
      error.name === 'ChunkLoadError' || 
      (error.message && error.message.includes('Loading chunk')) ||
      (error.message && error.message.includes('Loading CSS chunk')) ||
      (error.message && error.message.includes('Failed to fetch dynamically imported module')) ||
      (error.message && error.message.includes('Importing a module script failed'))
    )) {
      event.preventDefault();
      recoverFromError(error.message || 'Chunk load failure');
    }
    // NOTE: Generic "Failed to fetch" from Service Worker (e.g. /passport) is intentionally
    // NOT caught here to avoid reload loops.
  });
  
  // Handle script loading errors (missing hashed JS chunks)
  window.addEventListener('error', function(event) {
    const target = event.target;
    if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      if (target.src && target.src.includes('/assets/')) {
        recoverFromError('Script error: ' + target.src);
      }
    }
  }, true);
  
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
