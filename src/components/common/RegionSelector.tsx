import React from 'react';

interface RegionSelectorProps {
  variant?: 'compact' | 'footer' | 'nav';
  className?: string;
}

/**
 * RegionSelector - Headless / Background Operation Only
 * Region detection runs automatically in the background via RegionContext (CF-IPCountry / Timezone / Locale).
 * Hidden from the UI per user instruction.
 */
export const RegionSelector: React.FC<RegionSelectorProps> = () => {
  return null;
};

export default RegionSelector;
