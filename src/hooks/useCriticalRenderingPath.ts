import { useEffect, useCallback, useRef } from 'react';

interface CriticalRenderingOptions {
  deferNonCritical?: boolean;
  inlineCriticalCSS?: boolean;
  optimizeWebFonts?: boolean;
  enableRenderOptimization?: boolean;
}

export const useCriticalRenderingPath = (options: CriticalRenderingOptions = {}) => {
  const {
    deferNonCritical = true,
    inlineCriticalCSS = true,
    optimizeWebFonts = true,
    enableRenderOptimization = true
  } = options;

  const criticalResourcesLoaded = useRef(false);
  const nonCriticalQueue = useRef<(() => void)[]>([]);

  // Critical CSS inlining
  const inlineCriticalStyles = useCallback(() => {
    if (!inlineCriticalCSS) return;

    const criticalCSS = `
      /* Critical CSS for above-the-fold content */
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
      @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      .critical-section { min-height: 100vh; }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  }, [inlineCriticalCSS]);

  // Optimize web font loading with system fonts
  const optimizeFontLoading = useCallback(() => {
    // System font stack is used natively; no external network font download required
  }, [optimizeWebFonts]);

  // Defer non-critical resources
  const deferNonCriticalResources = useCallback(() => {
    if (!deferNonCritical) return;

    // Defer analytics and tracking scripts
    const deferredScripts = [
      'gtag',
      'analytics',
      'tracking',
      'social-media'
    ];

    deferredScripts.forEach(scriptId => {
      const script = document.getElementById(scriptId);
      if (script) {
        script.setAttribute('defer', 'true');
      }
    });

    // Load non-critical CSS asynchronously
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-critical="false"]');
    nonCriticalCSS.forEach(link => {
      const newLink = link.cloneNode(true) as HTMLLinkElement;
      newLink.rel = 'preload';
      newLink.as = 'style';
      newLink.onload = () => {
        newLink.rel = 'stylesheet';
      };
      link.parentNode?.replaceChild(newLink, link);
    });
  }, [deferNonCritical]);

  // Queue non-critical operations
  const queueNonCriticalOperation = useCallback((operation: () => void) => {
    if (criticalResourcesLoaded.current) {
      operation();
    } else {
      nonCriticalQueue.current.push(operation);
    }
  }, []);

  // Execute queued non-critical operations
  const executeQueuedOperations = useCallback(() => {
    while (nonCriticalQueue.current.length > 0) {
      const operation = nonCriticalQueue.current.shift();
      if (operation) {
        try {
          operation();
        } catch (error) {
          console.warn('Non-critical operation failed:', error);
        }
      }
    }
  }, []);

  // Mark critical resources as loaded
  const markCriticalResourcesLoaded = useCallback(() => {
    criticalResourcesLoaded.current = true;
    executeQueuedOperations();
  }, [executeQueuedOperations]);

  // Minimize render-blocking resources
  const optimizeRenderBlocking = useCallback(() => {
    if (!enableRenderOptimization) return;

    // Add critical resource hints
    const resourceHints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' }
    ];

    resourceHints.forEach(hint => {
      const link = document.createElement('link');
      Object.assign(link, hint);
      if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
      document.head.appendChild(link);
    });

    // Remove unused CSS (simplified detection)
    setTimeout(() => {
      const allStyles = Array.from(document.styleSheets);
      allStyles.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          let usedRules = 0;
          
          rules.forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              if (document.querySelector(rule.selectorText)) {
                usedRules++;
              }
            }
          });

          const usage = (usedRules / rules.length) * 100;
          if (usage < 20) { // Less than 20% used
            console.debug('Potentially unused stylesheet detected:', sheet.href);
          }
        } catch (e) {
          // Cross-origin stylesheets can't be analyzed
        }
      });
    }, 3000);
  }, [enableRenderOptimization]);

  // Initialize critical rendering path optimizations
  useEffect(() => {
    const init = async () => {
      // Phase 1: Inline critical styles
      inlineCriticalStyles();
      
      // Phase 2: Optimize fonts
      optimizeFontLoading();
      
      // Phase 3: Minimize render blocking
      optimizeRenderBlocking();
      
      // Phase 4: Defer non-critical resources
      requestAnimationFrame(() => {
        deferNonCriticalResources();
      });

      // Mark critical resources as loaded after initial render
      setTimeout(() => {
        markCriticalResourcesLoaded();
      }, 100);
    };

    init();
  }, [
    inlineCriticalStyles,
    optimizeFontLoading,
    optimizeRenderBlocking,
    deferNonCriticalResources,
    markCriticalResourcesLoaded
  ]);

  return {
    queueNonCriticalOperation,
    markCriticalResourcesLoaded,
    criticalResourcesLoaded: criticalResourcesLoaded.current
  };
};