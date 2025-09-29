/**
 * Apple-inspired performance optimizations
 * Non-destructive enhancements that work alongside existing systems
 */

// Apple's animation timing functions
export const appleTimings = {
  // Precise cubic-bezier curves used by Apple
  'ease-in-out-quart': 'cubic-bezier(0.77, 0, 0.175, 1)',
  'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'ease-out-circ': 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Apple's precise border radius system
export const appleBorderRadius = {
  'micro': '2px',   // Tiny elements
  'small': '6px',   // Buttons, inputs
  'medium': '8px',  // Cards, containers
  'large': '12px',  // Modal, panels
  'xl': '16px',     // Hero sections
  'round': '50%',   // Avatars, icons
} as const;

class ApplePerformanceEnhancer {
  private static instance: ApplePerformanceEnhancer;
  private isEnabled = false;

  private constructor() {}

  static getInstance(): ApplePerformanceEnhancer {
    if (!ApplePerformanceEnhancer.instance) {
      ApplePerformanceEnhancer.instance = new ApplePerformanceEnhancer();
    }
    return ApplePerformanceEnhancer.instance;
  }

  /**
   * Enable Apple-style performance optimizations
   */
  enable() {
    if (this.isEnabled || typeof document === 'undefined') return;

    this.injectAppleCSS();
    this.enableHardwareAcceleration();
    this.optimizeScrolling();
    this.enablePredictivePreloading();
    
    this.isEnabled = true;
  }

  /**
   * Inject Apple-inspired CSS optimizations
   */
  private injectAppleCSS() {
    const style = document.createElement('style');
    style.id = 'apple-performance-enhancements';
    style.textContent = `
      /* Apple-inspired performance CSS */
      :root {
        --apple-ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
        --apple-ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
        --apple-ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        --apple-duration-fast: 0.15s;
        --apple-duration-normal: 0.3s;
        --apple-duration-slow: 0.5s;
      }

      /* Hardware acceleration for key elements */
      .apple-optimized {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
        will-change: transform, opacity;
      }

      /* Smooth micro-interactions */
      .apple-hover {
        transition: all var(--apple-duration-fast) var(--apple-ease-out-expo);
      }

      .apple-hover:hover {
        transform: translateY(-1px) scale(1.02);
        filter: brightness(1.05);
      }

      /* Enhanced focus states */
      .apple-focus:focus {
        outline: 2px solid hsl(var(--primary));
        outline-offset: 2px;
        border-radius: 6px;
        transition: outline var(--apple-duration-fast) var(--apple-ease-out-expo);
      }

      /* Optimized image rendering */
      .apple-image {
        image-rendering: -webkit-optimize-contrast;
        backface-visibility: hidden;
        transform: translateZ(0);
      }

      /* Containment for better performance */
      .apple-contain {
        contain: layout style paint;
      }

      /* Optimized text rendering */
      .apple-text {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-feature-settings: 'kern' 1;
      }

      /* Smooth scrolling containers */
      .apple-scroll {
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
    `;

    // Only add if not already present
    if (!document.getElementById('apple-performance-enhancements')) {
      document.head.appendChild(style);
    }
  }

  /**
   * Enable hardware acceleration for performance-critical elements
   */
  private enableHardwareAcceleration() {
    const selectors = [
      '.card',
      '.btn',
      '.button',
      '[class*="hover"]',
      '[class*="transition"]',
      '.animated'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        (el as HTMLElement).classList.add('apple-optimized');
      });
    });
  }

  /**
   * Optimize scrolling performance
   */
  private optimizeScrolling() {
    // Add smooth scrolling to scroll containers
    const scrollContainers = document.querySelectorAll(
      '[class*="overflow"], [class*="scroll"], .h-screen, .min-h-screen'
    );
    
    scrollContainers.forEach(container => {
      (container as HTMLElement).classList.add('apple-scroll');
    });

    // Passive scroll listeners for better performance
    let ticking = false;
    const updateScrollElements = () => {
      // Add subtle parallax or scroll effects here if needed
      ticking = false;
    };

    document.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollElements);
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Enable predictive preloading for navigation
   */
  private enablePredictivePreloading() {
    const links = document.querySelectorAll('a[href]');
    const prefetched = new Set<string>();

    links.forEach(link => {
      const href = (link as HTMLAnchorElement).href;
      
      // Preload on hover with delay
      let hoverTimeout: NodeJS.Timeout;
      
      link.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
          if (!prefetched.has(href) && link.getAttribute('href')?.startsWith('/')) {
            this.prefetchRoute(href);
            prefetched.add(href);
          }
        }, 100); // Apple-style 100ms delay
      }, { passive: true });

      link.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
      }, { passive: true });
    });
  }

  /**
   * Prefetch route for instant navigation
   */
  private prefetchRoute(href: string) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * Add Apple-style visual enhancements to elements
   */
  addAppleEnhancements(element: HTMLElement) {
    element.classList.add('apple-optimized', 'apple-text');
    
    // Add hover effects to interactive elements
    if (element.tagName === 'BUTTON' || element.role === 'button' || element.tagName === 'A') {
      element.classList.add('apple-hover', 'apple-focus');
    }

    // Add image optimizations
    if (element.tagName === 'IMG') {
      element.classList.add('apple-image');
    }

    // Add containment for containers
    if (element.classList.contains('card') || element.classList.contains('container')) {
      element.classList.add('apple-contain');
    }
  }

  /**
   * Get Apple timing function
   */
  static getTiming(name: keyof typeof appleTimings): string {
    return appleTimings[name];
  }

  /**
   * Get Apple border radius
   */
  static getBorderRadius(size: keyof typeof appleBorderRadius): string {
    return appleBorderRadius[size];
  }
}

// Export singleton instance
export const applePerformance = ApplePerformanceEnhancer.getInstance();

// Auto-enable Apple enhancements
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applePerformance.enable();
    });
  } else {
    applePerformance.enable();
  }
}

// Export class for use in hooks
export { ApplePerformanceEnhancer };