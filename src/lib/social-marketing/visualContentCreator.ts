// src/lib/social-marketing/visualContentCreator.ts
// Stage 6: Visual Content Factory for TalentXcel AI Content Factory
// Generates actual rendered visual assets (SVG/Vector layouts for Carousels, Thumbnails, and Infographics)
// Invariant: Produces complete rendered deliverables with SHA-256 checksums, dimensions, and asset vault records.

import fs from 'fs';
import path from 'path';
import { computeSha256Prefixed } from './utils/cryptoUtils';
import type { CoreContentDraft, SocialContentAsset, CarouselSlideData } from './types';
import { defaultImageProvider } from './providers/imageGenerationProvider';
import { defaultContentVault } from './vault/contentVaultProvider';

/**
 * Computes deterministic SHA-256 hash for buffer or string
 */
function computeChecksum(content: Buffer | string): string {
  return computeSha256Prefixed(content);
}

/**
 * Generates an ultra-crisp, production-ready SVG card for an Instagram Carousel slide (1080x1350, 4:5 ratio)
 */
export function renderCarouselSlideSvg(slide: CarouselSlideData): string {
  const isHookSlide = slide.slide_number === 1;
  const isCtaSlide = slide.slide_number === slide.total_slides;

  const bgGradient = isHookSlide
    ? 'linear-gradient(145deg, #090D16 0%, #111827 50%, #1E1B4B 100%)'
    : 'linear-gradient(145deg, #0B0F19 0%, #111827 100%)';

  const bulletsMarkup = (slide.bullet_points || [])
    .map(
      (b, idx) => `
      <g transform="translate(80, ${440 + idx * 110})">
        <circle cx="20" cy="20" r="14" fill="#007AFF" opacity="0.2"/>
        <circle cx="20" cy="20" r="6" fill="#007AFF"/>
        <text x="54" y="27" fill="#E2E8F0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="500">
          ${escapeXml(b)}
        </text>
      </g>`
    )
    .join('');

  const calloutMarkup = slide.callout_box
    ? `
    <g transform="translate(80, 880)">
      <rect width="920" height="150" rx="16" fill="#1E293B" stroke="#334155" stroke-width="2"/>
      <rect width="8" height="150" rx="4" fill="#7B2CBF"/>
      <text x="40" y="55" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="600" letter-spacing="1">KEY TAKEAWAY</text>
      <text x="40" y="100" fill="#F8FAFC" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26" font-weight="600">
        ${escapeXml(slide.callout_box.slice(0, 75))}
      </text>
    </g>`
    : '';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16"/>
      <stop offset="50%" stop-color="#111827"/>
      <stop offset="100%" stop-color="${isHookSlide ? '#1E1B4B' : '#0B0F19'}"/>
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#007AFF"/>
      <stop offset="100%" stop-color="#7B2CBF"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1350" fill="url(#bgGrad)"/>

  <!-- Top Navigation / Slide Counter -->
  <rect x="80" y="80" width="220" height="48" rx="24" fill="#1E293B" stroke="#334155" stroke-width="1"/>
  <text x="190" y="112" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">
    ${slide.badge || 'CAREER INSIGHT'}
  </text>
  <text x="960" y="112" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" font-weight="700" text-anchor="end">
    ${slide.slide_number} / ${slide.total_slides}
  </text>

  <!-- Main Headline -->
  <g transform="translate(80, ${isHookSlide ? 280 : 200})">
    <text x="0" y="60" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="${isHookSlide ? 58 : 46}" font-weight="800" line-height="1.2">
      ${wrapSvgText(slide.headline, isHookSlide ? 30 : 38)}
    </text>
    ${
      slide.subheadline
        ? `<text x="0" y="180" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="28" font-weight="400">
          ${escapeXml(slide.subheadline.slice(0, 100))}
        </text>`
        : ''
    }
  </g>

  <!-- Bullets and Callouts -->
  ${bulletsMarkup}
  ${calloutMarkup}

  <!-- Brand Footer -->
  <line x1="80" y1="1230" x2="1000" y2="1230" stroke="#1E293B" stroke-width="2"/>
  <text x="80" y="1280" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="600">
    TalentXcel Verified Intelligence
  </text>
  <g transform="translate(820, 1255)">
    <text x="0" y="24" fill="#007AFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="700">
      ${isCtaSlide ? 'talentxcel.in ↗' : 'Swipe ➔'}
    </text>
  </g>
</svg>`.trim();
}

/**
 * Generates an ultra-crisp YouTube 16:9 Thumbnail SVG (1280x720)
 */
export function renderThumbnailSvg(title: string, categoryBadge = '2026 BENCHMARK'): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs>
    <linearGradient id="thumbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050811"/>
      <stop offset="60%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#007AFF"/>
      <stop offset="100%" stop-color="#7B2CBF"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#thumbBg)"/>

  <!-- Dynamic Corner Glow -->
  <circle cx="1180" cy="100" r="300" fill="#7B2CBF" opacity="0.15" filter="blur(60px)"/>
  <circle cx="100" cy="620" r="300" fill="#007AFF" opacity="0.12" filter="blur(60px)"/>

  <!-- Left Accent Bar -->
  <rect x="0" y="0" width="16" height="720" fill="url(#accentLine)"/>

  <!-- Category Pill Badge -->
  <rect x="80" y="90" width="260" height="52" rx="26" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
  <text x="210" y="125" fill="#38BDF8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="800" text-anchor="middle" letter-spacing="1">
    ${escapeXml(categoryBadge)}
  </text>

  <!-- Big Punchy Text Hook -->
  <g transform="translate(80, 220)">
    <text x="0" y="70" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="64" font-weight="900" letter-spacing="-1">
      ${wrapSvgText(title, 26)}
    </text>
  </g>

  <!-- Bottom Brand Watermark -->
  <g transform="translate(80, 620)">
    <text x="0" y="30" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="26" font-weight="700">
      TalentXcel Official
    </text>
    <rect x="250" y="10" width="120" height="28" rx="14" fill="#10B981" opacity="0.2"/>
    <text x="310" y="30" fill="#10B981" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="800" text-anchor="middle">
      VERIFIED
    </text>
  </g>
</svg>`.trim();
}

/**
 * Stage 6 Primary Function: Renders Carousel Slides and Thumbnails, writes physical files to disk,
 * and returns persistent Asset Vault records.
 * Invariant: UI / system must never mark READY unless the physical file exists on disk with size > 0.
 */
export async function generateVisualAssets(
  content: CoreContentDraft,
  factoryJobId = 'job-auto'
): Promise<SocialContentAsset[]> {
  const assets: SocialContentAsset[] = [];
  const contentId = content.identity.content_id;
  const now = new Date().toISOString();

  // Ensure target directories exist on disk
  const webVaultRoot = defaultContentVault.getWebVaultRoot();
  const carouselDir = path.join(webVaultRoot, 'carousels', contentId);
  const thumbDir = path.join(webVaultRoot, 'thumbnails', contentId);

  try {
    if (!fs.existsSync(carouselDir)) fs.mkdirSync(carouselDir, { recursive: true });
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
  } catch (err) {
    // continue
  }

  // 1. Generate 5-Slide Instagram Carousel
  const totalSlides = 5;
  const slidesData: CarouselSlideData[] = [
    {
      slide_number: 1,
      total_slides: totalSlides,
      badge: 'CAREER GUIDE 2026',
      headline: content.title,
      subheadline: content.hook_variants.curiosity,
      callout_box: 'Swipe to see the 3 verified shifts every professional must know.',
      footer_brand: 'TalentXcel',
    },
    ...content.value_points.slice(0, 3).map((vp, idx) => ({
      slide_number: idx + 2,
      total_slides: totalSlides,
      badge: `STEP 0${idx + 1}`,
      headline: vp.heading,
      bullet_points: [vp.body.slice(0, 80), vp.actionable_takeaway.slice(0, 80)],
      callout_box: vp.actionable_takeaway,
      footer_brand: 'TalentXcel',
    })),
    {
      slide_number: 5,
      total_slides: totalSlides,
      badge: 'NEXT ACTION',
      headline: 'Take Action on Your Career Today',
      subheadline: content.cta_copy,
      callout_box: 'Save this post for later. Share with someone navigating their 2026 career moves.',
      footer_brand: 'TalentXcel',
    },
  ];

  for (const slide of slidesData) {
    const slideOutput = await defaultImageProvider.generateCarouselSlideImage(slide);
    const fileName = `slide-0${slide.slide_number}.svg`;
    const filePath = path.join(carouselDir, fileName);

    // Physically write file to disk
    try {
      fs.writeFileSync(filePath, slideOutput.buffer);
    } catch {
      // continue
    }

    const fileExists = fs.existsSync(filePath);
    const byteSize = fileExists ? fs.statSync(filePath).size : slideOutput.fileSizeBytes;
    const checksum = slideOutput.checksum;
    const assetId = `asset-car-${contentId}-s${slide.slide_number}`;

    assets.push({
      id: assetId,
      factory_job_id: factoryJobId,
      content_id: contentId,
      asset_type: 'CAROUSEL_SLIDE',
      platform: 'INSTAGRAM',
      storage_path: `carousels/${contentId}/${fileName}`,
      cdn_url: `/social-vault/carousels/${contentId}/${fileName}`,
      mime_type: 'image/svg+xml',
      width: 1080,
      height: 1350,
      file_size: byteSize,
      checksum,
      generation_model: 'talentxcel-svg-vector-engine-v2',
      generation_version: '2.4.0',
      status: fileExists && byteSize > 0 ? 'READY' : 'FAILED',
      created_at: now,
    });
  }

  // 2. Generate YouTube & Video Thumbnail
  const thumbOutput = await defaultImageProvider.generateThumbnailImage(content.title, '2026 CAREER SHIFT');
  const thumbFileName = 'thumbnail.svg';
  const thumbPath = path.join(thumbDir, thumbFileName);

  try {
    fs.writeFileSync(thumbPath, thumbOutput.buffer);
  } catch {
    // continue
  }

  const thumbExists = fs.existsSync(thumbPath);
  const thumbByteSize = thumbExists ? fs.statSync(thumbPath).size : thumbOutput.fileSizeBytes;
  const thumbAssetId = `asset-thumb-${contentId}`;

  assets.push({
    id: thumbAssetId,
    factory_job_id: factoryJobId,
    content_id: contentId,
    asset_type: 'THUMBNAIL',
    platform: 'YOUTUBE',
    storage_path: `thumbnails/${contentId}/${thumbFileName}`,
    cdn_url: `/social-vault/thumbnails/${contentId}/${thumbFileName}`,
    mime_type: 'image/svg+xml',
    width: 1280,
    height: 720,
    file_size: thumbByteSize,
    checksum: thumbOutput.checksum,
    generation_model: 'talentxcel-thumbnail-engine-v2',
    generation_version: '2.4.0',
    status: thumbExists && thumbByteSize > 0 ? 'READY' : 'FAILED',
    created_at: now,
  });

  return assets;
}

// XML escaping helper for SVG text rendering
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Simple text wrapping helper for SVG text elements
function wrapSvgText(text: string, maxCharsPerLine = 32): string {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines
    .slice(0, 3)
    .map((line, idx) => `<tspan x="0" dy="${idx === 0 ? 0 : '1.3em'}">${escapeXml(line)}</tspan>`)
    .join('');
}
