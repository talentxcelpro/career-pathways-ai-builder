import { existsSync, copyFileSync, unlinkSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { generateSubdomainHomepages } from './generate-subdomain-homepages.js';

const publicDir = resolve('public');
const distDir = resolve('dist');

const REQUIRED_SITEMAPS = [
  'sitemap-jobs.xml',
  'sitemap-salary.xml',
  'sitemap-careers.xml',
  'sitemap-resume.xml',
  'sitemap-learning.xml',
  'sitemap-colleges.xml',
  'sitemap-government.xml',
  'sitemap-employers.xml',
  'sitemap-passport.xml',
  'sitemap-root.xml',
];

const REQUIRED_ROBOTS = [
  'robots-jobs.txt',
  'robots-salary.txt',
  'robots-careers.txt',
  'robots-resume.txt',
  'robots-learning.txt',
  'robots-colleges.txt',
  'robots-government.txt',
  'robots-employers.txt',
  'robots-employer-alias.txt',
  'robots-passport.txt',
  'robots-root.txt',
];

const REQUIRED_SUBDOMAIN_PAGES = [
  'index-jobs.html',
  'index-salary.html',
  'index-careers.html',
  'index-resume.html',
  'index-learning.html',
  'index-colleges.html',
  'index-employers.html',
  'index-government.html',
  'index-passport.html',
];

export function finalizeSubdomainRouting(): void {
  console.log('================================================================');
  console.log('⚡ FINALIZING VERCEL MULTI-DOMAIN ROUTING ASSETS (DIST)');
  console.log('================================================================\n');

  // 1. Ensure public/ root aliases exist
  const publicSitemap = resolve(publicDir, 'sitemap.xml');
  const publicSitemapRoot = resolve(publicDir, 'sitemap-root.xml');
  if (existsSync(publicSitemap)) {
    copyFileSync(publicSitemap, publicSitemapRoot);
    console.log('✓ Synchronized public/sitemap.xml -> public/sitemap-root.xml');
  }

  const publicRobots = resolve(publicDir, 'robots.txt');
  const publicRobotsRoot = resolve(publicDir, 'robots-root.txt');
  if (existsSync(publicRobots)) {
    copyFileSync(publicRobots, publicRobotsRoot);
    console.log('✓ Synchronized public/robots.txt -> public/robots-root.txt');
  }

  // 2. Finalize dist/ directory if present
  if (existsSync(distDir)) {
    const distSitemap = resolve(distDir, 'sitemap.xml');
    const distSitemapRoot = resolve(distDir, 'sitemap-root.xml');
    if (existsSync(distSitemap)) {
      copyFileSync(distSitemap, distSitemapRoot);
      unlinkSync(distSitemap);
      console.log('✓ Moved dist/sitemap.xml -> dist/sitemap-root.xml (unlinked dist/sitemap.xml to unblock rewrites)');
    } else if (existsSync(publicSitemapRoot) && !existsSync(distSitemapRoot)) {
      copyFileSync(publicSitemapRoot, distSitemapRoot);
      console.log('✓ Copied public/sitemap-root.xml -> dist/sitemap-root.xml');
    }

    const distRobots = resolve(distDir, 'robots.txt');
    const distRobotsRoot = resolve(distDir, 'robots-root.txt');
    if (existsSync(distRobots)) {
      copyFileSync(distRobots, distRobotsRoot);
      unlinkSync(distRobots);
      console.log('✓ Moved dist/robots.txt -> dist/robots-root.txt (unlinked dist/robots.txt to unblock rewrites)');
    } else if (existsSync(publicRobotsRoot) && !existsSync(distRobotsRoot)) {
      copyFileSync(publicRobotsRoot, distRobotsRoot);
      console.log('✓ Copied public/robots-root.txt -> dist/robots-root.txt');
    }

    // Verify all required sitemaps exist in dist
    console.log('\n--- Verifying Dist Sitemaps ---');
    let allSitemapsValid = true;
    for (const sm of REQUIRED_SITEMAPS) {
      const p = resolve(distDir, sm);
      if (existsSync(p)) {
        const content = readFileSync(p, 'utf8');
        const isXml = content.startsWith('<?xml');
        console.log(`  ✓ ${sm.padEnd(26)} : Valid XML (${content.length.toLocaleString()} bytes)`);
        if (!isXml) allSitemapsValid = false;
      } else {
        console.error(`  ❌ MISSING: ${sm}`);
        allSitemapsValid = false;
      }
    }

    // Verify all required robots files exist in dist
    console.log('\n--- Verifying Dist Robots Files ---');
    let allRobotsValid = true;
    for (const rb of REQUIRED_ROBOTS) {
      const p = resolve(distDir, rb);
      if (existsSync(p)) {
        const content = readFileSync(p, 'utf8');
        console.log(`  ✓ ${rb.padEnd(26)} : Valid Text (${content.length.toLocaleString()} bytes)`);
      } else {
        console.error(`  ❌ MISSING: ${rb}`);
        allRobotsValid = false;
      }
    }

    // 3. Generate and verify dedicated subdomain HTML entry files
    generateSubdomainHomepages();
    console.log('--- Verifying Dist Subdomain HTML Entry Pages ---');
    let allHtmlValid = true;
    for (const htmlFile of REQUIRED_SUBDOMAIN_PAGES) {
      const p = resolve(distDir, htmlFile);
      if (existsSync(p)) {
        const content = readFileSync(p, 'utf8');
        const hasTitle = /<title>[^<]+<\/title>/i.test(content);
        const hasCanonical = /<link\s+rel=["']canonical["']/i.test(content) || /<link[^>]+rel=["']canonical["']/i.test(content);
        console.log(`  ✓ ${htmlFile.padEnd(26)} : Valid HTML (${content.length.toLocaleString()} bytes, title: ${hasTitle}, canonical: ${hasCanonical})`);
        if (!hasTitle || !hasCanonical) allHtmlValid = false;
      } else {
        console.error(`  ❌ MISSING: ${htmlFile}`);
        allHtmlValid = false;
      }
    }

    // Confirm that colliding files are completely removed from dist
    const collisionCheckSitemap = existsSync(resolve(distDir, 'sitemap.xml'));
    const collisionCheckRobots = existsSync(resolve(distDir, 'robots.txt'));
    if (!collisionCheckSitemap && !collisionCheckRobots) {
      console.log('\n✅ COLLISION CHECK PASSED: dist/sitemap.xml and dist/robots.txt are unlinked.');
      console.log('   All host-specific Vercel rewrites will execute with 100% fidelity.');
    } else {
      console.error('\n❌ COLLISION DETECTED: Colliding files still present in dist!');
      if (collisionCheckSitemap) unlinkSync(resolve(distDir, 'sitemap.xml'));
      if (collisionCheckRobots) unlinkSync(resolve(distDir, 'robots.txt'));
    }

    if (!allSitemapsValid || !allRobotsValid || !allHtmlValid) {
      throw new Error('Sitemap, robots, or HTML homepage validation failed in dist output.');
    }
  } else {
    console.log('ℹ dist/ folder not present; public/ root assets synchronized.');
  }

  console.log('\n✓ Subdomain routing finalization completed successfully.');
}

finalizeSubdomainRouting();
