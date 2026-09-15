// src/lib/social-marketing/videoProductionEngine.ts
// Stage 7: Video Production Engine for TalentXcel AI Content Factory
// Decoupled video assembly pipeline: Stitches visual frames, voice stems, subtitles, and branding.
// Invariant: Decoupled tolerance. A video render failure does NOT block static, carousel, or text deliverables.

import type { CoreContentDraft, VoiceSpec, SocialContentAsset, VideoRenderPackage } from './types';

/**
 * Computes deterministic checksum for video deliverables
 */
function computeVideoChecksum(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return `sha256_vid_${Math.abs(hash).toString(16).padStart(32, '0')}`;
}

import fs from 'fs';
import path from 'path';
import { defaultVideoRenderer } from './providers/videoRenderProvider';
import { defaultContentVault } from './vault/contentVaultProvider';

/**
 * Stage 7 Primary Function: Assembles and renders the final Video Deliverable package (9:16 vertical Short or 16:9 horizontal).
 * Invariant: Uses real FFmpeg rendering into public/social-vault/ and local content vault.
 * Decoupled failure tolerance: Video render failure does NOT block static, carousel, or text deliverables.
 */
export async function renderVideoPackage(
  content: CoreContentDraft,
  voice?: VoiceSpec,
  visualAssets: SocialContentAsset[] = [],
  options?: {
    aspectRatio?: '9:16' | '16:9';
    forceSimulateFailure?: boolean;
  }
): Promise<VideoRenderPackage> {
  const contentId = content.identity.content_id;
  const aspectRatio = options?.aspectRatio || '9:16';
  const renderId = `vid-pkg-${contentId}-${aspectRatio.replace(':', 'x')}`;

  const webVaultRoot = defaultContentVault.getWebVaultRoot();
  const videoDir = path.join(webVaultRoot, 'videos', contentId);
  try {
    if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
  } catch {
    // continue
  }

  const mp4FileName = aspectRatio === '9:16' ? 'video_9x16.mp4' : 'video_16x9.mp4';
  const outputFilePath = path.join(videoDir, mp4FileName);

  // Locate narration audio path if available
  let audioPath: string | undefined;
  if (voice?.audio_storage_path) {
    const fullAudioPath = path.join(webVaultRoot, voice.audio_storage_path);
    if (fs.existsSync(fullAudioPath)) {
      audioPath = fullAudioPath;
    }
  }

  const durationMs = voice?.duration_ms || 30000;

  // Execute physical video rendering with rich multi-scene metadata
  const renderOutput = await defaultVideoRenderer.renderVideo({
    contentId,
    aspectRatio,
    durationMs,
    audioFilePath: audioPath,
    outputFilePath,
    title: content.title,
    category: content.target_product,
    valuePoints: content.value_points,
    ctaCopy: content.cta_copy,
    ctaUrl: content.cta_destination_url,
    forceSimulateFailure: options?.forceSimulateFailure,
  });

  const thumbnail = visualAssets.find(a => a.asset_type === 'THUMBNAIL');

  if (renderOutput.status === 'FAILED') {
    return {
      id: renderId,
      content_id: contentId,
      aspect_ratio: aspectRatio,
      duration_ms: 0,
      status: 'FAILED',
      error: renderOutput.error || 'FFmpeg video rendering failed',
    };
  }

  return {
    id: renderId,
    content_id: contentId,
    aspect_ratio: aspectRatio,
    mp4_storage_path: `videos/${contentId}/${mp4FileName}`,
    mp4_checksum: renderOutput.checksum,
    captions_vtt_storage_path: voice?.subtitles_vtt ? `videos/${contentId}/captions.vtt` : undefined,
    transcript_storage_path: voice?.transcript_json ? `videos/${contentId}/transcript.json` : undefined,
    thumbnail_storage_path: thumbnail?.storage_path || `thumbnails/${contentId}/thumbnail.svg`,
    poster_storage_path: `thumbnails/${contentId}/thumbnail.svg`,
    duration_ms: renderOutput.durationMs,
    file_size_bytes: renderOutput.fileSizeBytes,
    status: 'READY',
  };
}
