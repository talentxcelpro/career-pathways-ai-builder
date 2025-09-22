import React from 'react';

// Polyfill for requestIdleCallback for better browser compatibility
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  window.requestIdleCallback = function(callback: IdleRequestCallback, options?: IdleRequestOptions): number {
    const start = Date.now();
    const timeoutId = setTimeout(function() {
      callback({
        didTimeout: false,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, 1);
    return timeoutId as unknown as number;
  };
  
  window.cancelIdleCallback = function(id: number) {
    clearTimeout(id);
  };
}

// Polyfill for browsers without requestIdleCallback support
declare global {
  interface Window {
    requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    cancelIdleCallback: (id: number) => void;
  }
}