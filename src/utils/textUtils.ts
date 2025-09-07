import React from 'react';
import { Link } from 'react-router-dom';
import VideoThumbnail from '@/components/media/VideoThumbnail';

// Helper function to detect video URLs
const isVideoUrl = (url: string): boolean => {
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    /\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?|#|$)/i.test(url) ||
    url.includes('post-media') // Supabase storage videos
  );
};

// Enhanced utility function to detect and convert URLs, mentions, and hashtags to clickable links with video thumbnails
export const linkifyText = (text: string): React.ReactNode[] => {
  if (!text) return [text];

  // Enhanced URL regex that captures more URL patterns
  const urlRegex = /(https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?)/gi;
  
  // @mention regex that matches @username patterns (supports usernames with underscores, dots, hyphens)
  const mentionRegex = /@([a-zA-Z0-9_.-]{2,30})/gi;
  
  // Hashtag regex for career-relevant hashtags
  const hashtagRegex = /#([a-zA-Z0-9_]{2,30})/gi;
  
  // Phone number regex (various formats)
  const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/gi;
  
  // Email regex
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  // Combined regex to find all URLs, mentions, hashtags, phones, and emails
  const combinedRegex = /(https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?)|(@[a-zA-Z0-9_.-]{2,30})|(#[a-zA-Z0-9_]{2,30})|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  
  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    const matchedText = match[0];
    
    if (matchedText.startsWith('http')) {
      // Check if it's a video URL
      if (isVideoUrl(matchedText)) {
        // Create video thumbnail component
        parts.push(
          React.createElement('div', {
            key: `video-${match.index}`,
            className: 'my-3 max-w-md'
          }, 
            React.createElement(VideoThumbnail, {
              url: matchedText,
              className: 'w-full'
            })
          )
        );
      } else {
        // Regular URL link
        parts.push(
          React.createElement('a', {
            key: `url-${match.index}`,
            href: matchedText,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'text-blue-600 hover:text-blue-800 underline font-medium transition-colors hover:bg-blue-50 px-1 py-0.5 rounded-sm',
            title: `Open ${matchedText}`
          }, matchedText)
        );
      }
    } else if (matchedText.startsWith('@')) {
      // It's a mention
      const username = matchedText.slice(1); // Remove the @ symbol
      parts.push(
        React.createElement(Link, {
          key: `mention-${match.index}`,
          to: `/profile/${username}`,
          className: 'text-blue-600 hover:text-blue-800 font-semibold transition-colors bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200',
          title: `View @${username}'s profile`
        }, matchedText)
      );
    } else if (matchedText.startsWith('#')) {
      // It's a hashtag
      const hashtag = matchedText.slice(1); // Remove the # symbol
      parts.push(
        React.createElement(Link, {
          key: `hashtag-${match.index}`,
          to: `/search?tag=${encodeURIComponent(hashtag)}`,
          className: 'text-blue-600 hover:text-blue-800 font-medium transition-colors bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded',
          title: `Search for #${hashtag}`
        }, matchedText)
      );
    } else if (matchedText.includes('@') && matchedText.includes('.')) {
      // It's an email
      parts.push(
        React.createElement('a', {
          key: `email-${match.index}`,
          href: `mailto:${matchedText}`,
          className: 'text-blue-600 hover:text-blue-800 underline font-medium transition-colors hover:bg-blue-50 px-1 py-0.5 rounded-sm',
          title: `Send email to ${matchedText}`
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
  const urlRegex = /(https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?)/gi;
  return urlRegex.test(text);
};

// Helper function to detect if text contains mentions
export const containsMentions = (text: string): boolean => {
  const mentionRegex = /@([a-zA-Z0-9_.-]{2,30})/gi;
  return mentionRegex.test(text);
};

// Helper function to detect if text contains hashtags
export const containsHashtags = (text: string): boolean => {
  const hashtagRegex = /#([a-zA-Z0-9_]{2,30})/gi;
  return hashtagRegex.test(text);
};

// Helper function to extract mentions from text
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@([a-zA-Z0-9_.-]{2,30})/gi;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // Get the username without @
  }
  
  return mentions;
};

// Helper function to extract hashtags from text
export const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#([a-zA-Z0-9_]{2,30})/gi;
  const hashtags: string[] = [];
  let match;
  
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1]); // Get the hashtag without #
  }
  
  return hashtags;
};

// Helper function to extract URLs from text
export const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?)/gi;
  return text.match(urlRegex) || [];
};

// Helper function to extract emails from text
export const extractEmails = (text: string): string[] => {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  return text.match(emailRegex) || [];
};

// Helper function to clean text from all linkable content for plain text display
export const stripLinkableContent = (text: string): string => {
  return text
    .replace(/(https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?)/gi, '[LINK]')
    .replace(/@([a-zA-Z0-9_.-]{2,30})/gi, '[MENTION]')
    .replace(/#([a-zA-Z0-9_]{2,30})/gi, '[HASHTAG]')
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi, '[EMAIL]');
};

// Helper function to get smart preview text with link indicators
export const getPreviewText = (text: string, maxLength: number = 100): string => {
  const urls = extractUrls(text);
  const mentions = extractMentions(text);
  const hashtags = extractHashtags(text);
  
  let preview = text.substring(0, maxLength);
  if (text.length > maxLength) {
    preview += '...';
  }
  
  // Add indicators
  const indicators = [];
  if (urls.length > 0) indicators.push(`🔗 ${urls.length} link${urls.length > 1 ? 's' : ''}`);
  if (mentions.length > 0) indicators.push(`@${mentions.length} mention${mentions.length > 1 ? 's' : ''}`);
  if (hashtags.length > 0) indicators.push(`#${hashtags.length} tag${hashtags.length > 1 ? 's' : ''}`);
  
  if (indicators.length > 0) {
    preview += ` (${indicators.join(', ')})`;
  }
  
  return preview;
};