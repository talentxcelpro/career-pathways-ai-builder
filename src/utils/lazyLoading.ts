// Phase 4: Simplified Lazy Loading (existing components only)
import { lazy, ComponentType, LazyExoticComponent, useRef, useEffect } from 'react';
import React from 'react';

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

// Component preloading utilities
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();

  // Preload based on route prediction
  static preloadByRoute(currentRoute: string) {
    // Simple route prediction based on current route
    const routeMap: Record<string, string[]> = {
      '/': ['jobs', 'profile'],
      '/jobs': ['profile', 'network'],
      '/profile': ['jobs', 'network'],
      '/network': ['messages', 'profile'],
    };

    const componentsToPreload = routeMap[currentRoute] || [];
    componentsToPreload.forEach(component => {
      if (!this.preloadedComponents.has(component)) {
        console.log(`Preloading ${component} component`);
        this.preloadedComponents.add(component);
      }
    });
  }

  // Preload based on user behavior
  static preloadByBehavior(userActions: string[]) {
    if (userActions.includes('view_jobs')) {
      console.log('Preloading job-related components');
    }
    if (userActions.includes('edit_profile')) {
      console.log('Preloading profile components');
    }
    if (userActions.includes('use_ai_tools')) {
      console.log('Preloading AI components');
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
    console.log(`Loading component: ${componentId}`);
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