const crypto = require('node:crypto');

class SubmissionAdapter {
  constructor(name, { mode = 'SIMULATION' } = {}) { this.name = name; this.mode = mode; }
  capability() { return { adapter: this.name, mode: this.mode, supportsLive: true, supportsSimulation: true }; }
  execute(request) {
    if (this.mode === 'SIMULATION') return { adapter: this.name, mode: 'SIMULATION', status: 'SUBMITTED', receipt: { receiptId: crypto.randomUUID(), simulated: true, endpoint: request.endpoint || null, submittedAt: new Date().toISOString() } };
    assertLiveEligibility(request);
    if (typeof request.transport !== 'function') throw new Error('LIVE_EXECUTION_DISABLED: a reviewed transport is required');
    return Promise.resolve(request.transport(request)).then(response => {
      const statusCode = Number(response?.statusCode || response?.status || 0);
      if (statusCode < 200 || statusCode >= 400) throw new Error(`SUBMISSION_HTTP_${statusCode || 'UNKNOWN'}`);
      return { adapter: this.name, mode: 'LIVE', status: 'SUBMITTED', receipt: { receiptId: crypto.randomUUID(), simulated: false, endpoint: request.endpoint, submittedAt: new Date().toISOString(), statusCode, location: response.location || null, bodyHash: response.bodyHash || null } };
    });
  }
}
class AuthorizedApiAdapter extends SubmissionAdapter { constructor(options) { super('AUTHORIZED_API', options); } }
class PermittedHttpFormAdapter extends SubmissionAdapter { constructor(options) { super('PERMITTED_HTTP_FORM', options); } }
class BrowserSubmissionAdapter extends SubmissionAdapter {
  constructor(options) { super('BROWSER_DESIGN_ONLY', options); }
  capability() { return { ...super.capability(), requiresHumanAuthorization: true, externalBrowserControlEnabled: true }; }
  execute(request) {
    if (this.mode === 'SIMULATION') return super.execute(request);
    assertLiveEligibility(request);
    throw new Error('BROWSER_CONFIRMATION_REQUIRED: review the visible form and confirm immediately before the final submission');
  }
}
function assertLiveEligibility(request = {}) {
  const policy = request.permissionEvidence || {};
  if (request.liveAuthorization !== 'PHASE3_CONTROLLED_LIVE') throw new Error('LIVE_EXECUTION_DISABLED: missing controlled-live authorization');
  if (policy.automationPermitted !== true) throw new Error('POLICY_BLOCKED: automation permission is not evidenced');
  if (policy.captchaDetected || policy.loginRequired || policy.paymentRequired || policy.editorialRequired) throw new Error('POLICY_BLOCKED: restricted workflow');
  if (request.verifiedCredentialEvidence !== true) throw new Error('CREDENTIALS_UNVERIFIED: verified company credentials are required');
  if (!/^https:\/\//i.test(request.endpoint || '')) throw new Error('INVALID_ENDPOINT: HTTPS endpoint required');
}
function createFetchTransport({ fetchImpl = globalThis.fetch } = {}) {
  return async request => {
    if (typeof fetchImpl !== 'function') throw new Error('NETWORK_TRANSPORT_UNAVAILABLE');
    const response = await fetchImpl(request.endpoint, { method: request.httpMethod || 'POST', headers: request.headers || {}, body: request.body, redirect: 'manual' });
    const body = await response.text();
    return { statusCode: response.status, location: response.headers.get('location'), bodyHash: crypto.createHash('sha256').update(body).digest('hex') };
  };
}
function classifyFailure(error) {
  const message = String(error?.message || error).toLowerCase();
  if (message.includes('captcha')) return 'CAPTCHA_REQUIRED';
  if (message.includes('login') || message.includes('auth')) return 'AUTH_REQUIRED';
  if (message.includes('payment')) return 'PAYMENT_REQUIRED';
  if (message.includes('timeout') || message.includes('network')) return 'RECOVERABLE_NETWORK';
  if (message.includes('disabled') || message.includes('permission')) return 'POLICY_BLOCKED';
  return 'UNCLASSIFIED';
}
function adapterFor(method, options) { return { API: new AuthorizedApiAdapter(options), HTTP_FORM: new PermittedHttpFormAdapter(options), BROWSER: new BrowserSubmissionAdapter(options) }[method] || null; }
module.exports = { SubmissionAdapter, AuthorizedApiAdapter, PermittedHttpFormAdapter, BrowserSubmissionAdapter, assertLiveEligibility, createFetchTransport, classifyFailure, adapterFor };
