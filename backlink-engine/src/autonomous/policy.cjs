const RESTRICTED = new Set(['CAPTCHA', 'LOGIN_REQUIRED', 'PAYMENT_REQUIRED', 'EDITORIAL_APPROVAL', 'AUTOMATION_PROHIBITED']);

function evaluateOpportunity(input = {}) {
  const evidence = {
    relevance: input.relevance || [],
    registrationRequired: !!input.registrationRequired,
    apiAvailable: !!input.apiAvailable,
    automationPermitted: input.automationPermitted !== false,
    followExpectation: input.followExpectation || 'unknown',
    editorialApprovalRequired: !!input.editorialApprovalRequired,
    paymentRequired: !!input.paymentRequired,
    captchaRequired: !!input.captchaRequired,
    loginRequired: !!input.loginRequired
  };
  const reasons = [];
  if (!evidence.automationPermitted) reasons.push('AUTOMATION_PROHIBITED');
  if (evidence.captchaRequired) reasons.push('CAPTCHA');
  if (evidence.loginRequired) reasons.push('LOGIN_REQUIRED');
  if (evidence.paymentRequired) reasons.push('PAYMENT_REQUIRED');
  if (evidence.editorialApprovalRequired) reasons.push('EDITORIAL_APPROVAL');
  const restricted = reasons.some(r => RESTRICTED.has(r));
  const decision = restricted ? 'ESCALATE_HUMAN' : (evidence.apiAvailable || input.formSubmissionPermitted ? 'ALLOW_SIMULATION' : 'REVIEW');
  return { decision, reasons, evidence, safeForLiveSubmission: false };
}

module.exports = { evaluateOpportunity, RESTRICTED };
