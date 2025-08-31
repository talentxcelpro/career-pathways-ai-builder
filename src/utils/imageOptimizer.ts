// Advanced image optimization utilities
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export class ImageOptimizer {
  // Generate optimized image URL (placeholder for future CDN integration)
  static getOptimizedUrl(src: string, options: ImageOptimizationOptions = {}): string {
    if (!src) return src;
    
    // For now, return original URL - future: integrate with image CDN
    // Example: Cloudinary, ImageKit, or custom optimization service
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    
    // If it's already an optimized URL, return as-is
    if (src.includes('?') || src.startsWith('data:')) return src;
    
    return params.toString() ? `${src}?${params.toString()}` : src;
  }

  // Generate responsive srcSet
  static generateSrcSet(src: string, widths: number[] = [320, 640, 960, 1280, 1920]): string {
    return widths
      .map(width => `${this.getOptimizedUrl(src, { width })} ${width}w`)
      .join(', ');
  }

  // Generate sizes attribute for responsive images
  static generateSizes(breakpoints: { [key: string]: string } = {
    '(max-width: 320px)': '100vw',
    '(max-width: 640px)': '50vw',
    '(max-width: 960px)': '33vw',
    '(max-width: 1280px)': '25vw',
    default: '20vw'
  }): string {
    const sizes = Object.entries(breakpoints)
      .filter(([key]) => key !== 'default')
      .map(([media, size]) => `${media} ${size}`)
      .join(', ');
    
    return `${sizes}, ${breakpoints.default || '100vw'}`;
  }

  // Preload critical images
  static preloadImage(src: string, options: ImageOptimizationOptions = {}) {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = this.getOptimizedUrl(src, options);
    
    if (options.format) {
      link.type = `image/${options.format}`;
    }
    
    // Add to head if not already present
    if (!document.head.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link);
    }
  }

  // Check if browser supports modern formats
  static supportsWebP(): Promise<boolean> {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = () => resolve(webP.height === 2);
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  static supportsAVIF(): Promise<boolean> {
    return new Promise(resolve => {
      const avif = new Image();
      avif.onload = avif.onerror = () => resolve(avif.height === 2);
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }

  // Get optimal format based on browser support
  static async getOptimalFormat(preferredFormat?: 'webp' | 'avif'): Promise<'avif' | 'webp' | 'jpg'> {
    if (preferredFormat === 'avif' && await this.supportsAVIF()) return 'avif';
    if ((preferredFormat === 'webp' || !preferredFormat) && await this.supportsWebP()) return 'webp';
    return 'jpg';
  }

  // Lazy loading with IntersectionObserver
  static observeLazyImages() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src], img.lazy').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Initialize image optimization
  static init() {
    if (typeof window === 'undefined') return;
    
    // Set up lazy loading observer
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.observeLazyImages);
    } else {
      this.observeLazyImages();
    }
  }
}

// Auto-initialize
ImageOptimizer.init();