/**
 * Apple-style typography helpers — re-mapped to the canonical type ramp
 * defined in tailwind.config.ts. Do not introduce raw text-3xl/4xl/etc.
 *
 * Approved tokens (single source of truth):
 *   text-display-1 / -2 / -3
 *   text-headline
 *   text-title-1 / -2 / -3
 *   text-body-lg / text-body / text-body-sm
 *   text-caption / text-eyebrow
 */

export const appleTextSizes = {
  // Display sizes (hero)
  'display-large':   'text-display-1',
  'display-medium':  'text-display-2',
  'display-small':   'text-display-3',

  // Headlines (section titles)
  'headline-large':  'text-headline',
  'headline-medium': 'text-title-1',
  'headline-small':  'text-title-2',

  // Titles
  'title-large':     'text-title-2',
  'title-medium':    'text-title-3',
  'title-small':     'text-body-lg',

  // Body
  'body-large':      'text-body-lg',
  'body-medium':     'text-body',
  'body-small':      'text-body-sm',

  // Labels
  'label-large':     'text-body-sm font-medium',
  'label-medium':    'text-caption font-medium',
  'label-small':     'text-eyebrow',
} as const;

export const appleSpacing = {
  'micro':       'space-y-1',
  'tiny':        'space-y-2',
  'small':       'space-y-3',
  'medium':      'space-y-4',
  'large':       'space-y-6',
  'extra-large': 'space-y-8',
} as const;

export const appleComponentSizes = {
  button: {
    small:  'h-8 px-3 text-body-sm',
    medium: 'h-9 px-4 text-body',
    large:  'h-11 px-6 text-body-lg',
  },
  input: {
    small:  'h-8 px-3 text-body-sm',
    medium: 'h-9 px-3 text-body',
    large:  'h-11 px-4 text-body-lg',
  },
  card: {
    padding: 'p-4 md:p-6',
    spacing: 'space-y-3',
  },
} as const;

export const appleIconSizes = {
  'micro':  'w-3 h-3',
  'tiny':   'w-3.5 h-3.5',
  'small':  'w-4 h-4',
  'medium': 'w-5 h-5',
  'large':  'w-6 h-6',
} as const;

export const getAppleTextClass = (
  size: keyof typeof appleTextSizes,
  weight?: 'light' | 'regular' | 'medium' | 'semibold',
) => {
  const sizeClass = appleTextSizes[size];
  const weightClass = weight ? `font-${weight === 'regular' ? 'normal' : weight}` : '';
  return `${sizeClass} ${weightClass}`.trim();
};

export const appleVariants = {
  card: {
    base:        'rounded-xl border border-border bg-card text-card-foreground shadow-card transition-all',
    interactive: 'rounded-xl border border-border bg-card text-card-foreground shadow-card transition-all hover:shadow-elegant hover:-translate-y-0.5 cursor-pointer',
    flat:        'rounded-xl border border-border/60 bg-card/60 p-4',
  },
  button: {
    primary:   'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors rounded-lg',
    ghost:     'bg-transparent hover:bg-muted/50 transition-colors rounded-lg',
  },
} as const;
