// backlink-engine/src/acquisition/acquisitionEngine.cjs
// Acquisition Orchestrator & Playbook Engine for TalentXcel.
// Manages legitimate listings, institutional partnerships, editorial pitches,
// and campaign manifests with strict external validation.

const config = require('../config.cjs');
const { getDatabase } = require('../db/schema.cjs');
const fs = require('fs');
const path = require('path');

class AcquisitionEngine {
  constructor(db) {
    this.db = db || getDatabase();
  }

  /**
   * Registers a newly placed or published backlink into the `backlinks` table
   * for live verification by the crawler.
   * Strictly enforces external validation (rejects *.talentxcel.in).
   */
  registerPublishedBacklink({
    url,
    referringDomain,
    targetUrl = 'https://talentxcel.in',
    anchorText = 'TalentXcel',
    relType = 'follow',
    linkPlacement = 'CONTENT_EDITORIAL',
    notes = ''
  }) {
    if (!url || !referringDomain) {
      throw new Error('URL and referringDomain are required to register a backlink');
    }

    const cleanUrl = url.trim();
    const cleanDomain = referringDomain.trim().toLowerCase();

    // Invariant: Self-referential subdomains are NOT external backlinks
    if (cleanDomain.includes(config.CANONICAL_DOMAIN)) {
      console.warn(`[Acquisition Engine] Rejected registration of internal link on ${cleanDomain}`);
      return { success: false, reason: 'SELF_REFERENTIAL_INTERNAL_REJECTED' };
    }

    const now = new Date().toISOString();

    const insertStmt = this.db.prepare(`
      INSERT INTO backlinks (
        url, referring_domain, target_url, anchor_text,
        rel_type, link_placement, status, is_external,
        http_status_code, notes, created_at, updated_at
      ) VALUES (
        @url, @referring_domain, @target_url, @anchor_text,
        @rel_type, @link_placement, 'PENDING_VERIFICATION', 1,
        NULL, @notes, @created_at, @updated_at
      )
      ON CONFLICT(url) DO UPDATE SET
        target_url = excluded.target_url,
        anchor_text = excluded.anchor_text,
        rel_type = excluded.rel_type,
        updated_at = excluded.updated_at
    `);

    insertStmt.run({
      url: cleanUrl,
      referring_domain: cleanDomain,
      target_url: targetUrl,
      anchor_text: anchorText,
      rel_type: relType,
      link_placement: linkPlacement,
      notes,
      created_at: now,
      updated_at: now
    });

    return {
      success: true,
      url: cleanUrl,
      referringDomain: cleanDomain
    };
  }
}

module.exports = {
  AcquisitionEngine
};
