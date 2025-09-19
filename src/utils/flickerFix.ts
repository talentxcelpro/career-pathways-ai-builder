// Enhanced flicker prevention utility
export class FlickerFix {
  private static applied = false;
  private static observer: MutationObserver | null = null;

  static applyEnhancedFix() {
    if (this.applied || typeof document === 'undefined') return;

    // Enhanced CSS to prevent all types of flickering
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced flicker prevention */
      html {
        visibility: hidden;
        opacity: 0;
      }
      
      html.loaded {
        visibility: visible;
        opacity: 1;
        transition: opacity 0.2s ease-in;
      }
      
      /* Prevent content jump during hydration */
      body {
        min-height: 100vh;
        overflow-x: hidden;
      }
      
      /* Stabilize layouts during loading */
      .loading-skeleton {
        background: linear-gradient(90deg, 
          hsl(var(--muted)) 25%, 
          hsl(var(--muted-foreground) / 0.1) 50%, 
          hsl(var(--muted)) 75%
        );
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }
      
      /* Prevent flash of unstyled content */
      *:not(.loaded) img {
        opacity: 0;
        transition: opacity 0.3s ease-in;
      }
      
      *.loaded img {
        opacity: 1;
      }
      
      /* Stabilize component mounting */
      .mount-transition {
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
      }
      
      .mount-transition.mounted {
        opacity: 1;
        transform: translateY(0);
      }
      
      /* Prevent dropdown flicker */
      [data-radix-popper-content-wrapper] {
        opacity: 0;
        transition: opacity 0.15s ease-out;
      }
      
      [data-radix-popper-content-wrapper][data-state="open"] {
        opacity: 1;
      }
      
      /* Smooth sidebar transitions */
      .sidebar-content {
        transition: transform 0.2s ease-out, opacity 0.2s ease-out;
      }
      
      /* Prevent form input flickering */
      input, textarea, select {
        transition: border-color 0.15s ease-out, box-shadow 0.15s ease-out;
      }
    `;
    
    document.head.appendChild(style);
    this.applied = true;

    // Enhanced load detection
    this.setupLoadDetection();
  }

  static setupLoadDetection() {
    const markAsLoaded = () => {
      if (!document.documentElement.classList.contains('loaded')) {
        document.documentElement.classList.add('loaded');
        document.body.classList.add('loaded');
        
        // Mark all images as loaded after fonts are ready
        if ('fonts' in document) {
          document.fonts.ready.then(() => {
            document.querySelectorAll('img').forEach(img => {
              img.classList.add('loaded');
            });
          });
        }
      }
    };

    // Multiple load detection strategies
    if (document.readyState === 'complete') {
      markAsLoaded();
    } else if (document.readyState === 'interactive') {
      // Wait for fonts and images
      setTimeout(markAsLoaded, 100);
    } else {
      document.addEventListener('DOMContentLoaded', markAsLoaded);
      window.addEventListener('load', markAsLoaded);
    }

    // Fallback timer
    setTimeout(markAsLoaded, 500);
  }

  static observeComponentMounts() {
    if (this.observer || typeof window === 'undefined') return;

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Add mount transition to new components
            if (element.getAttribute('data-component')) {
              element.classList.add('mount-transition');
              requestAnimationFrame(() => {
                element.classList.add('mounted');
              });
            }
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  static cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Auto-apply enhanced fix
if (typeof window !== 'undefined') {
  FlickerFix.applyEnhancedFix();
  
  // Set up component mount observation after React hydration
  if (document.readyState !== 'loading') {
    setTimeout(() => FlickerFix.observeComponentMounts(), 1000);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => FlickerFix.observeComponentMounts(), 1000);
    });
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    FlickerFix.cleanup();
  });
}