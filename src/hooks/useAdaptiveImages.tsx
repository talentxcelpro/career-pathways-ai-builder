/**
 * Adaptive Image Quality
 * Adjusts image quality based on connection speed and device capabilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNetworkOptimization } from './useBatteryOptimization';

interface ImageQualityConfig {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  format: 'webp' | 'jpeg' | 'avif';
  lazy: boolean;
  blur: boolean;
}

const QUALITY_CONFIGS: Record<string, ImageQualityConfig> = {
  ultra: {
    quality: 'ultra',
    format: 'avif',
    lazy: false,
    blur: false,
  },
  high: {
    quality: 'high',
    format: 'webp',
    lazy: true,
    blur: false,
  },
  medium: {
    quality: 'medium',
    format: 'webp',
    lazy: true,
    blur: true,
  },
  low: {
    quality: 'low',
    format: 'jpeg',
    lazy: true,
    blur: true,
  },
};

export function useAdaptiveImages() {
  const { connectionType, saveData } = useNetworkOptimization();
  const [config, setConfig] = useState<ImageQualityConfig>(QUALITY_CONFIGS.high);

  useEffect(() => {
    // Determine quality based on connection and preferences
    if (saveData || connectionType === 'slow') {
      setConfig(QUALITY_CONFIGS.low);
    } else if (connectionType === 'fast') {
      setConfig(QUALITY_CONFIGS.high);
    } else {
      setConfig(QUALITY_CONFIGS.medium);
    }
  }, [connectionType, saveData]);

  const getOptimizedImageUrl = useCallback(
    (url: string, width?: number, height?: number): string => {
      if (!url) return '';

      // For external URLs, return as-is
      if (url.startsWith('http') && !url.includes('supabase')) {
        return url;
      }

      // Build optimized URL with transformations
      const params = new URLSearchParams();

      // Quality adjustment
      const qualityMap = {
        low: '50',
        medium: '70',
        high: '85',
        ultra: '95',
      };
      params.set('quality', qualityMap[config.quality]);

      // Format preference
      if (config.format === 'avif' && supportsAvif()) {
        params.set('format', 'avif');
      } else if (config.format === 'webp' && supportsWebP()) {
        params.set('format', 'webp');
      }

      // Resize if dimensions provided
      if (width) params.set('width', width.toString());
      if (height) params.set('height', height.toString());

      // Auto optimization
      params.set('auto', 'compress');

      return `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
    },
    [config]
  );

  const getImageProps = useCallback(
    (src: string, alt: string, width?: number, height?: number) => {
      const optimizedSrc = getOptimizedImageUrl(src, width, height);

      return {
        src: optimizedSrc,
        alt,
        loading: config.lazy ? ('lazy' as const) : ('eager' as const),
        decoding: 'async' as const,
        style: config.blur
          ? {
              backgroundImage: `url(${getBlurDataUrl(src)})`,
              backgroundSize: 'cover',
            }
          : undefined,
      };
    },
    [config, getOptimizedImageUrl]
  );

  return {
    config,
    getOptimizedImageUrl,
    getImageProps,
  };
}

// Helper functions
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

function supportsAvif(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  try {
    return canvas.toDataURL('image/avif').startsWith('data:image/avif');
  } catch {
    return false;
  }
}

function getBlurDataUrl(url: string): string {
  // Create a tiny blurred placeholder
  // In production, this would be generated on the backend
  const encodedUrl = encodeURIComponent(url);
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='none' style='filter: url(%23b);' href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='/%3E%3C/svg%3E`;
}

// Optimized Image Component
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function OptimizedImage({ src, alt, width, height, ...props }: OptimizedImageProps) {
  const { getImageProps } = useAdaptiveImages();
  const imageProps = getImageProps(src, alt, width, height);

  return <img {...imageProps} {...props} />;
}
