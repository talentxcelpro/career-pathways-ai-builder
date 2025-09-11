import React from 'react';
import { ContentEmbed } from '@/components/embeds';

interface LinkPreviewProps {
  url: string;
  className?: string;
  compact?: boolean;
}

// Delegates to the unified ContentEmbed so all links (social, videos, articles)
// render with native embeds or rich previews consistently across the app.
const LinkPreview: React.FC<LinkPreviewProps> = ({ url, className = '' }) => {
  return <ContentEmbed url={url} className={className} />;
};

export default LinkPreview;