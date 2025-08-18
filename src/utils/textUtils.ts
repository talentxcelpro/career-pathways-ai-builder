import React from 'react';
import { Link } from 'react-router-dom';

// Utility function to detect and convert URLs to clickable links
export const linkifyText = (text: string): React.ReactNode[] => {
  if (!text) return [text];

  // URL regex that matches http(s):// URLs
  const urlRegex = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?'])/gi;
  
  // @mention regex that matches @username patterns
  const mentionRegex = /@([a-zA-Z0-9_.-]+)/gi;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  // Combined regex to find all URLs and mentions
  const combinedRegex = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?'])|(@[a-zA-Z0-9_.-]+)/gi;
  
  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    const matchedText = match[0];
    
    if (matchedText.startsWith('http')) {
      // It's a URL
      parts.push(
        React.createElement('a', {
          key: `url-${match.index}`,
          href: matchedText,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'text-primary hover:text-primary/80 underline font-medium transition-colors'
        }, matchedText)
      );
    } else if (matchedText.startsWith('@')) {
      // It's a mention
      const username = matchedText.slice(1); // Remove the @ symbol
      parts.push(
        React.createElement(Link, {
          key: `mention-${match.index}`,
          to: `/network/people/${username}`,
          className: 'text-primary hover:text-primary/80 font-semibold transition-colors bg-primary/10 px-1 rounded'
        }, matchedText)
      );
    }
    
    lastIndex = match.index + matchedText.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
};

// Helper function to detect if text contains URLs
export const containsUrls = (text: string): boolean => {
  const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
  return urlRegex.test(text);
};

// Helper function to detect if text contains mentions
export const containsMentions = (text: string): boolean => {
  const mentionRegex = /@([a-zA-Z0-9_.-]+)/gi;
  return mentionRegex.test(text);
};

// Helper function to extract mentions from text
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@([a-zA-Z0-9_.-]+)/gi;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // Get the username without @
  }
  
  return mentions;
};

// Helper function to extract URLs from text
export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?'])/gi;
  return text.match(urlRegex) || [];
};