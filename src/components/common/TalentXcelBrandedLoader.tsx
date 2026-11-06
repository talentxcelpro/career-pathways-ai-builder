import React from 'react';

interface TalentXcelBrandedLoaderProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

/**
 * Official TalentXcel Branded Loader
 * Uses original brand logo asset with smooth pulsing ring and premium typography.
 * Follows the 3-state loading hierarchy: used for initial page loads and Suspense.
 */
export const TalentXcelBrandedLoader: React.FC<TalentXcelBrandedLoaderProps> = ({
  fullScreen = true,
  message = 'Loading your experience...',
  className = '',
}) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-300'
    : 'w-full py-16 flex flex-col items-center justify-center bg-transparent';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${containerClass} ${className}`}
    >
      <div className="flex flex-col items-center justify-center space-y-4 px-4 text-center">
        {/* Logo Container with Subtle Blue Ambient Glow Ring */}
        <div className="relative flex items-center justify-center">
          {/* Subtle pulsating blue aura */}
          <div
            className="absolute -inset-2.5 rounded-full bg-blue-500/15 blur-md animate-pulse pointer-events-none"
            aria-hidden="true"
          />

          {/* Clean branded logo */}
          <div className="relative px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <img
              src="/talentxcel-brand-logo.png"
              alt="TalentXcel"
              className="h-10 w-auto object-contain select-none"
              loading="eager"
            />
          </div>
        </div>

        {/* Subtle Indicator & Text */}
        <div className="flex items-center gap-2.5 pt-1">
          <div
            className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-sky-600 dark:border-t-sky-400 animate-spin"
            aria-hidden="true"
          />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-tight">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TalentXcelBrandedLoader;
