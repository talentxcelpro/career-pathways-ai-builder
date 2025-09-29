import React, { useEffect, useState } from 'react';

interface Resource {
  href: string;
  as: 'script' | 'style' | 'font' | 'image';
  crossOrigin?: boolean;
  media?: string;
}

const criticalResources: Resource[] = [
  {
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    as: 'style'
  },
  {
    href: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZ.woff2',
    as: 'font',
    crossOrigin: true
  }
];

const deferredResources: Resource[] = [
  {
    href: 'https://www.googletagmanager.com/gtag/js?id=G-CMYNTTNT56',
    as: 'script'
  },
  {
    href: 'https://accounts.google.com/gsi/client',
    as: 'script'
  }
];

export const CriticalResourceLoader: React.FC = () => {
  const [criticalLoaded, setCriticalLoaded] = useState(false);

  useEffect(() => {
    // Load critical resources immediately
    const loadCriticalResources = async () => {
      const promises = criticalResources.map(resource => {
        return new Promise<void>((resolve, reject) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = resource.href;
          link.as = resource.as;
          
          if (resource.crossOrigin) {
            link.crossOrigin = 'anonymous';
          }
          
          if (resource.media) {
            link.media = resource.media;
          }

          link.onload = () => {
            // For stylesheets, also create actual stylesheet link
            if (resource.as === 'style') {
              const styleLink = document.createElement('link');
              styleLink.rel = 'stylesheet';
              styleLink.href = resource.href;
              document.head.appendChild(styleLink);
            }
            resolve();
          };
          
          link.onerror = reject;
          document.head.appendChild(link);
        });
      });

      try {
        await Promise.all(promises);
        setCriticalLoaded(true);
        performance.mark('critical-resources-loaded');
      } catch (error) {
        console.warn('Failed to load some critical resources:', error);
        setCriticalLoaded(true); // Continue anyway
      }
    };

    loadCriticalResources();
  }, []);

  useEffect(() => {
    if (!criticalLoaded) return;

    // Load deferred resources after critical resources
    const loadDeferredResources = () => {
      deferredResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource.href;
        link.as = resource.as;
        document.head.appendChild(link);
      });
    };

    // Use requestIdleCallback to load deferred resources
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadDeferredResources);
    } else {
      setTimeout(loadDeferredResources, 1000);
    }
  }, [criticalLoaded]);

  return null; // This component only manages resource loading
};

// Hook for components that need to wait for critical resources
export const useCriticalResources = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const checkResources = () => {
      // Check if critical fonts are loaded
      if (document.fonts && document.fonts.check) {
        const fontLoaded = document.fonts.check('12px Inter');
        if (fontLoaded) {
          setLoaded(true);
          return;
        }
      }

      // Fallback: assume loaded after reasonable timeout
      setTimeout(() => setLoaded(true), 2000);
    };

    if (document.readyState === 'complete') {
      checkResources();
    } else {
      window.addEventListener('load', checkResources);
      return () => window.removeEventListener('load', checkResources);
    }
  }, []);

  return loaded;
};