import { lazy, Suspense, ComponentType, FC } from 'react';
import { SkeletonLoader } from '@/components/ui/glass-components';

// Optimized lazy loading with preloading
const lazyWithPreload = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  const Component = lazy(factory);
  (Component as any).preload = factory;
  return Component;
};

// Wrap lazy components with skeleton loaders
export const withSuspense = <P extends Record<string, any>>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
): FC<P> => {
  const WrappedComponent: FC<P> = (props) => {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
  return WrappedComponent;
};

// Preload routes on hover
export const preloadRoute = (component: any) => {
  if (component && (component as any).preload) {
    (component as any).preload();
  }
};

export { lazyWithPreload };
