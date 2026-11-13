const { evaluateOpportunity } = require('./policy.cjs');

const names = [
  'opportunity-discovery', 'domain-quality-relevance', 'submission-page-discovery',
  'submission-content-generation', 'automated-directory-submission', 'browser-submission',
  'outreach-preparation', 'backlink-verification', 'lost-backlink-recovery', 'campaign-intelligence'
];

function runAgent(name, input = {}) {
  if (!names.includes(name)) throw new Error(`Unknown agent: ${name}`);
  const policy = evaluateOpportunity(input);
  return {
    agent: name,
    mode: 'SIMULATION',
    decision: name.includes('submission') && policy.decision === 'ESCALATE_HUMAN' ? 'ESCALATE_HUMAN' : policy.decision,
    evidence: { ...policy.evidence, inputKeys: Object.keys(input).sort() },
    reasons: policy.reasons,
    timestamp: new Date().toISOString()
  };
}

module.exports = { AGENT_NAMES: names, runAgent };
