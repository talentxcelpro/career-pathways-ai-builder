/**
 * Apple-style typography scale and design system utilities
 */

// Apple's refined text hierarchy with precise sizing
export const appleTextSizes = {
  // Display sizes (for hero sections)
  'display-large': 'text-5xl md:text-6xl lg:text-7xl', // 48px -> 72px -> 80px
  'display-medium': 'text-4xl md:text-5xl lg:text-6xl', // 36px -> 48px -> 60px
  'display-small': 'text-3xl md:text-4xl lg:text-5xl', // 30px -> 36px -> 48px
  
  // Headlines (for section titles)
  'headline-large': 'text-2xl md:text-3xl', // 24px -> 30px
  'headline-medium': 'text-xl md:text-2xl', // 20px -> 24px
  'headline-small': 'text-lg md:text-xl', // 18px -> 20px
  
  // Titles (for card headers, page titles)
  'title-large': 'text-base md:text-lg', // 16px -> 18px
  'title-medium': 'text-sm md:text-base', // 14px -> 16px
  'title-small': 'text-xs md:text-sm', // 12px -> 14px
  
  // Body text (for content)
  'body-large': 'text-sm', // 14px
  'body-medium': 'text-xs', // 12px
  'body-small': 'text-xs', // 12px
  
  // Labels (for buttons, badges)
  'label-large': 'text-xs font-medium', // 12px medium
  'label-medium': 'text-xs font-medium', // 12px medium
  'label-small': 'text-xs font-medium', // 12px medium
} as const;

// Apple's spacing scale
export const appleSpacing = {
  'micro': 'space-y-0.5', // 2px
  'tiny': 'space-y-1', // 4px
  'small': 'space-y-2', // 8px
  'medium': 'space-y-3', // 12px
  'large': 'space-y-4', // 16px
  'extra-large': 'space-y-6', // 24px
} as const;

// Apple's component sizing
export const appleComponentSizes = {
  button: {
    small: 'h-7 px-3 text-xs',
    medium: 'h-8 px-4 text-xs',
    large: 'h-9 px-5 text-sm',
  },
  input: {
    small: 'h-7 px-2 text-xs',
    medium: 'h-8 px-3 text-xs', 
    large: 'h-9 px-4 text-sm',
  },
  card: {
    padding: 'p-3 md:p-4',
    spacing: 'space-y-2',
  }
} as const;

// Apple's icon sizing
export const appleIconSizes = {
  'micro': 'w-3 h-3', // 12px
  'tiny': 'w-3.5 h-3.5', // 14px
  'small': 'w-4 h-4', // 16px
  'medium': 'w-5 h-5', // 20px
  'large': 'w-6 h-6', // 24px
} as const;

// Utility function to get consistent text classes
export const getAppleTextClass = (size: keyof typeof appleTextSizes, weight?: 'light' | 'regular' | 'medium' | 'semibold') => {
  const sizeClass = appleTextSizes[size];
  const weightClass = weight ? `font-apple-${weight}` : '';
  return `${sizeClass} ${weightClass}`.trim();
};

// Apple-style component variants
export const appleVariants = {
  card: {
    base: 'card-apple backdrop-apple transition-apple',
    interactive: 'card-apple backdrop-apple transition-apple hover-lift cursor-pointer',
    flat: 'bg-card/50 rounded-apple border border-border/50 p-3',
  },
  button: {
    primary: 'btn-apple-primary transition-apple hover-lift',
    secondary: 'btn-apple-secondary transition-apple hover-lift',
    ghost: 'bg-transparent hover:bg-muted/50 transition-apple rounded-apple',
  }
} as const;