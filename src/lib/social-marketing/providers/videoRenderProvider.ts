// src/lib/social-marketing/providers/videoRenderProvider.ts
// Phase 25 / Stage 7: Video Production Engine Provider Abstraction for TalentXcel
// Renders actual, physical H.264/AAC MP4 video files using system FFmpeg with decoupled failure tolerance.

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import type { VideoRenderPackage, SocialContentAsset, VoiceSpec } from '../types';

export interface VideoScene {
  scene_id: string;
  start_ms: number;
  end_ms: number;
  headline: string;
  subheadline?: string;
  badge?: string;
  visual_asset_id?: string;
}

export interface VideoRenderInput {
  contentId: string;
  aspectRatio: '9:16' | '16:9';
  durationMs: number;
  audioFilePath?: string;
  outputFilePath: string;
  scenes?: VideoScene[];
  forceSimulateFailure?: boolean;
}

export interface VideoRenderOutput {
  filePath: string;
  aspectRatio: '9:16' | '16:9';
  durationMs: number;
  fileSizeBytes: number;
  checksum: string;
  status: 'READY' | 'FAILED';
  error?: string;
}

export interface VideoRenderProvider {
  renderVideo(input: VideoRenderInput): Promise<VideoRenderOutput>;
}

export class FfmpegVideoRenderer implements VideoRenderProvider {
  private computeFileChecksum(filePath: string): string {
    const data = fs.readFileSync(filePath);
    const hash = createHash('sha256');
    hash.update(data);
    return `sha256:${hash.digest('hex')}`;
  }

  async renderVideo(input: VideoRenderInput): Promise<VideoRenderOutput> {
    const { contentId, aspectRatio, durationMs, audioFilePath, outputFilePath, forceSimulateFailure } = input;

    if (forceSimulateFailure) {
      return {
        filePath: outputFilePath,
        aspectRatio,
        durationMs: 0,
        fileSizeBytes: 0,
        checksum: 'sha256:failed',
        status: 'FAILED',
        error: 'Simulated video compositor rendering timeout: FFmpeg worker exited with code 1.',
      };
    }

    const durationSec = Math.max(2, Math.min(60, Math.round(durationMs / 1000)));
    const resolution = aspectRatio === '9:16' ? '1080x1920' : '1920x1080';
    const bgColor = aspectRatio === '9:16' ? '0x090D16' : '0x0B0F19';

    // Ensure parent directory exists
    const dir = path.dirname(outputFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      // Build FFmpeg command
      let cmd: string;
      if (audioFilePath && fs.existsSync(audioFilePath)) {
        // Mux video stream with the synthesized narration audio
        cmd = `ffmpeg -y -f lavfi -i color=c=${bgColor}:s=${resolution}:d=${durationSec} -i "${audioFilePath}" -c:v libx264 -pix_fmt yuv420p -preset ultrafast -c:a aac -b:a 128k -shortest "${outputFilePath}"`;
      } else {
        // Fallback tone audio so audio stream is guaranteed present
        cmd = `ffmpeg -y -f lavfi -i color=c=${bgColor}:s=${resolution}:d=${durationSec} -f lavfi -i sine=frequency=160:duration=${durationSec} -c:v libx264 -pix_fmt yuv420p -preset ultrafast -c:a aac -b:a 128k -shortest "${outputFilePath}"`;
      }

      execSync(cmd, { stdio: 'pipe', timeout: 30000 });

      if (!fs.existsSync(outputFilePath)) {
        throw new Error(`FFmpeg finished without creating output file at ${outputFilePath}`);
      }

      const stat = fs.statSync(outputFilePath);
      if (stat.size === 0) {
        throw new Error(`Rendered MP4 file is empty (0 bytes)`);
      }

      const checksum = this.computeFileChecksum(outputFilePath);

      return {
        filePath: outputFilePath,
        aspectRatio,
        durationMs: durationSec * 1000,
        fileSizeBytes: stat.size,
        checksum,
        status: 'READY',
      };
    } catch (err: any) {
      console.warn(`[VideoRenderer] FFmpeg render error for ${contentId}: ${err.message}`);
      return {
        filePath: outputFilePath,
        aspectRatio,
        durationMs: 0,
        fileSizeBytes: 0,
        checksum: 'sha256:render_failed',
        status: 'FAILED',
        error: `FFmpeg render failed: ${err.message}`,
      };
    }
  }
}

// Global default singleton instance
export const defaultVideoRenderer = new FfmpegVideoRenderer();
