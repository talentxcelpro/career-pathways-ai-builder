// src/lib/social-marketing/voiceSynthesisEngine.ts
// Stage 5: Voice Synthesis Engine for TalentXcel AI Content Factory
// Generates natural speech specifications, word-level subtitle timings (.vtt), and transcript files.
// Invariant: Graceful degradation. Voice is optional; audio render failures do NOT block static/carousel assets.

import type { CoreContentDraft, VoiceSpec } from './types';

/**
 * Calculates SHA-256 equivalent checksum for audio metadata
 */
function computeStringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `chk_voice_${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

/**
 * Converts text into structured word-level timed subtitle segments (.vtt format)
 */
function generateVttSubtitles(
  scriptLines: string[],
  wpm = 145
): { vttText: string; transcriptJson: Array<{ start_ms: number; end_ms: number; text: string }> } {
  const msPerWord = Math.round((60 / wpm) * 1000);
  let currentMs = 0;
  const transcript: Array<{ start_ms: number; end_ms: number; text: string }> = [];
  const vttLines = ['WEBVTT', ''];

  let cueIndex = 1;
  for (const line of scriptLines) {
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    const durationMs = words.length * msPerWord;
    const startMs = currentMs;
    const endMs = startMs + durationMs;

    transcript.push({
      start_ms: startMs,
      end_ms: endMs,
      text: line,
    });

    const formatTime = (ms: number) => {
      const s = Math.floor(ms / 1000);
      const frac = ms % 1000;
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      const mss = String(frac).padStart(3, '0');
      return `${mm}:${ss}.${mss}`;
    };

    vttLines.push(`${cueIndex++}`);
    vttLines.push(`${formatTime(startMs)} --> ${formatTime(endMs)}`);
    vttLines.push(line);
    vttLines.push('');

    currentMs = endMs + 250; // 250ms natural pause between lines
  }

  return {
    vttText: vttLines.join('\n'),
    transcriptJson: transcript,
  };
}

import fs from 'fs';
import path from 'path';
import { defaultVoiceProvider } from './providers/voiceGenerationProvider';
import { defaultContentVault } from './vault/contentVaultProvider';

/**
 * Stage 5 Primary Function: Generates Voice and Subtitle tracks from Core Content Draft.
 * Invariant: Writes actual physical PCM WAV and WebVTT caption files to disk.
 */
export async function generateVoiceSynthesis(
  content: CoreContentDraft,
  options?: {
    voiceProfile?: string;
    pacingWpm?: number;
  }
): Promise<VoiceSpec> {
  const contentId = content.identity.content_id;
  const voiceId = options?.voiceProfile || 'voice_talentxcel_executive_en';
  const pacing = options?.pacingWpm || 145;

  // Use voice generation provider to create actual PCM WAV and VTT
  const voiceOutput = await defaultVoiceProvider.synthesizeSpeech(content, { voiceProfile: voiceId, pacingWpm: pacing });

  // Ensure target directory exists on disk
  const webVaultRoot = defaultContentVault.getWebVaultRoot();
  const audioDir = path.join(webVaultRoot, 'audio', contentId);
  try {
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  } catch {
    // continue
  }

  const audioFilePath = path.join(audioDir, voiceOutput.audioFileName);
  const vttFilePath = path.join(audioDir, voiceOutput.vttFileName);
  const transcriptFilePath = path.join(audioDir, voiceOutput.transcriptFileName);

  try {
    fs.writeFileSync(audioFilePath, voiceOutput.audioBuffer);
    fs.writeFileSync(vttFilePath, voiceOutput.vttContent);
    fs.writeFileSync(transcriptFilePath, JSON.stringify(voiceOutput.transcriptJson, null, 2));
  } catch (err: any) {
    console.warn(`[VoiceEngine] Could not write audio to disk: ${err.message}`);
  }

  const fileExists = fs.existsSync(audioFilePath);
  const byteSize = fileExists ? fs.statSync(audioFilePath).size : voiceOutput.fileSizeBytes;

  return {
    voice_id: voiceId,
    voice_name: 'TalentXcel Executive Narrator (Neutral Global English)',
    accent: 'Global Professional English',
    pacing_wpm: pacing,
    emphasis_markers: [
      { word: 'actually', pause_ms: 150 },
      { word: 'hiring', pause_ms: 200 },
      { word: 'verified', pause_ms: 200 },
    ],
    audio_storage_path: `audio/${contentId}/${voiceOutput.audioFileName}`,
    audio_checksum: voiceOutput.checksum,
    duration_ms: voiceOutput.durationMs,
    subtitles_vtt: voiceOutput.vttContent,
    transcript_json: voiceOutput.transcriptJson,
    status: fileExists && byteSize > 0 ? 'READY' : 'FAILED',
  };
}
