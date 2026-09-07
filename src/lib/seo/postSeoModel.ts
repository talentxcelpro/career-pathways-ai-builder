// src/lib/seo/postSeoModel.ts
// Single Canonical Post SEO Data Model for TalentXcel
// Unifies React client (Helmet), build-time static prerenderer, sitemaps, and social cards.

import { BASE_PRODUCTION_ORIGIN } from './canonicalUrls.js';
import {
  buildPostSchema,
  buildVideoObjectSchema,
  buildImageObjectSchema,
  buildBreadcrumbSchema,
} from './structuredDataSchemas.js';

export interface RawPostComment {
  id?: string;
  author_id?: string;
  authorName?: string;
  created_at: string;
  content: string;
  dateCreated?: string;
  text?: string;
  dateLabel?: string;
}

export interface RawPostInput {
  id: string;
  content?: string | null;
  created_at: string;
  updated_at?: string | null;
  post_type?: string | null;
  media_urls?: string[] | null;
  featured_image_url?: string | null;
  likes_count?: number | null;
  comments_count?: number | null;
  shares_count?: number | null;
  hashtags?: string[] | null;
  author?: {
    id?: string;
    full_name?: string | null;
    username?: string | null;
    title?: string | null;
    profile_picture_url?: string | null;
  } | null;
}

export interface PostSeoData {
  canonicalUrl: string;
  legacyUrl: string;
  headline: string;
  title: string;
  description: string;
  cleanContent: string;
  authorName: string;
  authorTitle: string;
  authorUsername: string;
  authorProfileUrl: string;
  publishedAt: string;
  formattedDate: string;
  videoUrl: string | null;
  imageUrl: string;
  imageAttachments: string[];
  altText: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hashtags: string[];
  publicComments: Array<{
    authorName: string;
    dateCreated: string;
    text: string;
    dateLabel: string;
  }>;
  jsonLdSchemas: object[];
  openGraph: {
    title: string;
    description: string;
    type: string;
    url: string;
    image: string;
    video?: string;
    videoType?: string;
    videoWidth?: string;
    videoHeight?: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
    player?: string;
    playerWidth?: string;
    playerHeight?: string;
  };
}

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'];

export function isVideoAttachment(url: string): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

export function isImageAttachment(url: string): boolean {
  return !isVideoAttachment(url);
}

export function derivePostAltText(content: string, authorName: string): string {
  const firstSentence = (content || '')
    .trim()
    .split(/[.!?\n]/)[0]
    ?.trim()
    ?.slice(0, 90) || '';
  if (firstSentence.length > 8) {
    return `${firstSentence} — shared by ${authorName} on TalentXcel`;
  }
  return `Career insight shared by ${authorName} on TalentXcel Network`;
}

/**
 * Maps a hashtag string to its canonical taxonomy hub or topic path.
 * Ensures we don't produce thousands of thin topic routes.
 */
export function resolveHashtagDestination(tag: string): {
  href: string;
  label: string;
  isPrimaryHub: boolean;
} {
  const clean = tag.replace(/^#/, '').trim().toLowerCase();
  
  if (['jobs', 'job', 'hiring', 'openings', 'recruitment', 'vacancy', 'apply'].includes(clean)) {
    return { href: '/network/jobs', label: 'Jobs', isPrimaryHub: true };
  }
  if (['careers', 'career', 'promotion', 'growth', 'fresher', 'careerpath'].includes(clean)) {
    return { href: '/network/careers', label: 'Careers', isPrimaryHub: true };
  }
  if (['tech', 'technology', 'software', 'coding', 'developer', 'engineering'].includes(clean)) {
    return { href: '/network/technology', label: 'Technology', isPrimaryHub: true };
  }
  if (['ai', 'ml', 'genai', 'machinelearning', 'artificialintelligence', 'llm', 'gpt'].includes(clean)) {
    return { href: '/network/ai', label: 'AI', isPrimaryHub: true };
  }
  if (['hr', 'humanresources', 'workforce', 'payroll', 'onboarding'].includes(clean)) {
    return { href: '/network/hr', label: 'HR', isPrimaryHub: true };
  }
  if (['leadership', 'management', 'leadershipskills', 'ceo', 'cxo', 'strategy'].includes(clean)) {
    return { href: '/network/leadership', label: 'Leadership', isPrimaryHub: true };
  }

  return { href: `/network?tag=${encodeURIComponent(clean)}`, label: `#${clean}`, isPrimaryHub: false };
}

/**
 * Builds the authoritative Canonical Post SEO Data Model for a given post.
 */
export function buildPostSeoData(
  post: RawPostInput,
  rawComments: RawPostComment[] = []
): PostSeoData {
  const canonicalUrl = `${BASE_PRODUCTION_ORIGIN}/post/${post.id}`;
  const legacyUrl = `${BASE_PRODUCTION_ORIGIN}/network/posts/${post.id}`;
  const authorName = post.author?.full_name || 'TalentXcel Services';
  const authorTitle = post.author?.title || 'Verified Professional';
  const authorUsername = post.author?.username || post.author?.id || 'member';
  const authorProfileUrl = `${BASE_PRODUCTION_ORIGIN}/@${authorUsername}`;

  const cleanContent = (post.content || '').trim();
  const headline =
    cleanContent.split(/[.!?\n]/)[0]?.slice(0, 80).trim() ||
    'Career & Hiring Insight';
  const description = cleanContent.slice(0, 160).replace(/\n/g, ' ') || headline;
  const title = `${headline} | ${authorName} on TalentXcel`;

  const dateObj = new Date(post.created_at);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const mediaUrls: string[] = Array.isArray(post.media_urls) ? post.media_urls : [];

  const videoUrl =
    mediaUrls.find(isVideoAttachment) ||
    (post.post_type === 'video' && mediaUrls[0] ? mediaUrls[0] : null);

  const imageAttachments = mediaUrls.filter(isImageAttachment);
  const imageUrl =
    imageAttachments[0] ||
    post.featured_image_url ||
    post.author?.profile_picture_url ||
    `${BASE_PRODUCTION_ORIGIN}/talentxcel-official-logo.png`;

  const altText = derivePostAltText(cleanContent, authorName);

  const likesCount = Math.max(0, post.likes_count || 0);
  const commentsCount = Math.max(0, post.comments_count || 0);
  const sharesCount = Math.max(0, post.shares_count || 0);

  const hashtags: string[] = Array.isArray(post.hashtags)
    ? post.hashtags.map((h) => h.trim())
    : [];

  const publicComments = rawComments
    .filter((c) => (c.content || c.text || '').trim().length > 1)
    .slice(0, 5)
    .map((c) => {
      const text = (c.content || c.text || '').trim();
      const dateCreated = c.created_at || c.dateCreated || post.created_at;
      const dateLabel =
        c.dateLabel ||
        new Date(dateCreated).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      return {
        authorName: c.authorName || 'TalentXcel Member',
        dateCreated,
        text,
        dateLabel,
      };
    });

  const postSchema = buildPostSchema({
    headline,
    content: cleanContent,
    datePublished: post.created_at,
    authorName,
    authorUrl: authorProfileUrl,
    postUrl: canonicalUrl,
    mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    likesCount,
    commentsCount,
    sharesCount,
    publicComments,
  });

  const breadcrumbsSchema = buildBreadcrumbSchema([
    { name: 'Home', url: BASE_PRODUCTION_ORIGIN },
    { name: 'Network', url: `${BASE_PRODUCTION_ORIGIN}/network` },
    { name: headline, url: canonicalUrl },
  ]);

  const jsonLdSchemas: object[] = [postSchema, breadcrumbsSchema];

  if (imageAttachments.length > 0) {
    imageAttachments.forEach((img) => {
      jsonLdSchemas.push(
        buildImageObjectSchema({
          url: img,
          caption: altText,
        })
      );
    });
  }

  if (videoUrl) {
    jsonLdSchemas.push(
      buildVideoObjectSchema({
        name: headline,
        description: cleanContent.slice(0, 300) || headline,
        thumbnailUrl: imageUrl,
        uploadDate: post.created_at,
        contentUrl: videoUrl,
        embedUrl: canonicalUrl,
      })
    );
  }

  const openGraph: PostSeoData['openGraph'] = {
    title,
    description,
    type: videoUrl ? 'video.other' : 'article',
    url: canonicalUrl,
    image: imageUrl,
    ...(videoUrl
      ? {
          video: videoUrl,
          videoType: 'video/mp4',
          videoWidth: '1280',
          videoHeight: '720',
        }
      : {}),
  };

  const twitter: PostSeoData['twitter'] = {
    card: videoUrl ? 'player' : 'summary_large_image',
    title,
    description,
    image: imageUrl,
    ...(videoUrl
      ? {
          player: canonicalUrl,
          playerWidth: '1280',
          playerHeight: '720',
        }
      : {}),
  };

  return {
    canonicalUrl,
    legacyUrl,
    headline,
    title,
    description,
    cleanContent,
    authorName,
    authorTitle,
    authorUsername,
    authorProfileUrl,
    publishedAt: post.created_at,
    formattedDate,
    videoUrl,
    imageUrl,
    imageAttachments,
    altText,
    likesCount,
    commentsCount,
    sharesCount,
    hashtags,
    publicComments,
    jsonLdSchemas,
    openGraph,
    twitter,
  };
}
