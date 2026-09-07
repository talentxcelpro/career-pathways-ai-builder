const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SITE_URL = 'https://talentxcel.in/';

async function getGoogleAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const base64UrlEncode = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64UrlEncode(header);
  const encodedClaim = base64UrlEncode(claimSet);
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  signer.end();

  const signature = signer
    .sign(serviceAccount.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signatureInput}.${signature}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    throw new Error(tokenData.error_description || JSON.stringify(tokenData));
  }

  return tokenData.access_token;
}

async function inspectUrl(inspectionUrl, token) {
  try {
    const res = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        inspectionUrl,
        siteUrl: SITE_URL,
        languageCode: 'en'
      })
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

async function main() {
  console.log('====================================================================');
  console.log('🔍 TALENTXCEL GOOGLEBOT REALITY TEST — GSC LIVE INSPECTION AUDIT');
  console.log('====================================================================\n');

  const keyPath = 'C:\\Users\\Arshid.Wani\\talentxcel-local\\gcp-key.json';
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const token = await getGoogleAccessToken(serviceAccount);
  console.log(`✓ Authenticated with GSC as: ${serviceAccount.client_email}\n`);

  // Fetch representative cohorts from Supabase
  const { data: allPosts } = await supabase
    .from('posts')
    .select('id, content, post_type, media_urls, featured_image_url, likes_count, comments_count')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(300);

  const isVideo = (url) => {
    if (!url) return false;
    const clean = url.split('?')[0].toLowerCase();
    return ['.mp4', '.webm', '.mov', '.m4v'].some(ext => clean.endsWith(ext));
  };

  const videoPosts = [];
  const imagePosts = [];
  const textPosts = [];

  for (const p of (allPosts || [])) {
    const urls = Array.isArray(p.media_urls) ? p.media_urls : [];
    const hasVid = urls.some(isVideo) || p.post_type === 'video';
    const hasImg = urls.some(u => !isVideo(u)) || Boolean(p.featured_image_url);

    if (hasVid && videoPosts.length < 5) {
      videoPosts.push(p);
    } else if (!hasVid && hasImg && imagePosts.length < 5) {
      imagePosts.push(p);
    } else if (!hasVid && !hasImg && textPosts.length < 5) {
      textPosts.push(p);
    }
  }

  const highEngagementPosts = [...(allPosts || [])]
    .sort((a, b) => ((b.likes_count || 0) + (b.comments_count || 0)) - ((a.likes_count || 0) + (a.comments_count || 0)))
    .slice(0, 5);

  const sampleCohorts = [
    {
      category: 'HUB & PAGINATION SURFACES',
      urls: [
        'https://talentxcel.in/network',
        'https://talentxcel.in/network/page/2',
      ]
    },
    {
      category: 'PRIMARY TOPIC HUBS',
      urls: [
        'https://talentxcel.in/network/jobs',
        'https://talentxcel.in/network/ai',
        'https://talentxcel.in/network/careers',
      ]
    },
    {
      category: 'VIDEO POSTS (5 Sample)',
      urls: videoPosts.map(p => `https://talentxcel.in/post/${p.id}`)
    },
    {
      category: 'IMAGE POSTS (5 Sample)',
      urls: imagePosts.map(p => `https://talentxcel.in/post/${p.id}`)
    },
    {
      category: 'TEXT POSTS (5 Sample)',
      urls: textPosts.map(p => `https://talentxcel.in/post/${p.id}`)
    },
    {
      category: 'HIGH-ENGAGEMENT POSTS (5 Sample)',
      urls: highEngagementPosts.map(p => `https://talentxcel.in/post/${p.id}`)
    },
  ];

  let totalTested = 0;
  let indexedCount = 0;
  let discoveredCount = 0;
  let unknownCount = 0;

  for (const cohort of sampleCohorts) {
    console.log(`\n────────────────────────────────────────────────────────────────────`);
    console.log(`📁 COHORT: ${cohort.category}`);
    console.log(`────────────────────────────────────────────────────────────────────`);

    for (const url of cohort.urls) {
      totalTested++;
      const res = await inspectUrl(url, token);
      const r = res.inspectionResult;

      if (r) {
        const indexStatus = r.indexStatusResult;
        const coverage = indexStatus?.coverageState || 'Unknown';
        const verdict = indexStatus?.verdict || 'NEUTRAL';
        const googleCanon = indexStatus?.googleCanonical || 'None assigned yet';
        const userCanon = indexStatus?.userCanonical || 'None declared';
        const crawlTime = indexStatus?.lastCrawlTime ? new Date(indexStatus.lastCrawlTime).toLocaleDateString() : 'Not yet crawled';
        const pageFetch = indexStatus?.pageFetchState || 'UNSPECIFIED';
        const robots = indexStatus?.robotsTxtState || 'UNSPECIFIED';

        let statusIcon = '⏳';
        if (coverage.toLowerCase().includes('indexed')) {
          statusIcon = '✅';
          indexedCount++;
        } else if (coverage.toLowerCase().includes('discovered') || coverage.toLowerCase().includes('crawled')) {
          statusIcon = '📡';
          discoveredCount++;
        } else {
          unknownCount++;
        }

        console.log(`\n${statusIcon} URL: ${url}`);
        console.log(`   Verdict: ${verdict} | Coverage: ${coverage}`);
        console.log(`   Page Fetch: ${pageFetch} | Robots: ${robots}`);
        console.log(`   Google Canonical: ${googleCanon}`);
        console.log(`   User Canonical:   ${userCanon}`);
        console.log(`   Last Crawled:     ${crawlTime}`);

        // Rich Results
        if (r.richResultsResult) {
          const rr = r.richResultsResult;
          console.log(`   Rich Results Verdict: ${rr.verdict || 'NONE'}`);
          for (const item of (rr.detectedItems || [])) {
            const hasIssues = (item.items || []).some(sub => sub.issues && sub.issues.length > 0);
            console.log(`     - [${item.richResultType}]: ${item.items?.length || 0} items ${hasIssues ? '⚠️' : '✓'}`);
          }
        }
      } else {
        unknownCount++;
        console.log(`\n❓ URL: ${url}`);
        console.log(`   Response: ${JSON.stringify(res.error || res)}`);
      }

      // 250ms pacing for Search Console Inspection API limits
      await new Promise(r => setTimeout(r, 250));
    }
  }

  console.log('\n====================================================================');
  console.log('📊 REALITY TEST AUDIT SUMMARY:');
  console.log(`  Total Representative URLs Tested: ${totalTested}`);
  console.log(`  Indexed in Google Search:         ${indexedCount}`);
  console.log(`  Discovered / Crawled in Pipeline: ${discoveredCount}`);
  console.log(`  Awaiting Initial Googlebot Crawl: ${unknownCount}`);
  console.log('====================================================================\n');
}

main().catch(console.error);
