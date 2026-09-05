// src/lib/social-marketing/types.ts
// Core Domain Types for TalentXcel Autonomous AI Content Factory & Social Marketing Engine
// Strictly governed: 12-stage pipeline, 8-mode AI decisioning, claim-to-evidence hierarchy, and 3-tier measurement.

export type SocialPlatform = 'YOUTUBE' | 'INSTAGRAM' | 'FACEBOOK' | 'X';

export const ALL_SOCIAL_PLATFORMS: SocialPlatform[] = ['YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'X'];

export type ContentFormatType =
  | 'YOUTUBE_SHORT'
  | 'YOUTUBE_VIDEO'
  | 'INSTAGRAM_REEL'
  | 'INSTAGRAM_CAROUSEL'
  | 'INSTAGRAM_POST'
  | 'FACEBOOK_POST'
  | 'FACEBOOK_VIDEO'
  | 'X_SINGLE'
  | 'X_THREAD'
  | 'X_VIDEO';

export type ContentCategory = 'VIDEO' | 'STATIC' | 'CAROUSEL' | 'TEXT' | 'INTERACTIVE';

export type AiDecisionMode =
  | 'CREATE_NEW'
  | 'REPURPOSE'
  | 'UPDATE'
  | 'REPOST_VARIANT'
  | 'SERIES'
  | 'BREAKING'
  | 'EVERGREEN'
  | 'NO_ACTION';

export type NoActionReason =
  | 'INSUFFICIENT_DEMAND'
  | 'LOW_EVIDENCE'
  | 'PLATFORM_COOLDOWN'
  | 'DUPLICATE_TOPIC'
  | 'QUALITY_RISK'
  | 'ACCOUNT_UNAVAILABLE'
  | 'GOVERNANCE_BLOCK'
  | 'NO_COMMERCIAL_VALUE';

export type CtaStrength = 'NONE' | 'SOFT' | 'CONTEXTUAL' | 'DIRECT';

export type ProductSurface =
  | 'JOBS'
  | 'RESUME_ATS'
  | 'SALARIES'
  | 'CAREER_MAP'
  | 'LEARNING'
  | 'COLLEGES'
  | 'NETWORK'
  | 'EMPLOYER_ACQUISITION'
  | 'TOOLS'
  | 'CAREER_PASSPORT'
  | 'SERVICES'
  | 'BRAND_AUTHORITY';

export type VerificationStatus = 'VERIFIED' | 'PROVISIONAL' | 'REJECTED';

export type AssetType =
  | 'CAROUSEL_SLIDE'
  | 'THUMBNAIL'
  | 'INFOGRAPHIC'
  | 'QUOTE_GRAPHIC'
  | 'COMPARISON_GRAPHIC'
  | 'VOICE_AUDIO'
  | 'RENDERED_VIDEO'
  | 'SUBTITLE_VTT'
  | 'TRANSCRIPT_JSON';

export type AssetStatus = 'GENERATING' | 'READY' | 'FAILED' | 'ARCHIVED' | 'DELETED';

export type PlatformReadiness = 'READY' | 'BLOCKED';

export type AccountHealth = 'CONNECTED' | 'EXPIRED' | 'REAUTH_REQUIRED' | 'ERROR' | 'DISABLED';

export type PublishingJobStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'DEAD_LETTER';

export type EditorialBriefStatus = 'PENDING_REVIEW' | 'APPROVED' | 'COMMISSIONED' | 'REJECTED';

export type EditorialTarget = 'BLOG' | 'NEWS';

// Stage 1: Discovery Model
export interface DiscoveredOpportunity {
  opportunity_id: string;
  source_type:
    | 'GSC_DEMAND'
    | 'LIVE_JOBS'
    | 'SALARY_BENCHMARK'
    | 'CAREER_QUESTION'
    | 'BLOG_ARTICLE'
    | 'NEWS_REPORT'
    | 'SOCIAL_PERFORMANCE'
    | 'REGIONAL_SIGNAL';
  source_reference: string;
  topic: string;
  target_audience: string;
  region: string;
  search_intent: string;
  demand_score: number; // 0 - 100
  evidence_status: VerificationStatus;
  detected_at: string;
  metadata?: Record<string, any>;
}

// Stage 3: Claim-Level Evidence Record
export interface EvidenceRecord {
  id: string;
  claim: string;
  source_url: string;
  source_type: 'GOVERNMENT_LABOR' | 'ACADEMIC' | 'TALENTXCEL_DATA' | 'INDUSTRY_REPORT' | 'OFFICIAL_DOCS';
  publisher: string;
  publication_date: string;
  observed_at: string;
  region?: string;
  dataset_sample_size?: number;
  confidence_score: number; // 0 - 100
  expires_at: string;
  verification_status: VerificationStatus;
}

// Permanent Content Identity Hierarchy
export interface ContentHierarchyIdentity {
  campaign_id: string;
  topic_id: string;
  content_id: string;
  parent_content_id?: string | null;
  content_version: number;
}

// Stage 4: Core Content Object
export interface CoreContentDraft {
  identity: ContentHierarchyIdentity;
  title: string;
  hook_variants: {
    curiosity: string;
    contrarian: string;
    data_revelation: string;
  };
  narrative_summary: string;
  value_points: Array<{
    heading: string;
    body: string;
    actionable_takeaway: string;
    supporting_evidence_ids: string[];
  }>;
  supporting_claims: Array<{
    claim: string;
    evidence_id: string;
  }>;
  target_product: ProductSurface;
  cta_strength: CtaStrength;
  cta_copy: string;
  cta_destination_url: string;
  tone: 'AUTHORITATIVE' | 'INSPIRING' | 'CONVERSATIONAL' | 'ANALYTICAL';
  target_audience: string;
  target_region: string;
  created_at: string;
}

// Stage 5: Voice Specification
export interface VoiceSpec {
  voice_id: string;
  voice_name: string;
  accent: string;
  pacing_wpm: number;
  emphasis_markers: Array<{ word: string; pause_ms: number }>;
  audio_storage_path?: string;
  audio_checksum?: string;
  duration_ms?: number;
  subtitles_vtt?: string;
  transcript_json?: Array<{ start_ms: number; end_ms: number; text: string }>;
  status: AssetStatus;
  error?: string;
}

// Stage 6: Asset Specification & Storage
export interface SocialContentAsset {
  id: string;
  factory_job_id: string;
  content_id: string;
  asset_type: AssetType;
  platform: SocialPlatform;
  storage_path: string;
  cdn_url: string;
  mime_type: string;
  width?: number;
  height?: number;
  duration_ms?: number;
  file_size: number;
  checksum: string; // SHA-256
  generation_model: string;
  generation_version: string;
  status: AssetStatus;
  created_at: string;
  expires_at?: string;
}

// Carousel Slide Data Spec
export interface CarouselSlideData {
  slide_number: number;
  total_slides: number;
  badge?: string;
  headline: string;
  subheadline?: string;
  bullet_points?: string[];
  callout_box?: string;
  footer_brand: string;
  svg_markup?: string;
  rendered_checksum?: string;
}

// Stage 7: Video Render Package
export interface VideoRenderPackage {
  id: string;
  content_id: string;
  aspect_ratio: '9:16' | '16:9';
  mp4_storage_path?: string;
  mp4_checksum?: string;
  captions_vtt_storage_path?: string;
  transcript_storage_path?: string;
  thumbnail_storage_path?: string;
  poster_storage_path?: string;
  duration_ms: number;
  file_size_bytes?: number;
  status: AssetStatus;
  error?: string;
}

// Stage 8: Platform Deliverable Packages
export interface YouTubeDeliverable {
  platform: 'YOUTUBE';
  video_type: 'SHORT' | 'LONG_FORM';
  title: string;
  description: string;
  chapters: Array<{ timestamp_sec: number; title: string }>;
  tags: string[];
  category_id: string;
  thumbnail_asset_id?: string;
  video_asset_id?: string;
  privacy_status: 'public' | 'private' | 'unlisted';
  utm_url: string;
}

export interface InstagramDeliverable {
  platform: 'INSTAGRAM';
  format: 'REEL' | 'CAROUSEL' | 'SINGLE_IMAGE';
  caption: string;
  hashtags: string[];
  carousel_asset_ids?: string[];
  reel_video_asset_id?: string;
  cover_asset_id?: string;
  share_to_feed: boolean;
  utm_url: string;
}

export interface FacebookDeliverable {
  platform: 'FACEBOOK';
  format: 'FEED_POST' | 'VIDEO';
  message: string;
  link_url: string;
  discussion_prompt: string;
  media_asset_ids?: string[];
  utm_url: string;
}

export interface XDeliverable {
  platform: 'X';
  format: 'SINGLE' | 'THREAD';
  tweets: Array<{
    index: number;
    text: string;
    media_asset_ids?: string[];
  }>;
  total_characters: number;
  utm_url: string;
}

export interface PlatformDeliverableGroup {
  content_id: string;
  youtube?: YouTubeDeliverable;
  instagram?: InstagramDeliverable;
  facebook?: FacebookDeliverable;
  x?: XDeliverable;
}

// Stage 9: Quality & Safety Audit Result
export interface QualityAuditReport {
  overall_score: number; // 0 - 100
  passed: boolean;
  factual_integrity_passed: boolean;
  anti_spam_passed: boolean;
  brand_consistency_passed: boolean;
  character_limits_passed: boolean;
  link_validity_passed: boolean;
  utm_integrity_passed: boolean;
  visual_quality_score: number;
  phrasing_overlap_score: number; // must be <= 20%
  breakdown: Array<{
    check_name: string;
    score: number;
    status: 'PASS' | 'WARN' | 'FAIL';
    message: string;
  }>;
}

export interface SafetyAuditReport {
  passed: boolean;
  hard_blocked_reason?: string;
  checks: {
    no_fabricated_statistics: boolean;
    no_fabricated_people_companies: boolean;
    no_fake_testimonials: boolean;
    no_competitor_misrepresentation: boolean;
    no_unsupported_salary_claims: boolean;
    no_copyright_risk: boolean;
    no_spam_engagement_tricks: boolean;
    no_pii_violation: boolean;
  };
}

// Stage 10: Publishing Job Model
export interface SocialPublishingJob {
  id: string;
  content_id: string;
  campaign_id: string;
  platform: SocialPlatform;
  format: ContentFormatType;
  idempotency_key: string;
  scheduled_at: string;
  execution_policy: 'AUTO' | 'REVIEW' | 'BLOCKED';
  quality_score: number;
  safety_check_passed: boolean;
  platform_readiness: PlatformReadiness;
  account_health: AccountHealth;
  execution_status: PublishingJobStatus;
  published_url?: string;
  external_post_id?: string;
  attempt_count: number;
  last_error?: string;
  next_retry_at?: string;
  retry_policy: {
    max_attempts: number;
    backoff_factor: number;
  };
  created_at: string;
  published_at?: string;
}

// Stage 11: 3-Tier Outcome Telemetry
export interface AttentionTierMetrics {
  impressions: number;
  reach: number;
  views: number;
  watch_time_sec: number;
  completion_rate: number;
}

export interface IntentTierMetrics {
  profile_visits: number;
  link_clicks: number;
  landing_sessions: number;
  saves: number;
  shares: number;
}

export interface BusinessTierMetrics {
  signups: number;
  verified_users: number;
  activated_users: number;
  resume_scans: number;
  job_applications: number;
  employer_leads: number;
  jobs_posted: number;
  paid_txc_purchases: number;
  direct_revenue_inr: number;
}

export interface FullFunnelAttributionSnapshot {
  job_id: string;
  platform: SocialPlatform;
  topic_title: string;
  campaign_slug: string;
  attention: AttentionTierMetrics;
  intent: IntentTierMetrics;
  business: BusinessTierMetrics;
  roi_score: number;
  recorded_at: string;
}

// Stage 12: Reverse Editorial Pipeline
export interface SocialEditorialBrief {
  id: string;
  content_id: string;
  source_social_topic: string;
  recommended_destination: EditorialTarget; // 'BLOG' or 'NEWS'
  justification: {
    total_clicks: number;
    signup_conversion_rate: number; // e.g. 7.2%
    revenue_generated: number;
    top_engaging_angle: string;
  };
  proposed_title: string;
  proposed_slug: string;
  outline: {
    executive_summary: string;
    section_headings: string[];
    evidence_sources: string[];
    target_keywords: string[];
  };
  editorial_status: EditorialBriefStatus;
  created_at: string;
  commissioned_at?: string;
}

// Scheduler Cycle Summary Record
export interface SchedulerCycleResult {
  cycle_id: string;
  timestamp: string;
  decision: AiDecisionMode;
  no_action_reason?: NoActionReason;
  selected_opportunity?: DiscoveredOpportunity;
  selected_platform?: SocialPlatform;
  jobs_created: number;
  policy_enforced: 'AUTO' | 'REVIEW' | 'BLOCKED';
  duration_ms: number;
}

// ============================================================================
// PHASE 25: 15/30-DAY ADVANCE BATCH CONTENT PRODUCTION & LOCAL VAULT TYPES
// ============================================================================

export type BatchMode = 'BATCH_15_DAYS' | 'BATCH_30_DAYS';

export type CalendarSlotStatus =
  | 'PLANNED'
  | 'GENERATING'
  | 'GENERATED'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'SKIPPED'
  | 'FAILED'
  | 'CANCELLED';

export interface ContentCalendarSlot {
  id: string;
  content_id: string;
  campaign_id: string;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:mm e.g. 09:00, 13:00, 18:00
  timezone: string;
  platform: SocialPlatform;
  format: ContentFormatType;
  calendar_status: CalendarSlotStatus;
  priority: 'P0' | 'P1' | 'P2';
  decision_mode: AiDecisionMode;
  topic_title: string;
  topic_category: string;
  content_version: number;
  vault_path?: string;
  approved_at?: string;
  published_at?: string;
  created_at: string;
}

export interface VaultAssetRecord {
  type: 'VIDEO' | 'CAROUSEL_SLIDE' | 'THUMBNAIL' | 'AUDIO' | 'SUBTITLES' | 'TRANSCRIPT' | 'POST_HERO' | 'COPY';
  platform: SocialPlatform;
  relative_path: string;
  absolute_path: string;
  cdn_url: string;
  mime_type: string;
  file_size_bytes: number;
  checksum: string;
}

export interface VaultManifest {
  manifestVersion?: string;
  contentId: string;
  campaignId: string;
  scheduledDate: string;
  scheduledTime: string;
  topicTitle: string;
  topicCategory: string;
  platforms: SocialPlatform[];
  assets: VaultAssetRecord[];
  qualityScore: number;
  safetyPassed: boolean;
  evidenceVerified: boolean;
  contentVersion: number;
  status: 'READY' | 'GENERATING' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface BatchProductionProgress {
  batchId: string;
  mode: BatchMode;
  totalDays: number;
  completedDays: number;
  currentDay: number;
  status: 'RUNNING' | 'COMPLETED' | 'PAUSED' | 'FAILED';
  stageProgress: {
    research: boolean;
    writing: boolean;
    images: boolean;
    voice: boolean;
    video: boolean;
    adaptation: boolean;
    safety: boolean;
    quality: boolean;
    vault: boolean;
  };
  daysSummary: Array<{
    date: string;
    slotsCount: number;
    percentage: number;
    status: CalendarSlotStatus;
  }>;
}

export interface ContentReserveStats {
  mode15DaysStatus: 'READY' | 'GENERATING' | 'NOT_GENERATED';
  mode30DaysStatus: 'READY' | 'GENERATING' | 'NOT_GENERATED';
  totalConcepts: number;
  readyAssets: number;
  videoCount: number;
  carouselCount: number;
  imageCount: number;
  audioCount: number;
  awaitingReviewCount: number;
  approvedCount: number;
  publishingStatus: 'CONNECTED' | 'PAUSED' | 'OFFLINE';
  nextScheduledSlot?: {
    date: string;
    time: string;
    platform: SocialPlatform;
    format: ContentFormatType;
    topic: string;
  };
}

