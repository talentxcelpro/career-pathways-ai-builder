const { detectCapabilities } = require('./capabilities.cjs');
const { evaluateOpportunity } = require('./policy.cjs');
function now() { return new Date().toISOString(); }
function score(domain = {}, capability = {}) {
  const category = String(domain.category || '').toLowerCase();
  const relevance = ['education', 'hr', 'recruit', 'career', 'startup', 'tech', 'media'].some(x => category.includes(x)) ? 80 : 50;
  const quality = Math.max(0, Math.min(100, 70 - Number(domain.spam_score || 0) + (domain.authority_tier === 'TIER_1' ? 20 : 0)));
  return { relevance, quality, notes: { category: domain.category || null, automation: capability.automationPermitted } };
}
function seedQualifiedDomains(db) {
  const timestamp = now();
  db.exec(`BEGIN;
    INSERT OR IGNORE INTO autonomous_opportunities(domain_id,root_domain,source_url,target_url,category,relevance_score,quality_score,status,policy_decision,policy_evidence_json,created_at,updated_at)
      SELECT d.id,d.root_domain,COALESCE(d.contact_page_url,d.placement_page_url), 'https://talentxcel.in', d.category,
        CASE WHEN lower(category) LIKE '%education%' OR lower(category) LIKE '%recruit%' OR lower(category) LIKE '%hr%' OR lower(category) LIKE '%tech%' OR lower(category) LIKE '%startup%' THEN 80 ELSE 50 END,
        MAX(0, MIN(100, 70 - COALESCE(d.spam_score,0))), 'QUALIFIED','REVIEW','{}','${timestamp}','${timestamp}'
      FROM domains d WHERE d.qualification_status='QUALIFIED'
      AND NOT EXISTS (SELECT 1 FROM autonomous_opportunities o WHERE o.domain_id=d.id);
    UPDATE autonomous_opportunities SET status='REJECTED',policy_decision='DUPLICATE_OPPORTUNITY',updated_at='${timestamp}'
      WHERE id IN (SELECT id FROM (SELECT id,row_number() OVER(PARTITION BY domain_id ORDER BY id) AS rn FROM autonomous_opportunities WHERE domain_id IS NOT NULL) WHERE rn>1);
    UPDATE autonomous_jobs SET status='CANCELLED',last_error='DUPLICATE_OPPORTUNITY',updated_at='${timestamp}'
      WHERE job_type='CAPABILITY_DISCOVERY' AND status IN ('QUEUED','LEASED')
      AND idempotency_key IN (SELECT 'capability:' || id FROM autonomous_opportunities WHERE policy_decision='DUPLICATE_OPPORTUNITY');
    INSERT OR IGNORE INTO autonomous_jobs(job_type,payload_json,idempotency_key,status,available_at,max_attempts,created_at,updated_at)
      SELECT 'CAPABILITY_DISCOVERY', json_object('opportunityId',id,'url',source_url), 'capability:' || id, 'QUEUED', '${timestamp}', 3, '${timestamp}', '${timestamp}'
      FROM autonomous_opportunities WHERE status='QUALIFIED';
    COMMIT;`);
  const qualifiedSeeded = db.prepare("SELECT count(1) n FROM autonomous_opportunities WHERE domain_id IS NOT NULL AND status='QUALIFIED'").get().n;
  const queued = db.prepare("SELECT count(1) n FROM autonomous_jobs WHERE job_type='CAPABILITY_DISCOVERY' AND status='QUEUED'").get().n;
  const duplicatesRejected = db.prepare("SELECT count(1) n FROM autonomous_opportunities WHERE policy_decision='DUPLICATE_OPPORTUNITY'").get().n;
  return { qualifiedSeeded, queued, duplicatesRejected };
}
function recordCapability(db, opportunity, detectionInput) {
  const cap = detectCapabilities(detectionInput); const decision = evaluateOpportunity({ ...cap, formSubmissionPermitted: Boolean(cap.submissionUrl) });
  const scores = score(opportunity, cap); const timestamp = now();
  db.prepare(`INSERT INTO autonomous_capabilities(opportunity_id,submission_url,api_available,registration_required,automation_permitted,editorial_required,payment_required,captcha_detected,login_required,expected_rel,confidence,evidence_json,discovered_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(opportunity_id) DO UPDATE SET submission_url=excluded.submission_url,api_available=excluded.api_available,registration_required=excluded.registration_required,automation_permitted=excluded.automation_permitted,editorial_required=excluded.editorial_required,payment_required=excluded.payment_required,captcha_detected=excluded.captcha_detected,login_required=excluded.login_required,expected_rel=excluded.expected_rel,confidence=excluded.confidence,evidence_json=excluded.evidence_json,discovered_at=excluded.discovered_at`)
    .run(opportunity.id,cap.submissionUrl,Number(cap.apiAvailable),Number(cap.registrationRequired),cap.automationPermitted === null ? null : Number(cap.automationPermitted),Number(cap.editorialRequired),Number(cap.paymentRequired),Number(cap.captchaDetected),Number(cap.loginRequired),cap.expectedRel,cap.confidence,JSON.stringify(cap.evidence),timestamp);
  const next = decision.decision === 'ESCALATE_HUMAN' ? 'PENDING_APPROVAL' : 'READY';
  db.prepare('UPDATE autonomous_opportunities SET relevance_score=?,quality_score=?,status=?,policy_decision=?,policy_evidence_json=?,updated_at=? WHERE id=?').run(scores.relevance,scores.quality,next,decision.decision,JSON.stringify({ reasons: decision.reasons, evidence: decision.evidence }),timestamp,opportunity.id);
  db.prepare('INSERT INTO autonomous_policy_decisions(opportunity_id,decision,reasons_json,evidence_json,created_at) VALUES(?,?,?,?,?)').run(opportunity.id,decision.decision,JSON.stringify(decision.reasons),JSON.stringify(decision.evidence),timestamp);
  return { capability: cap, policy: decision, status: next, scores };
}
module.exports = { score, seedQualifiedDomains, recordCapability };
