import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load recharts components
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const AreaChart = lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));

// Re-export other chart components
export const LazyLineChart = lazy(() => import('recharts').then(module => ({ 
  default: ({ children, ...props }: any) => (
    <Suspense fallback={<ChartSkeleton />}>
      <module.LineChart {...props}>{children}</module.LineChart>
    </Suspense>
  )
})));

export const LazyAreaChart = lazy(() => import('recharts').then(module => ({ 
  default: ({ children, ...props }: any) => (
    <Suspense fallback={<ChartSkeleton />}>
      <module.AreaChart {...props}>{children}</module.AreaChart>
    </Suspense>
  )
})));

export const LazyBarChart = lazy(() => import('recharts').then(module => ({ 
  default: ({ children, ...props }: any) => (
    <Suspense fallback={<ChartSkeleton />}>
      <module.BarChart {...props}>{children}</module.BarChart>
    </Suspense>
  )
})));

export const LazyPieChart = lazy(() => import('recharts').then(module => ({ 
  default: ({ children, ...props }: any) => (
    <Suspense fallback={<ChartSkeleton />}>
      <module.PieChart {...props}>{children}</module.PieChart>
    </Suspense>
  )
})));

// Chart components that are commonly used together
export const LazyResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
export const LazyXAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
export const LazyYAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
export const LazyCartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
export const LazyTooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
export const LazyLegend = lazy(() => import('recharts').then(module => ({ default: module.Legend })));
export const LazyLine = lazy(() => import('recharts').then(module => ({ default: module.Line })));
export const LazyArea = lazy(() => import('recharts').then(module => ({ default: module.Area })));
export const LazyBar = lazy(() => import('recharts').then(module => ({ default: module.Bar })));
export const LazyPie = lazy(() => import('recharts').then(module => ({ default: module.Pie })));
export const LazyCell = lazy(() => import('recharts').then(module => ({ default: module.Cell })));

const ChartSkeleton = () => (
  <div className="w-full h-64 space-y-3">
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-48 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export { ChartSkeleton };