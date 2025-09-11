// Minimal flicker prevention utility
export class FlickerFix {
  private static applied = false;

  static applyMinimalFix() {
    if (this.applied || typeof document === 'undefined') return;

    // Only critical CSS to prevent major layout shifts
    const style = document.createElement('style');
    style.textContent = `
      /* Minimal flicker prevention */
      body {
        opacity: 0;
        transition: opacity 0.1s ease-in;
      }
      
      body.loaded {
        opacity: 1;
      }
      
      /* Prevent image layout shifts */
      img {
        height: auto;
        max-width: 100%;
      }
      
      /* Smooth transitions for components */
      .animate-fade-in {
        animation: fade-in 0.2s ease-out;
      }
    `;
    
    document.head.appendChild(style);
    this.applied = true;

    // Add loaded class when DOM is ready
    const addLoadedClass = () => {
      document.body.classList.add('loaded');
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addLoadedClass);
    } else {
      addLoadedClass();
    }
  }

  static stabilizeDOM() {
    // Minimal DOM stabilization - just ensure loaded class is present
    if (!document.body.classList.contains('loaded')) {
      document.body.classList.add('loaded');
    }
  }
}

// Auto-apply minimal fix
if (typeof window !== 'undefined') {
  if (document.readyState !== 'loading') {
    FlickerFix.applyMinimalFix();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      FlickerFix.applyMinimalFix();
    });
  }
}