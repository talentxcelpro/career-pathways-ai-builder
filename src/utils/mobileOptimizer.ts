// Mobile-specific performance optimizations
export class MobileOptimizer {
  private static instance: MobileOptimizer;
  private isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  static getInstance(): MobileOptimizer {
    if (!MobileOptimizer.instance) {
      MobileOptimizer.instance = new MobileOptimizer();
    }
    return MobileOptimizer.instance;
  }

  // Optimize for mobile viewport
  optimizeViewport() {
    if (this.isMobile) {
      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Add mobile-specific CSS
      const style = document.createElement('style');
      style.textContent = `
        /* Mobile optimizations */
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        body {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
        
        input, textarea, select {
          font-size: 16px !important; /* Prevent zoom on iOS */
        }
        
        .fast-loading-wrapper {
          will-change: transform;
        }
        
        img {
          content-visibility: auto;
          contain-intrinsic-size: 1px 200px;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Enable hardware acceleration for smooth animations
  enableHardwareAcceleration() {
    const elements = document.querySelectorAll('.animate, [class*="animate-"], .transition');
    elements.forEach(el => {
      (el as HTMLElement).style.willChange = 'transform';
      (el as HTMLElement).style.transform = 'translateZ(0)';
    });
  }

  // Optimize touch events
  optimizeTouchEvents() {
    if (this.isMobile) {
      // Add passive event listeners for better scrolling performance
      const options = { passive: true };
      
      document.addEventListener('touchstart', () => {}, options);
      document.addEventListener('touchmove', () => {}, options);
      document.addEventListener('wheel', () => {}, options);
    }
  }

  // Reduce motion for users who prefer it
  respectReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Optimize for PWA
  optimizePWA() {
    // Add PWA-specific optimizations
    if ('serviceWorker' in navigator) {
      // Service worker is handled elsewhere, but ensure proper caching
      caches.open('fast-cache').then(cache => {
        // Cache critical resources
        cache.addAll([
          '/assets/talentxcel-logo.png',
          '/manifest.json'
        ]).catch(() => {
          // Ignore cache errors
        });
      }).catch(() => {
        // Ignore if cache API not available
      });
    }
  }

  // Initialize all mobile optimizations
  initialize() {
    this.optimizeViewport();
    this.enableHardwareAcceleration();
    this.optimizeTouchEvents();
    this.respectReducedMotion();
    this.optimizePWA();

    // Additional mobile-specific optimizations
    if (this.isMobile) {
      // Reduce bundle size by conditionally loading desktop-only features
      (window as any).MOBILE_OPTIMIZED = true;
      
      // Optimize font loading for mobile
      const fontDisplay = document.createElement('style');
      fontDisplay.textContent = `
        @font-face {
          font-display: swap;
        }
      `;
      document.head.appendChild(fontDisplay);
    }
  }
}

// Initialize mobile optimizer
export const mobileOptimizer = MobileOptimizer.getInstance();