import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RichUrlPreview } from '@/components/social/RichUrlPreview';

interface UniversalPostContentProps {
  content: string;
  tags?: string[];
  showLinkPreview?: boolean;
  className?: string;
  maxInitialLength?: number;
}

// Helper to separate trailing punctuation from valid URLs
function cleanUrl(rawUrl: string): { url: string; trailing: string } {
  let url = rawUrl;
  let trailing = '';
  while (/[.,!?;:)\]>"]$/.test(url)) {
    // Only strip closing parenthesis if parentheses count is balanced
    if (url.endsWith(')')) {
      const openCount = (url.match(/\(/g) || []).length;
      const closeCount = (url.match(/\)/g) || []).length;
      if (openCount >= closeCount) break;
    }
    trailing = url.slice(-1) + trailing;
    url = url.slice(0, -1);
  }
  return { url, trailing };
}

// Check if URL is media (image/video), which should not be shown as a web preview
function isMediaFileUrl(url: string): boolean {
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.png') ||
    clean.endsWith('.gif') ||
    clean.endsWith('.webp') ||
    clean.endsWith('.svg') ||
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov')
  );
}

export const UniversalPostContent: React.FC<UniversalPostContentProps> = ({
  content,
  tags = [],
  showLinkPreview = true,
  className = '',
  maxInitialLength = 380,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract first external URL for rich preview
  const firstPreviewUrl = useMemo(() => {
    if (!content || !showLinkPreview) return null;
    const urlMatches = content.match(/https?:\/\/[^\s<>'"]+/gi);
    if (!urlMatches) return null;
    for (const raw of urlMatches) {
      const { url } = cleanUrl(raw);
      if (!isMediaFileUrl(url)) {
        return url;
      }
    }
    return null;
  }, [content, showLinkPreview]);

  if (!content) return null;

  const isLong = content.length > maxInitialLength;
  const displayContent = (isLong && !isExpanded) 
    ? content.slice(0, maxInitialLength).trim() 
    : content;

  // Split into paragraphs by double newlines or single newlines
  const paragraphs = displayContent.split(/\n\n+/);

  // Token parser for a single line of text
  const parseLineTokens = (text: string, pIndex: number, lIndex: number): React.ReactNode[] => {
    // Regex matching: **bold text**, http(s) URLs, #hashtags, @mentions
    const tokenRegex = /(\*\*[^*]+\*\*)|(https?:\/\/[^\s<>'"]+)|(#[a-zA-Z0-9_\u00C0-\u017F]+)|(@[a-zA-Z0-9_.-]{2,30})/g;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      // Add plain text before match
      if (match.index > lastIndex) {
        nodes.push(text.slice(lastIndex, match.index));
      }

      const rawToken = match[0];
      const key = `t-${pIndex}-${lIndex}-${match.index}`;

      if (rawToken.startsWith('**') && rawToken.endsWith('**')) {
        // Bold text
        const innerText = rawToken.slice(2, -2);
        // Check if bold text itself contains a URL
        const urlInBold = innerText.match(/(https?:\/\/[^\s<>'"]+)/i);
        if (urlInBold) {
          const { url, trailing } = cleanUrl(urlInBold[0]);
          const before = innerText.slice(0, urlInBold.index);
          const after = innerText.slice((urlInBold.index || 0) + urlInBold[0].length);
          nodes.push(
            <strong key={key} className="font-extrabold text-foreground">
              {before}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline break-all inline transition-colors"
              >
                {url}
              </a>
              {trailing}
              {after}
            </strong>
          );
        } else {
          nodes.push(
            <strong key={key} className="font-extrabold text-foreground tracking-tight">
              {innerText}
            </strong>
          );
        }
      } else if (rawToken.startsWith('http://') || rawToken.startsWith('https://')) {
        // Clean trailing punctuation
        const { url, trailing } = cleanUrl(rawToken);
        nodes.push(
          <React.Fragment key={key}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline break-all inline transition-colors"
              title={`Open ${url}`}
            >
              {url}
            </a>
            {trailing}
          </React.Fragment>
        );
      } else if (rawToken.startsWith('#')) {
        // Hashtag
        const tag = rawToken.slice(1);
        nodes.push(
          <Link
            key={key}
            to={`/network?tab=feed&search=${encodeURIComponent('#' + tag)}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer transition-colors"
            title={`Search #${tag}`}
          >
            {rawToken}
          </Link>
        );
      } else if (rawToken.startsWith('@')) {
        // Mention
        const username = rawToken.slice(1);
        nodes.push(
          <Link
            key={key}
            to={`/profile/${username}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded text-xs transition-colors inline-block"
            title={`View profile of @${username}`}
          >
            {rawToken}
          </Link>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    // Remaining text after last token
    if (lastIndex < text.length) {
      nodes.push(text.slice(lastIndex));
    }

    return nodes;
  };

  return (
    <div className={`space-y-2.5 sm:space-y-3 ${className}`}>
      {/* Formatted Paragraphs */}
      <div className="text-slate-800 dark:text-slate-100 text-sm sm:text-[15px] leading-relaxed break-words font-normal space-y-2 sm:space-y-2.5 select-text">
        {paragraphs.map((paragraph, pIdx) => {
          const lines = paragraph.split('\n');
          return (
            <p key={pIdx} className="leading-relaxed whitespace-pre-wrap">
              {lines.map((line, lIdx) => (
                <React.Fragment key={lIdx}>
                  {parseLineTokens(line, pIdx, lIdx)}
                  {lIdx < lines.length - 1 && <br />}
                </React.Fragment>
              ))}
              {/* Show "see more" on last paragraph when collapsed */}
              {isLong && !isExpanded && pIdx === paragraphs.length - 1 && (
                <>
                  <span className="text-muted-foreground select-none">... </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(true);
                    }}
                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                  >
                    see more
                  </button>
                </>
              )}
            </p>
          );
        })}
      </div>

      {/* "See less" option if post was expanded */}
      {isLong && isExpanded && (
        <div className="pt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="text-xs font-bold text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
          >
            see less
          </button>
        </div>
      )}

      {/* External Tags (if any provided via post.tags) */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag, idx) => (
            <Link
              key={idx}
              to={`/network?tab=feed&search=${encodeURIComponent('#' + tag.replace(/^#/, ''))}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              #{tag.replace(/^#/, '')}
            </Link>
          ))}
        </div>
      )}

      {/* Rich Link Preview Card for detected external website */}
      {firstPreviewUrl && (
        <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
          <RichUrlPreview url={firstPreviewUrl} />
        </div>
      )}
    </div>
  );
};
