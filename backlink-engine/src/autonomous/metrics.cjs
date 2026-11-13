function dashboard(db) {
  const count = (sql, ...args) => db.prepare(sql).get(...args).n;
  return {
    discoveredOpportunities: count("SELECT count(*) n FROM autonomous_opportunities"),
    qualifiedDomains: count("SELECT count(*) n FROM domains WHERE qualification_status='QUALIFIED'"),
    submissionReady: count("SELECT count(*) n FROM autonomous_opportunities WHERE status='READY'"),
    successfulSubmissions: count("SELECT count(*) n FROM autonomous_submissions WHERE status IN ('SUBMITTED','PUBLISHED','VERIFIED_LIVE')"),
    pendingEditorialApprovals: count("SELECT count(*) n FROM autonomous_opportunities WHERE status='PENDING_APPROVAL'"),
    verifiedLiveBacklinks: count("SELECT count(*) n FROM backlinks WHERE status='LIVE' AND is_external=1"),
    lostBacklinks: count("SELECT count(*) n FROM backlinks WHERE status='LOST'"),
    uniqueReferringRootDomains: count("SELECT count(DISTINCT referring_domain) n FROM backlinks WHERE status='LIVE' AND is_external=1"),
    approvalQueue: count("SELECT count(*) n FROM autonomous_approval_queue WHERE state='PENDING_APPROVAL'"),
    capabilityDiscoveryQueued: count("SELECT count(*) n FROM autonomous_jobs WHERE job_type='CAPABILITY_DISCOVERY' AND status='QUEUED'"),
    simulationSubmissions: count("SELECT count(*) n FROM autonomous_submissions WHERE receipt_json LIKE '%\"simulated\":true%'")
  };
}
module.exports = { dashboard };
