/**
 * src/lib/seo/globalKeywordRegistry.ts
 *
 * High-performance deterministic resolver for the 50,000-Keyword Global SEO Engine.
 * Resolves meta attributes, PLG widget type, localized currencies, and canonicals in O(1) time.
 */

import { buildCanonicalUrl, buildHreflangTags, evaluateCanIndex } from './uniquenessGuard';

export interface KeywordHubMetadata {
  slug: string;
  vertical: string;
  targetUrl: string;
  canonicalUrl: string;
  roleName: string;
  cityName?: string;
  countryCode: string;
  currency: string;
  title: string;
  metaDescription: string;
  plgWidgetType: 'salary_benchmark' | 'ats_scanner' | 'network_discussion' | 'compliance_checklist' | 'passport_preview';
  canIndex: boolean;
  robotsDirective: 'index, follow' | 'noindex, follow';
  hreflangTags: Array<{ lang: string; href: string }>;
  estimatedSalary?: string;
}

const formatTitle = (slug: string) => 
  slug.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * Deterministically resolves any slug across the 11 vertical templates in O(1) time
 */
export function resolveKeywordHub(rawPathOrSlug: string): KeywordHubMetadata | null {
  const cleanPath = (rawPathOrSlug || '').trim().replace(/^\/+|\/+$/g, '');
  if (!cleanPath) return null;

  const parts = cleanPath.split('/');
  const prefix = parts[0]?.toLowerCase();
  const slug = parts[parts.length - 1];

  const canonicalUrl = buildCanonicalUrl(cleanPath);
  const hreflangTags = buildHreflangTags(cleanPath);

  // 1. Salary Hubs (/salary/:role-in-:city)
  if (prefix === 'salary' && slug.includes('-in-')) {
    const [rolePart, cityPart] = slug.split('-in-');
    const roleName = formatTitle(rolePart);
    const cityName = formatTitle(cityPart);

    // Multi-currency mapping
    const menaAedCities = new Set(['dubai', 'abu-dhabi', 'sharjah']);
    const menaSarCities = new Set(['riyadh', 'jeddah', 'dammam', 'al-khobar']);
    const ukCities = new Set(['london', 'manchester', 'birmingham']);
    const euCities = new Set(['berlin', 'munich', 'frankfurt', 'amsterdam', 'dublin', 'paris', 'stockholm']);
    const chCities = new Set(['zurich', 'geneva']);
    const caCities = new Set(['toronto', 'vancouver', 'montreal']);
    const usCities = new Set(['new-york', 'san-francisco', 'austin', 'seattle', 'chicago', 'boston', 'los-angeles', 'atlanta']);

    let currency = 'INR';
    let countryCode = 'IN';

    const cityLower = cityPart.toLowerCase();
    if (menaAedCities.has(cityLower)) { currency = 'AED'; countryCode = 'AE'; }
    else if (menaSarCities.has(cityLower)) { currency = 'SAR'; countryCode = 'SA'; }
    else if (cityLower === 'doha') { currency = 'QAR'; countryCode = 'QA'; }
    else if (ukCities.has(cityLower)) { currency = 'GBP'; countryCode = 'GB'; }
    else if (euCities.has(cityLower)) { currency = 'EUR'; countryCode = 'DE'; }
    else if (chCities.has(cityLower)) { currency = 'CHF'; countryCode = 'CH'; }
    else if (caCities.has(cityLower)) { currency = 'CAD'; countryCode = 'CA'; }
    else if (usCities.has(cityLower)) { currency = 'USD'; countryCode = 'US'; }

    return {
      slug,
      vertical: 'salary',
      targetUrl: `/salary/${slug}`,
      canonicalUrl,
      roleName,
      cityName,
      countryCode,
      currency,
      title: `${roleName} Salary in ${cityName} (${currency} 2026 Benchmark) | TalentXcel`,
      metaDescription: `Explore verified 2026 ${roleName} salary ranges, compensation percentiles, in-hand pay calculator, and skill premiums in ${cityName} (${currency}).`,
      plgWidgetType: 'salary_benchmark',
      canIndex: true,
      robotsDirective: 'index, follow',
      hreflangTags,
    };
  }

  // 2. Jobs & Visa Sponsorship (/jobs/visa-sponsored-:role-:country or /jobs/:role-in-:city)
  if (prefix === 'jobs') {
    if (slug.startsWith('visa-sponsored-')) {
      const match = slug.replace('visa-sponsored-', '').match(/^(.+)-([a-z-]+)$/);
      const rolePart = match ? match[1] : 'software-engineer';
      const countryPart = match ? match[2] : 'uae';
      const roleName = formatTitle(rolePart);
      const countryName = formatTitle(countryPart);

      return {
        slug,
        vertical: 'jobs_visa',
        targetUrl: `/jobs/${slug}`,
        canonicalUrl,
        roleName,
        cityName: countryName,
        countryCode: 'AE',
        currency: 'USD',
        title: `Visa Sponsored ${roleName} Jobs in ${countryName} (2026) | TalentXcel`,
        metaDescription: `Explore verified visa-sponsored ${roleName} vacancies in ${countryName}. Work permit sponsorship, relocation support, and verified compensation.`,
        plgWidgetType: 'compliance_checklist',
        canIndex: true,
        robotsDirective: 'index, follow',
        hreflangTags,
      };
    }

    if (slug.includes('-in-')) {
      const [rolePart, cityPart] = slug.split('-in-');
      const roleName = formatTitle(rolePart);
      const cityName = formatTitle(cityPart);

      return {
        slug,
        vertical: 'jobs_visa',
        targetUrl: `/jobs/${slug}`,
        canonicalUrl,
        roleName,
        cityName,
        countryCode: 'IN',
        currency: 'INR',
        title: `${roleName} Jobs in ${cityName} (2026 Openings) | TalentXcel Jobs`,
        metaDescription: `Apply for verified ${roleName} openings in ${cityName}. Direct applications to top tech employers with transparent compensation.`,
        plgWidgetType: 'salary_benchmark',
        canIndex: true,
        robotsDirective: 'index, follow',
        hreflangTags,
      };
    }
  }

  // 3. Resume & CV Templates (/resume/:slug)
  if (prefix === 'resume' && (slug.includes('-resume-template') || slug.includes('-cv-format'))) {
    const isCv = slug.includes('-cv-format');
    const rolePart = isCv 
      ? slug.replace(/^[a-z]+-/, '').replace('-cv-format', '') 
      : slug.replace(/-[a-z0-9]+-resume-template$/, '').replace('-resume-template', '');
    const roleName = formatTitle(rolePart);

    return {
      slug,
      vertical: 'resume_cv',
      targetUrl: `/resume/${slug}`,
      canonicalUrl,
      roleName,
      countryCode: 'IN',
      currency: 'INR',
      title: `${roleName} ${isCv ? 'CV Format & Guidelines' : 'Resume Template'} (2026 ATS-Optimized) | TalentXcel`,
      metaDescription: `Download recruiter-approved ${roleName} resume and CV templates. Optimized for top enterprise ATS scanners with pre-written impact bullet points.`,
      plgWidgetType: 'ats_scanner',
      canIndex: true,
      robotsDirective: 'index, follow',
      hreflangTags,
    };
  }

  // 4. ATS Check (/ats-check/:slug)
  if (prefix === 'ats-check' || prefix === 'ats') {
    const roleName = formatTitle(slug.replace(/-resume-scanner.*$/, '').replace(/-(score|keyword|format).*$/, ''));
    return {
      slug,
      vertical: 'ats_check',
      targetUrl: `/ats-check/${slug}`,
      canonicalUrl,
      roleName,
      countryCode: 'US',
      currency: 'USD',
      title: `${roleName} ATS Resume Scanner (2026 Checker) | TalentXcel`,
      metaDescription: `Test your ${roleName} resume against enterprise parsing rules. Uncover missing technical keywords, formatting errors, and recruiter score.`,
      plgWidgetType: 'ats_scanner',
      canIndex: true,
      robotsDirective: 'index, follow',
      hreflangTags,
    };
  }

  // 5. Career Paths (/career-paths/:slug)
  if (prefix === 'career-paths' && slug.includes('-to-')) {
    const [fromPart, toPart] = slug.split('-to-');
    const fromName = formatTitle(fromPart);
    const toName = formatTitle(toPart);
    return {
      slug,
      vertical: 'career_paths',
      targetUrl: `/career-paths/${slug}`,
      canonicalUrl,
      roleName: toName,
      countryCode: 'IN',
      currency: 'INR',
      title: `${fromName} to ${toName} Career Transition Roadmap (2026) | TalentXcel`,
      metaDescription: `Step-by-step career switch guide from ${fromName} to ${toName}. Bridge key skill gaps, transfer proven competencies, and target 40%+ salary growth.`,
      plgWidgetType: 'salary_benchmark',
      canIndex: true,
      robotsDirective: 'index, follow',
      hreflangTags,
    };
  }

  // 6. Network Topics (/network/topic/:slug)
  if (prefix === 'network' && parts.includes('topic')) {
    const topicName = formatTitle(slug);
    return {
      slug,
      vertical: 'network_topics',
      targetUrl: `/network/topic/${slug}`,
      canonicalUrl,
      roleName: topicName,
      countryCode: 'IN',
      currency: 'INR',
      title: `${topicName} — Professional Network Discussion | TalentXcel`,
      metaDescription: `Join verified professionals discussing ${topicName}. Real experiences, recruiter advice, and verified insights led by Director Operations Sanobar Khan.`,
      plgWidgetType: 'network_discussion',
      canIndex: true,
      robotsDirective: 'index, follow',
      hreflangTags,
    };
  }

  // 7. Colleges & Placements (/colleges/:slug)
  if (prefix === 'colleges' && slug) {
    const collegeName = formatTitle(slug);
    return {
      slug,
      vertical: 'colleges',
      targetUrl: `/colleges/${slug}`,
      canonicalUrl,
      roleName: collegeName,
      countryCode: 'IN',
      currency: 'INR',
      title: `${collegeName} Campus Placements & Career Outcomes (2026) | TalentXcel`,
      metaDescription: `Review verified campus placement reports, median salary packages, recruiting companies, and career pathways for ${collegeName}.`,
      plgWidgetType: 'salary_benchmark',
      canIndex: true,
      robotsDirective: 'index, follow',
      hreflangTags,
    };
  }

  // 8. Learning & Certifications (/learning/:slug)
  if (prefix === 'learning' && slug) {
    const skillName = formatTitle(slug);
    return {
      slug,
      vertical: 'learning',
      targetUrl: `/learning/${slug}`,
      canonicalUrl,
      roleName: skillName,
      countryCode: 'IN',
      currency: 'USD',
      title: `${skillName} Certification & Skill Assessment (2026) | TalentXcel`,
      metaDescription: `Master ${skillName}. Take the verified skill benchmark, identify competency gaps, and boost your ATS profile score for global hiring.`,
      plgWidgetType: 'ats_scanner',
      canIndex: true,
      robotsDirective: 'index, follow',
      hreflangTags,
    };
  }

  // 9. Talent & Career Passports (/talent/:slug or /passport/:slug)
  if ((prefix === 'talent' || prefix === 'passport') && slug) {
    const talentName = formatTitle(slug);
    return {
      slug,
      vertical: 'talent_passport',
      targetUrl: `/${prefix}/${slug}`,
      canonicalUrl,
      roleName: talentName,
      countryCode: 'IN',
      currency: 'USD',
      title: `Verified ${talentName} Talent Directory & Career Passports | TalentXcel`,
      metaDescription: `Explore pre-vetted ${talentName} professionals with verified technical skills, GitHub credentials, and Career Passports ready for immediate hire.`,
      plgWidgetType: 'passport_preview',
      canIndex: true,
      robotsDirective: 'index, follow',
      hreflangTags,
    };
  }

  // 10. Communities & Reels (/communities/:slug or /reels/topic/:slug)
  if ((prefix === 'communities' || prefix === 'reels') && slug) {
    const communityName = formatTitle(slug);
    return {
      slug,
      vertical: 'community_reels',
      targetUrl: `/${cleanPath}`,
      canonicalUrl,
      roleName: communityName,
      countryCode: 'IN',
      currency: 'INR',
      title: `${communityName} Professional Hub & Career Discussions | TalentXcel`,
      metaDescription: `Join the verified ${communityName} peer group. Connect with senior engineers, recruiters, and mentors sharing verified career advice.`,
      plgWidgetType: 'network_discussion',
      canIndex: true,
      robotsDirective: 'index, follow',
      hreflangTags,
    };
  }

  // 11. CA, Legal & Compliance (/ca-legal/:slug)
  if (prefix === 'ca-legal') {
    const titleName = formatTitle(slug);
    return {
      slug,
      vertical: 'ca_legal',
      targetUrl: `/ca-legal/${slug}`,
      canonicalUrl,
      roleName: titleName,
      countryCode: 'IN',
      currency: 'USD',
      title: `${titleName} (2026 Legal & Tax Guide) | TalentXcel`,
      metaDescription: `Statutory compliance guide: ${titleName}. Review documentation checklists, tax obligations, and international statutory requirements.`,
      plgWidgetType: 'compliance_checklist',
      canIndex: true,
      robotsDirective: 'index, follow',
      hreflangTags,
    };
  }

  return null;
}
