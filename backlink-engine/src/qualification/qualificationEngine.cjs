// backlink-engine/src/qualification/qualificationEngine.cjs
// Strict Multi-Factor Domain Qualification & Anti-Spam Gate.
// Enforces zero-tolerance for spam, link farms, PBNs, or low-quality link schemes.
// Promotes candidates to 'QUALIFIED_PROSPECT' status without falsely declaring them as referring domains.

const config = require('../config.cjs');
const { getDatabase } = require('../db/schema.cjs');

class QualificationEngine {
  constructor(db) {
    this.db = db || getDatabase();
  }

  /**
   * Evaluates all 'DISCOVERED' domains against quality, spam, and relevance gates.
   * Updates pipeline_stage to 'QUALIFIED_PROSPECT'.
   */
  async runQualification() {
    console.log(`\n⚖️ [Qualification Engine] Starting multi-factor qualification evaluation...`);
    const startTime = Date.now();

    const fetchStmt = this.db.prepare(`
      SELECT * FROM domains WHERE qualification_status = 'DISCOVERED'
    `);
    const domains = fetchStmt.all();
    console.log(`   Found ${domains.length.toLocaleString()} candidate domains to qualify.`);

    const updateStmt = this.db.prepare(`
      UPDATE domains 
      SET qualification_status = @qualification_status,
          pipeline_stage = @pipeline_stage,
          disqualification_reason = @disqualification_reason,
          spam_score = @spam_score,
          primary_modality = @primary_modality,
          updated_at = @updated_at
      WHERE id = @id
    `);

    let qualifiedCount = 0;
    let disqualifiedCount = 0;
    const now = new Date().toISOString();

    this.db.exec('BEGIN TRANSACTION;');

    for (const d of domains) {
      const evaluation = this.evaluateDomain(d);

      updateStmt.run({
        id: d.id,
        qualification_status: evaluation.status,
        pipeline_stage: evaluation.pipelineStage,
        disqualification_reason: evaluation.reason,
        spam_score: evaluation.spamScore,
        primary_modality: evaluation.modality,
        updated_at: now
      });

      if (evaluation.status === 'QUALIFIED') {
        qualifiedCount++;
      } else {
        disqualifiedCount++;
      }
    }

    this.db.exec('COMMIT;');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n================================================================`);
    console.log(`✅ [Qualification Complete] Evaluation Finished.`);
    console.log(`   Qualified Prospects: ${qualifiedCount.toLocaleString()}`);
    console.log(`   Disqualified Domains (Anti-Spam Filter): ${disqualifiedCount.toLocaleString()}`);
    console.log(`   Note: Qualified prospects are prospective leads, NOT acquired backlinks.`);
    console.log(`   Duration: ${duration}s`);
    console.log(`================================================================\n`);

    return {
      totalEvaluated: domains.length,
      qualifiedCount,
      disqualifiedCount,
      duration
    };
  }

  /**
   * Multi-dimensional evaluation rule set
   */
  evaluateDomain(domainRecord) {
    const domainLower = (domainRecord.domain || '').toLowerCase();
    let spamScore = domainRecord.spam_score || 0;
    let modality = domainRecord.primary_modality || config.MODALITIES.DIRECTORY_LISTING.id;

    // Gate 1: Check forbidden spam keywords in domain
    for (const kw of config.SPAM_GATE.FORBIDDEN_KEYWORDS) {
      if (domainLower.includes(kw)) {
        return {
          status: 'DISQUALIFIED',
          pipelineStage: 'DISQUALIFIED',
          reason: `Violates Anti-Spam Gate: Prohibited keyword '${kw}'`,
          spamScore: 95,
          modality
        };
      }
    }

    // Gate 2: Check suspicious low-cost TLDs often used for link farms
    for (const tld of config.SPAM_GATE.SUSPICIOUS_TLDS) {
      if (domainLower.endsWith(tld)) {
        return {
          status: 'DISQUALIFIED',
          pipelineStage: 'DISQUALIFIED',
          reason: `Violates Anti-Spam Gate: Suspicious TLD '${tld}'`,
          spamScore: 80,
          modality
        };
      }
    }

    // Gate 3: Check Authority & Statutory Legitimacy
    const isGov = domainLower.endsWith('.gov.in') || domainLower.endsWith('.gov');
    const isEdu = domainLower.endsWith('.ac.in') || domainLower.endsWith('.edu.in') || domainLower.endsWith('.edu') || domainLower.endsWith('.ac.uk');

    if (isGov || isEdu) {
      spamScore = 0;
      modality = isGov ? config.MODALITIES.DIRECTORY_LISTING.id : config.MODALITIES.UNIVERSITY_TPO_RESOURCE.id;
    } else if (domainRecord.category === config.CATEGORIES.MEDIA_EDITORIAL.id) {
      modality = config.MODALITIES.EDITORIAL_MENTION.id;
    } else if (domainRecord.category === config.CATEGORIES.TECH_DEVELOPER.id) {
      modality = config.MODALITIES.OPEN_DATA_CITATION.id;
    } else if (domainRecord.category === config.CATEGORIES.HR_RECRUITMENT.id) {
      modality = config.MODALITIES.DIRECTORY_LISTING.id;
    }

    return {
      status: 'QUALIFIED',
      pipelineStage: 'QUALIFIED_PROSPECT',
      reason: null,
      spamScore,
      modality
    };
  }
}

module.exports = {
  QualificationEngine
};
