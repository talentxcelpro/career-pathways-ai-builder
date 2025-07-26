import { useState, useEffect, useCallback } from 'react';

interface AssetOptimizationOptions {
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  critical?: boolean;
}

interface OptimizedAsset {
  src: string;
  srcSet?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

class AssetOptimizer {
  private cache = new Map<string, OptimizedAsset>();
  
  async optimizeImage(
    src: string, 
    options: AssetOptimizationOptions = {}
  ): Promise<OptimizedAsset> {
    const cacheKey = `${src}_${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const {
      quality = 80,
      format = 'auto',
      lazy = true,
      critical = false
    } = options;

    // For development, return optimized URLs that would be handled by CDN/build process
    const optimizedSrc = this.generateOptimizedUrl(src, { quality, format });
    const srcSet = this.generateSrcSet(src, { quality, format });

    const optimizedAsset: OptimizedAsset = {
      src: optimizedSrc,
      srcSet,
      loading: critical ? 'eager' : (lazy ? 'lazy' : 'eager'),
      fetchPriority: critical ? 'high' : 'auto'
    };

    this.cache.set(cacheKey, optimizedAsset);
    return optimizedAsset;
  }

  private generateOptimizedUrl(src: string, options: { quality: number; format: string }): string {
    // In production, this would integrate with your CDN or image optimization service
    if (src.includes('unsplash.com')) {
      const url = new URL(src);
      url.searchParams.set('q', options.quality.toString());
      if (options.format !== 'auto') {
        url.searchParams.set('fm', options.format);
      }
      return url.toString();
    }
    return src;
  }

  private generateSrcSet(src: string, options: { quality: number; format: string }): string {
    const sizes = [640, 768, 1024, 1280, 1536];
    
    if (src.includes('unsplash.com')) {
      return sizes
        .map(size => {
          const url = new URL(src);
          url.searchParams.set('w', size.toString());
          url.searchParams.set('q', options.quality.toString());
          if (options.format !== 'auto') {
            url.searchParams.set('fm', options.format);
          }
          return `${url.toString()} ${size}w`;
        })
        .join(', ');
    }
    
    return '';
  }

  preloadCriticalAssets(assets: Array<{ src: string; type: 'image' | 'font' | 'style' }>) {
    assets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset.src;
      
      switch (asset.type) {
        case 'image':
          link.as = 'image';
          link.setAttribute('fetchpriority', 'high');
          break;
        case 'font':
          link.as = 'font';
          link.crossOrigin = 'anonymous';
          break;
        case 'style':
          link.as = 'style';
          break;
      }
      
      document.head.appendChild(link);
    });
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

const globalOptimizer = new AssetOptimizer();

export const useOptimizedAssets = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeImage = useCallback(async (
    src: string,
    options?: AssetOptimizationOptions
  ): Promise<OptimizedAsset> => {
    setIsOptimizing(true);
    try {
      return await globalOptimizer.optimizeImage(src, options);
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const preloadCritical = useCallback((
    assets: Array<{ src: string; type: 'image' | 'font' | 'style' }>
  ) => {
    globalOptimizer.preloadCriticalAssets(assets);
  }, []);

  const clearCache = useCallback(() => {
    globalOptimizer.clearCache();
  }, []);

  return {
    optimizeImage,
    preloadCritical,
    clearCache,
    isOptimizing,
    cacheStats: globalOptimizer.getCacheStats()
  };
};

// Hook for critical resource preloading on app startup
export const useCriticalResourcePreloader = () => {
  const { preloadCritical } = useOptimizedAssets();

  useEffect(() => {
    // Preload critical assets on app start
    const criticalAssets = [
      {
        src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        type: 'image' as const
      },
      {
        src: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
        type: 'style' as const
      }
    ];

    preloadCritical(criticalAssets);
  }, [preloadCritical]);
};

// Support for browsers that support WebP
export const useWebPSupport = () => {
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      const dataURL = canvas.toDataURL('image/webp');
      setSupportsWebP(dataURL.indexOf('data:image/webp') === 0);
    };

    checkWebPSupport();
  }, []);

  return supportsWebP;
};