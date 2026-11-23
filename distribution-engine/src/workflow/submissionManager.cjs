// distribution-engine/src/workflow/submissionManager.cjs
// Manages Submission Staging, Profile Descriptions & Platform-Content Mapping

const { WorkflowStateMachine } = require('./stateMachine.cjs');

class SubmissionManager {
  constructor(db) {
    this.db = db;
    this.stateMachine = new WorkflowStateMachine(db);
  }

  /**
   * Maps platform type to the best-fitting content variation format
   */
  mapPlatformToFormat(platformType) {
    const type = (platformType || '').toUpperCase();
    if (type.includes('DIRECTORY') || type.includes('RESOURCE')) return 'RESOURCE_LISTING';
    if (type.includes('FORUM') || type.includes('COMMUNITY_FORUM')) return 'FORUM_DISCUSSION';
    if (type.includes('STARTUP') || type.includes('ENTREPRENEUR')) return 'STARTUP_PUB';
    if (type.includes('SMALL_BUSINESS') || type.includes('LOCAL')) return 'SMALL_BIZ';
    if (type.includes('HR') || type.includes('RECRUITMENT')) return 'HR_COMMUNITY';
    if (type.includes('STUDENT') || type.includes('COLLEGE')) return 'STUDENT_COMMUNITY';
    if (type.includes('NEWSLETTER')) return 'NEWSLETTER_PITCH';
    if (type.includes('SOCIAL') || type.includes('BLOGGING')) return 'SHORT_SOCIAL';
    if (type.includes('CAREER') || type.includes('RESUME') || type.includes('JOB')) return 'CAREER_BLOG';
    return 'CAREER_BLOG';
  }

  /**
   * Prepares and stages a submission draft for an approved platform
   */
  stageSubmission(platform) {
    if (!this.db) return null;

    const formatId = this.mapPlatformToFormat(platform.platform_type);

    // Find the best concept matching the platform niche
    const conceptStmt = this.db.prepare(`
      SELECT * FROM content_concepts 
      ORDER BY RANDOM() 
      LIMIT 1
    `);
    const concept = conceptStmt.get();
    if (!concept) return null;

    // Fetch matching variation
    const variationStmt = this.db.prepare(`
      SELECT * FROM content_variations 
      WHERE concept_id = ? AND format_id = ?
    `);
    let variation = variationStmt.get(concept.concept_id, formatId);

    // Fallback if specific format not found for this concept
    if (!variation) {
      variation = this.db.prepare('SELECT * FROM content_variations WHERE concept_id = ? LIMIT 1').get(concept.concept_id) ||
                  this.db.prepare('SELECT * FROM content_variations WHERE format_id = ? LIMIT 1').get(formatId) ||
                  this.db.prepare('SELECT * FROM content_variations ORDER BY RANDOM() LIMIT 1').get();
    }

    const draftId = `DRAFT_${platform.platform_id}_${Date.now()}`;
    const now = new Date().toISOString();

    const title = variation ? variation.headline : (concept.topic || 'Career Optimization Guide');
    const contentBody = variation ? variation.body_text : (concept.thesis_outline || 'Comprehensive career guide and analysis.');
    const targetUrl = variation ? variation.destination_url : (concept.talentxcel_destination || config.ECOSYSTEM.PROPERTIES.HOME.url);
    const anchorText = 'TalentXcel';
    const bio = 'TalentXcel is a modern, transparent career and credential verification ecosystem offering free ATS resume analysis, verified Career Passports, and talent discovery.';

    // Insert submission draft
    const insertDraft = this.db.prepare(`
      INSERT OR REPLACE INTO submission_drafts (
        draft_id, platform_id, concept_id, variation_id, submission_type,
        title, content_body, bio_or_description, target_url, anchor_text,
        staging_status, prepared_at, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDraft.run(
      draftId,
      platform.platform_id,
      concept.concept_id,
      variation ? variation.variation_id : null,
      formatId === 'RESOURCE_LISTING' ? 'DIRECTORY_PROFILE' : (formatId === 'FORUM_DISCUSSION' ? 'COMMUNITY_POST' : 'ARTICLE'),
      title,
      contentBody,
      bio,
      targetUrl,
      anchorText,
      'READY_FOR_SUBMISSION',
      now,
      `Auto-staged under format ${formatId}`
    );

    // Update platform state machine
    try {
      this.stateMachine.transition(platform.platform_id, 'CONTENT_READY', { notes: 'Content selected & matched' });
      this.stateMachine.transition(platform.platform_id, 'SUBMISSION_READY', { notes: 'Draft staged and ready for operator dispatch' });
    } catch {
      // Direct update if already in later state
      this.db.prepare("UPDATE platforms SET submission_status = 'SUBMISSION_READY' WHERE platform_id = ?").run(platform.platform_id);
    }

    return {
      draftId,
      platformId: platform.platform_id,
      formatId,
      title,
      targetUrl,
      submissionMethod: platform.submission_method
    };
  }

  /**
   * Stages submission drafts for all approved platforms
   */
  stageBatchSubmissions(limit = 200) {
    if (!this.db) return 0;

    const platforms = this.db.prepare(`
      SELECT * FROM platforms 
      WHERE (submission_status = 'APPROVED' OR submission_status = 'VERIFIED_FREE') 
        AND overall_score >= 70
      LIMIT ?
    `).all(limit);

    let count = 0;
    for (const p of platforms) {
      this.stageSubmission(p);
      count++;
    }

    return count;
  }
}

module.exports = { SubmissionManager };
