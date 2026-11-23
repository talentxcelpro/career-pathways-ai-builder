// distribution-engine/src/workflow/outreachEngine.cjs
// Ethical 1-to-1 Editorial Outreach & Relationship Tracking Engine
// Strictly prohibits bulk unsolicited spam. Generates concise, customized pitches using public editorial contacts.

class OutreachEngine {
  constructor(db) {
    this.db = db;
  }

  /**
   * Generates a tailored, individual 1-to-1 email draft for an editor
   */
  generateEditorialPitch(platform, concept, draft) {
    const editorName = platform.contact_name || 'Editor';
    const siteName = platform.platform_name || platform.canonical_domain;
    const topic = draft ? draft.title : concept.topic;
    const dest = draft ? draft.target_url : concept.talentxcel_destination;

    const subject = `Story concept / guest contribution for ${siteName}: ${topic}`;
    const body = `Hi ${editorName},

I follow ${siteName} and appreciate your thoughtful coverage of ${platform.niche || 'industry developments'}.

I am reaching out to propose an original, non-promotional contribution tailored to your readers:
"${topic}"

Key discussion points:
${concept.thesis_outline}

This is a fresh, data-backed perspective designed specifically for ${siteName}'s audience. We never recycle drafts or engage in keyword stuffing, and would gladly adhere to your editorial length and formatting guidelines.

For reference, our engineering and research background is rooted in the TalentXcel career ecosystem (${dest}).

Would you be open to reviewing a complete draft, or would you prefer a different angle on ${platform.niche}?

Warm regards,
Growth & Editorial Team | TalentXcel
editorial@talentxcel.in | https://talentxcel.in`;

    return {
      subject,
      body,
      editorName,
      contactEmail: platform.contact_email || `editor@${platform.canonical_domain}`
    };
  }

  /**
   * Stages outreach in the database for human review and individual dispatch
   */
  stageOutreach(platformId) {
    if (!this.db) return null;

    const platform = this.db.prepare('SELECT * FROM platforms WHERE platform_id = ?').get(platformId);
    if (!platform) return null;

    const draft = this.db.prepare('SELECT * FROM submission_drafts WHERE platform_id = ?').get(platformId);
    let concept = null;
    if (draft && draft.concept_id) {
      concept = this.db.prepare('SELECT * FROM content_concepts WHERE concept_id = ?').get(draft.concept_id);
    } else {
      concept = this.db.prepare('SELECT * FROM content_concepts ORDER BY RANDOM() LIMIT 1').get();
    }

    const pitch = this.generateEditorialPitch(platform, concept, draft);
    const now = new Date().toISOString();
    
    // Follow-up date: 7 days later
    const followUp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const stmt = this.db.prepare(`
      INSERT INTO editorial_outreach (
        platform_id, contact_name, contact_email, contact_source,
        subject, body, outreach_date, reply_received, status,
        follow_up_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'OUTREACH_STAGED', ?, ?, ?)
    `);

    stmt.run(
      platform.platform_id,
      pitch.editorName,
      pitch.contactEmail,
      platform.contact_url || 'Public Editorial Masthead',
      pitch.subject,
      pitch.body,
      now,
      followUp,
      now,
      now
    );

    return pitch;
  }

  /**
   * Stages outreach for all approved platforms that accept email pitches
   */
  stageAllEligibleOutreach(limit = 100) {
    if (!this.db) return 0;

    const platforms = this.db.prepare(`
      SELECT * FROM platforms 
      WHERE (submission_method = 'EMAIL' OR contact_email IS NOT NULL)
        AND overall_score >= 70
        AND platform_id NOT IN (SELECT platform_id FROM editorial_outreach)
      LIMIT ?
    `).all(limit);

    let stagedCount = 0;
    for (const p of platforms) {
      this.stageOutreach(p.platform_id);
      stagedCount++;
    }

    return stagedCount;
  }
}

module.exports = { OutreachEngine };
