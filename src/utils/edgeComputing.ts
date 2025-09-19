// Edge computing utilities for performance optimization
export interface EdgeConfig {
  regions: string[];
  cacheStrategy: 'aggressive' | 'balanced' | 'minimal';
  preloadAssets: string[];
}

export const edgeConfig: EdgeConfig = {
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  cacheStrategy: 'balanced',
  preloadAssets: [
    '/src/assets/logo.svg',
    '/src/index.css',
    '/fonts/inter-var.woff2'
  ]
};

// Edge function simulation for client-side optimization
export const edgeOptimizer = {
  // Geographic optimization
  getOptimalRegion: () => {
    if (typeof navigator !== 'undefined') {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.includes('America')) return 'us-east-1';
      if (timezone.includes('Europe')) return 'eu-west-1';
      if (timezone.includes('Asia')) return 'ap-southeast-1';
    }
    return 'us-east-1';
  },

  // Adaptive resource loading based on connection
  getConnectionQuality: () => {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn.effectiveType === '4g' && conn.downlink > 10) return 'high';
      if (conn.effectiveType === '3g' || conn.downlink > 2) return 'medium';
    }
    return 'low';
  },

  // Dynamic asset optimization
  optimizeAssetLoading: () => {
    const quality = edgeOptimizer.getConnectionQuality();
    const region = edgeOptimizer.getOptimalRegion();
    
    return {
      imageQuality: quality === 'high' ? 95 : quality === 'medium' ? 80 : 60,
      videoQuality: quality === 'high' ? '1080p' : quality === 'medium' ? '720p' : '480p',
      bundleStrategy: quality === 'high' ? 'eager' : 'lazy',
      region,
      preconnect: [
        `https://cdn-${region}.supabase.co`,
        `https://api-${region}.vercel.app`
      ]
    };
  },

  // Smart prefetching
  prefetchCriticalResources: () => {
    const config = edgeOptimizer.optimizeAssetLoading();
    
    // Preconnect to critical domains
    config.preconnect.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Prefetch critical assets
    edgeConfig.preloadAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = asset;
      document.head.appendChild(link);
    });
  }
};

// Service worker registration for edge caching
export const registerEdgeServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'imports'
    }).then(registration => {
      console.log('Edge service worker registered:', registration);
      
      // Update on new version
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              window.location.reload();
            }
          });
        }
      });
    }).catch(error => {
      console.error('Edge service worker registration failed:', error);
    });
  }
};