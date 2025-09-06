import React from 'react';
import { getCustomStorageUrl } from '@/utils/storage';

interface CustomImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/**
 * Image component that automatically converts Supabase storage URLs to custom domain URLs
 */
export const CustomImage: React.FC<CustomImageProps> = ({ src, alt, ...props }) => {
  const customSrc = getCustomStorageUrl(src);
  
  return (
    <img 
      {...props}
      src={customSrc}
      alt={alt}
      onError={(e) => {
        // Fallback to original URL if custom domain fails
        const target = e.target as HTMLImageElement;
        if (target.src === customSrc && customSrc !== src) {
          target.src = src;
        }
        
        // Call original onError if provided
        if (props.onError) {
          props.onError(e);
        }
      }}
    />
  );
};