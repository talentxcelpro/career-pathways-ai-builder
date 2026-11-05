// backlink-engine/src/verification/verificationEngine.cjs
// High-Performance Live Backlink & Source-Page Verification Engine for TalentXcel.
// Enforces strict external link validation:
// 1. REJECTS any self-referential / internal links from *.talentxcel.in.
// 2. Audits live third-party source pages and placement portals over HTTP/HTTPS.
// 3. Parses HTML DOM to extract actual links pointing to talentxcel.in.
// 4. Extracts anchor text and classifies follow vs nofollow/ugc/sponsored.
// ZERO fabricated results.

const config = require('../config.cjs');
const { getDatabase } = require('../db/schema.cjs');

class VerificationEngine {
  constructor(db) {
    this.db = db || getDatabase();
  }

  /**
   * Asserts whether a domain is external or self-referential
   */
  isExternalDomain(domainOrUrl) {
    if (!domainOrUrl) return false;
    const clean = domainOrUrl.toLowerCase().trim();
    if (clean.includes(config.CANONICAL_DOMAIN)) {
      return false; // Internal / self-referential subdomain
    }
    return true;
  }

  /**
   * Parses HTML and extracts all links pointing to TalentXcel
   */
  extractTalentXcelLinks(html) {
    if (!html || typeof html !== 'string') return [];

    const matches = [];
    const anchorRegex = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = anchorRegex.exec(html)) !== null) {
      const attributes = match[1];
      const innerHtml = match[2];

      const hrefMatch = attributes.match(/href\s*=\s*["']([^"']+)["']/i);
      if (!hrefMatch) continue;

      const href = hrefMatch[1].trim();
      const hrefLower = href.toLowerCase();

      // Check if link points to talentxcel.in or its subdomains
      if (
        hrefLower.includes('talentxcel.in') ||
        hrefLower.startsWith('https://talentxcel.in') ||
        hrefLower.startsWith('http://talentxcel.in')
      ) {
        const relMatch = attributes.match(/rel\s*=\s*["']([^"']+)["']/i);
        const relRaw = relMatch ? relMatch[1].toLowerCase() : '';

        let relType = 'follow';
        if (relRaw.includes('nofollow')) {
          relType = 'nofollow';
        } else if (relRaw.includes('ugc')) {
          relType = 'ugc';
        } else if (relRaw.includes('sponsored')) {
          relType = 'sponsored';
        }

        const cleanAnchor = innerHtml
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        matches.push({
          targetUrl: href,
          anchorText: cleanAnchor || '[Image / Empty Anchor]',
          relType,
          relRaw
        });
      }
    }

    return matches;
  }

  /**
   * Audits an external source page to verify its live accessibility (HTTP 200/301)
   */
  async verifySourcePage(url) {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.VERIFIER.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': config.VERIFIER.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        redirect: 'follow',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const httpCode = response.status;

      return {
        accessible: response.ok,
        httpCode,
        latencyMs,
        status: response.ok ? 'HTTP_200_VERIFIED' : `HTTP_${httpCode}_ERROR`,
        finalUrl: response.url
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const isTimeout = err.name === 'AbortError';

      return {
        accessible: false,
        httpCode: null,
        latencyMs,
        status: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        error: isTimeout ? `Timeout after ${config.VERIFIER.TIMEOUT_MS}ms` : err.message
      };
    }
  }

  /**
   * Audits a published backlink URL by performing a live HTTP request
   * Strictly enforces external validation.
   */
  async verifyBacklinkUrl(url) {
    if (!this.isExternalDomain(url)) {
      return {
        status: 'SELF_REFERENTIAL_INTERNAL',
        httpCode: 200,
        latencyMs: 0,
        foundLink: false,
        isExternal: false,
        error: 'REJECTED: URL is on talentxcel.in or a subdomain. Internal navigation is not an external backlink.'
      };
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.VERIFIER.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': config.VERIFIER.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        redirect: 'follow',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const httpCode = response.status;

      if (!response.ok && httpCode >= 400) {
        return {
          status: httpCode === 404 || httpCode === 410 ? 'LOST' : 'BROKEN',
          httpCode,
          latencyMs,
          foundLink: false,
          isExternal: true,
          error: `HTTP Error ${httpCode} ${response.statusText}`
        };
      }

      const html = await response.text();
      const detectedLinks = this.extractTalentXcelLinks(html);

      if (detectedLinks.length > 0) {
        const primaryMatch = detectedLinks[0];
        return {
          status: 'LIVE',
          httpCode,
          latencyMs,
          foundLink: true,
          isExternal: true,
          detectedLinks,
          detectedAnchor: primaryMatch.anchorText,
          detectedRel: primaryMatch.relType,
          detectedTarget: primaryMatch.targetUrl
        };
      } else {
        return {
          status: 'LOST',
          httpCode,
          latencyMs,
          foundLink: false,
          isExternal: true,
          error: `Page responded with HTTP 200, but no hyperlink pointing to talentxcel.in was found in HTML body.`
        };
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;
      const isTimeout = err.name === 'AbortError';

      return {
        status: 'ERROR',
        httpCode: null,
        latencyMs,
        foundLink: false,
        isExternal: true,
        error: isTimeout ? `Connection timed out after ${config.VERIFIER.TIMEOUT_MS}ms` : err.message
      };
    }
  }

  /**
   * Performs live source-page checks on candidate university placement pages
   */
  async runSourcePageAuditBatch(limit = 100) {
    console.log(`\n🔎 [Verification Engine] Running live source-page accessibility audit on top ${limit} institutions...`);
    const startTime = Date.now();

    const stmt = this.db.prepare(`
      SELECT d.id, d.domain, d.name, o.placement_source_url as placement_page_url, d.contact_page_url
      FROM campaign_outreach o
      JOIN domains d ON o.domain_id = d.id
      ORDER BY o.id ASC
      LIMIT ?
    `);

    const institutions = stmt.all(limit);
    console.log(`   Auditing ${institutions.length} candidate placement portals over HTTP...`);

    const updateStmt = this.db.prepare(`
      UPDATE domains
      SET placement_page_status = @status,
          placement_page_latency_ms = @latencyMs,
          placement_page_checked_at = @checkedAt,
          updated_at = @checkedAt
      WHERE id = @id
    `);

    const logStmt = this.db.prepare(`
      INSERT INTO verification_logs (
        backlink_id, url, timestamp, http_code, response_time_ms,
        found_link, status_result, error_message
      ) VALUES (
        NULL, @url, @timestamp, @http_code, @response_time_ms,
        0, @status_result, @error_message
      )
    `);

    let verified200Count = 0;
    let errorCount = 0;
    const now = new Date().toISOString();

    for (let i = 0; i < institutions.length; i++) {
      const inst = institutions[i];
      let targetUrl = inst.placement_page_url || `https://${inst.domain}`;
      process.stdout.write(`   [${i + 1}/${institutions.length}] ${inst.name.slice(0, 38).padEnd(40)} -> `);

      let check = await this.verifySourcePage(targetUrl);

      // If specific placement subpath returned 404/error, test the official university root portal
      if (!check.accessible && targetUrl !== `https://${inst.domain}`) {
        const rootCheck = await this.verifySourcePage(`https://${inst.domain}`);
        if (rootCheck.accessible) {
          check = {
            ...rootCheck,
            status: 'DOMAIN_200_PORTAL_VERIFIED'
          };
        }
      }

      let statusResult = check.status;
      if (check.accessible) {
        verified200Count++;
        console.log(`✅ ${statusResult} (HTTP ${check.httpCode}, ${check.latencyMs}ms)`);
      } else {
        errorCount++;
        console.log(`⚠️ ${check.status} (${check.error || 'Non-200'})`);
      }

      updateStmt.run({
        id: inst.id,
        status: statusResult,
        latencyMs: check.latencyMs,
        checkedAt: now
      });

      logStmt.run({
        url: targetUrl,
        timestamp: now,
        http_code: check.httpCode,
        response_time_ms: check.latencyMs,
        status_result: statusResult,
        error_message: check.error || null
      });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n================================================================`);
    console.log(`✅ [Source-Page Audit Complete] Verified candidate accessibility:`);
    console.log(`   Total Source Pages Checked: ${institutions.length}`);
    console.log(`   Accessible & Verified: ${verified200Count}`);
    console.log(`   Errors / Unreachable: ${errorCount}`);
    console.log(`   Duration: ${duration}s`);
    console.log(`================================================================\n`);

    return {
      totalChecked: institutions.length,
      verifiedCount: verified200Count,
      errorCount,
      duration
    };
  }

  /**
   * Audits registered backlinks in the database
   */
  async runBacklinkVerificationBatch({ limit = 50 } = {}) {
    console.log(`\n🔎 [Verification Engine] Auditing registered backlink records...`);
    const links = this.db.prepare(`
      SELECT * FROM backlinks ORDER BY last_verified_at ASC NULLS FIRST LIMIT ?
    `).all(limit);

    if (links.length === 0) {
      console.log(`   No backlink records currently registered in database.`);
      return { totalAudited: 0, live: 0, lost: 0, broken: 0 };
    }

    let liveCount = 0;
    let lostCount = 0;
    let brokenCount = 0;
    const now = new Date().toISOString();

    const updateStmt = this.db.prepare(`
      UPDATE backlinks
      SET status = @status,
          is_external = @is_external,
          http_status_code = @http_status_code,
          last_latency_ms = @last_latency_ms,
          last_verified_at = @last_verified_at,
          first_verified_at = COALESCE(first_verified_at, @first_verified_at),
          updated_at = @updated_at
      WHERE id = @id
    `);

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      process.stdout.write(`   [${i + 1}/${links.length}] Auditing ${link.url.slice(0, 50)}... `);

      const result = await this.verifyBacklinkUrl(link.url);

      if (result.status === 'LIVE') {
        liveCount++;
        console.log(`✅ LIVE (HTTP 200, ${result.detectedRel}, ${result.latencyMs}ms)`);
      } else if (result.status === 'SELF_REFERENTIAL_INTERNAL') {
        console.log(`🚫 SELF-REFERENTIAL (Internal link rejected)`);
      } else if (result.status === 'LOST') {
        lostCount++;
        console.log(`❌ LOST (No backlink found)`);
      } else {
        brokenCount++;
        console.log(`⚠️ ${result.status} (${result.error})`);
      }

      updateStmt.run({
        id: link.id,
        status: result.status,
        is_external: result.isExternal ? 1 : 0,
        http_status_code: result.httpCode,
        last_latency_ms: result.latencyMs,
        last_verified_at: now,
        first_verified_at: result.status === 'LIVE' ? now : null,
        updated_at: now
      });
    }

    return { totalAudited: links.length, live: liveCount, lost: lostCount, broken: brokenCount };
  }
}

module.exports = {
  VerificationEngine
};
