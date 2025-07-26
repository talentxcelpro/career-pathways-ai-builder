import { useState, useCallback } from 'react';

interface DynamicImportHook {
  component: React.ComponentType<any> | null;
  isLoading: boolean;
  error: Error | null;
  loadComponent: () => Promise<void>;
}

// Cache for dynamically loaded components
const componentCache = new Map<string, React.ComponentType<any>>();

export const useDynamicImport = (importPath: string): DynamicImportHook => {
  const [component, setComponent] = useState<React.ComponentType<any> | null>(() => {
    return componentCache.get(importPath) || null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    // Return cached component if available
    if (componentCache.has(importPath)) {
      setComponent(componentCache.get(importPath)!);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let importedModule: any;

      // Dynamic import mapping for known components
      switch (importPath) {
        case '@/components/analytics/RealTimeAnalytics':
          importedModule = await import('@/components/analytics/RealTimeAnalytics');
          break;
        case '@/components/ai/AIToolsInterface':
          importedModule = await import('@/components/ai/AIToolsInterface');
          break;
        case '@/pages/seo/JobsByLocation':
          importedModule = await import('@/pages/seo/JobsByLocation');
          break;
        case '@/pages/seo/JobsByRole':
          importedModule = await import('@/pages/seo/JobsByRole');
          break;
        case '@/pages/seo/JobsBySkill':
          importedModule = await import('@/pages/seo/JobsBySkill');
          break;
        case '@/pages/seo/CompaniesByLocation':
          importedModule = await import('@/pages/seo/CompaniesByLocation');
          break;
        case '@/pages/seo/CoursesByCategory':
          importedModule = await import('@/pages/seo/CoursesByCategory');
          break;
        case '@/pages/seo/SalaryGuide':
          importedModule = await import('@/pages/seo/SalaryGuide');
          break;
        default:
          throw new Error(`Unknown import path: ${importPath}`);
      }

      const Component = importedModule.default || importedModule;
      componentCache.set(importPath, Component);
      setComponent(Component);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
    } finally {
      setIsLoading(false);
    }
  }, [importPath]);

  return {
    component,
    isLoading,
    error,
    loadComponent
  };
};

// Preload specific components for better performance
export const useComponentPreloader = () => {
  const preloadComponents = useCallback(async (paths: string[]) => {
    const preloadPromises = paths.map(async (path) => {
      if (!componentCache.has(path)) {
        try {
          let importedModule: any;
          
          switch (path) {
            case '@/components/analytics/RealTimeAnalytics':
              importedModule = await import('@/components/analytics/RealTimeAnalytics');
              break;
            case '@/components/ai/AIToolsInterface':
              importedModule = await import('@/components/ai/AIToolsInterface');
              break;
            default:
              return;
          }
          
          const Component = importedModule.default || importedModule;
          componentCache.set(path, Component);
        } catch (err) {
          console.warn(`Failed to preload component: ${path}`, err);
        }
      }
    });

    await Promise.all(preloadPromises);
  }, []);

  return { preloadComponents };
};

// Hook for lazy loading with intersection observer
export const useLazyComponentLoader = (
  importPath: string,
  options: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
) => {
  const { threshold = 0.1, rootMargin = '100px', triggerOnce = true } = options;
  const [shouldLoad, setShouldLoad] = useState(false);
  const { component, isLoading, error, loadComponent } = useDynamicImport(importPath);

  const observerRef = useCallback((node: HTMLElement | null) => {
    if (!node || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          loadComponent();
          if (triggerOnce) {
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldLoad, loadComponent, threshold, rootMargin, triggerOnce]);

  return {
    component,
    isLoading,
    error,
    shouldLoad,
    observerRef
  };
};