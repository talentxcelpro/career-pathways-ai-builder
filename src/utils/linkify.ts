import React from 'react';

export const linkifyText = (text: string): React.ReactNode => {
  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  // @username pattern
  const mentionPattern = /@(\w+)/g;
  
  let result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  // Find all URLs and mentions
  const combinedPattern = /(https?:\/\/[^\s]+)|(@\w+)/g;
  
  while ((match = combinedPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    
    const matchedText = match[0];
    
    if (matchedText.startsWith('http')) {
      // It's a URL
      result.push(
        React.createElement(
          'a',
          {
            key: match.index,
            href: matchedText,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'text-blue-600 hover:underline'
          },
          matchedText
        )
      );
    } else if (matchedText.startsWith('@')) {
      // It's a mention
      const username = matchedText.slice(1);
      result.push(
        React.createElement(
          'span',
          {
            key: match.index,
            className: 'text-blue-600 font-semibold cursor-pointer hover:underline',
            onClick: () => {
              // Navigate to user profile
              window.location.href = `/profile/${username}`;
            }
          },
          matchedText
        )
      );
    }
    
    lastIndex = match.index + matchedText.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  
  return result.length === 0 ? text : result;
};