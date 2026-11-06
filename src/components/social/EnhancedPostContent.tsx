import React from 'react';
import { UniversalPostContent } from '@/components/network/UniversalPostContent';

// Master Post Content Component with Safe Linkification, Markdown Bold & URL Previews
const EnhancedPostContent: React.FC<{
  content: string;
  className?: string;
}> = ({ content, className }) => {
  return <UniversalPostContent content={content} className={className} />;
};

export { EnhancedPostContent };
export default EnhancedPostContent;
