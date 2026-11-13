// src/services/jobs/jobDescriptionSanitizer.ts
// TalentXcel Human-First Job Description Sanitizer & Semantic Normalizer
// Eliminates raw AI Markdown artifacts (##, **, etc.) and normalizes job descriptions
// into clean, recruiter-grade, semantic HTML with standard professional sections.

import DOMPurify from 'dompurify';

export interface SanitizedJobDescriptionOptions {
  theme?: 'dark' | 'light' | 'auto';
  preserveFullContent?: boolean;
}

/**
 * Standard recruiter heading normalizer
 */
const SECTION_NORMALIZATIONS: Array<{ regex: RegExp; standardTitle: string }> = [
  { regex: /^(about\s+(the\s+)?(role|position|job)|role\s+overview|job\s+summary|position\s+overview):?$/i, standardTitle: 'About the Role' },
  { regex: /^(what\s+you('ll|\s+will)\s+be?\s+doing|key\s+responsibilities|responsibilities|day\s+to\s+day|core\s+duties):?$/i, standardTitle: "What You'll Be Doing" },
  { regex: /^(what\s+we('re|\s+are)\s+looking\s+for|requirements|qualifications|candidate\s+profile|who\s+you\s+are|what\s+you\s+bring):?$/i, standardTitle: "What We're Looking For" },
  { regex: /^(salary(\s+(&|and)\s+benefits)?|compensation(\s+(&|and)\s+perks)?|perks\s+(&|and)\s+benefits|benefits):?$/i, standardTitle: 'Salary & Benefits' },
  { regex: /^(apply\s+for\s+this\s+position|verified\s+application(\s+method)?|how\s+to\s+apply|application\s+process|next\s+steps):?$/i, standardTitle: 'Apply for This Position' },
  { regex: /^(about\s+(us|the\s+company|our\s+team)|company\s+overview):?$/i, standardTitle: 'About the Company' },
];

/**
 * Standard TalentXcel Application Description
 */
export const TALENTXCEL_APPLICATION_NOTICE = 
  "Interested in this opportunity? Submit your application through TalentXcel. Upload your latest CV and share your details. Your application will be securely recorded and made available to the hiring team.";

/**
 * Parse and convert Markdown / plain text job description into clean semantic HTML
 */
export function sanitizeAndFormatJobDescription(rawContent: string, options: SanitizedJobDescriptionOptions = {}): string {
  if (!rawContent || typeof rawContent !== 'string') {
    return '';
  }

  const { theme = 'auto' } = options;

  // 1. Pre-process: Clean code fences, escaped markdown, external application redirects
  let text = rawContent
    .replace(/\r\n/g, '\n')
    .replace(/```[a-z]*\n?/gi, '') // remove code fences
    .replace(/\\(\*|_|#|\[|\]|-)/g, '$1') // unescape markdown
    // Eliminate external application instructions (Part 1.1)
    .replace(/Applications are processed directly through the official hiring portal[^.\n]*\.[^\n]*/gi, TALENTXCEL_APPLICATION_NOTICE)
    .replace(/Click\s*['"]?Apply on Employer Site['"]?\s*to submit your verified profile[^.\n]*/gi, TALENTXCEL_APPLICATION_NOTICE)
    .replace(/Submit your verified profile on the employer website[^.\n]*/gi, TALENTXCEL_APPLICATION_NOTICE)
    .replace(/Apply on Employer Site/gi, 'Apply on TalentXcel')
    .trim();

  // 2. Split into structural blocks (paragraphs, headings, lists)
  const lines = text.split('\n');
  const blocks: string[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const pText = currentParagraphLines.join(' ').trim();
      if (pText) {
        // Format inline bold/italic
        const formatted = formatInlineStyles(pText);
        blocks.push(`<p class="leading-relaxed mb-3.5 text-inherit">${formatted}</p>`);
      }
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      const tag = currentList.type;
      const listClass = tag === 'ul' 
        ? 'list-disc pl-5 space-y-1.5 mb-4 text-inherit marker:text-blue-500' 
        : 'list-decimal pl-5 space-y-1.5 mb-4 text-inherit marker:text-blue-500';
      
      const itemsHtml = currentList.items
        .map(item => `<li class="leading-relaxed">${formatInlineStyles(item)}</li>`)
        .join('');
      blocks.push(`<${tag} class="${listClass}">${itemsHtml}</${tag}>`);
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Blank line -> boundary between elements
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Check for Heading (#, ##, ###, or bold standalone heading like **About the Role**)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    const boldHeadingMatch = trimmed.match(/^\*{2}([^*]+)\*{2}:?$/);
    const plainHeadingCandidate = !trimmed.includes('.') && trimmed.length < 50 && (
      SECTION_NORMALIZATIONS.some(s => s.regex.test(trimmed))
    );

    if (headingMatch || boldHeadingMatch || plainHeadingCandidate) {
      flushParagraph();
      flushList();

      let headingText = headingMatch 
        ? headingMatch[2].trim()
        : boldHeadingMatch 
          ? boldHeadingMatch[1].trim()
          : trimmed;

      // Check if matches standard recruiter section
      let normalizedTitle = headingText;
      for (const section of SECTION_NORMALIZATIONS) {
        if (section.regex.test(headingText.replace(/^[:\s-]+|[:\s-]+$/g, ''))) {
          normalizedTitle = section.standardTitle;
          break;
        }
      }

      // Render semantic H3 heading
      const headingClass = "text-base sm:text-lg font-bold text-inherit tracking-tight mt-6 mb-2.5 pb-1 border-b border-border/20 flex items-center gap-2";
      blocks.push(`<h3 class="${headingClass}"><span>${escapeHtml(normalizedTitle)}</span></h3>`);
      continue;
    }

    // Check for bullet list item (*, -, +, •)
    const bulletMatch = trimmed.match(/^([*\-+•]|\d+\.)\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      const marker = bulletMatch[1];
      const itemContent = bulletMatch[2].trim();
      const isOrdered = /^\d+\./.test(marker);
      const listType = isOrdered ? 'ol' : 'ul';

      if (!currentList || currentList.type !== listType) {
        flushList();
        currentList = { type: listType, items: [] };
      }
      currentList.items.push(itemContent);
      continue;
    }

    // Otherwise, standard paragraph text line
    if (currentList) {
      flushList();
    }
    currentParagraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  const fullHtml = blocks.join('\n');

  // 3. Sanitize with DOMPurify to guarantee zero XSS vulnerability
  const cleanHtml = DOMPurify.sanitize(fullHtml, {
    ALLOWED_TAGS: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'span', 'br', 'a'],
    ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
  });

  return cleanHtml;
}

/**
 * Format inline bold **text**, __text__, italic *text*, _text_
 */
function formatInlineStyles(input: string): string {
  let str = escapeHtml(input);

  // Bold: **text** or __text__
  str = str.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-inherit">$1</strong>');
  str = str.replace(/__(.+?)__/g, '<strong class="font-bold text-inherit">$1</strong>');

  // Italic: *text* or _text_ (when not part of a word)
  str = str.replace(/(^|[^\w])\*([^*]+?)\*([^\w]|$)/g, '$1<em class="italic">$2</em>$3');
  str = str.replace(/(^|[^\w])_([^_]+?)_([^\w]|$)/g, '$1<em class="italic">$2</em>$3');

  return str;
}

/**
 * Basic HTML escaping for safe injection before markup formation
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
