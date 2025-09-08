// Emergency flicker fix utility
export class FlickerFix {
  private static applied = false;

  static applyEmergencyFix() {
    if (this.applied || typeof document === 'undefined') return;

    // Inject critical CSS to prevent flickering
    const style = document.createElement('style');
    style.textContent = `
      /* Emergency flicker prevention */
      * {
        transform: translateZ(0);
      }
      
      body, #root {
        contain: layout style;
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }

      /* Stable page transitions */
      [data-reactroot] {
        min-height: 100vh;
        contain: layout style paint;
      }

      /* Force repaint for all containers */
      .container, main, section, article, div[class*="grid"], div[class*="flex"] {
        contain: layout style;
        transform: translateZ(0);
      }

      /* Stabilize lazy loaded content */
      .suspense-container {
        min-height: 100vh;
        contain: strict;
        content-visibility: auto;
        contain-intrinsic-size: 100vw 100vh;
      }

      /* Prevent skeleton flicker */
      .animate-pulse {
        animation-duration: 1.5s;
        animation-fill-mode: both;
        transform: translateZ(0);
      }

      /* Critical loading states */
      [data-loading="true"] {
        contain: strict;
        min-height: 200px;
        background: hsl(var(--muted) / 0.3);
        position: relative;
      }

      [data-loading="true"]::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        margin: -10px 0 0 -10px;
        border: 2px solid hsl(var(--primary));
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    
    document.head.insertBefore(style, document.head.firstChild);
    this.applied = true;

    // Apply to existing elements
    this.stabilizeExistingElements();
  }

  private static stabilizeExistingElements() {
    // Add containment to main containers
    const containers = document.querySelectorAll('main, section, article, .container');
    containers.forEach(el => {
      const element = el as HTMLElement;
      element.style.contain = 'layout style';
      element.style.transform = 'translateZ(0)';
    });

    // Stabilize images without dimensions
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      const image = img as HTMLImageElement;
      if (!image.style.aspectRatio) {
        image.style.aspectRatio = '16 / 9';
        image.style.background = 'hsl(var(--muted))';
        image.style.contain = 'layout size';
      }
    });

    // Add loading attribute to prevent layout shifts
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
      const image = img as HTMLImageElement;
      if (!image.complete) {
        image.style.minHeight = '200px';
        image.style.background = 'hsl(var(--muted))';
      }
    });
  }

  // Force immediate DOM stabilization
  static stabilizeDOM() {
    if (typeof document === 'undefined') return;

    // Force layout and paint to complete
    document.body.offsetHeight;
    
    // Trigger immediate repaint
    requestAnimationFrame(() => {
      document.documentElement.style.transform = 'translateZ(0)';
      
      requestAnimationFrame(() => {
        document.documentElement.style.transform = '';
      });
    });
  }
}

// Auto-apply emergency fix
if (typeof window !== 'undefined') {
  // Apply immediately if DOM is ready
  if (document.readyState !== 'loading') {
    FlickerFix.applyEmergencyFix();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      FlickerFix.applyEmergencyFix();
    });
  }

  // Stabilize on every route change
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(() => FlickerFix.stabilizeDOM(), 0);
    }
  }).observe(document, { subtree: true, childList: true });
}