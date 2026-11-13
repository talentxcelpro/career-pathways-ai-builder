function buildPacket(db, opportunityId) {
  const opportunity = db.prepare('SELECT * FROM autonomous_opportunities WHERE id=?').get(opportunityId); if (!opportunity) throw new Error('Opportunity not found');
  const capability = db.prepare('SELECT * FROM autonomous_capabilities WHERE opportunity_id=?').get(opportunityId) || null;
  const content = db.prepare('SELECT content_type,audience,body,facts_json FROM autonomous_content_assets WHERE opportunity_id=?').all(opportunityId);
  return { website: opportunity.root_domain, submissionUrl: capability?.submission_url || opportunity.source_url, domainQuality: opportunity.quality_score, relevance: opportunity.relevance_score, submissionMethod: capability?.api_available ? 'API' : 'HTTP_FORM', requiredCredentials: Boolean(capability?.registration_required || capability?.login_required), automationPermission: capability?.automation_permitted, automationPermissionEvidence: capability?.evidence_json || '{}', generatedContent: content, expectedLinkAttributes: capability?.expected_rel || 'unknown', riskClassification: opportunity.policy_decision, simulationOnly: true };
}
function queueForApproval(db, opportunityId) {
  const packet = buildPacket(db, opportunityId); const now = new Date().toISOString();
  db.prepare('UPDATE autonomous_opportunities SET status=?,updated_at=? WHERE id=?').run('PENDING_APPROVAL',now,opportunityId);
  db.prepare('INSERT INTO autonomous_approval_queue(opportunity_id,state,packet_json,requested_at) VALUES(?,?,?,?) ON CONFLICT(opportunity_id) DO UPDATE SET state=excluded.state,packet_json=excluded.packet_json,requested_at=excluded.requested_at').run(opportunityId,'PENDING_APPROVAL',JSON.stringify(packet),now);
  return db.prepare('SELECT * FROM autonomous_approval_queue WHERE opportunity_id=?').get(opportunityId);
}
module.exports = { buildPacket, queueForApproval };
