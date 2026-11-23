// distribution-engine/src/discovery/deduplicationEngine.cjs
// Normalizes URLs, identifies canonical domains, and enforces strict deduplication.

const { URL } = require('url');

class DeduplicationEngine {
  constructor() {
    // Multi-tenant publication domains where subdomains or user paths represent distinct publication properties
    this.multiTenantRoots = new Set([
      'substack.com',
      'hashnode.dev',
      'medium.com',
      'ghost.io',
      'github.io',
      'beehiiv.com',
      'notion.site'
    ]);

    // Common two-level ccTLD suffixes
    this.compoundSuffixes = new Set([
      'co.uk', 'org.uk', 'gov.uk', 'ac.uk',
      'co.in', 'org.in', 'net.in', 'gen.in', 'ac.in', 'edu.in', 'res.in', 'gov.in',
      'com.au', 'net.au', 'org.au', 'edu.au',
      'co.za', 'org.za',
      'com.br', 'org.br',
      'com.sg', 'edu.sg',
      'com.my', 'edu.my',
      'co.nz',
      'co.jp',
      'co.ke'
    ]);
  }

  /**
   * Normalizes any input URL into a clean, standardized format
   */
  normalizeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    let cleaned = rawUrl.trim();
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = 'https://' + cleaned;
    }

    try {
      const parsed = new URL(cleaned);
      // Lowercase host
      const host = parsed.hostname.toLowerCase();
      // Remove default ports
      const port = (parsed.port === '80' || parsed.port === '443') ? '' : (parsed.port ? `:${parsed.port}` : '');
      // Normalize pathname
      let pathname = parsed.pathname.replace(/\/+$/, '');
      if (pathname === '') pathname = '/';

      return `${parsed.protocol}//${host}${port}${pathname}`;
    } catch {
      return rawUrl.trim().toLowerCase();
    }
  }

  /**
   * Extracts root domain and canonical representation
   */
  extractDomainInfo(inputUrl) {
    let hostname = '';
    let fullUrl = inputUrl;

    try {
      if (!/^https?:\/\//i.test(inputUrl)) {
        inputUrl = 'https://' + inputUrl;
      }
      const parsed = new URL(inputUrl);
      hostname = parsed.hostname.toLowerCase();
      fullUrl = this.normalizeUrl(inputUrl);
    } catch {
      hostname = inputUrl.split('/')[0].toLowerCase();
    }

    // Strip port if present
    hostname = hostname.split(':')[0];

    // Check if multi-tenant
    let isMultiTenant = false;
    let canonicalDomain = hostname;
    let rootDomain = hostname;

    for (const mt of this.multiTenantRoots) {
      if (hostname.endsWith(`.${mt}`) || hostname === mt) {
        isMultiTenant = true;
        break;
      }
    }

    if (!isMultiTenant) {
      // Strip 'www.'
      if (hostname.startsWith('www.')) {
        canonicalDomain = hostname.substring(4);
      } else {
        canonicalDomain = hostname;
      }
      rootDomain = this.extractRootDomain(canonicalDomain);
    } else {
      // For multi-tenant platforms, preserve specific publication identity
      canonicalDomain = hostname;
      rootDomain = this.extractRootDomain(hostname);
    }

    return {
      raw: inputUrl,
      canonicalUrl: fullUrl,
      hostname,
      canonicalDomain,
      rootDomain,
      isMultiTenant
    };
  }

  /**
   * Extracts registered 2nd-level root domain taking compound ccTLDs into account
   */
  extractRootDomain(hostname) {
    const parts = hostname.toLowerCase().split('.');
    if (parts.length <= 2) return hostname;

    const lastTwo = parts.slice(-2).join('.');
    if (this.compoundSuffixes.has(lastTwo)) {
      if (parts.length >= 3) {
        return parts.slice(-3).join('.');
      }
      return hostname;
    }

    return parts.slice(-2).join('.');
  }

  /**
   * Generates a stable duplicate group identifier based on root domain
   */
  getDuplicateGroup(canonicalDomain) {
    const root = this.extractRootDomain(canonicalDomain);
    return `group_${root.replace(/[^a-z0-9]/g, '_')}`;
  }

  /**
   * Checks if candidate is already in the platform registry or marks it as duplicate
   */
  evaluateCandidate(candidate, existingPlatformMap) {
    const domainInfo = this.extractDomainInfo(candidate.platform_url || candidate.domain);
    const existing = existingPlatformMap.get(domainInfo.canonicalDomain) || existingPlatformMap.get(domainInfo.rootDomain);

    if (existing) {
      return {
        isDuplicate: true,
        canonicalDomain: domainInfo.canonicalDomain,
        rootDomain: domainInfo.rootDomain,
        existingPlatformId: existing.platform_id,
        duplicateGroup: this.getDuplicateGroup(domainInfo.canonicalDomain),
        reason: `Matched existing entity ${existing.platform_id} on root domain ${domainInfo.rootDomain}`
      };
    }

    return {
      isDuplicate: false,
      canonicalDomain: domainInfo.canonicalDomain,
      rootDomain: domainInfo.rootDomain,
      duplicateGroup: this.getDuplicateGroup(domainInfo.canonicalDomain)
    };
  }
}

module.exports = { DeduplicationEngine };
