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
        const target = e.target as HTMLImageElement;
        // First fallback: try original URL
        if (target.src === customSrc && customSrc !== src) {
          console.log('Custom domain failed, trying original URL:', src);
          target.src = src;
        } 
        // Second fallback: use placeholder
        else if (target.src === src) {
          console.log('Original URL failed, using placeholder');
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTZiMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
        }
        
        // Call original onError if provided
        if (props.onError) {
          props.onError(e);
        }
      }}
    />
  );
};