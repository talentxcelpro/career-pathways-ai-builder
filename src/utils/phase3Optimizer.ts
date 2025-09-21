import { initPhase2Optimizations } from './performanceOptimizer';
import { useCriticalRenderingPath } from '@/hooks/useCriticalRenderingPath';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';

// Phase 3: Final Production Optimizations
export const initPhase3Optimizations = async () => {
  console.log('🚀 Initializing Phase 3 Final Production Optimizations...');

  // Ensure Phase 2 is complete
  await initPhase2Optimizations();

  // Register enhanced service worker
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('✅ Enhanced Service Worker registered');

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker installed, show update notification
              showUpdateNotification();
            }
          });
        }
      });
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }

  // Initialize critical rendering path optimizations
  initializeCriticalPath();

  // Set up performance monitoring
  initializePerformanceMonitoring();

  // Enable advanced caching
  enableAdvancedCaching();

  // Optimize for production bundle
  optimizeProductionBundle();

  console.log('✅ Phase 3 final optimizations complete');
};

const showUpdateNotification = () => {
  // Show user-friendly update notification
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: hsl(var(--primary));
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui;
      max-width: 300px;
    ">
      <div style="font-weight: 600; margin-bottom: 8px;">
        🚀 Update Available
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;">
        A new version is available with performance improvements.
      </div>
      <button 
        onclick="window.location.reload()" 
        style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        "
      >
        Update Now
      </button>
      <button 
        onclick="this.parentElement.parentElement.remove()" 
        style="
          background: none;
          border: none;
          color: rgba(255,255,255,0.8);
          padding: 6px 12px;
          cursor: pointer;
          font-size: 12px;
          margin-left: 8px;
        "
      >
        Later
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
};

const initializeCriticalPath = () => {
  // Inline critical CSS for above-the-fold content
  const criticalCSS = `
    .critical-loading {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)));
    }
    
    .loading-pulse {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: hsl(var(--primary));
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }
  `;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
};

const initializePerformanceMonitoring = () => {
  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          console.warn('Long task detected:', {
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime)
          });
        }
      });
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.debug('Long task observer not supported');
    }
  }

  // Monitor memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize / 1024 / 1024;
      const limit = memory.jsHeapSizeLimit / 1024 / 1024;
      const ratio = used / limit;

      if (ratio > 0.9) {
        console.warn('High memory usage detected:', {
          used: Math.round(used),
          limit: Math.round(limit),
          ratio: Math.round(ratio * 100)
        });
      }
    }, 30000); // Check every 30 seconds
  }
};

const enableAdvancedCaching = () => {
  // Implement intelligent prefetching based on user behavior
  let mouseIdleTimer: NodeJS.Timeout;
  let isUserIdle = false;

  const handleMouseMove = () => {
    isUserIdle = false;
    clearTimeout(mouseIdleTimer);
    
    mouseIdleTimer = setTimeout(() => {
      isUserIdle = true;
      // Start prefetching when user is idle
      prefetchLikelyResources();
    }, 2000);
  };

  const prefetchLikelyResources = () => {
    if (!isUserIdle) return;

    // Prefetch likely next pages based on current route
    const currentPath = window.location.pathname;
    const prefetchRoutes: string[] = [];

    switch (currentPath) {
      case '/':
        prefetchRoutes.push('/jobs', '/network');
        break;
      case '/jobs':
        prefetchRoutes.push('/profile', '/applications');
        break;
      case '/network':
        prefetchRoutes.push('/profile', '/messages');
        break;
    }

    prefetchRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  };

  document.addEventListener('mousemove', handleMouseMove);
  
  // Cleanup
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    clearTimeout(mouseIdleTimer);
  };
};

const optimizeProductionBundle = () => {
  // Remove development-only code
  if (process.env.NODE_ENV === 'production') {
    // Disable console logs in production (except errors)
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalDebug = console.debug;

    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};

    // Keep error logging for debugging
    console.error = console.error;

    // In development, you can uncomment these to restore logging:
    // console.log = originalLog;
    // console.warn = originalWarn;
    // console.info = originalInfo;
    // console.debug = originalDebug;
  }

  // Optimize images on the fly
  document.querySelectorAll('img[data-src]').forEach((img: any) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement;
          target.src = target.dataset.src || '';
          target.removeAttribute('data-src');
          observer.unobserve(target);
        }
      });
    });

    observer.observe(img);
  });
};

// Initialize all performance optimizations
export const initializeAllOptimizations = async () => {
  try {
    await initPhase3Optimizations();
    
    // Mark performance initialization as complete
    document.documentElement.setAttribute('data-performance-optimized', 'true');
    
    // Dispatch custom event for other parts of the app
    window.dispatchEvent(new CustomEvent('performance-optimized', {
      detail: { phase: 3, timestamp: Date.now() }
    }));
    
  } catch (error) {
    console.error('Performance optimization failed:', error);
  }
};
