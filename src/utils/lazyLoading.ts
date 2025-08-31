// Phase 4: Advanced Lazy Loading and Code Splitting
import { lazy, ComponentType, LazyExoticComponent } from 'react';

interface LazyLoadConfig {
  retries?: number;
  retryDelay?: number;
  fallback?: ComponentType;
  preload?: boolean;
}

// Enhanced lazy loading with retry logic
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: LazyLoadConfig = {}
): LazyExoticComponent<T> {
  const { retries = 3, retryDelay = 1000 } = config;

  const lazyComponentImport = async () => {
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const module = await importFn();
        return module;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          console.warn(`Failed to load component (attempt ${attempt + 1}):`, error);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    // If all retries failed, show error boundary
    throw new Error(`Failed to load component after ${retries + 1} attempts: ${lastError.message}`);
  };

  return lazy(lazyComponentImport);
}

// Route-based code splitting
export const RouteComponents = {
  // Main pages
  HomePage: createLazyComponent(() => import('@/pages/HomePage')),
  JobsPage: createLazyComponent(() => import('@/pages/JobsPage')),
  ProfilePage: createLazyComponent(() => import('@/pages/ProfilePage')),
  NetworkPage: createLazyComponent(() => import('@/pages/NetworkPage')),
  MessagesPage: createLazyComponent(() => import('@/pages/MessagesPage')),
  
  // Admin pages
  AdminDashboard: createLazyComponent(() => import('@/pages/admin/AdminDashboard')),
  UserManagement: createLazyComponent(() => import('@/pages/admin/UserManagement')),
  ContentModeration: createLazyComponent(() => import('@/pages/admin/ContentModeration')),
  
  // Settings pages
  AccountSettings: createLazyComponent(() => import('@/pages/settings/AccountSettings')),
  PrivacySettings: createLazyComponent(() => import('@/pages/settings/PrivacySettings')),
  NotificationSettings: createLazyComponent(() => import('@/pages/settings/NotificationSettings')),
  
  // AI Tools
  AIResumeBuilder: createLazyComponent(() => import('@/components/ai/AIResumeBuilder')),
  AICoverLetterBuilder: createLazyComponent(() => import('@/components/ai/AICoverLetterBuilder')),
  AICareerCoach: createLazyComponent(() => import('@/components/ai/AICareerCoach')),
  AIInterviewPrep: createLazyComponent(() => import('@/components/ai/AIInterviewPrep')),
};

// Feature-based code splitting
export const FeatureComponents = {
  // Charts and Analytics
  AnalyticsChart: createLazyComponent(() => import('@/components/charts/AnalyticsChart')),
  PerformanceChart: createLazyComponent(() => import('@/components/charts/PerformanceChart')),
  
  // File handling
  FileUploader: createLazyComponent(() => import('@/components/files/FileUploader')),
  PDFViewer: createLazyComponent(() => import('@/components/files/PDFViewer')),
  ImageEditor: createLazyComponent(() => import('@/components/files/ImageEditor')),
  
  // Rich editors
  RichTextEditor: createLazyComponent(() => import('@/components/editor/RichTextEditor')),
  MarkdownEditor: createLazyComponent(() => import('@/components/editor/MarkdownEditor')),
  
  // Video/Media
  VideoPlayer: createLazyComponent(() => import('@/components/media/VideoPlayer')),
  AudioRecorder: createLazyComponent(() => import('@/components/media/AudioRecorder')),
  
  // Maps and Geo
  MapComponent: createLazyComponent(() => import('@/components/map/MapComponent')),
  LocationPicker: createLazyComponent(() => import('@/components/map/LocationPicker')),
};

// Preloading utilities
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();

  // Preload components on user interaction
  static preloadOnHover(componentKey: keyof typeof RouteComponents) {
    if (this.preloadedComponents.has(componentKey)) return;

    const component = RouteComponents[componentKey];
    if (component) {
      // Start preloading
      component._result?.();
      this.preloadedComponents.add(componentKey);
    }
  }

  // Preload based on route prediction
  static preloadByRoute(currentRoute: string) {
    const routePreloadMap: Record<string, (keyof typeof RouteComponents)[]> = {
      '/': ['JobsPage', 'ProfilePage'],
      '/jobs': ['ProfilePage', 'NetworkPage'],
      '/profile': ['JobsPage', 'NetworkPage'],
      '/network': ['MessagesPage', 'ProfilePage'],
      '/admin': ['UserManagement', 'ContentModeration'],
    };

    const componentsToPreload = routePreloadMap[currentRoute] || [];
    componentsToPreload.forEach(component => {
      this.preloadOnHover(component);
    });
  }

  // Preload based on user behavior
  static preloadByBehavior(userActions: string[]) {
    if (userActions.includes('view_jobs')) {
      this.preloadOnHover('JobsPage');
    }
    if (userActions.includes('edit_profile')) {
      this.preloadOnHover('ProfilePage');
    }
    if (userActions.includes('use_ai_tools')) {
      // Preload AI components
      FeatureComponents.RichTextEditor;
    }
  }
}

// Intersection Observer for viewport-based loading
export class ViewportLoader {
  private static observer: IntersectionObserver | null = null;
  private static loadedComponents = new Set<string>();

  static init() {
    if (this.observer) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const componentId = entry.target.getAttribute('data-component-id');
            if (componentId && !this.loadedComponents.has(componentId)) {
              this.loadComponent(componentId);
              this.loadedComponents.add(componentId);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Load 50px before entering viewport
        threshold: 0.1,
      }
    );
  }

  static observe(element: HTMLElement, componentId: string) {
    if (!this.observer) this.init();
    
    element.setAttribute('data-component-id', componentId);
    this.observer?.observe(element);
  }

  static unobserve(element: HTMLElement) {
    this.observer?.unobserve(element);
  }

  private static loadComponent(componentId: string) {
    // Load component based on ID
    const componentMap: Record<string, () => void> = {
      'analytics-chart': () => FeatureComponents.AnalyticsChart,
      'pdf-viewer': () => FeatureComponents.PDFViewer,
      'rich-editor': () => FeatureComponents.RichTextEditor,
      'video-player': () => FeatureComponents.VideoPlayer,
    };

    const loader = componentMap[componentId];
    if (loader) {
      loader();
    }
  }
}

// Hook for viewport-based lazy loading
export function useLazyLoad(componentId: string) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      ViewportLoader.observe(elementRef.current, componentId);
      
      return () => {
        if (elementRef.current) {
          ViewportLoader.unobserve(elementRef.current);
        }
      };
    }
  }, [componentId]);

  return elementRef;
}

// Dynamic import with caching
export class DynamicImportCache {
  private static cache = new Map<string, Promise<any>>();

  static async import<T>(
    importPath: string,
    importFn: () => Promise<T>
  ): Promise<T> {
    if (this.cache.has(importPath)) {
      return this.cache.get(importPath);
    }

    const importPromise = importFn();
    this.cache.set(importPath, importPromise);
    
    try {
      const result = await importPromise;
      return result;
    } catch (error) {
      // Remove failed import from cache
      this.cache.delete(importPath);
      throw error;
    }
  }

  static clearCache() {
    this.cache.clear();
  }

  static getCacheSize() {
    return this.cache.size;
  }
}

// Initialize lazy loading
export function initializeLazyLoading() {
  ViewportLoader.init();
  
  // Preload based on current route
  const currentRoute = window.location.pathname;
  ComponentPreloader.preloadByRoute(currentRoute);
  
  // Listen for route changes to preload next likely components
  window.addEventListener('popstate', () => {
    const newRoute = window.location.pathname;
    ComponentPreloader.preloadByRoute(newRoute);
  });
}