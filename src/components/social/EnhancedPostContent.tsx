import React from 'react';
import { RichUrlPreview, useUrlDetection } from './RichUrlPreview';

// Enhanced Post Content Component with URL Detection
const EnhancedPostContent: React.FC<{
  content: string;
  className?: string;
}> = ({ content, className }) => {
  const { urls, textWithoutUrls } = useUrlDetection(content);

  return (
    <div className={`space-y-3 ${className}`}>
      {textWithoutUrls && (
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {textWithoutUrls}
        </p>
      )}
      
      {urls.map((url, index) => (
        <RichUrlPreview key={index} url={url} compact />
      ))}
    </div>
  );
};

export { EnhancedPostContent };