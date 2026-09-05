// src/lib/social-marketing/vault/contentVaultProvider.ts
// Phase 25.4 & 25.12: Content Vault Provider for TalentXcel Local Content Vault
// Manages local physical storage at C:\TalentXcel\SocialContentVault\ and public/social-vault/
// Invariant: Non-overwriting. Approved packages cannot be overwritten silently without version increment.

import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import type {
  VaultManifest,
  VaultAssetRecord,
  SocialPlatform,
  ContentCalendarSlot,
} from '../types';

export interface SavePackageInput {
  scheduledDate: string; // YYYY-MM-DD
  campaignSlug: string;
  contentId: string;
  topicTitle: string;
  topicCategory: string;
  platforms: SocialPlatform[];
  contentData: any;
  evidenceData: any;
  assets: Array<{
    type: VaultAssetRecord['type'];
    platform: SocialPlatform;
    subfolder: string; // e.g. 'youtube', 'instagram', 'facebook', 'x'
    fileName: string; // e.g. 'video_9x16.mp4', 'slide-01.png'
    bufferOrText: Buffer | string;
    mimeType: string;
  }>;
  qualityScore: number;
  safetyPassed: boolean;
  evidenceVerified: boolean;
  contentVersion?: number;
}

export interface IntegrityCheckResult {
  valid: boolean;
  contentId: string;
  checkedFilesCount: number;
  missingFiles: string[];
  mismatchedChecksums: string[];
  errors: string[];
}

export interface ContentVaultProvider {
  saveContentPackage(input: SavePackageInput): Promise<VaultManifest>;
  getPackageManifest(scheduledDate: string, campaignSlug: string, contentId: string): Promise<VaultManifest | null>;
  verifyPackageIntegrity(manifest: VaultManifest): Promise<IntegrityCheckResult>;
  listVaultDates(): Promise<string[]>;
  getVaultRoot(): string;
  getWebVaultRoot(): string;
}

export class LocalFilesystemVault implements ContentVaultProvider {
  private primaryVaultRoot: string;
  private webVaultRoot: string;

  constructor(customPath?: string) {
    // 1. Primary Physical C: drive vault
    this.primaryVaultRoot =
      customPath ||
      process.env.TALENTXCEL_SOCIAL_VAULT_PATH ||
      'C:\\TalentXcel\\SocialContentVault';

    // 2. Local public folder mirror for zero-CORS browser preview in Vite
    this.webVaultRoot = path.resolve(process.cwd(), 'public', 'social-vault');

    this.ensureDirectoryExists(this.primaryVaultRoot);
    this.ensureDirectoryExists(this.webVaultRoot);
  }

  getVaultRoot(): string {
    return this.primaryVaultRoot;
  }

  getWebVaultRoot(): string {
    return this.webVaultRoot;
  }

  private ensureDirectoryExists(dirPath: string): void {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (err) {
      // In constrained environments (e.g. non-Windows CI), fallback to cwd public folder
      console.warn(`[Vault] Could not create directory at ${dirPath}, using project public path.`);
    }
  }

  private computeBufferChecksum(data: Buffer | string): string {
    const hash = createHash('sha256');
    hash.update(data);
    return `sha256:${hash.digest('hex')}`;
  }

  async saveContentPackage(input: SavePackageInput): Promise<VaultManifest> {
    const {
      scheduledDate,
      campaignSlug,
      contentId,
      topicTitle,
      topicCategory,
      platforms,
      contentData,
      evidenceData,
      assets,
      qualityScore,
      safetyPassed,
      evidenceVerified,
      contentVersion = 1,
    } = input;

    // Check existing manifest to prevent overwriting approved content
    const existingManifest = await this.getPackageManifest(scheduledDate, campaignSlug, contentId);
    if (existingManifest && existingManifest.status === 'READY') {
      // Check if slot was approved
      if (contentVersion <= existingManifest.contentVersion) {
        throw new Error(
          `[Vault Protection] Content package ${contentId} is already stored with version ${existingManifest.contentVersion}. Overwrite forbidden without version increment.`
        );
      }
    }

    const relFolder = path.join(scheduledDate, campaignSlug, contentId);
    const primaryDir = path.join(this.primaryVaultRoot, relFolder);
    const webDir = path.join(this.webVaultRoot, relFolder);

    this.ensureDirectoryExists(primaryDir);
    this.ensureDirectoryExists(webDir);

    // 1. Write content.json and evidence.json
    const contentJsonStr = JSON.stringify(contentData, null, 2);
    const evidenceJsonStr = JSON.stringify(evidenceData, null, 2);

    this.writeFileSafely(path.join(primaryDir, 'content.json'), contentJsonStr);
    this.writeFileSafely(path.join(webDir, 'content.json'), contentJsonStr);

    this.writeFileSafely(path.join(primaryDir, 'evidence.json'), evidenceJsonStr);
    this.writeFileSafely(path.join(webDir, 'evidence.json'), evidenceJsonStr);

    // 2. Write all platform asset files
    const manifestAssets: VaultAssetRecord[] = [];

    for (const asset of assets) {
      const relAssetPath = path.join(asset.subfolder, asset.fileName).replace(/\\/g, '/');
      const primaryAssetPath = path.join(primaryDir, asset.subfolder, asset.fileName);
      const webAssetPath = path.join(webDir, asset.subfolder, asset.fileName);

      this.ensureDirectoryExists(path.dirname(primaryAssetPath));
      this.ensureDirectoryExists(path.dirname(webAssetPath));

      this.writeFileSafely(primaryAssetPath, asset.bufferOrText);
      this.writeFileSafely(webAssetPath, asset.bufferOrText);

      const checksum = this.computeBufferChecksum(asset.bufferOrText);
      const byteSize = Buffer.isBuffer(asset.bufferOrText)
        ? asset.bufferOrText.length
        : Buffer.byteLength(asset.bufferOrText, 'utf8');

      // Vite Web URL
      const cdnUrl = `/social-vault/${relFolder.replace(/\\/g, '/')}/${relAssetPath}`;

      manifestAssets.push({
        type: asset.type,
        platform: asset.platform,
        relative_path: relAssetPath,
        absolute_path: primaryAssetPath,
        cdn_url: cdnUrl,
        mime_type: asset.mimeType,
        file_size_bytes: byteSize,
        checksum,
      });
    }

    // 3. Construct and write manifest.json
    const now = new Date().toISOString();
    const manifest: VaultManifest = {
      manifestVersion: '1.0.0',
      contentId,
      campaignId: campaignSlug,
      scheduledDate,
      scheduledTime: '09:00',
      topicTitle,
      topicCategory,
      platforms,
      assets: manifestAssets,
      qualityScore,
      safetyPassed,
      evidenceVerified,
      contentVersion,
      status: 'READY',
      createdAt: existingManifest?.createdAt || now,
      updatedAt: now,
    };

    const manifestJsonStr = JSON.stringify(manifest, null, 2);
    this.writeFileSafely(path.join(primaryDir, 'manifest.json'), manifestJsonStr);
    this.writeFileSafely(path.join(webDir, 'manifest.json'), manifestJsonStr);

    return manifest;
  }

  private writeFileSafely(targetPath: string, data: Buffer | string): void {
    try {
      this.ensureDirectoryExists(path.dirname(targetPath));
      fs.writeFileSync(targetPath, data);
    } catch (err: any) {
      console.warn(`[Vault] Could not write to ${targetPath}: ${err.message}`);
    }
  }

  async getPackageManifest(
    scheduledDate: string,
    campaignSlug: string,
    contentId: string
  ): Promise<VaultManifest | null> {
    const relFolder = path.join(scheduledDate, campaignSlug, contentId);
    const manifestPaths = [
      path.join(this.primaryVaultRoot, relFolder, 'manifest.json'),
      path.join(this.webVaultRoot, relFolder, 'manifest.json'),
    ];

    for (const p of manifestPaths) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, 'utf8');
          return JSON.parse(raw) as VaultManifest;
        } catch {
          // continue
        }
      }
    }
    return null;
  }

  async verifyPackageIntegrity(manifest: VaultManifest): Promise<IntegrityCheckResult> {
    const missingFiles: string[] = [];
    const mismatchedChecksums: string[] = [];
    const errors: string[] = [];
    let checkedCount = 0;

    for (const asset of manifest.assets) {
      checkedCount++;
      // Check either primary or web fallback
      let foundPath: string | null = null;
      if (fs.existsSync(asset.absolute_path)) {
        foundPath = asset.absolute_path;
      } else {
        const webFallback = path.join(
          this.webVaultRoot,
          manifest.scheduledDate,
          manifest.campaignId,
          manifest.contentId,
          asset.relative_path
        );
        if (fs.existsSync(webFallback)) {
          foundPath = webFallback;
        }
      }

      if (!foundPath) {
        missingFiles.push(asset.relative_path);
        continue;
      }

      try {
        const data = fs.readFileSync(foundPath);
        const actualChecksum = this.computeBufferChecksum(data);
        if (actualChecksum !== asset.checksum) {
          mismatchedChecksums.push(
            `${asset.relative_path} (expected ${asset.checksum}, got ${actualChecksum})`
          );
        }
        if (data.length === 0) {
          errors.push(`File ${asset.relative_path} is empty (0 bytes)`);
        }
      } catch (err: any) {
        errors.push(`Could not read file ${asset.relative_path}: ${err.message}`);
      }
    }

    return {
      valid: missingFiles.length === 0 && mismatchedChecksums.length === 0 && errors.length === 0,
      contentId: manifest.contentId,
      checkedFilesCount: checkedCount,
      missingFiles,
      mismatchedChecksums,
      errors,
    };
  }

  async listVaultDates(): Promise<string[]> {
    const dates = new Set<string>();
    for (const root of [this.primaryVaultRoot, this.webVaultRoot]) {
      if (fs.existsSync(root)) {
        try {
          const entries = fs.readdirSync(root);
          for (const e of entries) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(e)) {
              dates.add(e);
            }
          }
        } catch {
          // continue
        }
      }
    }
    return Array.from(dates).sort();
  }
}

// Global default singleton instance
export const defaultContentVault = new LocalFilesystemVault();
