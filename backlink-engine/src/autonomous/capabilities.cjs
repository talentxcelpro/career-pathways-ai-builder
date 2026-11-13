function detectCapabilities({ url = '', html = '', headers = {}, automationPolicy, registrationRequired: registrationOverride, loginRequired: loginOverride, captchaRequired: captchaOverride, paymentRequired: paymentOverride, editorialApprovalRequired: editorialOverride, automationPermitted: automationOverride } = {}) {
  const source = `${url}\n${html}`.toLowerCase();
  const matches = (rx) => rx.test(source);
  const submissionUrl = url || null;
  const apiAvailable = Boolean(headers['x-api-version'] || matches(/openapi|\/api\/|graphql|api documentation/));
  const registrationRequired = registrationOverride ?? matches(/sign up|create account|register|registration required/);
  const loginRequired = loginOverride ?? matches(/log in|sign in|authentication required/);
  const captchaDetected = captchaOverride ?? matches(/recaptcha|hcaptcha|turnstile|captcha/);
  const paymentRequired = paymentOverride ?? matches(/pricing|paid submission|payment required|checkout|purchase/);
  const editorialRequired = editorialOverride ?? matches(/editorial review|editorial approval|review by our team|submission guidelines/);
  const automationPermitted = automationOverride ?? (automationPolicy === true ? true : automationPolicy === false ? false : null);
  const expectedRel = matches(/nofollow/) ? 'nofollow' : matches(/sponsored/) ? 'sponsored' : matches(/ugc/) ? 'ugc' : 'unknown';
  const evidence = { url, indicators: { apiAvailable, registrationRequired, loginRequired, captchaDetected, paymentRequired, editorialRequired, expectedRel }, policy: automationPolicy ?? 'unknown' };
  const hits = Object.values(evidence.indicators).filter(v => v === true).length + (automationPermitted !== null ? 1 : 0);
  return { submissionUrl, apiAvailable, registrationRequired, loginRequired, captchaDetected, paymentRequired, editorialRequired, automationPermitted, expectedRel, confidence: Math.min(0.95, 0.25 + hits * 0.1), evidence };
}
module.exports = { detectCapabilities };
