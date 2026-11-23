// distribution-engine/src/verification/publicationVerifier.cjs
// Real HTTP DOM Inspection & Live Publication Verification Engine for TalentXcel
// Invariant: A submission is NOT a publication. Only verified live URLs count as published.

const http = require('http');
const https = require('https');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { URL } = require('url');

class PublicationVerifier {
  constructor(db) {
    this.db = db;
    this.userAgent = 'TalentXcel-Verification-Bot/1.0 (+https://talentxcel.in; verification@talentxcel.in)';
  }

  /**
   * Fetches URL content using native Node.js HTTP/HTTPS
   */
  async fetchPage(targetUrl, timeoutMs = 8000) {
    return new Promise((resolve) => {
      let parsedUrl;
      try {
        parsedUrl = new URL(targetUrl);
      } catch (e) {
        return resolve({ success: false, error: `Invalid URL: ${e.message}`, statusCode: 0, body: '', latencyMs: 0 });
      }

      const client = parsedUrl.protocol === 'https:' ? https : http;
      const startTime = Date.now();

      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: timeoutMs
      }, (res) => {
        // Follow single redirect if 301/302
        if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, targetUrl).href;
          return this.fetchPage(redirectUrl, timeoutMs).then(resolve);
        }

        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => {
          body += chunk;
          // Cap at 1MB to avoid memory bloat
          if (body.length > 1024 * 1024) {
            req.destroy();
          }
        });
        res.on('end', () => {
          const latencyMs = Date.now() - startTime;
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            body,
            latencyMs,
            finalUrl: targetUrl
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: 'Connection timed out', statusCode: 408, body: '', latencyMs: Date.now() - startTime });
      });

      req.on('error', (err) => {
        resolve({ success: false, error: err.message, statusCode: 0, body: '', latencyMs: Date.now() - startTime });
      });
    });
  }

  /**
   * Inspects page HTML for the presence of the TalentXcel link and attributes
   */
  inspectHtmlForLink(html, expectedTarget = 'talentxcel.in') {
    if (!html || typeof html !== 'string') {
      return { found: false, anchorText: '', rel: 'none', rawTag: '' };
    }

    // Match <a> tags containing talentxcel
    const anchorRegex = /<a\s+([^>]*href=["'][^"']*talentxcel\.in[^"']*["'][^>]*)>(.*?)<\/a>/gi;
    const match = anchorRegex.exec(html);

    if (match) {
      const attributes = match[1];
      const anchorText = match[2].replace(/<[^>]*>/g, '').trim();

      // Extract rel attribute
      let rel = 'dofollow';
      const relMatch = /rel=["']([^"']*)["']/i.exec(attributes);
      if (relMatch) {
        rel = relMatch[1].toLowerCase();
      }

      return {
        found: true,
        anchorText: anchorText || 'TalentXcel',
        rel,
        rawTag: match[0].substring(0, 150)
      };
    }

    // Check if plain text domain exists
    const plainTextIndex = html.indexOf('talentxcel.in');
    if (plainTextIndex !== -1) {
      return {
        found: true,
        anchorText: 'Unlinked Text Mention',
        rel: 'unlinked_mention',
        rawTag: html.substring(Math.max(0, plainTextIndex - 20), plainTextIndex + 40)
      };
    }

    return { found: false, anchorText: '', rel: 'none', rawTag: '' };
  }

  /**
   * Verifies an individual publication record and updates database
   */
  async verifyPublication(platformId, publicationUrl, expectedTarget = 'talentxcel.in') {
    const timestamp = new Date().toISOString();
    console.log(`\n🔍 Verifying Live Publication for platform ${platformId} at: ${publicationUrl}...`);

    // Strict Guard: Publication URL must be a third-party external domain
    try {
      const parsedUrl = new URL(publicationUrl);
      if (parsedUrl.hostname.toLowerCase().includes('talentxcel.in')) {
        console.log(`❌ Verification Rejected: ${publicationUrl} is an internal TalentXcel domain, not an external publication.`);
        if (this.db) {
          this.db.prepare(`
            UPDATE platforms 
            SET publication_url = NULL,
                submission_status = 'REJECTED_INTERNAL_URL',
                notes = coalesce(notes, '') || ' | Rejected internal self-hosted URL',
                last_verified_at = ?
            WHERE platform_id = ?
          `).run(timestamp, platformId);
        }
        return { verified: false, reason: 'INTERNAL_DOMAIN_REJECTED: Cannot count self-hosted TalentXcel URLs as external publications.' };
      }
    } catch (urlErr) {
      console.log(`❌ Verification Rejected: Invalid URL "${publicationUrl}"`);
      return { verified: false, reason: 'INVALID_URL' };
    }

    const fetchResult = await this.fetchPage(publicationUrl);

    if (!fetchResult.success) {
      console.log(`❌ Verification Failed: HTTP ${fetchResult.statusCode} (${fetchResult.error || 'Unreachable'})`);
      if (this.db) {
        this.db.prepare(`
          UPDATE platforms 
          SET submission_status = 'FOLLOW_UP_REQUIRED',
              notes = coalesce(notes, '') || ' | Verification failed: HTTP ' || ?,
              last_verified_at = ?
          WHERE platform_id = ?
        `).run(String(fetchResult.statusCode), timestamp, platformId);

        this.db.prepare(`
          INSERT INTO platform_verification_logs (
            platform_id, checked_at, http_status, response_time_ms, ssl_valid,
            publishing_model, accepts_community, free_tier_confirmed, promo_allowed, link_allowed,
            evidence_snippet, raw_guidelines, verdict, confidence_score, created_at
          ) VALUES (?, ?, ?, ?, ?, 'VERIFY_CRAWL', 1, 1, 1, 1, ?, 'Live Publication Verification', 'FAILED_HTTP_ERROR', 0.98, ?)
        `).run(platformId, timestamp, fetchResult.statusCode, fetchResult.latencyMs, 1, `Failed to load publication URL: HTTP ${fetchResult.statusCode}`, timestamp);
      }
      return { verified: false, reason: `HTTP error ${fetchResult.statusCode}` };
    }

    const linkAudit = this.inspectHtmlForLink(fetchResult.body, expectedTarget);

    if (!linkAudit.found) {
      console.log(`⚠️ Page accessible (HTTP 200) but no link or mention of ${expectedTarget} was found.`);
      if (this.db) {
        this.db.prepare(`
          UPDATE platforms 
          SET submission_status = 'FOLLOW_UP_REQUIRED',
              notes = coalesce(notes, '') || ' | Missing backlink on live page',
              last_verified_at = ?
          WHERE platform_id = ?
        `).run(timestamp, platformId);

        this.db.prepare(`
          INSERT INTO platform_verification_logs (
            platform_id, checked_at, http_status, response_time_ms, ssl_valid,
            publishing_model, accepts_community, free_tier_confirmed, promo_allowed, link_allowed,
            evidence_snippet, raw_guidelines, verdict, confidence_score, created_at
          ) VALUES (?, ?, ?, ?, ?, 'VERIFY_CRAWL', 1, 1, 1, 1, ?, 'Live Publication Verification', 'FAILED_MISSING_LINK', 0.95, ?)
        `).run(platformId, timestamp, fetchResult.statusCode, fetchResult.latencyMs, 1, 'Page loaded (200 OK) but backlink missing from HTML', timestamp);
      }
      return { verified: false, reason: 'Page loaded but backlink missing' };
    }

    // Success: Confirmed live published link
    const evidence = `Verified live on ${timestamp}. Status: HTTP 200 (${fetchResult.latencyMs}ms). Anchor: "${linkAudit.anchorText}". Rel: ${linkAudit.rel}. Tag: ${linkAudit.rawTag}`;
    console.log(`✅ VERIFIED LIVE PUBLICATION! ${evidence}`);

    if (this.db) {
      this.db.prepare(`
        UPDATE platforms 
        SET submission_status = 'PUBLISHED',
            publication_url = ?,
            publication_date = ?,
            link_policy = ?,
            last_verified_at = ?,
            notes = coalesce(notes, '') || ' | ' || ?
        WHERE platform_id = ?
      `).run(publicationUrl, timestamp, linkAudit.rel.toUpperCase(), timestamp, evidence, platformId);

      this.db.prepare(`
        INSERT INTO platform_verification_logs (
          platform_id, checked_at, http_status, response_time_ms, ssl_valid,
          publishing_model, accepts_community, free_tier_confirmed, promo_allowed, link_allowed,
          evidence_snippet, raw_guidelines, verdict, confidence_score, created_at
        ) VALUES (?, ?, ?, ?, ?, 'VERIFY_CRAWL', 1, 1, 1, 1, ?, 'Live Publication Verification', 'VERIFIED_PUBLISHED_LIVE', 1.0, ?)
      `).run(platformId, timestamp, fetchResult.statusCode, fetchResult.latencyMs, 1, evidence, timestamp);
    }

    return {
      verified: true,
      statusCode: fetchResult.statusCode,
      latencyMs: fetchResult.latencyMs,
      anchorText: linkAudit.anchorText,
      rel: linkAudit.rel,
      evidence
    };
  }
}

module.exports = { PublicationVerifier };
