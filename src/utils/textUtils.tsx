import React from 'react';

export const linkifyText = (text: string): React.ReactNode => {
  // Simple implementation for hashtags and mentions
  const parts = text.split(/(#\w+|@\w+)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span key={index} className="text-blue-500 font-medium">
          {part}
        </span>
      );
    } else if (part.startsWith('@')) {
      return (
        <span key={index} className="text-purple-500 font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
};

export const extractHashtags = (text: string): string[] => {
  const hashtags = text.match(/#\w+/g) || [];
  return hashtags.map(tag => tag.slice(1)); // Remove the # symbol
};

export const extractMentions = (text: string): string[] => {
  const mentions = text.match(/@\w+/g) || [];
  return mentions.map(mention => mention.slice(1)); // Remove the @ symbol
};