// src/components/jobs/JobDescriptionRenderer.tsx
// Centralized Human-First Job Description Renderer for TalentXcel
// Converts raw markdown into beautiful, recruiter-written, semantic HTML with zero AI artifacts.

import React, { useMemo } from 'react';
import { sanitizeAndFormatJobDescription } from '@/services/jobs/jobDescriptionSanitizer';

export interface JobDescriptionRendererProps {
  content?: string | null;
  className?: string;
  fallbackText?: string;
  theme?: 'dark' | 'light' | 'auto';
  maxHeight?: string;
}

export const JobDescriptionRenderer: React.FC<JobDescriptionRendererProps> = ({
  content,
  className = '',
  fallbackText = 'Detailed responsibilities and requirements are provided by the hiring organization upon application.',
  theme = 'auto',
  maxHeight
}) => {
  const formattedHtml = useMemo(() => {
    if (!content || !content.trim()) {
      return `<p class="leading-relaxed text-inherit">${fallbackText}</p>`;
    }
    return sanitizeAndFormatJobDescription(content, { theme });
  }, [content, fallbackText, theme]);

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed ${className}`}
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
};

export default JobDescriptionRenderer;
