// src/lib/social-marketing/contentFormatLibrary.ts
// Content Format Library for TalentXcel AI Content Factory
// 5 major categories spanning 20+ distinct deliverables with exact constraints and platform targets.

import type { ContentCategory, ContentFormatType, SocialPlatform } from './types';

export interface FormatSpecification {
  format_type: ContentFormatType;
  category: ContentCategory;
  name: string;
  description: string;
  supported_platforms: SocialPlatform[];
  aspect_ratio: '9:16' | '16:9' | '1:1' | '4:5';
  max_characters?: number;
  duration_range_sec?: { min: number; max: number };
  slide_count_range?: { min: number; max: number };
  requires_voice: boolean;
  requires_video_render: boolean;
  requires_visual_assets: boolean;
}

export const CONTENT_FORMAT_LIBRARY: Record<ContentFormatType, FormatSpecification> = {
  YOUTUBE_SHORT: {
    format_type: 'YOUTUBE_SHORT',
    category: 'VIDEO',
    name: 'YouTube Short',
    description: 'Vertical 9:16 fast-paced video under 60 seconds with on-screen kinetic captions.',
    supported_platforms: ['YOUTUBE'],
    aspect_ratio: '9:16',
    duration_range_sec: { min: 30, max: 60 },
    requires_voice: true,
    requires_video_render: true,
    requires_visual_assets: true,
  },
  YOUTUBE_VIDEO: {
    format_type: 'YOUTUBE_VIDEO',
    category: 'VIDEO',
    name: 'YouTube Long-Form Video',
    description: 'Horizontal 16:9 comprehensive breakdown with chapters, slides, and deep analysis.',
    supported_platforms: ['YOUTUBE'],
    aspect_ratio: '16:9',
    duration_range_sec: { min: 300, max: 900 },
    requires_voice: true,
    requires_video_render: true,
    requires_visual_assets: true,
  },
  INSTAGRAM_REEL: {
    format_type: 'INSTAGRAM_REEL',
    category: 'VIDEO',
    name: 'Instagram Reel',
    description: 'High-hook vertical 9:16 video tailored for quick mobile discovery and saves.',
    supported_platforms: ['INSTAGRAM'],
    aspect_ratio: '9:16',
    duration_range_sec: { min: 25, max: 45 },
    requires_voice: true,
    requires_video_render: true,
    requires_visual_assets: true,
  },
  INSTAGRAM_CAROUSEL: {
    format_type: 'INSTAGRAM_CAROUSEL',
    category: 'CAROUSEL',
    name: 'Instagram 5-10 Slide Carousel',
    description: 'Swipeable educational deck (4:5 or 1:1) with progressive frameworks and high save rates.',
    supported_platforms: ['INSTAGRAM', 'FACEBOOK'],
    aspect_ratio: '4:5',
    slide_count_range: { min: 5, max: 10 },
    requires_voice: false,
    requires_video_render: false,
    requires_visual_assets: true,
  },
  INSTAGRAM_POST: {
    format_type: 'INSTAGRAM_POST',
    category: 'STATIC',
    name: 'Instagram Single Graphic Post',
    description: 'Single high-impact stat, quote, or diagram paired with an in-depth caption.',
    supported_platforms: ['INSTAGRAM'],
    aspect_ratio: '1:1',
    max_characters: 2200,
    requires_voice: false,
    requires_video_render: false,
    requires_visual_assets: true,
  },
  FACEBOOK_POST: {
    format_type: 'FACEBOOK_POST',
    category: 'TEXT',
    name: 'Facebook Educational Post',
    description: 'Long-form narrative (150-250 words) with rich link preview card and community question.',
    supported_platforms: ['FACEBOOK'],
    aspect_ratio: '16:9',
    max_characters: 5000,
    requires_voice: false,
    requires_video_render: false,
    requires_visual_assets: true,
  },
  FACEBOOK_VIDEO: {
    format_type: 'FACEBOOK_VIDEO',
    category: 'VIDEO',
    name: 'Facebook Video',
    description: 'Square or landscape video with burned-in subtitles for silent autoplay.',
    supported_platforms: ['FACEBOOK'],
    aspect_ratio: '1:1',
    duration_range_sec: { min: 60, max: 180 },
    requires_voice: true,
    requires_video_render: true,
    requires_visual_assets: true,
  },
  X_SINGLE: {
    format_type: 'X_SINGLE',
    category: 'TEXT',
    name: 'X Punchy Insight Post',
    description: 'Sharp, 280-character contrarian observation or single data point with high shareability.',
    supported_platforms: ['X'],
    aspect_ratio: '16:9',
    max_characters: 280,
    requires_voice: false,
    requires_video_render: false,
    requires_visual_assets: false,
  },
  X_THREAD: {
    format_type: 'X_THREAD',
    category: 'TEXT',
    name: 'X Value Thread (3-7 Tweets)',
    description: 'Sequenced value breakdown with hook tweet, numbered steps, citations, and closing CTA.',
    supported_platforms: ['X'],
    aspect_ratio: '16:9',
    slide_count_range: { min: 3, max: 7 },
    max_characters: 280, // per tweet
    requires_voice: false,
    requires_video_render: false,
    requires_visual_assets: true,
  },
  X_VIDEO: {
    format_type: 'X_VIDEO',
    category: 'VIDEO',
    name: 'X Native Video Clip',
    description: 'Concise, high-impact video clip under 90 seconds natively embedded on X.',
    supported_platforms: ['X'],
    aspect_ratio: '16:9',
    duration_range_sec: { min: 30, max: 90 },
    requires_voice: true,
    requires_video_render: true,
    requires_visual_assets: true,
  },
};
