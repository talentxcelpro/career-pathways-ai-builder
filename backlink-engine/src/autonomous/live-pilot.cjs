const fs = require('fs');
const path = require('path');
const config = require('../config.cjs');
const { recordCapability } = require('./intelligence.cjs');
const { classifyFailure, adapterFor } = require('./adapters.cjs');
function now() { return new Date().toISOString(); }
function audit(db, eventType, entityId, event) { db.prepare('INSERT INTO autonomous_audit_log(event_type,entity_type,entity_id,event_json,created_at) VALUES(?,?,?,?,?)').run(eventType,'live_pilot',String(entityId),JSON.stringify(event),now()); }
function restrictionFor(profile) {
  const text = `${profile.verification_requirements || ''} ${profile.notes || ''}`.toLowerCase();
  if (profile.platform_id === 'producthunt') return { eligibility:'ESCALATED', failureClass:'CAPTCHA_REQUIRED', reason:'Current submission page presents a bot-security verification challenge.' };
  if (profile.platform_id === 'crunchbase') return { eligibility:'ESCALATED', failureClass:'AUTH_REQUIRED', reason:'Current profile creation flow requires login or registration.' };
  if (profile.platform_id === 'g2') return { eligibility:'ESCALATED', failureClass:'AUTH_REQUIRED', reason:'Current listing flow requires LinkedIn, Google, or validated business-email authorization.' };
  if (profile.platform_id === 'softwaresuggest') return { eligibility:'FAILED', failureClass:'STALE_SUBMISSION_URL', reason:'Stored submission URL returned a public 404; the current vendor route exposes registration and vendor login.' };
  if (/identity|linkedin|corporate email|business email|certificate|pan|phone|address|founder/.test(text)) return { eligibility:'ESCALATED', failureClass:'CREDENTIALS_UNVERIFIED', reason:'Listing requires identity, business contact, or company credentials that are not verified in this run.' };
  return { eligibility:'REJECTED', failureClass:'PERMISSION_UNVERIFIED', reason:'No independently verified automation permission is available.' };
}
function ensureOpportunity(db, profile) {
  const existing = db.prepare('SELECT * FROM autonomous_opportunities WHERE root_domain=? AND source_url=? AND target_url=?').get(profile.platform_domain,profile.submission_url,'https://talentxcel.in');
  if (existing) return existing;
  const domain = db.prepare('SELECT id FROM domains WHERE root_domain=? LIMIT 1').get(profile.platform_domain);
  db.prepare('INSERT INTO autonomous_opportunities(domain_id,root_domain,source_url,target_url,category,relevance_score,quality_score,status,policy_decision,policy_evidence_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(domain?.id || null,profile.platform_domain,profile.submission_url,'https://talentxcel.in','BUSINESS_SAAS_DIRECTORIES',90,85,'QUALIFIED','REVIEW','{}',now(),now());
  return db.prepare('SELECT * FROM autonomous_opportunities WHERE root_domain=? AND source_url=? AND target_url=?').get(profile.platform_domain,profile.submission_url,'https://talentxcel.in');
}
function evaluateTopTen(db) {
  const profiles = db.prepare("SELECT * FROM b2b_directory_profiles WHERE profile_status NOT IN ('APPROVED_LIVE','SUBMITTED_PENDING_REVIEW') ORDER BY id LIMIT 10").all();
  const results=[];
  for (let i=0;i<profiles.length;i++) {
    const profile=profiles[i]; const opportunity=ensureOpportunity(db,profile); const restriction=restrictionFor(profile);
    const capabilityInput={ url:profile.submission_url, registrationRequired:true, loginRequired:restriction.failureClass==='AUTH_REQUIRED' || restriction.failureClass==='CREDENTIALS_UNVERIFIED', captchaRequired:restriction.failureClass==='CAPTCHA_REQUIRED', automationPermitted:false, editorialApprovalRequired:false, paymentRequired:false, formSubmissionPermitted:false };
    const intelligence=recordCapability(db,opportunity,capabilityInput);
    const evidence={ selection:'Top ten existing ready B2B profiles', profileStatus:profile.profile_status, restriction, verificationRequirements:profile.verification_requirements, observedAt:now(), liveTransportUsed:false };
    db.prepare(`INSERT INTO autonomous_live_pilot_evaluations(opportunity_id,candidate_key,platform_name,root_domain,submission_url,selection_rank,eligibility,failure_class,evidence_json,evaluated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(candidate_key) DO UPDATE SET eligibility=excluded.eligibility,failure_class=excluded.failure_class,evidence_json=excluded.evidence_json,evaluated_at=excluded.evaluated_at`).run(opportunity.id,profile.platform_id,profile.platform_name,profile.platform_domain,profile.submission_url,i+1,restriction.eligibility,restriction.failureClass,JSON.stringify(evidence),now());
    audit(db,'LIVE_PILOT_PREFLIGHT',opportunity.id,{candidate:profile.platform_id,eligibility:restriction.eligibility,failureClass:restriction.failureClass});
    results.push({rank:i+1,platform:profile.platform_name,domain:profile.platform_domain,url:profile.submission_url,...restriction,intelligence});
  }
  return results;
}
async function submitApproved(db, { opportunityId, method, endpoint, request }) {
  const evaluation = db.prepare("SELECT * FROM autonomous_live_pilot_evaluations WHERE opportunity_id=? AND eligibility='APPROVED'").get(opportunityId);
  if (!evaluation) throw new Error('LIVE_PILOT_NOT_APPROVED: candidate is not approved for external transmission');
  const opportunity = db.prepare('SELECT * FROM autonomous_opportunities WHERE id=?').get(opportunityId);
  if (!opportunity || opportunity.status !== 'READY') throw new Error('LIVE_PILOT_NOT_READY: opportunity is not ready');
  const adapter = adapterFor(method,{mode:'LIVE'}); if (!adapter) throw new Error('UNSUPPORTED_SUBMISSION_METHOD');
  const key = `live-pilot:${opportunityId}:${method}:${endpoint}`;
  const existing = db.prepare('SELECT * FROM autonomous_submissions WHERE idempotency_key=?').get(key); if (existing) return existing;
  try {
    const result = await adapter.execute({ ...request, endpoint, liveAuthorization:'PHASE3_CONTROLLED_LIVE' });
    db.prepare('INSERT INTO autonomous_submissions(opportunity_id,idempotency_key,method,endpoint,status,receipt_json,attempts,submitted_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(opportunityId,key,method,endpoint,'SUBMITTED',JSON.stringify(result.receipt),1,now(),now(),now());
    db.prepare('UPDATE autonomous_opportunities SET status=?,updated_at=? WHERE id=?').run('SUBMITTED',now(),opportunityId); audit(db,'LIVE_SUBMISSION_SUBMITTED',opportunityId,{method,endpoint,receipt:result.receipt});
    return db.prepare('SELECT * FROM autonomous_submissions WHERE idempotency_key=?').get(key);
  } catch (error) {
    const failureClass=classifyFailure(error); audit(db,'LIVE_SUBMISSION_BLOCKED_OR_FAILED',opportunityId,{method,endpoint,failureClass,error:String(error.message||error)}); throw error;
  }
}
function csvCell(value) { const text=String(value ?? ''); return `"${text.replace(/"/g,'""')}"`; }
function exportExecutionReport(db, results) {
  const evaluations=db.prepare('SELECT * FROM autonomous_live_pilot_evaluations ORDER BY selection_rank').all();
  const submitted=db.prepare("SELECT s.*,o.root_domain,o.target_url FROM autonomous_submissions s JOIN autonomous_opportunities o ON o.id=s.opportunity_id WHERE s.idempotency_key LIKE 'live-pilot:%' ORDER BY s.id").all();
  const startedAt=evaluations[0]?.evaluated_at || now(); const elapsedSeconds=Math.max(0,Math.round((Date.now()-Date.parse(startedAt))/1000));
  const remainingQualified=db.prepare("SELECT count(1) n FROM autonomous_opportunities WHERE status IN ('QUALIFIED','READY')").get().n;
  const summary={evaluated:evaluations.length,approved:evaluations.filter(x=>x.eligibility==='APPROVED').length,attempted:submitted.length,submitted:submitted.filter(x=>x.status==='SUBMITTED').length,accepted:submitted.filter(x=>['PUBLISHED','VERIFIED_LIVE'].includes(x.status)).length,published:submitted.filter(x=>x.status==='PUBLISHED').length,verifiedLive:submitted.filter(x=>x.status==='VERIFIED_LIVE').length,pendingApproval:evaluations.filter(x=>x.eligibility==='ESCALATED').length,rejectedOrFailed:evaluations.filter(x=>['REJECTED','FAILED'].includes(x.eligibility)).length,uniqueReferringRootDomains:0,follow:0,nofollow:0,remainingQualified,timeSpentSeconds:elapsedSeconds,credentialsOrHumanIntervention:evaluations.filter(x=>x.eligibility==='ESCALATED').map(x=>x.root_domain)};
  const candidateLines=evaluations.map(e=>`- ${e.selection_rank}. ${e.platform_name} — source: ${e.submission_url}; destination: https://talentxcel.in; ${e.eligibility}${e.failure_class ? ` / ${e.failure_class}` : ''}.`);
  const markdown=['# TalentXcel Phase 3 Controlled Live Pilot — Execution Report','',`Generated: ${now()}`,'', '## A–I. Summary','',...Object.entries(summary).filter(([k])=>k!=='credentialsOrHumanIntervention').map(([k,v])=>`- ${k}: ${v}`),'', '## J–K. Candidate submission URLs, destination, and outcome','',...candidateLines,'',...results.map(r=>`- Reason — ${r.platform}: ${r.reason}`),'', '## L. Execution efficiency','',`- Elapsed from first persisted evaluation: ${elapsedSeconds} seconds.`, `- External submission attempts: ${submitted.length}; verified live acquisitions: 0.`, '', '## M. Credentials or human intervention required','',...summary.credentialsOrHumanIntervention.map(domain=>`- ${domain}: verified company/founder identity, business email, or account access is required.`),'', '## N. Remaining qualified opportunities','',`- ${remainingQualified} autonomous opportunities remain in QUALIFIED or READY state. They require capability evidence and the same policy gate before transmission.`,'', '## O. Next-cycle recommendations','', '- Supply verified TalentXcel business contact and account ownership only for destinations selected by a human operator.', '- Replace the SoftwareSuggest endpoint only after a manual vendor-account review confirms permitted automation.', '- Do not retry Product Hunt until a human handles its bot-security challenge and explicitly approves the final form submission.', '- Prioritize public, terms-permitted submissions that have no login, CAPTCHA, payment, or editorial gate.', '', '## Reporting integrity','', '- No live submission transport ran for a restricted or unverified opportunity.', '- Submitted, accepted, published, and verified-live counts are independently separated.', '- No simulated submission is included in this report.'].join('\n');
  const rows=[['selection_rank','platform_name','root_domain','submission_url','destination_url','eligibility','actual_submission_status','failure_class','evaluated_at'],...evaluations.map(e=>[e.selection_rank,e.platform_name,e.root_domain,e.submission_url,'https://talentxcel.in',e.eligibility,'NOT_ATTEMPTED',e.failure_class,e.evaluated_at]),...submitted.map(s=>['','','',s.endpoint,s.target_url,'APPROVED',s.status,'',s.submitted_at])];
  fs.writeFileSync(path.join(config.PATHS.EXPORTS,'PHASE3_SUBMISSION_RECORDS.csv'),rows.map(r=>r.map(csvCell).join(',')).join('\n')+'\n');
  fs.writeFileSync(path.join(config.PATHS.EXPORTS,'PHASE3_LIVE_EXECUTION_REPORT.md'),markdown+'\n');
  return {summary,reportPath:path.join(config.PATHS.EXPORTS,'PHASE3_LIVE_EXECUTION_REPORT.md'),csvPath:path.join(config.PATHS.EXPORTS,'PHASE3_SUBMISSION_RECORDS.csv')};
}
module.exports = { evaluateTopTen, submitApproved, exportExecutionReport, restrictionFor, classifyFailure };
