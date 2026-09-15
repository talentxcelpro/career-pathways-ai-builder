import React from 'react';
import { SEOHead } from './SEOHead';

export interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}

/**
 * MetaTags component — delegates directly to unified canonical SEOHead component.
 * Removes redundant react-helmet-async head elements and legacy branding.
 */
export const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
}) => {
  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      image={image}
      url={url}
      type={type}
      noindex={noIndex}
    />
  );
};

export default MetaTags;