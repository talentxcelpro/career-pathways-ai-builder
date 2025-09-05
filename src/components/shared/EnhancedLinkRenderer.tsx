import React from 'react';
import { linkifyText } from '@/utils/textUtils';

interface EnhancedLinkRendererProps {
  text: string;
  className?: string;
  maxLength?: number;
  showPreview?: boolean;
}

export const EnhancedLinkRenderer: React.FC<EnhancedLinkRendererProps> = ({
  text,
  className = '',
  maxLength,
  showPreview = false
}) => {
  if (!text) return null;

  const displayText = maxLength && text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text;

  const linkedContent = linkifyText(displayText);

  return (
    <div className={className}>
      {linkedContent.map((part, index) => (
        <React.Fragment key={index}>{part}</React.Fragment>
      ))}
    </div>
  );
};

export default EnhancedLinkRenderer;