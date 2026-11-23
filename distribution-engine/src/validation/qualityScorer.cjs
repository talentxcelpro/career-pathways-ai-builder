// distribution-engine/src/validation/qualityScorer.cjs
// 100-Point Algorithmic Quality Scoring Model for TalentXcel Distribution
// Evaluates Relevance (30), Activity (20), Editorial Quality (20), Free Opportunity (15),
// Audience Relevance (10), and Technical Accessibility (5), plus severe anti-spam penalties.

class QualityScorer {
  /**
   * Computes granular quality breakdown and final overall score
   * @param {Object} factors - platform characteristics and inspection data
   * @returns {Object} detailed score report
   */
  scorePlatform(factors) {
    const scores = {
      relevance: 0,
      activity: 0,
      editorialQuality: 0,
      freeSubmission: 0,
      audienceRelevance: 0,
      technicalAccessibility: 0,
      penalties: 0,
      penaltyReasons: []
    };

    // 1. Relevance Score (Max 30)
    const niche = (factors.niche || '').toLowerCase();
    const category = (factors.category || '').toLowerCase();
    const type = (factors.platform_type || '').toLowerCase();

    if (/career|resume|job|hiring|recruitment|talent|ats|placement/.test(niche) ||
        /career|resume|job|hiring|recruitment|talent/.test(category)) {
      scores.relevance = 30;
    } else if (/startup|founder|entrepreneur|saas|hr technology/.test(niche) ||
               /startup|founder|entrepreneur|saas/.test(category) ||
               /startup|founder/.test(type)) {
      scores.relevance = 26;
    } else if (/technology|software|developer|coding|productivity/.test(niche) ||
               /technology|developer/.test(category)) {
      scores.relevance = 22;
    } else if (/small business|regional news|local business/.test(niche) ||
               /small business|business publication/.test(category)) {
      scores.relevance = 18;
    } else {
      scores.relevance = 10;
    }

    // 2. Platform Activity Score (Max 20)
    const activityLevel = factors.activity_level || 'ACTIVE_REGULAR'; // 'HIGH', 'ACTIVE_REGULAR', 'MODERATE', 'STALE'
    if (activityLevel === 'HIGH') {
      scores.activity = 20;
    } else if (activityLevel === 'ACTIVE_REGULAR') {
      scores.activity = 17;
    } else if (activityLevel === 'MODERATE') {
      scores.activity = 12;
    } else if (activityLevel === 'STALE') {
      scores.activity = 4;
    } else {
      scores.activity = 8;
    }

    // 3. Editorial Quality Score (Max 20)
    const editorialTier = factors.editorial_tier || 'CURATED'; // 'HIGH_STANDARDS', 'CURATED', 'COMMUNITY_MODERATED', 'UNMODERATED'
    if (editorialTier === 'HIGH_STANDARDS') {
      scores.editorialQuality = 20;
    } else if (editorialTier === 'CURATED') {
      scores.editorialQuality = 16;
    } else if (editorialTier === 'COMMUNITY_MODERATED') {
      scores.editorialQuality = 13;
    } else if (editorialTier === 'UNMODERATED') {
      scores.editorialQuality = 4;
    } else {
      scores.editorialQuality = 10;
    }

    // 4. Free Submission Opportunity (Max 15)
    if (factors.free_verified === 1 || factors.free_submission === 1) {
      if (factors.has_public_submission_form) {
        scores.freeSubmission = 15;
      } else if (factors.has_editorial_contact) {
        scores.freeSubmission = 13;
      } else {
        scores.freeSubmission = 11;
      }
    } else {
      scores.freeSubmission = 0; // Paid-only or undisclosed
    }

    // 5. Audience Relevance (Max 10)
    if (/job seeker|student|developer|founder|candidate|recruiter|hr/.test((factors.target_audience || '').toLowerCase())) {
      scores.audienceRelevance = 10;
    } else if (/entrepreneur|small business owner|professional/.test((factors.target_audience || '').toLowerCase())) {
      scores.audienceRelevance = 8;
    } else {
      scores.audienceRelevance = 5;
    }

    // 6. Technical Accessibility (Max 5)
    if (factors.http_status === 200 && (factors.response_time_ms || 300) < 1500 && factors.ssl_valid !== false) {
      scores.technicalAccessibility = 5;
    } else if (factors.http_status === 200) {
      scores.technicalAccessibility = 3;
    } else {
      scores.technicalAccessibility = 0;
    }

    // 7. Penalties
    if (factors.is_spam_content) {
      scores.penalties += 35;
      scores.penaltyReasons.push('Spam content or link farm pattern detected');
    }
    if (factors.has_excessive_outbound_links) {
      scores.penalties += 25;
      scores.penaltyReasons.push('Excessive unrelated outbound commercial links');
    }
    if (factors.is_low_quality_directory) {
      scores.penalties += 25;
      scores.penaltyReasons.push('Low-quality automated directory structure');
    }
    if (factors.is_pbn) {
      scores.penalties += 45;
      scores.penaltyReasons.push('Private Blog Network (PBN) footprint detected');
    }
    if (factors.has_deceptive_practices) {
      scores.penalties += 50;
      scores.penaltyReasons.push('Deceptive or manipulative practices detected');
    }

    const rawTotal = scores.relevance +
                     scores.activity +
                     scores.editorialQuality +
                     scores.freeSubmission +
                     scores.audienceRelevance +
                     scores.technicalAccessibility;

    const overallScore = Math.max(0, Math.min(100, Math.round(rawTotal - scores.penalties)));
    const passesQualityGate = overallScore >= 70 && scores.penalties === 0;

    return {
      scores,
      overallScore,
      passesQualityGate,
      priorityTier: overallScore >= 85 ? 'TIER_1_PREMIER' : (overallScore >= 70 ? 'TIER_2_QUALIFIED' : (overallScore >= 50 ? 'TIER_3_MARGINAL' : 'TIER_4_REJECTED'))
    };
  }
}

module.exports = { QualityScorer };
