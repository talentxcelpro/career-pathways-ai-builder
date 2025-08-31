// Layout stability utilities to prevent CLS (Cumulative Layout Shift)
export class LayoutStabilityManager {
  private static observer: ResizeObserver | null = null;
  private static mutationObserver: MutationObserver | null = null;

  // Reserve space for images to prevent layout shift
  static reserveImageSpace(img: HTMLImageElement, width?: number, height?: number): void {
    if (width && height) {
      // Set explicit dimensions
      img.style.aspectRatio = `${width} / ${height}`;
      img.style.width = '100%';
      img.style.height = 'auto';
    } else {
      // Use intrinsic aspect ratio
      img.style.aspectRatio = 'auto';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    }
    
    // Prevent layout shift during loading
    img.style.display = 'block';
    img.style.backgroundColor = 'hsl(var(--muted))';
  }

  // Create skeleton placeholder for content
  static createSkeletonPlaceholder(element: HTMLElement, config?: {
    height?: string;
    width?: string;
    borderRadius?: string;
  }): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton animate-pulse';
    skeleton.style.height = config?.height || '1rem';
    skeleton.style.width = config?.width || '100%';
    skeleton.style.borderRadius = config?.borderRadius || '0.25rem';
    skeleton.style.backgroundColor = 'hsl(var(--muted))';
    
    element.appendChild(skeleton);
    return skeleton;
  }

  // Optimize for font loading to prevent FOIT/FOUT
  static optimizeFontRendering(): void {
    if (typeof document === 'undefined') return;

    // Use font-display: swap for better loading performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap;
      }
      
      /* Fallback fonts with similar metrics to prevent layout shift */
      .font-inter-fallback {
        font-family: 
          'Inter', 
          -apple-system, 
          BlinkMacSystemFont, 
          'Segoe UI', 
          Roboto, 
          'Helvetica Neue', 
          Arial, 
          sans-serif;
        font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
        font-optical-sizing: auto;
      }
    `;
    document.head.appendChild(style);
  }

  // Monitor layout shifts and report them
  static monitorLayoutShifts(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        let cumulativeScore = 0;
        
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            const layoutShift = entry as any;
            if (!layoutShift.hadRecentInput) {
              cumulativeScore += layoutShift.value;
            }
          }
        }

        // Report if CLS is above threshold
        if (cumulativeScore > 0.1) {
          console.warn(`High CLS detected: ${cumulativeScore.toFixed(4)}`);
          
          // Send to analytics if available
          if (typeof window !== 'undefined' && 'gtag' in window) {
            const gtag = (window as any).gtag;
            gtag('event', 'cls_high', {
              value: Math.round(cumulativeScore * 10000),
              custom_map: { metric_value: cumulativeScore }
            });
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('Layout shift monitoring not available:', e);
    }
  }

  // Prevent layout shift for dynamic content
  static containerQueryOptimization(): void {
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      /* Container queries for responsive behavior without layout shift */
      .responsive-container {
        container-type: inline-size;
        container-name: main-content;
      }
      
      @container main-content (min-width: 768px) {
        .responsive-item {
          padding: 2rem;
          grid-template-columns: repeat(3, 1fr);
        }
      }
      
      @container main-content (max-width: 767px) {
        .responsive-item {
          padding: 1rem;
          grid-template-columns: 1fr;
        }
      }
      
      /* CSS containment for performance */
      .content-section {
        contain: layout style paint;
      }
      
      .isolated-component {
        contain: layout style;
        content-visibility: auto;
        contain-intrinsic-size: 200px;
      }
    `;
    document.head.appendChild(style);
  }

  // Optimize for different viewport sizes
  static optimizeViewportStability(): void {
    if (typeof document === 'undefined') return;

    // Set proper viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no'
      );
    }

    // Add CSS for safe area insets
    const style = document.createElement('style');
    style.textContent = `
      /* Safe area support for notched devices */
      .safe-area-top {
        padding-top: env(safe-area-inset-top);
      }
      
      .safe-area-bottom {
        padding-bottom: env(safe-area-inset-bottom);
      }
      
      .safe-area-left {
        padding-left: env(safe-area-inset-left);
      }
      
      .safe-area-right {
        padding-right: env(safe-area-inset-right);
      }
      
      /* Prevent zoom on focus for iOS */
      input, select, textarea {
        font-size: 16px;
      }
      
      @media screen and (max-width: 767px) {
        input, select, textarea {
          font-size: 16px !important;
          transform: translateZ(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize all layout stability optimizations
  static init(): void {
    this.optimizeFontRendering();
    this.monitorLayoutShifts();
    this.containerQueryOptimization();
    this.optimizeViewportStability();

    // Initialize ResizeObserver for monitoring element size changes
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          
          // Add contain property for performance
          if (!element.style.contain) {
            element.style.contain = 'layout style';
          }
        });
      });

      // Observe critical elements
      document.addEventListener('DOMContentLoaded', () => {
        const criticalElements = document.querySelectorAll(
          '.hero-section, .navigation, .main-content, .footer'
        );
        criticalElements.forEach(el => this.observer?.observe(el));
      });
    }
  }

  // Cleanup
  static destroy(): void {
    this.observer?.disconnect();
    this.mutationObserver?.disconnect();
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  LayoutStabilityManager.init();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    LayoutStabilityManager.destroy();
  });
}