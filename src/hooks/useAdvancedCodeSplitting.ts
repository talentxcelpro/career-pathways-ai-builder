import { lazy, ComponentType } from 'react';
import { useResourcePreloading } from './useResourcePreloading';

interface LazyComponentOptions {
  preload?: boolean;
  retries?: number;
  fallback?: ComponentType;
}

export const useAdvancedCodeSplitting = () => {
  const { preloadResource } = useResourcePreloading();

  const createLazyComponent = <T extends ComponentType<any>>(
    importFunction: () => Promise<{ default: T }>,
    options: LazyComponentOptions = {}
  ) => {
    const { preload = false, retries = 3 } = options;

    // Enhanced import function with retry logic
    const enhancedImport = async (): Promise<{ default: T }> => {
      let lastError: Error;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const module = await importFunction();
          return module;
        } catch (error) {
          lastError = error as Error;
          
          if (attempt < retries) {
            // Exponential backoff
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            console.warn(`Code splitting attempt ${attempt} failed, retrying in ${delay}ms...`);
          }
        }
      }

      throw lastError!;
    };

    const LazyComponent = lazy(enhancedImport);

    // Preload if requested
    if (preload) {
      setTimeout(() => {
        enhancedImport().catch(error => {
          console.warn('Preload failed:', error);
        });
      }, 100);
    }

    return LazyComponent;
  };

  const preloadRoute = (routeChunk: string) => {
    preloadResource({
      href: `/chunks/${routeChunk}.js`,
      as: 'script'
    });
  };

  const createRouteBasedLazy = (routes: Record<string, () => Promise<any>>) => {
    const lazyRoutes: Record<string, ComponentType> = {};

    Object.entries(routes).forEach(([route, importFn]) => {
      lazyRoutes[route] = createLazyComponent(importFn, {
        preload: false,
        retries: 3
      });
    });

    return lazyRoutes;
  };

  return {
    createLazyComponent,
    preloadRoute,
    createRouteBasedLazy
  };
};