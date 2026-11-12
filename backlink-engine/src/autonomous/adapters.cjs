const crypto = require('node:crypto');

class SubmissionAdapter {
  constructor(name, { mode = 'SIMULATION' } = {}) { this.name = name; this.mode = mode; }
  capability() { return { adapter: this.name, mode: this.mode, supportsLive: false, supportsSimulation: true }; }
  execute(request) {
    if (this.mode !== 'SIMULATION') throw new Error('LIVE_EXECUTION_DISABLED: explicit live-pilot approval is required');
    return { adapter: this.name, mode: 'SIMULATION', status: 'SUBMITTED', receipt: { receiptId: crypto.randomUUID(), simulated: true, endpoint: request.endpoint || null, submittedAt: new Date().toISOString() } };
  }
}
class AuthorizedApiAdapter extends SubmissionAdapter { constructor(options) { super('AUTHORIZED_API', options); } }
class PermittedHttpFormAdapter extends SubmissionAdapter { constructor(options) { super('PERMITTED_HTTP_FORM', options); } }
class BrowserSubmissionAdapter extends SubmissionAdapter {
  constructor(options) { super('BROWSER_DESIGN_ONLY', options); }
  capability() { return { ...super.capability(), requiresHumanAuthorization: true, externalBrowserControlEnabled: false }; }
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
module.exports = { SubmissionAdapter, AuthorizedApiAdapter, PermittedHttpFormAdapter, BrowserSubmissionAdapter, classifyFailure, adapterFor };
