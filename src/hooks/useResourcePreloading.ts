import { useEffect, useCallback, useRef } from 'react';

interface PreloadOptions {
  priority?: 'high' | 'low';
  crossorigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
}

interface PreloadResource {
  href: string;
  as: 'script' | 'style' | 'font' | 'image' | 'fetch' | 'document';
  type?: string;
  options?: PreloadOptions;
}

export const useResourcePreloading = () => {
  const preloadedResources = useRef<Set<string>>(new Set());
  const preloadLinks = useRef<HTMLLinkElement[]>([]);

  const preloadResource = useCallback((resource: PreloadResource) => {
    const { href, as, type, options = {} } = resource;
    
    // Avoid duplicate preloading
    if (preloadedResources.current.has(href)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    
    if (type) link.type = type;
    if (options.crossorigin) link.crossOrigin = options.crossorigin;
    if (options.integrity) link.integrity = options.integrity;
    if (options.priority) link.setAttribute('fetchpriority', options.priority);

    document.head.appendChild(link);
    preloadLinks.current.push(link);
    preloadedResources.current.add(href);

    return link;
  }, []);

  const preloadRouteResources = useCallback((route: string) => {
    const routeMapping: Record<string, PreloadResource[]> = {
      '/jobs': [
        { href: '/api/jobs', as: 'fetch' },
        { href: '/src/pages/Jobs.tsx', as: 'script' }
      ],
      '/network': [
        { href: '/api/connections', as: 'fetch' },
        { href: '/src/pages/Network.tsx', as: 'script' }
      ],
      '/profile': [
        { href: '/api/profile', as: 'fetch' },
        { href: '/src/pages/Profile.tsx', as: 'script' }
      ]
    };

    const resources = routeMapping[route];
    if (resources) {
      resources.forEach(preloadResource);
    }
  }, [preloadResource]);

  const preloadCriticalFonts = useCallback(() => {
    const fonts = [
      '/fonts/inter-var.woff2',
      '/fonts/inter-var-latin.woff2'
    ];

    fonts.forEach(font => {
      preloadResource({
        href: font,
        as: 'font',
        type: 'font/woff2',
        options: { crossorigin: 'anonymous' }
      });
    });
  }, [preloadResource]);

  const preloadImages = useCallback((imageUrls: string[]) => {
    imageUrls.forEach(url => {
      preloadResource({
        href: url,
        as: 'image',
        options: { priority: 'low' }
      });
    });
  }, [preloadResource]);

  const prefetchNextRoute = useCallback((route: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
    preloadLinks.current.push(link);
  }, []);

  // Intelligent preloading based on user behavior
  const preloadOnHover = useCallback((element: HTMLElement, resources: PreloadResource[]) => {
    let hoverTimeout: NodeJS.Timeout;

    const handleMouseEnter = () => {
      hoverTimeout = setTimeout(() => {
        resources.forEach(preloadResource);
      }, 150); // Delay to avoid preloading on quick mouse movements
    };

    const handleMouseLeave = () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [preloadResource]);

  // Cleanup function
  const cleanup = useCallback(() => {
    preloadLinks.current.forEach(link => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    });
    preloadLinks.current = [];
    preloadedResources.current.clear();
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    preloadResource,
    preloadRouteResources,
    preloadCriticalFonts,
    preloadImages,
    prefetchNextRoute,
    preloadOnHover,
    cleanup
  };
};