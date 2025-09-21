// Critical CSS extraction and inlining for above-the-fold content
export class CriticalCSSManager {
  private static extractedCSS: string | null = null;
  private static isExtracted = false;

  // Extract critical CSS for above-the-fold content
  static extractCriticalCSS(): string {
    if (this.extractedCSS && this.isExtracted) {
      return this.extractedCSS;
    }

    const criticalCSS = `
      /* Critical styles for immediate rendering */
      *, *::before, *::after {
        box-sizing: border-box;
      }
      
      html {
        line-height: 1.15;
        -webkit-text-size-adjust: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      body {
        margin: 0;
        font-family: inherit;
        background-color: hsl(0 0% 100%);
        color: hsl(222.2 84% 4.9%);
      }
      
      .min-h-screen { min-height: 100vh; }
      .flex { display: flex; }
      .items-center { align-items: center; }
      .justify-center { justify-content: center; }
      .text-center { text-align: center; }
      .font-bold { font-weight: 700; }
      .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
      .mb-4 { margin-bottom: 1rem; }
      .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
      
      /* Hero section critical styles */
      .hero-gradient {
        background: linear-gradient(135deg, hsl(221.2 83.2% 53.3%), hsl(212 95% 68%));
      }
      
      /* Navigation critical styles */
      .nav-blur {
        backdrop-filter: blur(8px);
        background-color: hsla(0, 0%, 100%, 0.8);
      }
    `;

    this.extractedCSS = criticalCSS;
    this.isExtracted = true;
    return criticalCSS;
  }

  // Inline critical CSS in document head
  static inlineCriticalCSS(): void {
    if (typeof document === 'undefined') return;

    const existingStyle = document.getElementById('critical-css');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'critical-css';
    style.innerHTML = this.extractCriticalCSS();
    
    // Insert before any other stylesheets
    const firstLink = document.querySelector('link[rel="stylesheet"]');
    if (firstLink) {
      document.head.insertBefore(style, firstLink);
    } else {
      document.head.appendChild(style);
    }
  }

  // Optimize font loading with swap
  static optimizeFontLoading(): void {
    if (typeof document === 'undefined') return;

    // Add font-display: swap to existing font links
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.includes('display=swap')) {
        const separator = href.includes('?') ? '&' : '?';
        link.setAttribute('href', `${href}${separator}display=swap`);
      }
    });
  }

  // Remove unused CSS classes (basic implementation)
  static removeUnusedCSS(): void {
    if (typeof document === 'undefined') return;

    // Skip CSS optimization to avoid security errors with cross-origin stylesheets
    // In production, use build-time tools like PurgeCSS instead
    console.log('CSS optimization skipped (build-time optimization recommended)');
  }

  // Initialize all optimizations
  static init(): void {
    this.inlineCriticalCSS();
    this.optimizeFontLoading();
    
    // Remove unused CSS after page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.removeUnusedCSS(), 1000);
      });
    } else {
      setTimeout(() => this.removeUnusedCSS(), 1000);
    }
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  CriticalCSSManager.init();
}