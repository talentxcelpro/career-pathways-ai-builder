// Mobile-first utility functions

export const getMobileFirstClasses = {
  // Container utilities
  container: (maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' = '7xl') => {
    const maxWidthClass = {
      'sm': 'max-w-sm',
      'md': 'max-w-md', 
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      '2xl': 'max-w-2xl',
      '7xl': 'max-w-7xl'
    }[maxWidth];
    
    return `${maxWidthClass} mx-auto px-3 sm:px-6 lg:px-8`;
  },

  // Spacing utilities
  spacing: {
    page: 'py-3 sm:py-6',
    section: 'space-y-3 sm:space-y-6',
    component: 'space-y-2 sm:space-y-4',
    tight: 'space-y-1 sm:space-y-2'
  },

  // Grid utilities
  grid: {
    auto: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4',
    twoCol: 'grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6',
    threeCol: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4',
    fourCol: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'
  },

  // Typography utilities
  text: {
    hero: 'text-3xl sm:text-5xl lg:text-6xl font-bold',
    heading: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    subheading: 'text-xl sm:text-2xl font-semibold',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm'
  },

  // Button utilities
  button: {
    primary: 'min-h-[44px] px-4 sm:px-6 py-2 sm:py-3 touch-target',
    secondary: 'min-h-[44px] px-3 sm:px-4 py-2 touch-target',
    icon: 'min-h-[44px] min-w-[44px] p-2 touch-target'
  },

  // Flex utilities
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    column: 'flex flex-col space-y-3 sm:space-y-4',
    row: 'flex flex-col sm:flex-row gap-3 sm:gap-4'
  }
};

// Touch-friendly interaction utilities
export const getTouchClasses = (enabled: boolean = true) => {
  if (!enabled) return '';
  return 'touch-target select-none active:scale-95 transition-transform duration-150';
};

// Image optimization utilities
export const getImageClasses = (lazy: boolean = true, responsive: boolean = true) => {
  const classes = [];
  
  if (lazy) {
    classes.push('loading-lazy');
  }
  
  if (responsive) {
    classes.push('w-full h-auto object-cover');
  }
  
  return classes.join(' ');
};

// Mobile-first performance utilities
export const initializeMobileOptimizations = () => {
  // Add mobile optimization classes to body
  if (typeof document !== 'undefined') {
    document.body.classList.add('mobile-optimized');
    
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Optimize touch interactions
    if ('ontouchstart' in window) {
      document.body.classList.add('touch-device');
    }
  }
};

// Responsive utility functions
export const isTouch = () => {
  return typeof window !== 'undefined' && 'ontouchstart' in window;
};

export const isMobileDevice = () => {
  return typeof window !== 'undefined' && window.innerWidth < 768;
};

export const getViewportSize = () => {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};