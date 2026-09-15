// scripts/generate-video-sitemap.ts
// Generates Google-compliant Video XML Sitemap for all public video posts on TalentXcel

import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = 'https://talentxcel.in';

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateVideoSitemap() {
  console.log('====================================================');
  console.log('🎬 Generating Google Video XML Sitemap (sitemap-videos.xml)...');
  console.log('====================================================');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, author:profiles(id, full_name, username, title, profile_picture_url)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    throw new Error('Supabase query error: ' + error.message);
  }

  const videoPosts = (posts || []).filter((post) => {
    if (post.post_type === 'video') return true;
    const mediaUrls: string[] = Array.isArray(post.media_urls) ? post.media_urls : [];
    return mediaUrls.some((url) => {
      const clean = url.split('?')[0].toLowerCase();
      return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v');
    });
  });

  console.log(`Found ${videoPosts.length} video post(s) in Supabase.`);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

  for (const post of videoPosts) {
    const canonicalUrl = `${BASE_URL}/post/${post.id}`;
    const mediaUrls: string[] = Array.isArray(post.media_urls) ? post.media_urls : [];
    const videoUrl = mediaUrls.find((url) => {
      const clean = url.split('?')[0].toLowerCase();
      return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.endsWith('.m4v');
    }) || (post.media_urls && post.media_urls[0]) || '';

    if (!videoUrl) continue;

    const authorName = post.author?.full_name || 'TalentXcel Services';
    const cleanContent = (post.content || '').trim();
    const firstSentence = cleanContent.split(/[.!?\n]/)[0]?.slice(0, 95).trim() || 'Career Video Insight';
    const title = `${firstSentence} | ${authorName}`;
    const description = cleanContent.slice(0, 2040).replace(/\n/g, ' ') || title;

    const thumbnailUrl = mediaUrls.find((url) => {
      const clean = url.split('?')[0].toLowerCase();
      return !clean.endsWith('.mp4') && !clean.endsWith('.webm') && !clean.endsWith('.mov') && !clean.endsWith('.m4v');
    }) || post.featured_image_url || `${BASE_URL}/talentxcel-official-logo.png`;

    const pubDate = new Date(post.created_at).toISOString();

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(canonicalUrl)}</loc>\n`;
    xml += `    <video:video>\n`;
    xml += `      <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>\n`;
    xml += `      <video:title>${escapeXml(title)}</video:title>\n`;
    xml += `      <video:description>${escapeXml(description)}</video:description>\n`;
    xml += `      <video:content_loc>${escapeXml(videoUrl)}</video:content_loc>\n`;
    xml += `      <video:player_loc>${escapeXml(canonicalUrl)}</video:player_loc>\n`;
    xml += `      <video:publication_date>${escapeXml(pubDate)}</video:publication_date>\n`;
    xml += `      <video:family_friendly>yes</video:family_friendly>\n`;
    xml += `      <video:live>no</video:live>\n`;
    xml += `    </video:video>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  const publicPath = resolve('public/sitemap-videos.xml');
  writeFileSync(publicPath, xml, 'utf-8');
  console.log(`✓ Written ${videoPosts.length} video URLs to ${publicPath}`);

  const distDir = resolve('dist');
  if (existsSync(distDir)) {
    const distPath = resolve('dist/sitemap-videos.xml');
    writeFileSync(distPath, xml, 'utf-8');
    console.log(`✓ Written to ${distPath}`);
  }

  console.log('====================================================');
  console.log('🎉 Google Video XML Sitemap successfully built!');
  console.log('====================================================\n');
}

generateVideoSitemap().catch((err) => {
  console.error('Fatal error generating video sitemap:', err);
  process.exit(1);
});
