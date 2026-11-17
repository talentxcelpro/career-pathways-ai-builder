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
      className={`job-description-content max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300
        [&_p]:mb-3 [&_p]:leading-relaxed
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4 [&_ul]:marker:text-blue-500
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mb-4 [&_ol]:marker:text-blue-500
        [&_li]:leading-relaxed
        [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-slate-100
        [&_b]:font-bold [&_b]:text-slate-900 dark:[&_b]:text-slate-100
        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-slate-900 dark:[&_h1]:text-slate-100
        [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:text-slate-900 dark:[&_h2]:text-slate-100
        [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-slate-900 dark:[&_h3]:text-slate-100
        [&_h4]:text-sm [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:text-slate-900 dark:[&_h4]:text-slate-100
        [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline
        [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
        [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted/40 [&_th]:font-bold
        [&_td]:border [&_td]:border-border [&_td]:p-2
        ${className}`}
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
};

export default JobDescriptionRenderer;
